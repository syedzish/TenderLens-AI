import { NextResponse } from "next/server";

import { getDemoAnalysis, isDemoFileSet } from "@/lib/demo-analysis";
import { analyzeDocuments } from "@/lib/gemini";
import { friendlyGeminiError, GeminiFallbackError, getGeminiModelCandidates, runWithGeminiFallback } from "@/lib/gemini-fallback";
import { checkCooldown, getClientKey } from "@/lib/rate-limit";
import { validateUploadContent, validateUploadManifest } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 45;

function isFile(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "arrayBuffer" in value && "name" in value;
}

export async function POST(request: Request) {
  const cooldown = checkCooldown(getClientKey(request));

  if (!cooldown.ok) {
    return NextResponse.json(
      {
        error: `Please wait ${cooldown.retryAfterSeconds}s before running another analysis.`,
      },
      { status: 429 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const modelCandidates = getGeminiModelCandidates(process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODELS);

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Gemini API key is not configured for this environment.",
      },
      { status: 503 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Malformed upload payload." }, { status: 400 });
  }

  const files = formData.getAll("files").filter(isFile);
  const language = formData.get("language") === "ar" ? "ar" : "en";
  const manifest = validateUploadManifest(
    files.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    })),
  );

  if (!manifest.ok) {
    return NextResponse.json({ error: manifest.errors.join(" ") }, { status: 400 });
  }

  try {
    const preparedFiles = await Promise.all(
      manifest.files.map(async (meta, index) => ({
        meta,
        buffer: await files[index].arrayBuffer(),
      })),
    );
    const contentValidation = validateUploadContent(preparedFiles);

    if (!contentValidation.ok) {
      return NextResponse.json({ error: contentValidation.errors.join(" ") }, { status: 400 });
    }

    const analysis = await runWithGeminiFallback(modelCandidates, (model) =>
      analyzeDocuments({
        apiKey,
        model,
        files: preparedFiles,
        language,
      }),
    );

    return NextResponse.json({
      result: analysis.value,
      meta: {
        model: analysis.model,
        attemptedModels: analysis.attemptedModels,
        fallbackUsed: analysis.fallbackUsed,
        files: manifest.files.map((file) => ({
          name: file.safeName,
          size: file.size,
          type: file.extension,
        })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    console.error("TenderLens analysis failed:", message);

    if (isDemoFileSet(manifest.files.map((file) => file.safeName))) {
      return NextResponse.json({
        result: getDemoAnalysis(language),
        meta: {
          model: "verified-example-analysis",
          fallback: "verified-example-analysis",
          files: manifest.files.map((file) => ({
            name: file.safeName,
            size: file.size,
            type: file.extension,
          })),
        },
      });
    }

    if (error instanceof GeminiFallbackError) {
      const friendly = friendlyGeminiError(error.kind, language);
      return NextResponse.json(
        {
          error: friendly.message,
          meta: {
            attemptedModels: error.attempts.map((attempt) => attempt.model),
          },
        },
        { status: friendly.status },
      );
    }

    return NextResponse.json(
      {
        error:
          language === "ar"
            ? "لم يتمكن TenderLens AI من إكمال التحليل. يرجى المحاولة مرة أخرى."
            : "TenderLens AI could not complete the analysis. Please try again.",
      },
      { status: 502 },
    );
  }
}
