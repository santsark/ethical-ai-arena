import { GoogleGenAI } from "@google/genai";
import { ModelResponse, JudgeOutput, JudgeResult } from "../types";
import { robustJsonParser } from "../utils/jsonParser";

// --- CONFIGURATION ---

const KEYS = {
  OPENAI: "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",
  GEMINI: "AIzaSyDY1UFN-1goI_-0t1Nrpgx0ZRVHSeottnc",
  ANTHROPIC: "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"
};

const MODELS = {
  OPENAI: "gpt-4o-mini",
  GEMINI: "gemini-2.0-flash-exp",
  // Switched to a more stable Haiku version to avoid model ID errors
  CLAUDE: "claude-3-haiku-20240307" 
};

// Cost per 1M tokens (Input / Output)
const PRICING = {
  [MODELS.OPENAI]: { input: 0.15, output: 0.60 },
  [MODELS.GEMINI]: { input: 0.00, output: 0.00 }, // Preview free
  [MODELS.CLAUDE]: { input: 0.25, output: 1.25 } // Haiku pricing
};

const CORS_PROXY = "https://corsproxy.io/?";

// --- HELPERS ---

const estimateTokens = (text: string) => Math.ceil((text || "").length / 4);

// --- API CLIENTS ---

const googleAI = new GoogleGenAI({ apiKey: KEYS.GEMINI });

// --- FETCH FUNCTIONS ---

async function callOpenAI(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<{ text: string, time: number, tokens: number, cost: number }> {
  const start = performance.now();
  try {
    const targetUrl = "https://api.openai.com/v1/chat/completions";
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

    const body: any = {
      model: MODELS.OPENAI,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    };

    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KEYS.OPENAI}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const end = performance.now();
    
    if (data.error) throw new Error(data.error.message);

    const text = data.choices?.[0]?.message?.content || "";
    
    // Metrics
    const usage = data.usage;
    let inputTokens = usage?.prompt_tokens || estimateTokens(systemPrompt + userPrompt);
    let outputTokens = usage?.completion_tokens || estimateTokens(text);
    
    const rates = PRICING[MODELS.OPENAI];
    const cost = (inputTokens / 1e6 * rates.input) + (outputTokens / 1e6 * rates.output);

    return { 
      text, 
      time: end - start, 
      tokens: inputTokens + outputTokens, 
      cost 
    };
  } catch (error: any) {
    throw new Error(`OpenAI Error: ${error.message}`);
  }
}

async function callGemini(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<{ text: string, time: number, tokens: number, cost: number }> {
  const start = performance.now();
  try {
    const config: any = {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    };

    if (jsonMode) {
      config.responseMimeType = "application/json";
    }

    const response = await googleAI.models.generateContent({
      model: MODELS.GEMINI,
      contents: userPrompt,
      config: config,
    });

    const end = performance.now();
    const text = response.text || "";
    
    // Metrics
    const usage = response.usageMetadata;
    let inputTokens = usage?.promptTokenCount || estimateTokens(systemPrompt + userPrompt);
    let outputTokens = usage?.candidatesTokenCount || estimateTokens(text);
    
    const rates = PRICING[MODELS.GEMINI];
    const cost = (inputTokens / 1e6 * rates.input) + (outputTokens / 1e6 * rates.output);

    return { 
      text, 
      time: end - start, 
      tokens: inputTokens + outputTokens, 
      cost 
    };
  } catch (error: any) {
    throw new Error(`Gemini Error: ${error.message}`);
  }
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<{ text: string, time: number, tokens: number, cost: number }> {
  const start = performance.now();
  try {
    const targetUrl = "https://api.anthropic.com/v1/messages";
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "x-api-key": KEYS.ANTHROPIC,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json", 
      },
      body: JSON.stringify({
        model: MODELS.CLAUDE,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
       const text = await response.text();
       let errorMessage = `HTTP ${response.status} ${response.statusText}`;
       try {
         const err = JSON.parse(text);
         if (err.error?.message) errorMessage = err.error.message;
       } catch (e) {
         // Fallback if not JSON
         errorMessage += `: ${text.substring(0, 100)}`; 
       }
       throw new Error(errorMessage);
    }

    const data = await response.json();
    const end = performance.now();
    const text = data.content?.[0]?.text || "";
    
    // Metrics
    const usage = data.usage;
    let inputTokens = usage?.input_tokens || estimateTokens(systemPrompt + userPrompt);
    let outputTokens = usage?.output_tokens || estimateTokens(text);
    
    const rates = PRICING[MODELS.CLAUDE];
    const cost = (inputTokens / 1e6 * rates.input) + (outputTokens / 1e6 * rates.output);

    return { 
      text, 
      time: end - start, 
      tokens: inputTokens + outputTokens, 
      cost 
    };
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Connection failed. The CORS proxy or API may be unreachable.");
    }
    throw new Error(`Claude Error: ${error.message}`);
  }
}

// --- MAIN EXPORTS ---

export const generateEthicalResponse = async (
  modelAlias: 'OpenAI' | 'Gemini' | 'Claude', 
  question: string
): Promise<ModelResponse> => {
  const systemPrompts = {
    OpenAI: "Answer the following question creatively",
    Gemini: "Answer the following question creatively.",
    Claude: "Answer the following question creatively."
  };

  try {
    let result: { text: string; time: number; tokens: number; cost: number };

    switch (modelAlias) {
      case 'OpenAI':
        result = await callOpenAI(systemPrompts.OpenAI, question);
        break;
      case 'Gemini':
        result = await callGemini(systemPrompts.Gemini, question);
        break;
      case 'Claude':
        result = await callClaude(systemPrompts.Claude, question);
        break;
      default:
        throw new Error("Unknown model alias");
    }

    return {
      id: modelAlias,
      modelName: modelAlias,
      content: result.text,
      timeTaken: result.time,
      tokensUsed: result.tokens,
      cost: result.cost
    };

  } catch (error: any) {
    console.error(`Error with ${modelAlias}:`, error);
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

IMPORTANT:
1. Return strictly valid JSON.
2. Do NOT use Markdown (no \`\`\`json blocks).
3. Escape any double quotes inside string values.

JSON STRUCTURE:
{
  "rankings": [
    {
      "position": 1,
      "model": "ModelName",
      "score": 9,
      "reason": "Brief explanation..."
    },
    ...
  ]
}
`;

  try {
    let result: { text: string; time: number; tokens: number; cost: number };

    // Use JSON mode where available
    switch (judgeAlias) {
      case 'OpenAI':
        result = await callOpenAI("You are a strict judge. Output valid JSON only.", judgePrompt, true);
        break;
      case 'Gemini':
        result = await callGemini("You are a strict judge. Output valid JSON only.", judgePrompt, true);
        break;
      case 'Claude':
        result = await callClaude("You are a strict judge. Output valid JSON only.", judgePrompt);
        break;
      default:
        throw new Error("Unknown judge alias");
    }

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