import { NextResponse } from "next/server";

import { normalizeChatPayload } from "@/lib/chat";
import { chatWithDocuments } from "@/lib/gemini";
import { checkCooldown, getClientKey } from "@/lib/rate-limit";
import { validateUploadManifest } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 45;

function isFile(value: FormDataEntryValue): value is File {
  return typeof value === "object" && "arrayBuffer" in value && "name" in value;
}

async function parseRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const historyText = formData.get("history");
    const analysisText = formData.get("analysis");

    return {
      payload: {
        message: formData.get("message"),
        language: formData.get("language"),
        history: typeof historyText === "string" && historyText ? JSON.parse(historyText) : [],
        analysis: typeof analysisText === "string" && analysisText ? JSON.parse(analysisText) : undefined,
      },
      files: formData.getAll("files").filter(isFile),
    };
  }

  const body = await request.json();

  return {
    payload: body,
    files: [] as File[],
  };
}

export async function POST(request: Request) {
  const cooldown = checkCooldown(`chat:${getClientKey(request)}`);

  if (!cooldown.ok) {
    return NextResponse.json(
      {
        error: `Please wait ${cooldown.retryAfterSeconds}s before asking another question.`,
      },
      { status: 429 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key is not configured for this environment." }, { status: 503 });
  }

  let parsed: Awaited<ReturnType<typeof parseRequest>>;

  try {
    parsed = await parseRequest(request);
  } catch {
    return NextResponse.json({ error: "Malformed chat request." }, { status: 400 });
  }

  const normalized = normalizeChatPayload(parsed.payload);

  if (!normalized.ok || !normalized.value) {
    return NextResponse.json({ error: normalized.errors.join(" ") }, { status: 400 });
  }

  const manifest = validateUploadManifest(
    parsed.files.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    })),
  );

  if (parsed.files.length > 0 && !manifest.ok) {
    return NextResponse.json({ error: manifest.errors.join(" ") }, { status: 400 });
  }

  try {
    const preparedFiles =
      parsed.files.length > 0
        ? await Promise.all(
            manifest.files.map(async (meta, index) => ({
              meta,
              buffer: await parsed.files[index].arrayBuffer(),
            })),
          )
        : [];

    const answer = await chatWithDocuments({
      apiKey,
      model,
      payload: normalized.value,
      files: preparedFiles,
    });

    return NextResponse.json({
      answer,
      language: normalized.value.language,
      meta: {
        model,
        files: manifest.files.map((file) => file.safeName),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    console.error("TenderLens chat failed:", message);

    return NextResponse.json(
      {
        error: "TenderLens AI could not answer that question. Try again with a shorter question.",
      },
      { status: 502 },
    );
  }
}
