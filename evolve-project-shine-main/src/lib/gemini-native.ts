const GEMINI_NATIVE_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiTextPart = { text: string };
export type GeminiInlineDataPart = {
  inlineData: { mimeType: string; data: string };
};
export type GeminiPart = GeminiTextPart | GeminiInlineDataPart;

export type GeminiContent = {
  role?: "user" | "model";
  parts: GeminiPart[];
};

export type GeminiTool = {
  functionDeclarations: Array<Record<string, unknown>>;
};

type GeminiGenerateContentInput = {
  contents: GeminiContent[];
  systemInstruction?: string;
  tools?: GeminiTool[];
  generationConfig?: Record<string, unknown>;
};

function normalizeModelName(model: string) {
  const normalized = model.trim().replace(/^models\//, "");
  if (!normalized) throw new Error("Brak nazwy modelu Gemini");
  return encodeURIComponent(normalized);
}

export function getGeminiGenerateContentUrl(model: string) {
  return `${GEMINI_NATIVE_BASE_URL}/${normalizeModelName(model)}:generateContent`;
}

export function getGeminiStreamGenerateContentUrl(model: string) {
  return `${GEMINI_NATIVE_BASE_URL}/${normalizeModelName(model)}:streamGenerateContent?alt=sse`;
}

export function createGeminiInlineDataPart(mimeType: string, data: string): GeminiInlineDataPart {
  return { inlineData: { mimeType, data } };
}

export function createGeminiGenerateContentBody({
  contents,
  systemInstruction,
  tools,
  generationConfig,
}: GeminiGenerateContentInput) {
  return {
    contents,
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
    ...(tools?.length ? { tools } : {}),
    ...(generationConfig ? { generationConfig } : {}),
  };
}
