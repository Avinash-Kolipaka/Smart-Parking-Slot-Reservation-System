const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Generic abstraction for the AI Provider (OpenAI, Gemini, etc.)
 * Ensures no hard coupling to a single SDK and handles timeouts safely.
 */
const askAI = async (prompt, systemInstruction) => {
  const provider = process.env.AI_PROVIDER || 'MOCK';
  
  if (provider === 'MOCK') {
    logger.info('Using MOCK AI Provider. Skipping real external call.');
    return "Mock AI Response: Based on the data, revenue looks healthy and occupancy is normal.";
  }

  // Example implementation for a generic OpenAI-compatible completions API
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', // Or Anthropic, Gemini REST endpoint
      {
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2 // Low temperature for factual analytics
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: parseInt(process.env.AI_TIMEOUT) || 10000 // Strict 10s timeout
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error(`AI Provider error: ${error.message}`);
    throw new Error('AI Service Unavailable');
  }
};

module.exports = {
  askAI
};
