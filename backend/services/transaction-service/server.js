const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin.routes');
const cassoWebhookRoutes = require('./routes/cassoWebhook');

// 🆕 NEW: Import controllers
const transactionRoleController = require('./controllers/transactionRoleController');
const depositController = require('./controllers/depositController');
const withdrawalController = require('./controllers/withdrawalController');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// Register models
require('./models/schemas/FeeConfig');
require('./models/schemas/Transaction');
require('./models/schemas/DepositRequest');
require('./models/schemas/WithdrawalRequest');

const app = express();
const port = 3001;

const mongoURI = 'mongodb://mongodb:27017/transaction_db';

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware for Casso webhook
app.use('/webhooks/casso', bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Middleware
app.use(bodyParser.json());

// Existing routes
app.use('/admin', adminRoutes);
app.use('/orders', orderRoutes);
app.use('/webhooks/casso', cassoWebhookRoutes);

// 🆕 NEW: Transaction Role Routes
app.get('/transactions/my-transactions', authenticateToken, transactionRoleController.getMyTransactions);
app.get('/transactions/seller/pending', authenticateToken, transactionRoleController.getSellerPendingTransactions);
app.get('/transactions/:id', authenticateToken, transactionRoleController.getTransactionById);
app.post('/transactions/:id/cancel', authenticateToken, transactionRoleController.cancelTransaction);
app.get('/transactions/:id/can-message', authenticateToken, transactionRoleController.canMessage);
app.post('/transactions/:id/sign', authenticateToken, transactionRoleController.signContract);

// 🆕 NEW: Deposit Routes (User)
app.post('/deposits/request', authenticateToken, depositController.createDepositRequest);
app.get('/deposits/my-requests', authenticateToken, depositController.getMyDepositRequests);

// 🆕 NEW: Deposit Routes (Admin)
app.get('/admin/deposits/pending', authenticateToken, requireAdmin, depositController.getPendingDeposits);
app.post('/admin/deposits/:id/approve', authenticateToken, requireAdmin, depositController.approveDeposit);
app.post('/admin/deposits/:id/reject', authenticateToken, requireAdmin, depositController.rejectDeposit);
app.get('/admin/deposits/history', authenticateToken, requireAdmin, depositController.getDepositHistory);

// 🆕 NEW: Withdrawal Routes (User)
app.post('/withdrawals/request', authenticateToken, withdrawalController.createWithdrawalRequest);
app.get('/withdrawals/my-requests', authenticateToken, withdrawalController.getMyWithdrawalRequests);

// 🆕 NEW: Withdrawal Routes (Admin)
app.get('/admin/withdrawals/pending', authenticateToken, requireAdmin, withdrawalController.getPendingWithdrawals);
app.post('/admin/withdrawals/:id/approve', authenticateToken, requireAdmin, withdrawalController.approveWithdrawal);
app.post('/admin/withdrawals/:id/reject', authenticateToken, requireAdmin, withdrawalController.rejectWithdrawal);
app.get('/admin/withdrawals/history', authenticateToken, requireAdmin, withdrawalController.getWithdrawalHistory);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Transaction Service running on http://localhost:${port}`);
  console.log('\n📋 Available Endpoints:');
  console.log('\n🛒 Orders:');
  console.log('  - GET    /orders/history');
  console.log('  - POST   /orders');
  console.log('  - POST   /orders/:id/payment');
  console.log('  - GET    /orders/:id/contract');

  console.log('\n💰 Transactions (Role-based):');
  console.log('  - GET    /transactions/my-transactions');
  console.log('  - GET    /transactions/seller/pending');
  console.log('  - GET    /transactions/:id');
  console.log('  - POST   /transactions/:id/cancel');
  console.log('  - GET    /transactions/:id/can-message');
  console.log('  - POST   /transactions/:id/sign');

  console.log('\n💸 Deposits:');
  console.log('  - POST   /deposits/request');
  console.log('  - GET    /deposits/my-requests');
  console.log('  - GET    /admin/deposits/pending');
  console.log('  - POST   /admin/deposits/:id/approve');
  console.log('  - POST   /admin/deposits/:id/reject');
  console.log('  - GET    /admin/deposits/history');

  console.log('\n💳 Withdrawals:');
  console.log('  - POST   /withdrawals/request');
  console.log('  - GET    /withdrawals/my-requests');
  console.log('  - GET    /admin/withdrawals/pending');
  console.log('  - POST   /admin/withdrawals/:id/approve');
  console.log('  - POST   /admin/withdrawals/:id/reject');
  console.log('  - GET    /admin/withdrawals/history');

  console.log('\n🔧 Admin:');
  console.log('  - GET    /admin/fees');

  console.log('\n🔗 Webhooks:');
  console.log('  - POST   /webhooks/casso');

  console.log('\n✅ Service ready!\n');
});