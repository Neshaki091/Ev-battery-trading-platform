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
      console.error('Error in getAllReports:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getReportsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const reports = await ReportService.getUserReports(userId);
      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    } catch (error) {
      console.error('Error in getReportsByUserId:', error);
      const statusCode = error.message.includes('Invalid') ? 400 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async createReport(req, res) {
    try {
      const reporterId = req.user._id;
      const { subjectType, subjectId, reasonCode, details } = req.body;
      const newReport = await ReportService.createReport({
        reporterId,
        subjectType,
        subjectId,
        reasonCode,
        details,
      });
      res.status(201).json({ success: true, data: newReport });
    } catch (error) {
      console.error('Error creating report:', error);
      const statusCode = error.message.includes('required') ? 400 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async updateReportStatus(req, res) {
    try {
      const reporterIdFromToken = req.user._id;
      const { status, resolverId } = req.body;
      const updatedReport = await ReportService.updateReportStatus(
        req.params.id,
        { status, resolverId },
        reporterIdFromToken
      );
      res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
      console.error('Error updating report status:', error);
      const statusCode =
        error.message.includes('Invalid') || error.message.includes('not found')
          ? 404
          : error.message.includes('required') || error.message.includes('Access denied')
          ? 400
          : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async deleteReport(req, res) {
    try {
      const reporterIdFromToken = req.user._id;
      const deletedReport = await ReportService.deleteReport(req.params.id, reporterIdFromToken);
      res.status(200).json({
        success: true,
        message: 'Report deleted successfully',
        data: deletedReport,
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      const statusCode = error.message === 'Report not found' ? 404 : error.message.includes('Invalid') ? 400 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

export default new ReportController();
