const reviewService = require('../services/review.service');
const { publishEvent } = require('../../util/mqService');

class ReviewController {
  // Lấy Review theo User ID (API công khai)
  async getReviewsByUserId(req, res) {
    try {
      const userId = req.params.userId;
      const reviews = await reviewService.getReviewsByUserId(userId);
      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      console.error('Error in getReviewsByUserId:', error);
      const statusCode = error.message.includes('Invalid') ? 400 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  } // Lấy Review theo Listing ID (API công khai)
  async getReviewsByListingId(req, res) {
    try {
      const listingId = req.params.listingId;
      const reviews = await reviewService.getReviewsByListingId(listingId);
      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      console.error('Error in getReviewsByListingId:', error);
      const statusCode = error.message.includes('Invalid') ? 400 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async createReview(req, res) {
    try {
      // 🔑 LẤY userId TỪ TOKEN (req.user)
      const userId = req.user._id;
      const { listingId, rating, content } = req.body;

      const review = await reviewService.createReview({ userId, listingId, rating, content });

      // Publish event to RabbitMQ for analytics service
      try {
        await publishEvent('review_created', {
          reviewId: review.id,
          rating: review.rating,
          listingId: review.listingId,
        });
      } catch (error) {
        console.error('Error publishing review_created event:', error.message);
      }

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('Error creating review:', error);
      const statusCode = error.message.includes('required') || error.message.includes('must be') ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateReview(req, res) {
    try {
      // 🔑 LẤY userId TỪ TOKEN để kiểm tra quyền
      const userIdFromToken = req.user._id;
      const { rating, content } = req.body;
      const review = await reviewService.updateReview(req.params.id, { rating, content }, userIdFromToken);
      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('Error updating review:', error); // Thêm xử lý lỗi Access denied (403)
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Access denied')
        ? 403
        : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async deleteReview(req, res) {
    try {
      // 🔑 LẤY userId TỪ TOKEN để kiểm tra quyền
      const userIdFromToken = req.user._id;
      const review = await reviewService.deleteReview(req.params.id, userIdFromToken);
      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
        data: review,
      });
    } catch (error) {
      console.error('Error deleting review:', error); // Thêm xử lý lỗi Access denied (403)
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('Access denied')
        ? 403
        : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async getReviewStats(req, res) {
    try {
      const listingId = req.params.listingId;
      const stats = await reviewService.getReviewStats(listingId);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting review stats:', error);
      const statusCode = error.message.includes('Invalid') ? 400 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReviewController();
