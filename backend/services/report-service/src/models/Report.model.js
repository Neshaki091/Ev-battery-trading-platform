// reports-service/src/models/Report.model.js
const mongoose = require('mongoose');

// Enum tương ứng với Prisma Enums
const ReportSubjectType = ['REVIEW', 'LISTING', 'USER'];
const ReportReasonCode = ['SPAM', 'INAPPROPRIATE_CONTENT', 'HARASSMENT', 'OTHER'];
const ReportStatus = ['PENDING', 'RESOLVED', 'REJECTED'];

<<<<<<< HEAD
const ReportSchema = new mongoose.Schema({
    reporterId: { 
        type: String, // Lưu dưới dạng String vì ID từ Auth Service là String
        required: true 
    },
    subjectType: { 
        type: String, 
        enum: ReportSubjectType, 
        required: true 
    },
    subjectId: { 
        type: String, // ID của Listing, Review, hoặc User bị báo cáo
        required: true, 
        index: true 
    },
    reasonCode: { 
        type: String, 
        enum: ReportReasonCode, 
        required: true 
    },
    details: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ReportStatus, 
        default: 'PENDING' 
    },
    resolverId: { 
        type: String 
    }, // ID của Admin giải quyết
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
=======
const ReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: String,
      required: true,
    },
    subjectType: {
      type: String,
      enum: ReportSubjectType,
      required: true,
    },
    subjectId: {
      type: String,
      required: true,
      index: true,
    },
    reasonCode: {
      type: String,
      enum: ReportReasonCode,
      required: true,
    },
    details: {
      type: String,
    },
    status: {
      type: String,
      enum: ReportStatus,
      default: 'PENDING',
    },
    resolverId: {
      type: String,
    }, // ID của Admin giải quyết
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
>>>>>>> temp
