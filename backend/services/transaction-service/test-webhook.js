/**
 * Test script for Casso Webhook
 * 
 * Usage:
 *   node test-webhook.js <orderId> [amount]
 * 
 * Example:
 *   node test-webhook.js 673abc987654321fedcba000 50000000
 */

const crypto = require('crypto');
const axios = require('axios');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3001/webhooks/casso';
const SECRET = process.env.CASSO_WEBHOOK_SECRET || 'your_secret_key_here';

// Get command line arguments
const orderId = process.argv[2];
const amount = process.argv[3] || 50000000;

if (!orderId) {
  console.error('❌ Error: Order ID is required');
  console.log('\nUsage:');
  console.log('  node test-webhook.js <orderId> [amount]');
  console.log('\nExample:');
  console.log('  node test-webhook.js 673abc987654321fedcba000 50000000');
  process.exit(1);
}

// Validate order ID format (24 hex characters)
if (!/^[a-f0-9]{24}$/i.test(orderId)) {
  console.error('❌ Error: Invalid order ID format');
  console.log('Order ID must be 24 hexadecimal characters (MongoDB ObjectId)');
  process.exit(1);
}

// Create webhook payload
const payload = {
  data: [
    {
      id: `trans_${Date.now()}`,
      amount: Number(amount),
      description: `Thanh toan ORDER#${orderId}`,
      bank_short_name: 'VCB',
      when: new Date().toISOString()
    }
  ]
};

// Convert payload to JSON string
const body = JSON.stringify(payload);

// Generate HMAC SHA256 signature
const signature = crypto
  .createHmac('sha256', SECRET)
  .update(body)
  .digest('hex');

console.log('🔧 Test Casso Webhook');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📍 URL:', WEBHOOK_URL);
console.log('🔑 Secret:', SECRET.substring(0, 10) + '...');
console.log('📦 Order ID:', orderId);
console.log('💰 Amount:', Number(amount).toLocaleString('vi-VN'), 'VND');
console.log('🔐 Signature:', signature);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Send webhook request
axios.post(WEBHOOK_URL, payload, {
  headers: {
    'Content-Type': 'application/json',
    'x-casso-signature': signature
  }
})
.then(response => {
  console.log('✅ Webhook sent successfully!\n');
  console.log('📊 Response Status:', response.status);
  console.log('📄 Response Data:');
  console.log(JSON.stringify(response.data, null, 2));
  
  if (response.data.success) {
    console.log('\n🎉 Transaction updated to PAID!');
  } else {
    console.log('\n⚠️  Webhook processed but with errors');
  }
})
.catch(error => {
  console.error('❌ Webhook failed!\n');
  
  if (error.response) {
    console.error('📊 Status:', error.response.status);
    console.error('📄 Response:');
    console.error(JSON.stringify(error.response.data, null, 2));
    
    if (error.response.status === 401) {
      console.error('\n💡 Tip: Check your CASSO_WEBHOOK_SECRET');
    } else if (error.response.status === 400) {
      console.error('\n💡 Tip: Make sure the order ID exists and is in pending status');
    }
  } else if (error.request) {
    console.error('📡 No response received from server');
    console.error('💡 Tip: Make sure the transaction service is running');
  } else {
    console.error('Error:', error.message);
  }
  
  process.exit(1);
});

