const cron = require('node-cron');
const Report = require('../models/Report');
const logger = require('../utils/logger');
// TODO: Implement real PDF/CSV generation with pdfkit/csv-writer and Cloudinary/S3 upload

const processPendingReports = async () => {
  try {
    const pendingReports = await Report.find({ status: 'PENDING' }).limit(5);

    for (const report of pendingReports) {
      report.status = 'PROCESSING';
      await report.save();

      try {
        logger.info(`Processing ${report.format} report for ${report._id}`);

        // Report file generation is not yet implemented.
        // When implemented:
        // 1. Fetch analytics data based on report.dateRange
        // 2. Generate PDF (pdfkit) or CSV (csv-writer)
        // 3. Upload to Cloudinary/S3 and save URL to report.fileUrl
        // 4. Set report.status = 'COMPLETED'

        report.status = 'FAILED';
        report.errorMessage = 'Report file generation not yet implemented.';
        await report.save();

      } catch (genError) {
        logger.error(`Failed to generate report ${report._id}`, genError);
        report.status = 'FAILED';
        report.errorMessage = genError.message;
        await report.save();
      }
    }
  } catch (error) {
    logger.error('Error in processPendingReports job:', error);
  }
};

// Run every 5 minutes to process any queued reports
const startReportJob = () => {
  cron.schedule('*/5 * * * *', processPendingReports);
};

module.exports = {
  processPendingReports,
  startReportJob
};
