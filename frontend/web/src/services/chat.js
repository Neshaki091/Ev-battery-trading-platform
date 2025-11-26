// src/services/chat.js
import api from './api'; // Import axios instance chung

/**
 * Tạo hoặc lấy phòng chat (gọi backend).
 * @param {string} receiverId - ID của người nhận.
 */
export const createOrGetRoom = (receiverId) =>
  api.post('/chat/rooms', { receiverId }).then((res) => res.data);

/**
 * Gửi tin nhắn vào một phòng chat (gọi backend).
 * @param {string} roomId - ID của phòng chat.
 * @param {string} text - Nội dung tin nhắn.
 */
export const sendMessage = (roomId, text) =>
  api.post(`/chat/rooms/${roomId}/messages`, { text }).then((res) => res.data);

/**
 * Lấy danh sách tin nhắn cũ (dùng khi mới mở chat).
 * @param {string} roomId - ID của phòng chat.
 * @param {object} params - Tùy chọn (ví dụ: limit).
 */
export const fetchMessages = (roomId, params = {}) =>
  api.get(`/chat/rooms/${roomId}/messages`, { params }).then((res) => res.data);

/**
 * Lấy tất cả phòng chat của user hiện tại (gọi backend).
 */
export const fetchUserRooms = () =>
  api.get('/chat/rooms').then((res) => res.data);

/**
 * Lấy thông báo (tin nhắn chưa đọc) (gọi backend).
 */
export const fetchNotifications = (params = {}) =>
  api.get('/chat/notifications', { params }).then((res) => res.data);