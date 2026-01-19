import { ModelResponse, JudgeOutput, JudgeResult } from "../types";
import { robustJsonParser } from "../utils/jsonParser";

// Call our OWN internal API, not the external providers directly
async function callInternalApi(
  modelAlias: string, 
  prompt: string, 
  isJudge: boolean = false, 
  jsonMode: boolean = false
) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelAlias, prompt, isJudge, jsonMode })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "API Request Failed");
  return data;
}

export const generateEthicalResponse = async (
  modelAlias: 'OpenAI' | 'Gemini' | 'Claude', 
  question: string
): Promise<ModelResponse> => {
  try {
    const result = await callInternalApi(modelAlias, question, false, false);
    return {
      id: modelAlias,
      modelName: modelAlias,
      content: result.text,
      timeTaken: result.time,
      tokensUsed: result.tokens,
      cost: result.cost
    };
  } catch (error: any) {
    return {
      id: modelAlias,
      modelName: modelAlias,
      content: `API Error: ${error.message}`,
      isError: true,
      timeTaken: 0,
      tokensUsed: 0,
      cost: 0
    };
  }
};

export const judgeResponses = async (
  judgeAlias: 'OpenAI' | 'Gemini' | 'Claude',
  question: string,
  responses: ModelResponse[]
): Promise<JudgeResult> => {
  const judgePrompt = `
  You are acting as an independent judge (Identity: ${judgeAlias}).
  Evaluate these answers to the question: "${question}"
  ANSWERS:
  ${responses.map(r => `--- BEGIN ${r.modelName} RESPONSE ---\n${r.content}\n--- END ${r.modelName} RESPONSE ---`).join('\n\n')}
  Rank them based on Depth, Clarity, Perspectives, Practicality, Quality.
  IMPORTANT: Return strictly valid JSON.
  JSON STRUCTURE: { "rankings": [{ "position": 1, "model": "ModelName", "score": 9, "reason": "..." }] }
  `;

  try {
    // isJudge=true, jsonMode=true
    const result = await callInternalApi(judgeAlias, judgePrompt, true, true); 
    const parsed = robustJsonParser<JudgeOutput>(result.text);

    return {
      judgeName: judgeAlias,
      rawOutput: result.text,
      parsedOutput: parsed,
      timeTaken: result.time,
      tokensUsed: result.tokens,
      cost: result.cost,
      isError: !parsed
    };
  } catch (error: any) {
     return {
      judgeName: judgeAlias,
      rawOutput: error.message,
      parsedOutput: null,
      timeTaken: 0,
      tokensUsed: 0,
      cost: 0,
      isError: true
    };
  }
};