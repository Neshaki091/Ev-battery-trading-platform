// listing-service/utils/mqService.js (Code Đã Sửa)
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = 'listing_events';
let channel;
const RETRY_DELAY = 5000; // Thử lại sau 5 giây

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log('✅ Connected to RabbitMQ (Listing Service)');

        // Thêm xử lý lỗi ngắt kết nối
        connection.on("error", (err) => {
            console.error('⚠️ RabbitMQ connection lost. Reconnecting...', err.message);
            // Gọi lại hàm kết nối để thiết lập lại channel
            setTimeout(connectRabbitMQ, RETRY_DELAY);
        });

    } catch (error) {
        // Lỗi kết nối ban đầu (ECONNREFUSED)
        console.error(`❌ RabbitMQ connection error: ${error.message}. Retrying in ${RETRY_DELAY / 1000}s...`);
        // Tự động thử lại
        setTimeout(connectRabbitMQ, RETRY_DELAY);
    }
}

async function sendMessage(message) {
    if (!channel) {
        console.error('RabbitMQ channel not available. Message dropped or waiting for reconnection.');
        return;
    }
    try {
        const messageString = JSON.stringify(message);
        // Gửi tin nhắn vào Queue (sử dụng assertQueue trong connect)
        channel.sendToQueue(QUEUE_NAME, Buffer.from(messageString), { 
            persistent: true // Giữ tin nhắn trên đĩa cho đến khi Consumer nhận được
        });
        console.log(`[MQ] Sent message: ${message.event} for ID ${message.data?._id || message.id}`);
    } catch (err) {
        console.error('Failed to send message to RabbitMQ:', err.message);
    }
}

module.exports = { connectRabbitMQ, sendMessage };