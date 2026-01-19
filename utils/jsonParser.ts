/**
 * Extracts and parses JSON from a string that might contain Markdown or other text.
 * Handles:
 * - Markdown code blocks
 * - Extra text before/after
 * - Attempts to fix common JSON malformations (trailing commas, bad escapes)
 */
export const robustJsonParser = <T>(input: string): T | null => {
  if (!input) return null;

  let cleaned = input.trim();

  // 1. Remove Markdown code blocks if present (```json ... ```)
  const markdownJsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(markdownJsonRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // 2. Find the first '{' and last '}' to isolate the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    console.warn("No JSON object found in output");
    return null;
  }

  cleaned = cleaned.substring(firstBrace, lastBrace + 1);

  // 3. Attempt to parse
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    // 4. If parse fails, try basic fixes
    try {
      let fixed = cleaned;
      
      // Remove trailing commas before closing braces/brackets
      fixed = fixed.replace(/,\s*([\]}])/g, '$1');
      
      // Replace non-breaking spaces
      fixed = fixed.replace(/\u00A0/g, ' ');

      // Fix bad escaped characters (e.g. \s, \', or single backslash at end of string)
      // JSON only allows: \" \\ \/ \b \f \n \r \t \uXXXX
      // Regex looks for \ not followed by those.
      // We replace \ with \\ to make it a literal backslash.
      fixed = fixed.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');

      return JSON.parse(fixed) as T;
    } catch (e2) {
      console.error("Failed to parse JSON even after cleanup:", e2);
      return null;
    }
  }
};