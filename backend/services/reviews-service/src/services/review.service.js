const reviewRepository = require('../repositories/review.repository');

class ReviewService {
  async getReviewsByUserId(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid userId');
    }
    return await reviewRepository.findByUserId(parseInt(userId));
  }

  async getReviewsByListingId(listingId) {
    if (!listingId || isNaN(listingId)) {
      throw new Error('Invalid listingId');
    }
    return await reviewRepository.findByListingId(parseInt(listingId));
  }

  async createReview({ userId, listingId, rating, content }) {
    if (!userId || isNaN(userId) || !listingId || isNaN(listingId) || !rating || isNaN(rating)) {
      throw new Error('user_id, product_id, and rating are required');
    }
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return await reviewRepository.create({ userId, listingId, rating, content });
  }

  async updateReview(id, { rating, content }) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid review id');
    }
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (content !== undefined) updateData.content = content;
    return await reviewRepository.update(parseInt(id), updateData);
  }

  async deleteReview(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid review id');
    }
    try {
      return await reviewRepository.delete(parseInt(id));
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Review not found');
      }
      throw error;
    }
  }

  async getReviewStats(listingId) {
    if (!listingId || isNaN(listingId)) {
      throw new Error('Invalid listing id');
    }
    const { stats, distribution } = await reviewRepository.getStats(parseInt(listingId));
    return {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.id || 0,
      distribution
    };
  }
}

module.exports = new ReviewService();