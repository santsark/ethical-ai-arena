import { ModelResponse, JudgeResult } from '../types';

/**
 * Captures experiment data for analytical purposes.
 * In a production environment, this would securely POST data to a backend 
 * which would then store it in a database.
 */
export const logExperimentData = async (
  question: string,
  responses: ModelResponse[],
  judgments: JudgeResult[],
  error?: string
): Promise<void> => {
  const payload = {
    timestamp: new Date().toISOString(),
    sessionId: crypto.randomUUID(), // Unique ID for this run
    question,
    responses: responses.map(r => ({
        model: r.modelName,
        content: r.content,
        metrics: { time: r.timeTaken, tokens: r.tokensUsed, cost: r.cost }
    })),
    judgments: judgments.map(j => ({
        judge: j.judgeName,
        rankings: j.parsedOutput?.rankings,
        raw: j.rawOutput
    })),
    status: error ? 'ERROR' : 'SUCCESS',
    errorMessage: error || null
  };

  // SIMULATION: Sending to secure database
  console.group("🔒 Secure Database Capture");
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Status: Captured for analysis");
  console.groupEnd();

  // NOTE: API Keys are protected by the backend proxy in a real deployment.
  // This frontend code prepares the data packet.
};