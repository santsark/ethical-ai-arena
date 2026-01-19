import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini on the server side
// FIX: Support GOOGLE_API_KEY to match your .env.local file
const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const googleAI = new GoogleGenAI({ apiKey: geminiKey });

const SYSTEM_PROMPTS = {
  OpenAI: "Answer the following question creatively",
  Gemini: "Answer the following question creatively.",
  Claude: "Answer the following question creatively."
};

const ESTIMATE_TOKENS = (text: string) => Math.ceil((text || "").length / 4);

// Pricing logic (Backend side)
const PRICING: any = {
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gemini-2.0-flash-exp": { input: 0.00, output: 0.00 },
  "claude-3-haiku-20240307": { input: 0.25, output: 1.25 }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelAlias, prompt, isJudge, jsonMode } = body;

    let text = "";
    let usage = { input: 0, output: 0 };
    let modelName = "";

    const start = performance.now();

    // --- OPENAI LOGIC ---
    if (modelAlias === 'OpenAI') {
      modelName = "gpt-4o-mini";
      // FIX: Trim keys to remove accidental whitespace or paste artifacts
      const apiKey = (process.env.OPENAI_API_KEY || "").trim();
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: isJudge ? "You are a strict judge. Output valid JSON only." : SYSTEM_PROMPTS.OpenAI },
            { role: "user", content: prompt }
          ],
          response_format: jsonMode ? { type: "json_object" } : undefined,
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      text = data.choices[0].message.content;
      usage.input = data.usage.prompt_tokens;
      usage.output = data.usage.completion_tokens;
    }

    // --- GEMINI LOGIC ---
    else if (modelAlias === 'Gemini') {
      modelName = "gemini-2.0-flash-exp";
      const config: any = {
        systemInstruction: isJudge ? "You are a strict judge. Output valid JSON only." : SYSTEM_PROMPTS.Gemini,
        temperature: 0.7,
      };
      if (jsonMode) config.responseMimeType = "application/json";

      const response = await googleAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: config,
      });
      
      text = response.text || "";
      usage.input = response.usageMetadata?.promptTokenCount || 0;
      usage.output = response.usageMetadata?.candidatesTokenCount || 0;
    }

    // --- CLAUDE LOGIC ---
    else if (modelAlias === 'Claude') {
      modelName = "claude-3-haiku-20240307";
      // FIX: Trim keys to remove accidental whitespace
      const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 4096,
          system: isJudge ? "You are a strict judge. Output valid JSON only." : SYSTEM_PROMPTS.Claude,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.error) {
        const msg = data.error.message || JSON.stringify(data.error);
        throw new Error(msg);
      }
      
      text = data.content[0].text;
      usage.input = data.usage.input_tokens;
      usage.output = data.usage.output_tokens;
    }

    const end = performance.now();
    
    // Calculate Cost
    const rates = PRICING[modelName] || { input: 0, output: 0 };
    const cost = (usage.input / 1e6 * rates.input) + (usage.output / 1e6 * rates.output);

    return NextResponse.json({
      text,
      time: end - start,
      tokens: usage.input + usage.output,
      cost
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}