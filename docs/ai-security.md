# AI Security & Privacy

## Principles
1. **Never Forward User PII:** The AI layer never receives user emails, payment IDs, passwords, or specific vehicle plate numbers.
2. **Aggregated Scopes:** The `analyticsAssistant.js` provides only rolled-up metrics (total revenue, total counts) to the Prompt Template.
3. **No Database Access:** The LLM does not generate database queries. The system uses deterministic "Intent Detection" to run pre-written, verified Mongoose queries, and only hands the JSON results to the LLM.

## Prompt Injection Protection
User input is stringified and passed strictly into the "User Message" layer of the LLM API, distinct from the "System Instructions". By explicitly commanding the LLM in the System Prompt to answer *only* based on the provided JSON facts, we minimize the risk of the model complying with malicious directives.
