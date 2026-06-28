import { NextResponse } from "next/server";

import { createReportExport, type ExportFormat } from "@/lib/exporters";

export const runtime = "nodejs";

const FORMATS: ExportFormat[] = ["txt", "pdf", "docx", "pptx"];

function isExportFormat(value: unknown): value is ExportFormat {
  return typeof value === "string" && FORMATS.includes(value as ExportFormat);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed export request." }, { status: 400 });
  }

  if (!isExportFormat(body.format)) {
    return NextResponse.json({ error: "Choose PDF, DOCX, TXT, or PPTX." }, { status: 400 });
  }

  if (!body.result || typeof body.result !== "object") {
    return NextResponse.json({ error: "Run an analysis before downloading a report." }, { status: 400 });
  }

  const files = Array.isArray(body.files) ? body.files.filter((file): file is string => typeof file === "string") : [];
  const language = body.language === "ar" ? "ar" : "en";

  try {
    const exported = await createReportExport({
      format: body.format,
      result: body.result as Parameters<typeof createReportExport>[0]["result"],
      files,
      language,
    });

    return new Response(new Blob([exported.body as BlobPart], { type: exported.contentType }), {
      headers: {
        "content-type": exported.contentType,
        "content-disposition": `attachment; filename="${exported.fileName}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown export error";
    console.error("TenderLens export failed:", message);

    return NextResponse.json({ error: "TenderLens AI could not create that download." }, { status: 500 });
  }
}
