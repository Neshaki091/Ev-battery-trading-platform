const amqp = require('amqplib');
const Listing = require('../models/listing'); // Đảm bảo model này cũng có schema cho 'images'

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

    // === SỬA Ở ĐÂY: Chỉ lưu ảnh đầu tiên ===
    // Kiểm tra nếu mảng images tồn tại và có phần tử, thì chỉ lấy phần tử đầu tiên
    // Lưu nó vào một mảng mới để giữ đúng kiểu dữ liệu (Array<string>)
    images: (listingData.images && listingData.images.length > 0) 
        ? [listingData.images[0]] 
        : [],
    // ===================================

    // CÁC TRƯỜNG MỚI ĐƯỢC THÊM
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

                    // SỬA LỖI: Dùng upsert cho 'listing_created'
                    if (message.event === 'listing_created') {
                        // Hàm này giờ đã bao gồm 'images' (chỉ 1 ảnh)
                        const syncData = getListingSyncData(listingData);

                        // Thay vì .save(), dùng updateOne + upsert
                        await Listing.updateOne(
                            { _id: listingData._id }, // Điều kiện tìm
                            { $set: syncData },      // Dữ liệu (chỉ 1 ảnh)
                            { upsert: true, setDefaultsOnInsert: true } // Tạo mới nếu chưa có
                        );
                        console.log(`[Search Service] Upserted (created) listing: ${listingData._id}`);

                    } else if (message.event === 'listing_updated') {
                        // Hàm này giờ đã bao gồm 'images' (chỉ 1 ảnh)
                        const updateFields = getListingSyncData(listingData);
                        
                        await Listing.findByIdAndUpdate(listingData._id, updateFields, { new: true });
                        console.log(`[Search Service] Updated listing: ${listingData._id}`);

                    } else if (message.event === 'listing_deleted') {
                        await Listing.findByIdAndDelete(message.id);
                        console.log(`[Search Service] Deleted listing: ${message.id}`);
                    }

                    channel.ack(msg);
                } catch (error) {
                    // TÙY CHỌN NÂNG CAO: Bạn có thể kiểm tra lỗi E11000 và ack()
                    if (error.code === 11000) {
                        console.warn(`[Search Service] Ignored duplicate key (E11000). Acknowledging.`);
                        channel.ack(msg); // Ack() để xóa message trùng lặp
                    } else {
                        console.error('❌ Error processing message. Nacking...', error.message);
                        channel.nack(msg); // Chỉ nack() các lỗi không mong muốn khác
                    }
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