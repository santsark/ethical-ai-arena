import { ModelResponse, JudgeResult, LogEntry } from '../types';

/**
 * Captures experiment data by sending it to the PostgreSQL backend.
 */
export const logExperimentData = async (
  question: string,
  responses: ModelResponse[],
  judgments: JudgeResult[],
  error?: string
): Promise<void> => {
  const payload = {
    sessionId: crypto.randomUUID(),
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

  try {
    const res = await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("Failed to save to DB:", await res.text());
    } else {
      console.log("✅ Data securely saved to Postgres DB");
    }
  } catch (e) {
    console.error("Network error saving to DB", e);
  }
};

/**
 * Retrieves all logs for the Admin Dashboard from the API.
 * Returns null if connection fails.
 */
export const getDatabaseLogs = async (): Promise<LogEntry[] | null> => {
  try {
    const res = await fetch('/api/logs', { cache: 'no-store' }); // Ensure fresh data
    if (!res.ok) {
      console.error("API Response not OK:", await res.text());
      return null;
    }
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed to read DB", e);
    return null;
  }
};

/**
 * Clears the database (Not implemented for SQL for safety).
 */
export const clearDatabase = (): void => {
  console.warn("Clearing database via client is disabled for production SQL databases.");
};