import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/firebase_config.dart';
import '../models/chat_message.dart';
import '../models/chat_room.dart';

class FirebaseChatService {
  DatabaseReference? get _db => FirebaseConfig.database;

  // Stream messages từ Firebase Realtime Database
  Stream<List<ChatMessage>> watchMessages(String roomId, String currentUserId) {
    if (_db == null) {
      return Stream.value([]);
    }
    final messagesRef = FirebaseConfig.messagesRef(roomId);

    return messagesRef.onValue.map((event) {
      if (!event.snapshot.exists) {
        return <ChatMessage>[];
      }

      final data = event.snapshot.value;
      if (data is! Map) {
        return <ChatMessage>[];
      }

      final messages = <ChatMessage>[];
      data.forEach((key, value) {
        if (value is Map) {
          try {
            final message = ChatMessage.fromFirebase(
              key.toString(),
              Map<String, dynamic>.from(value),
              currentUserId,
            );
            messages.add(message);
          } catch (e) {
            // Skip invalid messages
          }
        }
      });

      // Sort by timestamp
      messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
      return messages;
    });
  }

  // Stream rooms từ Firebase
  Stream<List<ChatRoom>> watchRooms(String currentUserId) {
    if (_db == null) {
      return Stream.value([]);
    }
    final roomsRef = FirebaseConfig.chatRoomsRef();

    return roomsRef.onValue.map((event) {
      if (!event.snapshot.exists) {
        return <ChatRoom>[];
      }

      final data = event.snapshot.value;
      if (data is! Map) {
        return <ChatRoom>[];
      }

      final rooms = <ChatRoom>[];
      data.forEach((key, value) {
        if (value is Map) {
          try {
            final roomData = Map<String, dynamic>.from(value);
            final participants = roomData['participants'];

            // Check if current user is a participant
            if (participants is Map &&
                participants.containsKey(currentUserId)) {
              final room = ChatRoom.fromFirebase(
                key.toString(),
                roomData,
                currentUserId,
              );
              rooms.add(room);
            }
          } catch (e) {
            // Skip invalid rooms
          }
        }
      });

      // Sort by last message timestamp
      rooms.sort((a, b) {
        final aTime = a.lastMessage?.createdAt ?? DateTime(0);
        final bTime = b.lastMessage?.createdAt ?? DateTime(0);
        return bTime.compareTo(aTime);
      });

      return rooms;
    });
  }

  // Gửi tin nhắn mới
  Future<void> sendMessage(String roomId, String senderId, String text) async {
    if (_db == null) {
      throw Exception('Firebase not available. Please configure Firebase.');
    }
    final messagesRef = FirebaseConfig.messagesRef(roomId);
    final newMessageRef = messagesRef.push();

    await newMessageRef.set({
      'senderId': senderId,
      'text': text.trim(),
      'timestamp': ServerValue.timestamp,
    });

    // Update last message in room
    final roomRef = FirebaseConfig.chatRoomRef(roomId);
    await roomRef.update({
      'lastMessageText': text.trim(),
      'lastMessageTimestamp': ServerValue.timestamp,
      'lastMessageSenderId': senderId,
    });
  }
}

final firebaseChatServiceProvider = Provider<FirebaseChatService>((ref) {
  return FirebaseChatService();
});
