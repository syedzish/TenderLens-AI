import type { ValidatedUploadFile } from "@/lib/security";

export type PreparedUploadFile = {
  meta: ValidatedUploadFile;
  buffer: ArrayBuffer;
};

export type GeminiPreparedDocument =
  | {
      kind: "text";
      safeName: string;
      text: string;
    }
  | {
      kind: "inline";
      safeName: string;
      mimeType: string;
      base64: string;
    };

function toBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

function decodeText(buffer: ArrayBuffer): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(buffer).trim();
}

function mimeTypeFor(meta: ValidatedUploadFile): string {
  switch (meta.extension) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".txt":
    default:
      return "text/plain";
  }
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({
    buffer: Buffer.from(buffer),
  });

  return result.value.trim();
}

export async function prepareDocumentForGemini(file: PreparedUploadFile): Promise<GeminiPreparedDocument> {
  if (file.meta.extension === ".txt") {
    return {
      kind: "text",
      safeName: file.meta.safeName,
      text: decodeText(file.buffer),
    };
  }

  if (file.meta.extension === ".docx") {
    const text = await extractDocxText(file.buffer);

    return {
      kind: "text",
      safeName: file.meta.safeName,
      text: text || "[DOCX contained no extractable text.]",
    };
  }

  return {
    kind: "inline",
    safeName: file.meta.safeName,
    mimeType: mimeTypeFor(file.meta),
    base64: toBase64(file.buffer),
  };
}

export async function prepareDocumentsForGemini(files: PreparedUploadFile[]): Promise<GeminiPreparedDocument[]> {
  return Promise.all(files.map((file) => prepareDocumentForGemini(file)));
}
