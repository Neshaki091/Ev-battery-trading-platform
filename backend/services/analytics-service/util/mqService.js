
// util/mqService.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'platform_events';
let connection = null;

async function connectRabbitMQ() {
    try {
        if (connection) return connection;
        connection = await amqp.connect(RABBITMQ_URL);
        console.log('✅ Connected to RabbitMQ (Analytics Service)');
        
        connection.on("error", (err) => {
            console.error('⚠️ RabbitMQ connection lost. Reconnecting...', err.message);
            connection = null; // Đặt lại connection để reconnect
            setTimeout(connectRabbitMQ, 5000);
        });

        return connection;
    } catch (error) {
        console.error(`❌ RabbitMQ connection error: ${error.message}. Retrying in 5s...`);
        setTimeout(connectRabbitMQ, 5000);
    }
}

module.exports = { connectRabbitMQ, EXCHANGE_NAME };