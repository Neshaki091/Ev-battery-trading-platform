const prisma = require('../../prisma/client');

class ReviewRepository {
  async findById(id) {
    return await prisma.review.findUnique({
      where: { id },
    });
  }
  // 🆕 BỔ SUNG: Kiểm tra Review đã tồn tại theo cặp (userId, listingId)
  async findExisting(userId, listingId) {
    return await prisma.review.findFirst({
      where: { userId, listingId },
    });
  }

  async findByUserId(userId) {
    return await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByListingId(listingId) {
    return await prisma.review.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data) {
    return await prisma.review.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return await prisma.review.delete({
      where: { id },
    });
  }

  async getStats(listingId) {
    const [stats, distribution] = await Promise.all([
      prisma.review.aggregate({
        where: { listingId },
        _avg: { rating: true },
        _count: { id: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { listingId },
        _count: { id: true },
        orderBy: { rating: 'asc' }, // Sắp xếp cho dễ đọc
      }),
    ]);
    return { stats, distribution };
  }
}

module.exports = new ReviewRepository();