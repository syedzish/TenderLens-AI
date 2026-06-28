import { describe, expect, it } from "vitest";

import { detectLanguage, normalizeChatPayload } from "../lib/chat";

describe("chat payload validation", () => {
  it("detects Arabic text and prefers Arabic response language", () => {
    expect(detectLanguage("ما هي أكبر المخاطر في هذا العرض؟")).toBe("ar");
    expect(detectLanguage("What are the biggest risks?")).toBe("en");
  });

  it("trims message history and rejects overlong questions", () => {
    const normalized = normalizeChatPayload({
      message: "  Why is bid security partial?  ",
      language: "en",
      history: Array.from({ length: 9 }, (_, index) => ({
        role: index % 2 === 0 ? "user" : "assistant",
        content: `message ${index}`,
      })),
    });

    expect(normalized.ok).toBe(true);
    expect(normalized.value?.message).toBe("Why is bid security partial?");
    expect(normalized.value?.history).toHaveLength(6);

    const tooLong = normalizeChatPayload({
      message: "x".repeat(1_201),
      language: "en",
      history: [],
    });

    expect(tooLong.ok).toBe(false);
    expect(tooLong.errors).toContain("Ask a shorter question, up to 1200 characters.");
  });
});
