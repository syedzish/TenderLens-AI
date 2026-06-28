import type { ComplianceResult } from "@/lib/compliance";

export type AppLanguage = "en" | "ar";
export type ChatRole = "user" | "assistant";

export type ChatHistoryMessage = {
  role: ChatRole;
  content: string;
};

export type ChatPayloadInput = {
  message?: unknown;
  language?: unknown;
  history?: unknown;
  analysis?: unknown;
};

export type NormalizedChatPayload = {
  message: string;
  language: AppLanguage;
  history: ChatHistoryMessage[];
  analysis?: ComplianceResult;
};

export type ChatPayloadResult = {
  ok: boolean;
  value?: NormalizedChatPayload;
  errors: string[];
};

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 6;
const ARABIC_RANGE = /[\u0600-\u06ff]/;

function isChatRole(value: unknown): value is ChatRole {
  return value === "user" || value === "assistant";
}

function normalizeHistory(value: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const role = record.role;
      const content = typeof record.content === "string" ? record.content.trim() : "";

      if (!isChatRole(role) || !content) {
        return null;
      }

      return {
        role,
        content: content.slice(0, MAX_MESSAGE_LENGTH),
      };
    })
    .filter((item): item is ChatHistoryMessage => Boolean(item))
    .slice(-MAX_HISTORY_ITEMS);
}

export function detectLanguage(text: string): AppLanguage {
  return ARABIC_RANGE.test(text) ? "ar" : "en";
}

export function normalizeChatPayload(input: ChatPayloadInput): ChatPayloadResult {
  const errors: string[] = [];
  const message = typeof input.message === "string" ? input.message.trim() : "";
  const requestedLanguage = input.language === "ar" || input.language === "en" ? input.language : undefined;

  if (!message) {
    errors.push("Ask a question about your tender documents.");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    errors.push("Ask a shorter question, up to 1200 characters.");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    errors: [],
    value: {
      message,
      language: requestedLanguage ?? detectLanguage(message),
      history: normalizeHistory(input.history),
      analysis: input.analysis as ComplianceResult | undefined,
    },
  };
}
