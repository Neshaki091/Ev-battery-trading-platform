import reviewRepository from '../repositories/review.repository.js';
class ReviewService {
  async getReviewsByUserId(userId) {
    if (!userId) {
      throw new Error('Invalid userId');
    }
    return await reviewRepository.findByUserId(userId);
  }

  async getReviewsByListingId(listingId) {
    if (!listingId) {
      throw new Error('Invalid listingId');
    }
    return await reviewRepository.findByListingId(listingId);
  }

  async createReview({ userId, listingId, rating, content }) {
    if (!userId || !listingId || !rating) {
      throw new Error('user_id, product_id, and rating are required');
    }
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    const existingReview = await reviewRepository.findExisting(userId, listingId);
    if (existingReview) {
      throw new Error('You have already submitted a review for this listing.');
    }
    return await reviewRepository.create({
      userId,
      listingId,
      rating,
      content,
    });
  }

  async updateReview(id, { rating, content }, userIdFromToken) {
    if (!id) {
      throw new Error('Invalid review id');
    }
    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    // So sánh ID từ DB với ID từ token
    if (review.userId !== userIdFromToken) {
      throw new Error('Access denied. You are not the owner.');
    }
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (content !== undefined) updateData.content = content;

    try {
      return await reviewRepository.update(id, updateData);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Review not found');
      }
      throw error;
    }
  }

  async deleteReview(id, userIdFromToken) {
    if (!id) {
      throw new Error('Invalid review id');
    }

    if (review.userId !== userIdFromToken) {
      throw new Error('Access denied. You are not the owner.');
    }
    try {
      return await reviewRepository.delete(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Review not found');
      }
      throw error;
    }
  }

  async getReviewStats(listingId) {
    if (!listingId) {
      throw new Error('Invalid listing id');
    }
    const { stats, distribution } = await reviewRepository.getStats(listingId);
    return {
      averageRating: stats._avg.rating ? parseFloat(stats._avg.rating.toFixed(2)) : 0,
      totalReviews: stats._count.id || 0,
      distribution,
    };
  }
}

export default new ReviewService();
