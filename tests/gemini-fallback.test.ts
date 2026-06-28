import { describe, expect, it } from "vitest";

import {
  classifyGeminiError,
  GeminiFallbackError,
  getGeminiModelCandidates,
  runWithGeminiFallback,
} from "../lib/gemini-fallback";

describe("Gemini model fallback helpers", () => {
  it("dedupes primary and fallback model candidates in order", () => {
    expect(getGeminiModelCandidates("gemini-2.5-flash-lite", "gemini-3.5-flash, gemini-2.5-flash-lite")).toEqual([
      "gemini-2.5-flash-lite",
      "gemini-3.5-flash",
    ]);
  });

  it("classifies quota errors as retryable quota failures", () => {
    expect(classifyGeminiError(new Error("429 RESOURCE_EXHAUSTED quota exceeded"))).toBe("quota");
  });

  it("tries the next model after a quota failure", async () => {
    const result = await runWithGeminiFallback(["model-a", "model-b"], async (model) => {
      if (model === "model-a") {
        throw new Error("RESOURCE_EXHAUSTED");
      }

      return `ok:${model}`;
    });

    expect(result.value).toBe("ok:model-b");
    expect(result.fallbackUsed).toBe(true);
    expect(result.attemptedModels).toEqual(["model-a", "model-b"]);
  });

  it("does not continue after an unknown non-retryable error", async () => {
    await expect(
      runWithGeminiFallback(["model-a", "model-b"], async () => {
        throw new Error("schema validation failed");
      }),
    ).rejects.toBeInstanceOf(GeminiFallbackError);
  });
});
