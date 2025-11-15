// src/services/api.js
import axios from 'axios';

// Tạo một instance của axios với URL gốc
const apiClient = axios.create({
  baseURL: 'http://api.waterbase.click/api', // URL gốc của backend
});

// Hàm nhận vào một đối tượng params và gọi API
export const fetchListings = async (params) => {
  try {
    // Axios tự động tạo chuỗi query string từ object params
    const response = await apiClient.get('/listings', { params });
    return response.data; // Axios tự động parse JSON
  } catch (error) {
    // Ném lỗi ra để component xử lý
    console.error("API call failed:", error.response || error.message);
    throw error;
  }
};