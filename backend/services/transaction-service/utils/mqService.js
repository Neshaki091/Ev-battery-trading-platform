// utils/mqService.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const EXCHANGE_NAME = 'platform_events';
const QUEUE_NAME = 'transaction_events';
const RETRY_DELAY = 5000;

let connection = null;
let channel = null;

async function connectRabbitMQ() {
    try {
        if (connection) return connection;

        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log('✅ Connected to RabbitMQ (Transaction Service)');

        connection.on("error", (err) => {
            console.error('⚠️ RabbitMQ connection lost. Reconnecting...', err.message);
            connection = null;
            channel = null;
            setTimeout(connectRabbitMQ, RETRY_DELAY);
        });

        connection.on("close", () => {
            console.warn('⚠️ RabbitMQ connection closed. Reconnecting...');
            connection = null;
            channel = null;
            setTimeout(connectRabbitMQ, RETRY_DELAY);
        });

        return connection;
    } catch (error) {
        console.error(`❌ RabbitMQ connection error: ${error.message}. Retrying in ${RETRY_DELAY / 1000}s...`);
        setTimeout(connectRabbitMQ, RETRY_DELAY);
    }
}

async function publishEvent(eventName, data) {
    try {
        if (!channel) {
            await connectRabbitMQ();
        }

        if (!channel) {
            console.error('RabbitMQ channel not available. Event not published.');
            return;
        }

        const message = {
            event: eventName,
            data: data,
            timestamp: new Date().toISOString()
        };

        channel.publish(EXCHANGE_NAME, eventName, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });

        console.log(`[MQ] Published event: ${eventName}`);
    } catch (error) {
        console.error(`Error publishing event ${eventName}:`, error.message);
    }
}

async function sendMessage(message) {
    try {
        if (!channel) {
            await connectRabbitMQ();
        }

        if (!channel) {
            console.error('RabbitMQ channel not available. Message not sent.');
            return;
        }

        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });

        console.log(`[MQ] Sent message to queue: ${QUEUE_NAME}`);
    } catch (error) {
        console.error('Error sending message to queue:', error.message);
    }
}

// Initialize connection on module load
connectRabbitMQ();

module.exports = { connectRabbitMQ, publishEvent, sendMessage, EXCHANGE_NAME, QUEUE_NAME };