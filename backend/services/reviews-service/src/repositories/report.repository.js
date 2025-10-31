import prisma from '../../prisma/client.js';

class ReportRepository {
  async findAllReport() {
    return prisma.reports.findMany();
  }

  async findByReporterId(reporterId) {
    return prisma.reports.findMany({
      where: { reporterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data) {
    return prisma.reports.create({
      data,
    });
  }

  async updateStatus(id, data) {
    return prisma.reports.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return prisma.reports.delete({
      where: { id },
    });
  }
}

export default new ReportRepository();
