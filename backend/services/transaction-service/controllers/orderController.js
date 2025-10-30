const Transaction = require('../utils/Transaction');
const pdfGenerator = require('../utils/pdfGenerator');


const createOrder = async (req, res) => {
  try {
    const { userId, sellerId, listingId, price, type } = req.body;
    
    if (!userId || !sellerId || !listingId || !price || !type) {
      return res.status(400).json({ success: false, error: 'Missing required fields: userId, sellerId, listingId, price, type' });
    }
    
    // Thêm check length hex (24 chars) để debug
    if (userId.length !== 24 || sellerId.length !== 24 || listingId.length !== 24) {
      return res.status(400).json({ success: false, error: 'Invalid ObjectId format (must be 24 hex chars)' });
    }
    
    const order = await Transaction.createNew(userId, sellerId, listingId, parseFloat(price), type);
    
    console.log(`Order created: ${order._id} with userId: ${order.userId}`);  // Log để check
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);  // Log full error
    res.status(500).json({ success: false, error: error.message });
  }
};


// 2. Thanh toán giả lập
// Trong processPayment:
const processPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Transaction.findById(id);  // Tìm trước để check status (không populate)
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Order is not pending' });
    }
    
    const updates = { status: 'paid', paidAt: new Date() };
    const updatedOrder = await Transaction.updateById(id, updates);  // Không populate → IDs giữ string
    
    console.log(`Payment simulated for order: ${id}, userId: ${updatedOrder.userId}`);  // Log để check
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const generateContract = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Transaction.findById(id);  // Không populate để lấy string ID gốc
    
    console.log(`Debug PDF: ID=${id}, Status=${order ? order.status : 'NOT FOUND'}`);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Order must be paid to generate contract' });
    }
    

    const orderForPDF = {
      id: order._id.toString(),
      userId: order.userId.toString(),  // String ID thật
      itemId: order.listingId.toString(),  // String ID thật
      price: order.price,
      type: order.type,
      paidAt: order.paidAt
    };
    
    console.log(`Debug PDF map: userId=${orderForPDF.userId}, itemId=${orderForPDF.itemId}`);
    
    pdfGenerator.generate(res, orderForPDF);
  } catch (error) {
    console.error('Controller generate error:', error);
    res.status(500).json({ success: false, error: 'Internal server error in contract generation' });
  }
};

module.exports = {
  createOrder,
  processPayment,
  generateContract
};