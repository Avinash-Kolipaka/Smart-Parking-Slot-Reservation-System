# AI Architecture & Security

## Overview
ParkOps utilizes LLMs (Large Language Models) exclusively as a Natural Language generation layer for analytics, isolating them entirely from the transactional MongoDB database.

## 1. Abstraction (`aiProvider.js`)
The system wraps the external AI calls in a generic provider interface. The specific model and provider are configured via `AI_PROVIDER` and `AI_MODEL` environment variables.

## 2. Security Boundaries (Prompt Injection Protection)
The LLM **never** receives direct access to the database or Mongoose models. 
1. The user asks a question.
2. The `analyticsAssistant.js` parses the intent.
3. The system executes a predefined safe query against the `ParkingAnalytics` collection.
4. The system injects the aggregated JSON result into a strict Prompt Template alongside the user's question.
5. The LLM translates the JSON into a readable summary.

## 3. Rate Limiting & Fail-safes
- The `POST /api/admin/ai/ask` route is strictly limited to 10 requests per 15 minutes.
- If the AI API key is missing or the external service fails, the provider safely falls back to throwing a caught error, meaning core parking and booking systems remain 100% unaffected.
