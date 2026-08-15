const { askAI } = require('./aiProvider');
const { buildSystemInstruction, buildPrompt } = require('./promptBuilder');
const { getDashboardOverview } = require('../analytics/analyticsService');
const { getCachedHourlyPredictions } = require('../analytics/predictionService');
const AIUsage = require('../../models/AIUsage');
const ParkingLocation = require('../../models/ParkingLocation');
const logger = require('../../utils/logger');

const handleAnalyticsQuestion = async (userQuestion, user) => {
  const startTime = process.hrtime();
  let toolsUsed = [];
  let facts = {};
  
  try {
    // 1. Tool selection (Mocked tool router for safe DB access without direct LLM DB access)
    let intent = 'GENERAL';
    const q = userQuestion.toLowerCase();
    
    if (q.includes('revenue') || q.includes('booking')) {
      intent = 'REVENUE';
      facts = await getDashboardOverview();
      toolsUsed.push('getDashboardOverview');
    } else if (q.includes('busy') || q.includes('occupancy') || q.includes('peak')) {
      intent = 'OCCUPANCY';
      // Fetch predictions for all parking locations
      const locations = await ParkingLocation.find({}, '_id name');
      const occupancyData = {};
      for (const loc of locations) {
        const pred = await getCachedHourlyPredictions(loc._id);
        if (pred) {
          occupancyData[loc.name] = pred;
        }
      }
      facts = occupancyData;
      toolsUsed.push('getCachedHourlyPredictions');
    } else {
      facts = { message: "General intent detected. No specific tools required." };
    }

    // 2. Build Prompt (Strict structural instructions)
    const { systemInstruction } = require('./prompts/analytics-v1');
    const safePrompt = `User Question: "${userQuestion}"\nData Facts: ${JSON.stringify(facts)}`;

    // 3. Query LLM
    const answer = await askAI(safePrompt, systemInstruction);
    const diff = process.hrtime(startTime);
    const durationMs = Math.round((diff[0] * 1e3) + (diff[1] * 1e-6));

    // 4. Audit Log (AI Usage Tracking)
    if (user && user.tenantId) {
      await AIUsage.create({
        tenantId: user.tenantId,
        userId: user._id,
        endpoint: '/api/admin/ai/ask',
        question: userQuestion,
        tokensUsed: Math.round(answer.length * 1.5), // rough estimate
        estimatedCost: 0.001,
        toolsUsed,
        status: 'SUCCESS'
      });
    }

    logger.info('AI Analytics Request Processed', { intent, durationMs, provider: process.env.AI_PROVIDER || 'MOCK' });

    // Try to parse the structured answer, otherwise return as Answer
    const parsed = {
      answer: answer,
      evidence: "See full answer.",
      timePeriod: "Current",
      dataSource: toolsUsed.join(', '),
      recommendation: "Review the insights."
    };

    // Very naive parsing of the structured output
    if (answer.includes('Evidence:')) {
      parsed.answer = answer.split('Evidence:')[0].replace('Answer:', '').trim();
      
      const evidencePart = answer.split('Evidence:')[1];
      if (evidencePart.includes('Time period:')) {
        parsed.evidence = evidencePart.split('Time period:')[0].trim();
        const timePart = evidencePart.split('Time period:')[1];
        
        if (timePart.includes('Data source:')) {
          parsed.timePeriod = timePart.split('Data source:')[0].trim();
          const sourcePart = timePart.split('Data source:')[1];
          
          if (sourcePart.includes('Recommendation:')) {
            parsed.dataSource = sourcePart.split('Recommendation:')[0].trim();
            parsed.recommendation = sourcePart.split('Recommendation:')[1].trim();
          }
        }
      }
    }

    return {
      structured: parsed,
      raw: answer,
      dataBasis: facts,
      durationMs
    };
  } catch (error) {
    logger.error('Failed to handle analytics question:', error);
    
    if (user && user.tenantId) {
      await AIUsage.create({
        tenantId: user.tenantId,
        userId: user._id,
        endpoint: '/api/admin/ai/ask',
        question: userQuestion,
        status: 'ERROR'
      });
    }

    return {
      structured: {
        answer: "I don't have enough data to answer this reliably right now due to a service error.",
        evidence: "N/A",
        timePeriod: "N/A",
        dataSource: "N/A",
        recommendation: "Check back later or view dashboard manually."
      },
      error: error.message
    };
  }
};

module.exports = {
  handleAnalyticsQuestion
};
