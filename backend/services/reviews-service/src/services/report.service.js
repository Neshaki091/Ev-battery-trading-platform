import reportRepository from '../repositories/report.repository.js';

class ReportService {
  async getAllReport() {
    return reportRepository.findAllReport();
  }

  async getUserReports(reporterId) {
    if (!reporterId) {
      throw new Error('Invalid reporterId');
    }
    return reportRepository.findByReporterId(reporterId);
  }

  async createReport({ reporterId, subjectType, subjectId, reasonCode, details }) {
    if (!reporterId || !subjectType || !subjectId || !reasonCode) {
      throw new Error('reporterId, subjectType, subjectId, and reasonCode are required');
    }
    return reportRepository.create({
      reporterId,
      subjectType,
      subjectId,
      reasonCode,
      details,
    });
  }

  async updateReportStatus(id, { status, resolverId }, reporterIdFromToken) {
    if (!id) {
      throw new Error('Invalid report id');
    }
    if (!status || !resolverId) {
      throw new Error('Status and resolverId are required');
    }

    const report = await reportRepository.findById(id);
    if (!report) {
      throw new Error('Report not found');
    }

    // So sánh ID từ DB với ID từ token
    if (report.reporterId !== reporterIdFromToken) {
      throw new Error('Access denied. You are not the owner.');
    }

    try {
      return reportRepository.updateStatus(id, { status, resolverId });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Report not found');
      }
      throw error;
    }
  }

  async deleteReport(id, reporterIdFromToken) {
    if (!id) {
      throw new Error('Invalid report id');
    }

    const report = await reportRepository.findById(id);
    if (!report) {
      throw new Error('Report not found');
    }

    // So sánh ID từ DB với ID từ token
    if (report.reporterId !== reporterIdFromToken) {
      throw new Error('Access denied. You are not the owner.');
    }

    try {
      return reportRepository.delete(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Report not found');
      }
      throw error;
    }
  }
}

export default new ReportService();
