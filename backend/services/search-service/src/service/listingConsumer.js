const amqp = require('amqplib');
const Listing = require('../models/listing');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = 'listing_events';
const RETRY_DELAY = 5000; // 5 giây chờ trước khi thử lại

// Hàm để lấy dữ liệu đồng bộ (giúp code dễ đọc hơn)
const getListingSyncData = (listingData) => ({
    title: listingData.title,
    description: listingData.description,
    price: listingData.price,
    location: listingData.location,
    condition: listingData.condition,
    status: listingData.status,
    category: listingData.category,

    // CÁC TRƯỜNG MỚI ĐƯỢC THÊM
    // Giả định dữ liệu gửi qua RabbitMQ có cấu trúc phẳng hoặc chứa các trường này
    vehicle_brand: listingData.vehicle_brand,
    vehicle_model: listingData.vehicle_model,
    vehicle_manufacturing_year: listingData.vehicle_manufacturing_year,
    vehicle_mileage_km: listingData.vehicle_mileage_km,
    battery_capacity_kwh: listingData.battery_capacity_kwh,
    battery_condition_percentage: listingData.battery_condition_percentage,

    vehicle_id: listingData.vehicle_id,
    battery_id: listingData.battery_id
});

async function connectAndConsume() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log('✅ Connected to RabbitMQ (Search Service). Waiting for messages...');

        connection.on("error", (err) => {
            console.error('⚠️ RabbitMQ connection lost. Reconnecting...', err.message);
            setTimeout(startListingConsumer, RETRY_DELAY); 
        });

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const message = JSON.parse(msg.content.toString());
                    const listingData = message.data;

                    console.log(`[Search Service] Received event: ${message.event}`);

                    // --- LOGIC XỬ LÝ SỰ KIỆN (ĐÃ CẬP NHẬT) ---
                    if (message.event === 'listing_created') {
                        const syncData = getListingSyncData(listingData);
                        const searchListing = new Listing({
                            _id: listingData._id, // Giữ _id đồng bộ
                            ...syncData,
                        });
                        await searchListing.save();
                        console.log(`[Search Service] Created listing: ${listingData._id}`);

                    } else if (message.event === 'listing_updated') {
                        const updateFields = getListingSyncData(listingData);
                        await Listing.findByIdAndUpdate(listingData._id, updateFields, { new: true });
                        console.log(`[Search Service] Updated listing: ${listingData._id}`);

                    } else if (message.event === 'listing_deleted') {
                        await Listing.findByIdAndDelete(message.id);
                        console.log(`[Search Service] Deleted listing: ${message.id}`);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error('❌ Error processing message. Nacking...', error.message);
                    channel.nack(msg);
                }
            }
        });

    } catch (error) {
        console.error(`❌ RabbitMQ connection failed: ${error.message}. Retrying in ${RETRY_DELAY / 1000}s...`);
        setTimeout(connectAndConsume, RETRY_DELAY);
    }
}

async function startListingConsumer() {
    await connectAndConsume();
}
 
module.exports = { startListingConsumer };