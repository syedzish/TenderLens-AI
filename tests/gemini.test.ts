import { describe, expect, it, vi } from "vitest";

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = {
      generateContent: vi.fn(async () => ({ text: "not-json" })),
    };
  },
  createPartFromBase64: vi.fn((data: string, mimeType: string) => ({ inlineData: { data, mimeType } })),
  createPartFromText: vi.fn((text: string) => ({ text })),
}));

import { analyzeDocuments } from "../lib/gemini";

describe("Gemini analysis", () => {
  it("throws a transient error for malformed model output instead of returning a fake zero-score result", async () => {
    await expect(
      analyzeDocuments({
        apiKey: "test-key",
        model: "test-model",
        files: [
          {
            meta: {
              name: "proposal.txt",
              safeName: "proposal.txt",
              type: "text/plain",
              size: 12,
              extension: ".txt",
            },
            buffer: new TextEncoder().encode("hello world").buffer,
          },
        ],
        language: "en",
      }),
    ).rejects.toMatchObject({ status: 503 });
  });
});
