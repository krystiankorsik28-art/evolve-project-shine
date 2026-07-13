/**
 * Central Gemini model configuration.
 *
 * Keep model identifiers in one place so a provider retirement cannot leave
 * only part of the teacher workspace working. Environment overrides allow a
 * controlled rollout without another code deployment.
 */
export const GEMINI_DEFAULT_MODEL = "gemini-3.5-flash";
export const GEMINI_LITE_MODEL = "gemini-3.1-flash-lite";
export const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";

export function getGeminiTextModel() {
  return process.env.GEMINI_MODEL?.trim() || GEMINI_DEFAULT_MODEL;
}

export function getGeminiLiteModel() {
  return process.env.GEMINI_LITE_MODEL?.trim() || GEMINI_LITE_MODEL;
}

export function getGeminiImageModel() {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || GEMINI_IMAGE_MODEL;
}
