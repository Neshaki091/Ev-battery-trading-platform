// util/mqService.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const EXCHANGE_NAME = 'platform_events';
let connection = null;
let channel = null;

async function connectRabbitMQ() {
    try {
        if (connection) return connection;
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        console.log('✅ Connected to RabbitMQ (Chat Service)');
        
        connection.on("error", (err) => {
            console.error('⚠️ RabbitMQ connection lost. Reconnecting...', err.message);
            connection = null;
            channel = null;
            setTimeout(connectRabbitMQ, 5000);
        });

        return connection;
    } catch (error) {
        console.error(`❌ RabbitMQ connection error: ${error.message}. Retrying in 5s...`);
        setTimeout(connectRabbitMQ, 5000);
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
            data: data
        };

        channel.publish(EXCHANGE_NAME, eventName, Buffer.from(JSON.stringify(message)), {
            persistent: true
        });
        
        console.log(`[MQ] Published event: ${eventName}`);
    } catch (error) {
        console.error(`Error publishing event ${eventName}:`, error.message);
    }
}

// Initialize connection on module load
connectRabbitMQ();

module.exports = { connectRabbitMQ, publishEvent, EXCHANGE_NAME };


