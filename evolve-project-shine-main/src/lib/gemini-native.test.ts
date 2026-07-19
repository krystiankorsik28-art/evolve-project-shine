import assert from "node:assert/strict";
import test from "node:test";
import {
  createGeminiGenerateContentBody,
  createGeminiInlineDataPart,
  getGeminiGenerateContentUrl,
  getGeminiStreamGenerateContentUrl,
} from "./gemini-native.ts";

test("uses the Gemini v1beta native endpoints", () => {
  assert.equal(
    getGeminiGenerateContentUrl("models/gemini-3.5-flash"),
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
  );
  assert.equal(
    getGeminiStreamGenerateContentUrl("gemini-3.5-flash"),
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse",
  );
});

test("serializes native Gemini fields with the canonical JSON names", () => {
  const body = createGeminiGenerateContentBody({
    systemInstruction: "Pomagaj nauczycielowi.",
    contents: [
      {
        role: "user",
        parts: [
          { text: "Utwórz sprawdzian." },
          createGeminiInlineDataPart("image/png", "base64-data"),
        ],
      },
    ],
    tools: [
      {
        functionDeclarations: [
          {
            name: "createExam",
            description: "Tworzy egzamin.",
            parameters: { type: "object", properties: {} },
          },
        ],
      },
    ],
  });

  const json = JSON.stringify(body);
  assert.match(json, /"systemInstruction"/);
  assert.match(json, /"functionDeclarations"/);
  assert.match(json, /"inlineData"/);
  assert.match(json, /"mimeType"/);
  assert.doesNotMatch(json, /system_instruction|function_declarations|inline_data|mime_type/);
});
