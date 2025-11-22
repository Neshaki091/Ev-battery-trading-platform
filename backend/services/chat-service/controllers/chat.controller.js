// controllers/chat.controller.js
const { db, admin } = require('../util/firebase'); // SỬA ĐỔI: Lấy cả admin
const { publishEvent } = require('../util/mqService');

// SỬA ĐỔI: Logic tạo/lấy phòng cho RTDB (hiệu quả hơn)
// Thay vì query, chúng ta dùng một key cố định (ID userA + ID userB)
exports.createOrGetRoom = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: 'receiverId is required' });
        }
        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot create room with yourself' });
        }

        // SỬA ĐỔI: Tạo một ID phòng cố định bằng cách sort và join 2 ID
        const participants = [senderId, receiverId].sort();
        const roomId = participants.join('_'); // Ví dụ: 'userId1_userId2'
        
        const roomRef = db.ref(`chatRooms/${roomId}`);
        const snapshot = await roomRef.once('value');

        if (snapshot.exists()) {
            // Phòng đã tồn tại, trả về
            return res.status(200).json({
                success: true,
                roomId: snapshot.key,
                data: {
                    roomId: snapshot.key,
                    ...snapshot.val()
                }
            });
        }

        // Tạo phòng mới
        const newRoomData = {
            participants: { [senderId]: true, [receiverId]: true }, // SỬA ĐỔI: Dùng object (key: true) thay vì array
            lastMessageText: '',
            lastMessageTimestamp: admin.database.ServerValue.TIMESTAMP, // SỬA ĐỔI: Dùng ServerValue.TIMESTAMP
            createdAt: admin.database.ServerValue.TIMESTAMP
        };
        await roomRef.set(newRoomData);

        // SỬA ĐỔI: Tạo bảng tra cứu (lookup table) cho cả 2 user
        // Điều này rất quan trọng để có thể lấy danh sách phòng của user
        await db.ref(`userChatRooms/${senderId}/${roomId}`).set(true);
        await db.ref(`userChatRooms/${receiverId}/${roomId}`).set(true);

        return res.status(201).json({
            success: true,
            roomId: roomId,
            data: newRoomData
        });
    } catch (error) {
        console.error('Error in createOrGetRoom:', error);
        return res.status(500).json({ message: error.message });
    }
};

// SỬA ĐỔI: Lấy phòng từ bảng tra cứu userChatRooms
exports.getUserRooms = async (req, res) => {
    try {
        const userId = req.user._id;

        // Lấy danh sách ID phòng từ bảng tra cứu
        const userRoomsRef = db.ref(`userChatRooms/${userId}`);
        const snapshot = await userRoomsRef.once('value');

        if (!snapshot.exists()) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        const roomIds = Object.keys(snapshot.val());
        const rooms = [];

        // Lặp qua từng ID phòng để lấy thông tin chi tiết
        for (const roomId of roomIds) {
            const roomSnapshot = await db.ref(`chatRooms/${roomId}`).once('value');
            if (roomSnapshot.exists()) {
                const roomData = roomSnapshot.val();
                const otherParticipantId = Object.keys(roomData.participants).find(id => id !== userId);
                
                rooms.push({
                    roomId: roomId,
                    otherParticipantId: otherParticipantId,
                    lastMessageText: roomData.lastMessageText || '',
                    lastMessageTimestamp: roomData.lastMessageTimestamp || null, // RTDB timestamp là con số (miliseconds)
                    createdAt: roomData.createdAt || null
                });
            }
        }

        // Sắp xếp thủ công
        rooms.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

        return res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        console.error('Error in getUserRooms:', error);
        return res.status(500).json({ message: error.message });
    }
};

// SỬA ĐỔI: Gửi tin nhắn dùng .push() và .update()
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { roomId } = req.params;
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Message text is required' });
        }

        const roomRef = db.ref(`chatRooms/${roomId}`);
        const roomSnapshot = await roomRef.once('value');
        
        if (!roomSnapshot.exists()) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        const roomData = roomSnapshot.val();
        // SỬA ĐỔI: Kiểm tra participants bằng key object
        if (!roomData.participants || !roomData.participants[userId]) {
            return res.status(403).json({ message: 'You are not a participant of this room' });
        }

        const receiverId = Object.keys(roomData.participants).find(id => id !== userId);

        // SỬA ĐỔI: Dùng .push() để tạo ID tin nhắn duy nhất và theo thứ tự
        const messagesRef = db.ref(`chatRooms/${roomId}/messages`);
        const newMessageRef = messagesRef.push(); // Tạo key mới
        
        const messageData = {
            senderId: userId,
            text: text.trim(),
            timestamp: admin.database.ServerValue.TIMESTAMP
        };
        await newMessageRef.set(messageData);

        // SỬA ĐỔI: Cập nhật lastMessage bằng .update()
        await roomRef.update({
            lastMessageText: text.trim(),
            lastMessageTimestamp: admin.database.ServerValue.TIMESTAMP,
            lastMessageSenderId: userId // Thêm người gửi tin nhắn cuối cùng
        });

        // Gửi notification qua RabbitMQ (giữ nguyên)
        try {
            await publishEvent('new_message_notification', {
                roomId: roomId,
                senderId: userId,
                receiverId: receiverId,
                messageText: text.trim(),
                messageId: newMessageRef.key, // SỬA ĐỔI: Lấy key từ ref
                timestamp: new Date().toISOString()
            });
            console.log(`[Notification] Published new_message_notification for room ${roomId}`);
        } catch (error) {
            console.error('Error publishing new_message_notification event:', error.message);
        }

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                messageId: newMessageRef.key,
                senderId: messageData.senderId,
                text: messageData.text,
                timestamp: null // Client sẽ nhận timestamp thật qua listener
            }
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).json({ message: error.message });
    }
};

// SỬA ĐỔI: Lấy tin nhắn dùng orderByChild
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { roomId } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        // Kiểm tra phòng (logic giữ nguyên)
        const roomRef = db.ref(`chatRooms/${roomId}`);
        const roomSnapshot = await roomRef.once('value');
        if (!roomSnapshot.exists()) {
            return res.status(404).json({ message: 'Chat room not found' });
        }
        const roomData = roomSnapshot.val();
        if (!roomData.participants || !roomData.participants[userId]) {
            return res.status(403).json({ message: 'You are not a participant of this room' });
        }

        // SỬA ĐỔI: Lấy tin nhắn bằng RTDB query
        const messagesRef = db.ref(`chatRooms/${roomId}/messages`);
        const messagesSnapshot = await messagesRef
            .orderByChild('timestamp') // Sắp xếp theo timestamp
            .limitToLast(limit)       // Lấy N tin nhắn cuối cùng
            .once('value');

        const messages = [];
        if (messagesSnapshot.exists()) {
            // SỬA ĐỔI: Lặp qua snapshot của RTDB
            messagesSnapshot.forEach(childSnapshot => {
                const messageData = childSnapshot.val();
                messages.push({
                    messageId: childSnapshot.key, // Lấy key
                    senderId: messageData.senderId,
                    text: messageData.text,
                    timestamp: messageData.timestamp || null
                });
            });
        }

        return res.status(200).json({
            success: true,
            count: messages.length,
            data: messages // Tin nhắn đã được sắp xếp tăng dần
        });
    } catch (error) {
        console.error('Error in getMessages:', error);
        return res.status(500).json({ message: error.message });
    }
};

// SỬA ĐỔI: Lấy thông báo (tin nhắn chưa đọc)
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 20 } = req.query;

        // Lấy danh sách ID phòng từ bảng tra cứu
        const userRoomsRef = db.ref(`userChatRooms/${userId}`);
        const snapshot = await userRoomsRef.once('value');

        if (!snapshot.exists()) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        const roomIds = Object.keys(snapshot.val());
        const notifications = [];

        for (const roomId of roomIds) {
            const roomSnapshot = await db.ref(`chatRooms/${roomId}`).once('value');
            if (roomSnapshot.exists()) {
                const roomData = roomSnapshot.val();
                
                // SỬA ĐỔI: Chỉ push notification nếu tin nhắn cuối cùng không phải của user này
                if (roomData.lastMessageText && roomData.lastMessageSenderId !== userId) {
                    const otherParticipantId = Object.keys(roomData.participants).find(id => id !== userId);
                    notifications.push({
                        roomId: roomId,
                        otherParticipantId: otherParticipantId,
                        lastMessage: {
                            text: roomData.lastMessageText,
                            timestamp: roomData.lastMessageTimestamp || null
                            },
                        unreadCount: 1 // Giữ logic cũ
                    });
                  }
                }
            }
        

        // Sắp xếp theo timestamp giảm dần
        notifications.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

        // Giới hạn số lượng
        const limitedNotifications = notifications.slice(0, parseInt(limit));

        return res.status(200).json({
            success: true,
            count: limitedNotifications.length,
            data: limitedNotifications
        });
    } catch (error) {
        console.error('Error in getNotifications:', error);
        return res.status(500).json({ message: error.message });
    }
};