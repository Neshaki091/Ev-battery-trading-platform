import ReportService from '../services/report.service.js';

class ReportController {
  async getAllReports(req, res) {
    try {
      const reports = await ReportService.getAllReport();
      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getReportsByUserId(req, res) {
    const { userId } = req.params;
    try {
      const reports = await ReportService.getUserReports(userId);
      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      const statusCode = error.message.includes('Invalid') ? 400 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async createReport(req, res) {
    const { reporterId, subjectType, subjectId, reasonCode, details } = req.body;
    try {
      const newReport = await ReportService.createReport({
        reporterId,
        subjectType,
        subjectId,
        reasonCode,
        details,
      });
      res.status(201).json({ success: true, data: newReport });
    } catch (error) {
      const statusCode = error.message.includes('required') ? 400 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async updateReportStatus(req, res) {
    const { id } = req.params;
    const { status, resolverId } = req.body;
    try {
      const updatedReport = await ReportService.updateReportStatus(id, { status, resolverId });
      res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
      let statusCode =
        error.message.includes('Invalid') || error.message.includes('required')
          ? 400
          : error.message.includes('Report not found')
          ? 404
          : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async deleteReport(req, res) {
    const { id } = req.params;
    try {
      const deletedReport = await ReportService.deleteReport(id);
      res.status(200).json({
        success: true,
        message: 'Report deleted successfully',
        data: deletedReport,
      });
    } catch (error) {
      let statusCode = error.message.includes('Invalid') ? 400 : error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

export default new ReportController();
