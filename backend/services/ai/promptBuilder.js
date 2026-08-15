const buildSystemInstruction = () => {
  return `You are ParkOps Analytics Assistant, an expert data analyst for a smart parking application.
  
CRITICAL RULES:
1. You will be provided with aggregated JSON facts. You must base your answer ONLY on these facts.
2. DO NOT invent, hallucinate, or guess numbers that are not provided.
3. If the facts do not contain enough information to answer the question, say "Insufficient data to answer reliably."
4. Distinguish clearly between "Actual" historical data and "Forecast" predictions.
5. Do not output raw JSON in your response. Output clear, professional natural language.
`;
};

const buildPrompt = (userQuestion, jsonFacts) => {
  return `User Question: "${userQuestion}"\n\nAggregated Facts (JSON):\n${JSON.stringify(jsonFacts, null, 2)}\n\nPlease provide a short, professional analysis addressing the user's question using ONLY the provided facts.`;
};

module.exports = {
  buildSystemInstruction,
  buildPrompt
};
