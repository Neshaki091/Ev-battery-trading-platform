import api from './api';

/**
 * Lấy thông tin chi tiết đơn hàng
 * @param {string} orderId - ID của đơn hàng
 */
export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get('/transactions/orders/history');
    const orders = response.data?.data || response.data || [];
    return orders.find(o => o._id === orderId || o.id === orderId);
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra trạng thái thanh toán của đơn hàng
 * @param {string} orderId - ID của đơn hàng
 */
export const checkPaymentStatus = async (orderId) => {
  try {
    const order = await getOrderDetails(orderId);
    return {
      isPaid: order?.status === 'paid' || order?.status === 'completed',
      status: order?.status,
      cassoPayment: order?.cassoPayment,
      paidAt: order?.paidAt
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Xử lý thanh toán thủ công (nút thanh toán cũ)
 * @param {string} orderId - ID của đơn hàng
 */
export const processManualPayment = async (orderId) => {
  try {
    const response = await api.post(`/transactions/orders/${orderId}/payment/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tải hợp đồng PDF
 * @param {string} orderId - ID của đơn hàng
 */
export const downloadContract = async (orderId) => {
  try {
    const response = await api.get(`/transactions/orders/${orderId}/contract`, {
      responseType: 'blob'
    });
    
    // Tạo URL từ blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contract_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

export default {
  getOrderDetails,
  checkPaymentStatus,
  processManualPayment,
  downloadContract
};

