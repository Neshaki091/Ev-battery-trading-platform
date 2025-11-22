// src/consumers/mqConsumer.js
const { connectRabbitMQ, EXCHANGE_NAME } = require('../../util/mqService');
const DailyStats = require('../models/DailyStats.model');
const moment = require('moment');

const getTodayStart = () => {
    return moment().startOf('day').toDate();
}

async function startConsumer() {
    const conn = await connectRabbitMQ();
    if (!conn) return;

    try {
        const channel = await conn.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        
        // Tạo queue độc quyền (exclusive) và bind với exchange
        const q = await channel.assertQueue('analytics_queue', { durable: true });
        
        // Bind với các events quan trọng
        await channel.bindQueue(q.queue, EXCHANGE_NAME, 'user_registered');
        await channel.bindQueue(q.queue, EXCHANGE_NAME, 'transaction_paid');
        await channel.bindQueue(q.queue, EXCHANGE_NAME, 'listing_created');
        
        console.log("👂 Waiting for platform events in %s", q.queue);

        channel.consume(q.queue, async (msg) => {
            const content = JSON.parse(msg.content.toString());
            const eventType = content.event;
            const data = content.data;
            
            const today = getTodayStart();

            // Tìm hoặc tạo DailyStats cho ngày hôm nay
            const stats = await DailyStats.findOneAndUpdate(
                { date: today },
                { $setOnInsert: { date: today } },
                { upsert: true, new: true }
            );

            // --- XỬ LÝ SỰ KIỆN ---
            try {
                if (eventType === 'user_registered') {
                    await DailyStats.updateOne({ _id: stats._id }, { $inc: { newUsers: 1 } });
                    console.log(`[Stats] User registered. New Users: +1`);
                } else if (eventType === 'listing_created') {
                    await DailyStats.updateOne({ _id: stats._id }, { $inc: { newListings: 1 } });
                    console.log(`[Stats] Listing created. New Listings: +1`);
                } else if (eventType === 'transaction_paid') {
                    // Giả định Transaction Service gửi price, commissionAmount
                    const revenue = data.price;
                    const commission = data.commissionAmount;
                    
                    await DailyStats.updateOne({ _id: stats._id }, { 
                        $inc: { 
                            totalRevenue: revenue,
                            totalCommission: commission,
                            totalTransactions: 1
                        }
                    });
                    console.log(`[Stats] Transaction paid. Commission: +${commission}`);
                }
            } catch (error) {
                console.error('Error processing event:', error);
                // Nếu lỗi, có thể reject tin nhắn để thử lại sau (hoặc log và ACK nếu tin nhắn không quan trọng)
            }

            channel.ack(msg);
        }, { noAck: false });

    } catch (error) {
        console.error('Error setting up consumer:', error);
    }
}

module.exports = { startConsumer };