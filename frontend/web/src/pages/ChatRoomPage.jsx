import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  fetchMessages as fetchChatMessages,
} from "../services/chat";
import api from "../services/api";
import { db } from "../util/firebaseConfig";
import { ref, onValue, get } from "firebase/database";

function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get("receiverId");

  // User state
  const [currentUser, setCurrentUser] = useState(null);

  // Chat rooms list state
  const [chatRooms, setChatRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  // Map để lưu tên người dùng theo ID
  const [userNamesMap, setUserNamesMap] = useState({});

  // Selected room state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);

  // Messages state
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // *** THAY ĐỔI 1: State cho sidebar chi tiết ***
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [profileUserDetails, setProfileUserDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Lấy thông tin user hiện tại
  useEffect(() => {
    const userData = localStorage.getItem("evb_user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Ngăn body scroll khi ở trang chat và điều chỉnh layout
  useEffect(() => {
    const originalBodyOverflow = window.getComputedStyle(document.body).overflow;
    const pageWrapper = document.querySelector('.page-wrapper');
    const nav = document.querySelector('.nav');

    const navHeight = nav ? nav.offsetHeight : 64;

    if (pageWrapper) {
      pageWrapper.style.padding = '0';
      pageWrapper.style.minHeight = '0';
      pageWrapper.style.height = `calc(100vh - ${navHeight}px)`;
    }
    document.body.style.overflow = "hidden";

    const chatCard = document.querySelector('.chat-card-wrapper');
    if (chatCard) {
      const cardHeight = `calc(100vh - ${navHeight}px - 2rem)`;
      chatCard.style.height = cardHeight;
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      if (pageWrapper) {
        pageWrapper.style.padding = '';
        pageWrapper.style.minHeight = '';
        pageWrapper.style.height = '';
      }
      if (chatCard) {
        chatCard.style.height = '';
      }
    };
  }, []);

  // Load thông tin người dùng theo ID
  const loadUserName = async (userId) => {
    if (!userId || userNamesMap[userId]) return userNamesMap[userId];

    try {
      const response = await api.get(`/auth/seller/${userId}`);
      const userData = response.data?.data || response.data;
      const username = userData?.username || `User ${userId.substring(0, 8)}`;

      setUserNamesMap(prev => ({ ...prev, [userId]: username }));
      return username;
    } catch (err) {
      console.error("Error loading user name:", err);
      const fallbackName = `User ${userId?.substring(0, 8) || 'Unknown'}`;
      setUserNamesMap(prev => ({ ...prev, [userId]: fallbackName }));
      return fallbackName;
    }
  };

  // Load thông tin người dùng khác
  const loadOtherParticipant = async (otherParticipantId) => {
    if (!otherParticipantId) return;
    try {
      const response = await api.get(`/auth/seller/${otherParticipantId}`);
      const userData = response.data?.data || response.data;
      setOtherParticipant(userData);
      if (userData?.username) {
        setUserNamesMap(prev => ({ ...prev, [otherParticipantId]: userData.username }));
      }
    } catch (err) {
      console.error("Error loading other participant:", err);
      setOtherParticipant({ username: `User ${otherParticipantId?.substring(0, 8)}`, _id: otherParticipantId });
    }
  };

  // Load messages ban đầu
  const loadInitialMessages = async (targetRoomId) => {
    if (!targetRoomId) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetchChatMessages(targetRoomId, { limit: 100 });
      const messagesData = response?.data || response || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, 100);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(err.response?.data?.message || err.message || "Lỗi khi tải tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe danh sách phòng chat real-time từ Firebase
  useEffect(() => {
    if (!currentUser) return;

    const currentUserId = currentUser._id || currentUser.id;
    if (!currentUserId) return;

    setRoomsLoading(true);
    setRoomsError("");

    const userRoomsRef = ref(db, `userChatRooms/${currentUserId}`);

    const unsubscribe = onValue(
      userRoomsRef,
      async (snapshot) => {
        // Bắt đầu quá trình tải/cập nhật
        setRoomsLoading(true);
        setRoomsError("");

        if (snapshot.exists()) {
          const roomsData = snapshot.val();
          const roomIds = Object.keys(roomsData);

          // --- FAN-OUT READS: Bất đồng bộ để lấy chi tiết phòng và tên người dùng ---
          const roomsPromises = roomIds.map(async (roomIdKey) => {
            try {
              const roomDetailRef = ref(db, `chatRooms/${roomIdKey}`);
              const roomDetailSnapshot = await get(roomDetailRef);

              if (!roomDetailSnapshot.exists()) return null;

              const roomData = roomDetailSnapshot.val();
              const participantIds = Object.keys(roomData.participants || {});

              // Đảm bảo người dùng hiện tại là thành viên và tìm ID đối phương
              // Giả định 'currentUserId' đã được định nghĩa và có sẵn trong scope này
              if (!roomData.participants || !roomData.participants[currentUserId]) {
                return null;
              }

              const otherParticipantId = participantIds.find(
                id => id !== currentUserId
              );

              if (!otherParticipantId) return null;

              // Lấy tên người dùng (dựa vào hàm loadUserName đã được định nghĩa bên ngoài)
              const username = await loadUserName(otherParticipantId);

              return {
                roomId: roomIdKey,
                otherParticipantId: otherParticipantId,
                otherParticipantName: username,
                lastMessageText: roomData.lastMessageText || "",
                lastMessageTimestamp: roomData.lastMessageTimestamp || null,
                createdAt: roomData.createdAt || null,
              };
            } catch (err) {
              console.error(`Error loading room ${roomIdKey}:`, err);
              return null; // Trả về null nếu có lỗi với một phòng cụ thể
            }
          });

          const roomsArray = (await Promise.all(roomsPromises)).filter(room => room !== null);

          // Sắp xếp
          roomsArray.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

          setChatRooms(roomsArray);
        } else {
          setChatRooms([]); // Không có phòng nào
        }

        // *** CHỈ CẬP NHẬT SAU KHI TOÀN BỘ PROCESS BẤT ĐỒNG BỘ HOÀN TẤT ***
        setRoomsLoading(false);
        setRoomsError("");
      },
      (error) => {
        // Xử lý lỗi cấp độ listener (ví dụ: lỗi kết nối Firebase)
        console.error("Error loading chat rooms:", error);
        setRoomsError("Lỗi khi tải danh sách cuộc trò chuyện");
        setRoomsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Xử lý khi có roomId từ URL hoặc receiverId
  useEffect(() => {
    if (!currentUser || !chatRooms.length) return;

    const currentUserId = currentUser._id || currentUser.id;

    if (receiverId && receiverId !== currentUserId) {
      const existingRoom = chatRooms.find(
        (room) => room.otherParticipantId === receiverId
      );
      if (existingRoom) {
        handleSelectRoom(existingRoom);
      } else {
        createOrGetRoomWithUser(receiverId);
      }
    } else if (roomId) {
      const room = chatRooms.find((r) => r.roomId === roomId);
      if (room) {
        handleSelectRoom(room);
      } else {
        setSelectedRoom({ roomId });
        loadInitialMessages(roomId);
      }
    }
  }, [roomId, receiverId, chatRooms, currentUser]);

  // Tạo hoặc lấy room với user
  const createOrGetRoomWithUser = async (receiverId) => {
    try {
      const response = await api.post("/chat/rooms", { receiverId });
      const roomData = response.data || response;
      const newRoomId = roomData?.roomId || roomData?.data?.roomId || roomData?._id || roomData?.id;

      if (newRoomId) {
        const username = await loadUserName(receiverId);

        const newRoom = {
          roomId: newRoomId,
          otherParticipantId: receiverId,
          otherParticipantName: username,
          lastMessageText: roomData?.data?.lastMessageText || "",
          lastMessageTimestamp: roomData?.data?.lastMessageTimestamp || null,
          createdAt: roomData?.data?.createdAt || null,
        };

        handleSelectRoom(newRoom);
      }
    } catch (err) {
      console.error("Error creating room:", err);
      setError(err.response?.data?.message || err.message || "Lỗi khi tạo cuộc trò chuyện");
    }
  };

  // Chọn room
  const handleSelectRoom = async (room) => {
    // *** THAY ĐỔI 3: Đóng sidebar khi chọn room khác ***
    setShowProfileSidebar(false);
    setProfileUserDetails(null); // Xóa dữ liệu cũ

    setSelectedRoom(room);
    setMessages([]);
    setError("");
    setText("");

    if (room.otherParticipantId) {
      await loadOtherParticipant(room.otherParticipantId);
    }

    await loadInitialMessages(room.roomId);

    navigate(`/chat/${room.roomId}`, { replace: true });
  };

  // Lắng nghe tin nhắn real-time từ Firebase
  useEffect(() => {
    if (!selectedRoom?.roomId) return;

    const messagesRef = ref(db, `chatRooms/${selectedRoom.roomId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesArray = Object.keys(messagesData).map((key) => ({
          _id: key,
          messageId: key,
          ...messagesData[key],
        })).sort((a, b) => {
          const timeA = a.timestamp || a.createdAt || 0;
          const timeB = b.timestamp || b.createdAt || 0;
          return timeA - timeB;
        });
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
    }, (error) => {
      console.error("Error listening to Firebase messages:", error);
      setError("Lỗi khi lắng nghe tin nhắn real-time");
    });

    return () => unsubscribe();
  }, [selectedRoom?.roomId]);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    }
  }, [messages]);

  // Gửi tin nhắn qua API
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !selectedRoom?.roomId || sending) return;

    setSending(true);
    setError("");
    try {
      await api.post(`/chat/rooms/${selectedRoom.roomId}/messages`, {
        text: text.trim()
      });
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || err.message || "Lỗi khi gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  // *** THAY ĐỔI 2: Sửa hàm xử lý xem profile ***
  const handleViewProfile = async () => {
    // Nếu đang mở, đóng nó lại
    if (showProfileSidebar) {
      setShowProfileSidebar(false);
      return;
    }

    if (!selectedRoom?.otherParticipantId) {
      console.error("Không tìm thấy ID người dùng để xem chi tiết.");
      return;
    }

    const userId = selectedRoom.otherParticipantId;

    // Mở sidebar
    setShowProfileSidebar(true);

    // Nếu đã có dữ liệu của user này thì không fetch lại
    if (profileUserDetails?._id === userId) {
      return;
    }

    // Fetch dữ liệu mới
    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileUserDetails(null); // Xóa dữ liệu cũ

      // Sử dụng endpoint bạn cung cấp
      const response = await api.get(`auth/userprofile/${userId}`);

      setProfileUserDetails(response.data?.data || response.data);
    } catch (err) {
      console.error("Lỗi khi tải thông tin user profile:", err);
      setProfileError(err.response?.data?.message || "Không thể tải chi tiết.");
    } finally {
      setProfileLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container py-8">
        <p>Đang tải...</p>
      </div>
    );
  }

  const currentUserId = currentUser._id || currentUser.id;

  return (
    <div className="container" style={{
      maxWidth: "60%", // Mở rộng container để chứa sidebar
      margin: "0 auto",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
    }}>
      <div className="card chat-card-wrapper" style={{
        display: "flex",
        overflow: "hidden",
        borderRadius: "var(--radius-lg)",
        padding: 0,
        minHeight: "90vh",
        maxHeight: "90vh",
      }}>

        {/* Sidebar - Danh sách cuộc trò chuyện */}
        <div
          style={{
            width: "350px",
            background: "var(--bg-card)",
            borderRight: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
            borderTopLeftRadius: "var(--radius-lg)",
            borderBottomLeftRadius: "var(--radius-lg)",
          }}
        >
          {/* Search bar - Fixed */}
          <div style={{
            padding: "12px",
            borderBottom: "1px solid var(--color-border)",
            flexShrink: 0,
          }}>
            <input
              type="text"
              className="form-input"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              style={{
                borderRadius: "20px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Rooms list - Scrollable */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            maxHeight: "100%",
          }}>
            {roomsLoading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-body)" }}>
                Đang tải...
              </div>
            ) : roomsError ? (
              <div className="error-message" style={{ margin: "20px", textAlign: "center" }}>
                {roomsError}
              </div>
            ) : chatRooms.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-body)" }}>
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              chatRooms.map((room) => {
                const isSelected = selectedRoom?.roomId === room.roomId;
                const lastMessageTime = room.lastMessageTimestamp
                  ? new Date(room.lastMessageTimestamp).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "";

                const displayName = room.otherParticipantName ||
                  userNamesMap[room.otherParticipantId] ||
                  `User ${room.otherParticipantId?.substring(0, 8) || 'Unknown'}`;

                return (
                  <div
                    key={room.roomId}
                    onClick={() => handleSelectRoom(room)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: isSelected ? "var(--bg-muted)" : "var(--bg-card)",
                      borderBottom: "1px solid var(--color-border)",
                      transition: "background 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "var(--bg-muted)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "var(--bg-card)";
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "#0084FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: isSelected ? 600 : 500,
                          color: "var(--text-heading)",
                          marginBottom: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {displayName}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--text-body)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {room.lastMessageText || "Chưa có tin nhắn"}
                      </div>
                    </div>
                    {lastMessageTime && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-body)",
                          flexShrink: 0,
                        }}
                      >
                        {lastMessageTime}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {selectedRoom ? (
          <div
            style={{
              flex: 1, // Panel này sẽ co lại khi sidebar bên phải xuất hiện
              display: "flex",
              flexDirection: "column",
              background: "var(--bg-card)",
              overflow: "hidden",
              minWidth: 0,
              borderTopRightRadius: showProfileSidebar ? 0 : "var(--radius-lg)", // Điều chỉnh border
              borderBottomRightRadius: showProfileSidebar ? 0 : "var(--radius-lg)", // Điều chỉnh border
            }}
          >
            {/* Chat header - Fixed */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "var(--bg-muted)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#0084FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {(otherParticipant?.username ||
                  selectedRoom.otherParticipantName ||
                  userNamesMap[selectedRoom.otherParticipantId] ||
                  selectedRoom.otherParticipantId?.charAt(0) ||
                  "?").charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-heading)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {otherParticipant?.username ||
                    selectedRoom.otherParticipantName ||
                    userNamesMap[selectedRoom.otherParticipantId] ||
                    `User ${selectedRoom.otherParticipantId?.substring(0, 8) || 'Unknown'}`}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-body)" }}>Đang hoạt động</div>
              </div>

              <button
                className="btn"
                onClick={handleViewProfile} // Sửa lại hàm này
                style={{
                  background: showProfileSidebar ? "var(--bg-muted)" : "transparent",
                  border: "1px solid var(--color-border)",
                  color: "var(--text-body)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {showProfileSidebar ? "Đóng" : "Chi tiết"}
              </button>

            </div>

            {/* Messages - Scrollable */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "20px",
                background: "#FFFFFF",
                maxHeight: "100%",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {loading && messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-body)" }}>
                  Đang tải tin nhắn...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-body)" }}>
                  Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {messages.map((msg, i) => {
                    const isMine = msg.senderId === currentUserId;

                    const timestamp = msg.timestamp || msg.createdAt;
                    const timeLabel = timestamp
                      ? new Date(timestamp).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "";

                    const prevMessage = i > 0 ? messages[i - 1] : null;
                    const showAvatar = !prevMessage || prevMessage.senderId !== msg.senderId;

                    const senderName = isMine
                      ? (currentUser.username || `User ${currentUserId?.substring(0, 8)}`)
                      : (userNamesMap[msg.senderId] || otherParticipant?.username || `User ${msg.senderId?.substring(0, 8) || 'Unknown'}`);

                    return (
                      <div
                        key={msg._id || msg.messageId || i}
                        style={{
                          display: "flex",
                          justifyContent: isMine ? "flex-end" : "flex-start",
                          marginBottom: "8px",
                          alignItems: "flex-end",
                          gap: "8px",
                        }}
                      >
                        {!isMine && showAvatar && (
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "#0084FF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {senderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {!isMine && !showAvatar && <div style={{ width: "32px" }} />}

                        <div
                          style={{
                            maxWidth: "60%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isMine ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              padding: "8px 12px",
                              borderRadius: "18px",
                              background: isMine ? "#0084FF" : "#E4E6EB",
                              color: isMine ? "white" : "#050505",
                              fontSize: "15px",
                              lineHeight: "1.33",
                              wordWrap: "break-word",
                              boxShadow: "var(--shadow-sm)",
                            }}
                          >
                            {msg.text || msg.content}
                          </div>
                          {timeLabel && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--text-body)",
                                marginTop: "4px",
                                padding: "0 8px",
                              }}
                            >
                              {timeLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area - Fixed */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid var(--color-border)",
                background: "var(--bg-muted)",
                flexShrink: 0,
              }}
            >
              {error && (
                <div className="error-message" style={{ marginBottom: "8px", fontSize: "13px" }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  className="form-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={sending}
                  style={{
                    flex: 1,
                    borderRadius: "20px",
                    fontSize: "15px",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="btn"
                  disabled={sending || !text.trim()}
                  style={{
                    borderRadius: "20px",
                    fontSize: "15px",
                    opacity: text.trim() && !sending ? 1 : 0.5,
                    cursor: text.trim() && !sending ? "pointer" : "not-allowed",
                    background: "#0084FF",
                    borderColor: "#0084FF",
                    color: "white",
                  }}
                >
                  {sending ? "Đang gửi..." : "Gửi"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-card)",
              color: "var(--text-body)",
              borderTopRightRadius: "var(--radius-lg)",
              borderBottomRightRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>💬</div>
              <div>Chọn một cuộc trò chuyện để bắt đầu</div>
            </div>
          </div>
        )}

        {/* *** THAY ĐỔI 4: Tab chi tiết bên phải *** */}
        {showProfileSidebar && (
          <div style={{
            width: "300px", // Kích thước tab
            borderLeft: "1px solid var(--color-border)",
            background: "var(--bg-card)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", // Ngăn cuộn chính nó
            flexShrink: 0,
            borderTopRightRadius: "var(--radius-lg)",
            borderBottomRightRadius: "var(--radius-lg)",
          }}>
            {/* Header của tab chi tiết */}
            <div style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--bg-muted)",
              flexShrink: 0,
            }}>
              <h5 style={{ margin: 0, fontSize: "16px", color: "var(--text-heading)" }}>
                Thông tin chi tiết
              </h5>
              <button
                onClick={() => setShowProfileSidebar(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "var(--text-body)",
                  padding: "0 5px",
                }}
              >
                &times; {/* Dấu X */}
              </button>
            </div>

            {/* Nội dung của tab chi tiết */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {profileLoading && <p>Đang tải...</p>}
              {profileError && <p className="error-message">{profileError}</p>}
              {profileUserDetails && (
                <div>
                  <p style={{ marginBottom: "12px" }}>
                    <strong>Username:</strong>
                    <br />
                    <span style={{ color: "var(--text-body)" }}>
                      {profileUserDetails.username}
                    </span>
                  </p>
                  <p style={{ marginBottom: "12px" }}>
                    <strong>Họ:</strong>
                    <br />
                    <span style={{ color: "var(--text-body)" }}>
                      {profileUserDetails.firstName || 'Chưa cập nhật'}
                    </span>
                  </p>
                  <p style={{ marginBottom: "12px" }}>
                    <strong>Tên:</strong>
                    <br />
                    <span style={{ color: "var(--text-body)" }}>
                      {profileUserDetails.lastName || 'Chưa cập nhật'}
                    </span>
                  </p>
                  <p style={{ marginBottom: "12px" }}>
                    <strong>Email:</strong>
                    <br />
                    <span style={{ color: "var(--text-body)" }}>
                      {profileUserDetails.email}
                    </span>
                  </p>
                  <p style={{ marginBottom: "12px" }}>
                    <strong>Số điện thoại:</strong>
                    <br />
                    <span style={{ color: "var(--text-body)" }}>
                      {profileUserDetails.phone || 'Chưa cập nhật'}
                    </span>
                  </p>
                  <p style={{ marginBottom: "12px" }}>
                    <strong>UID:</strong>
                    <br />
                    <span style={{ color: "var(--text-body)", wordBreak: "break-all" }}>
                      {profileUserDetails._id}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatRoomPage;