const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const EXCHANGE_NAME = "platform_events";
const QUEUE_NAME = "auction_events";
const RETRY_DELAY = 5000;

let connection = null;
let channel = null;

async function ensureConnection() {
  if (connection && channel) return channel;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log("✅ Connected to RabbitMQ (auction-service)");

    connection.on("error", (err) => {
      console.error("⚠️ RabbitMQ connection error:", err.message);
      connection = null;
      channel = null;
      setTimeout(ensureConnection, RETRY_DELAY);
    });

    connection.on("close", () => {
      console.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
      connection = null;
      channel = null;
      setTimeout(ensureConnection, RETRY_DELAY);
    });

    return channel;
  } catch (error) {
    console.error(
      `❌ RabbitMQ connection failed: ${error.message}. Retry in ${
        RETRY_DELAY / 1000
      }s`
    );
    setTimeout(ensureConnection, RETRY_DELAY);
  }
}

async function publishEvent(eventName, payload) {
  try {
    const ch = await ensureConnection();
    if (!ch) return;
    const message = JSON.stringify({ event: eventName, data: payload });
    ch.publish(EXCHANGE_NAME, eventName, Buffer.from(message), {
      persistent: true,
    });
  } catch (error) {
    console.error(`Failed to publish event ${eventName}:`, error.message);
  }
}

async function sendMessage(payload) {
  try {
    const ch = await ensureConnection();
    if (!ch) return;
    ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  } catch (error) {
    console.error("Failed to send message to queue:", error.message);
  }
}

ensureConnection();

module.exports = {
  ensureConnection,
  publishEvent,
  sendMessage,
  EXCHANGE_NAME,
};

