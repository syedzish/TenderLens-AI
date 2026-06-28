export type GeminiErrorKind = "quota" | "transient" | "model" | "unknown";

export type GeminiAttempt = {
  model: string;
  kind: GeminiErrorKind;
  message: string;
};

export class GeminiFallbackError extends Error {
  readonly kind: GeminiErrorKind;
  readonly attempts: GeminiAttempt[];

  constructor(kind: GeminiErrorKind, attempts: GeminiAttempt[]) {
    super(attempts.at(-1)?.message ?? "Gemini request failed.");
    this.name = "GeminiFallbackError";
    this.kind = kind;
    this.attempts = attempts;
  }
}

const DEFAULT_PRIMARY_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];

function splitModels(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}

export function getGeminiModelCandidates(primary?: string, fallbackList?: string): string[] {
  const candidates = [primary?.trim() || DEFAULT_PRIMARY_MODEL, ...(fallbackList ? splitModels(fallbackList) : DEFAULT_FALLBACK_MODELS)];
  return [...new Set(candidates.filter(Boolean))];
}

function errorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const maybe = error as { status?: unknown; code?: unknown };
  if (typeof maybe.status === "number") return maybe.status;
  if (typeof maybe.code === "number") return maybe.code;
  return undefined;
}

export function classifyGeminiError(error: unknown): GeminiErrorKind {
  const status = errorStatus(error);
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (
    status === 429 ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("too many request")
  ) {
    return "quota";
  }

  if (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("overloaded") ||
    message.includes("temporarily") ||
    message.includes("unavailable") ||
    message.includes("timeout")
  ) {
    return "transient";
  }

  if (
    status === 400 ||
    status === 404 ||
    message.includes("model") ||
    message.includes("not found") ||
    message.includes("unsupported")
  ) {
    return "model";
  }

  return "unknown";
}

export function isRetryableGeminiError(kind: GeminiErrorKind): boolean {
  return kind === "quota" || kind === "transient" || kind === "model";
}

export async function runWithGeminiFallback<T>(
  models: string[],
  task: (model: string) => Promise<T>,
): Promise<{ value: T; model: string; attemptedModels: string[]; fallbackUsed: boolean }> {
  const attempts: GeminiAttempt[] = [];

  for (const model of models) {
    try {
      return {
        value: await task(model),
        model,
        attemptedModels: [...attempts.map((attempt) => attempt.model), model],
        fallbackUsed: attempts.length > 0,
      };
    } catch (error) {
      const kind = classifyGeminiError(error);
      const message = error instanceof Error ? error.message : String(error);
      attempts.push({ model, kind, message });

      if (!isRetryableGeminiError(kind)) {
        throw new GeminiFallbackError(kind, attempts);
      }
    }
  }

  throw new GeminiFallbackError(attempts.at(-1)?.kind ?? "unknown", attempts);
}

export function friendlyGeminiError(kind: GeminiErrorKind, language: "en" | "ar" = "en"): { message: string; status: number } {
  const isArabic = language === "ar";

  if (kind === "quota") {
    return {
      status: 429,
      message: isArabic
        ? "وصل حد Gemini المجاني أو أصبح مشغولا. يرجى الانتظار قليلا ثم المحاولة مرة أخرى."
        : "Gemini free-tier limit is busy or reached. Please wait a little and try again.",
    };
  }

  if (kind === "transient") {
    return {
      status: 503,
      message: isArabic ? "خدمة Gemini مشغولة مؤقتا. يرجى المحاولة بعد قليل." : "Gemini is temporarily busy. Please try again shortly.",
    };
  }

  if (kind === "model") {
    return {
      status: 502,
      message: isArabic
        ? "نموذج Gemini المحدد غير متاح. يرجى مراجعة إعداد النموذج في Vercel."
        : "The selected Gemini model is unavailable. Please check the Vercel model setting.",
    };
  }

  return {
    status: 502,
    message: isArabic
      ? "لم يتمكن TenderLens AI من إكمال الطلب. يرجى المحاولة مرة أخرى."
      : "TenderLens AI could not complete the request. Please try again.",
  };
}
