const express = require('express');
const prisma = require('./prisma/client');
const reviewController = require('./src/controllers/review.controller');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      service: 'reviews-service',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      service: 'reviews-service',
      database: 'disconnected',
    });
  }
});

app.get('/api/reviews/user/:userId', reviewController.getReviewsByUserId);
app.get('/api/reviews/listing/:listingId', reviewController.getReviewsByListingId);
app.post('/api/reviews', reviewController.createReview);
app.put('/api/reviews/:id', reviewController.updateReview);
app.delete('/api/reviews/:id', reviewController.deleteReview);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma');

    app.listen(port, () => {
      console.log(`🚀 Reviews service is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
