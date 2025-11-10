import express from 'express';
import prisma from './prisma/client.js';
import reviewController from './src/controllers/review.controller.js';
import reportController from './src/controllers/report.controller.js';
const { authmiddleware } = require('./shared/authmiddleware');
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

// Review Routes
app.get('/reviews/user/:userId', reviewController.getReviewsByUserId);
app.get('/reviews/listing/:listingId', reviewController.getReviewsByListingId);
app.get('/reviews/stats/:listingId', reviewController.getReviewStats);
app.post('/reviews', authmiddleware, reviewController.createReview);
app.put('/reviews/:id', authmiddleware, reviewController.updateReview);
app.delete('/reviews/:id', authmiddleware, reviewController.deleteReview);
// Report Routes
app.get('/reports', reportController.getAllReports);
app.get('/reports/user/:userId', reportController.getReportsByUserId);
app.post('/reports', authmiddleware, reportController.createReport);
app.put('/reports/:id', authmiddleware, reportController.updateReportStatus);
app.delete('/reports/:id', authmiddleware, reportController.deleteReport);

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
