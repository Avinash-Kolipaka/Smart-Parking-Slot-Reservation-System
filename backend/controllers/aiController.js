const { handleAnalyticsQuestion } = require('../services/ai/analyticsAssistant');
const logger = require('../utils/logger');

const askAi = async (req, res, next) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }
    if (question.length > 500) {
      return res.status(400).json({ success: false, message: 'Question too long (max 500 characters)' });
    }

    const aiResponse = await handleAnalyticsQuestion(question, req.user);
    
    res.status(200).json({ success: true, data: aiResponse });
  } catch (error) {
    logger.error('Error in askAi controller:', error);
    next(error);
  }
};

module.exports = {
  askAi
};
