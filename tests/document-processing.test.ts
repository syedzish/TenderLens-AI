import { describe, expect, it } from "vitest";

import { prepareDocumentForGemini } from "../lib/document-processing";
import type { ValidatedUploadFile } from "../lib/security";

function meta(name: string, extension: ValidatedUploadFile["extension"], type = ""): ValidatedUploadFile {
  return {
    name,
    safeName: name,
    extension,
    type,
    size: 5,
  };
}

describe("document processing", () => {
  it("keeps text files as trusted text parts", async () => {
    const prepared = await prepareDocumentForGemini({
      meta: meta("notes.txt", ".txt", "text/plain"),
      buffer: new TextEncoder().encode("Tender notes").buffer,
    });

    expect(prepared.kind).toBe("text");
    expect(prepared.text).toContain("Tender notes");
  });

  it("keeps PDFs and images as inline Gemini file parts", async () => {
    const pdf = await prepareDocumentForGemini({
      meta: meta("rfp.pdf", ".pdf", "application/pdf"),
      buffer: new Uint8Array([1, 2, 3]).buffer,
    });

    const image = await prepareDocumentForGemini({
      meta: meta("site.png", ".png", "image/png"),
      buffer: new Uint8Array([4, 5, 6]).buffer,
    });

    expect(pdf.kind).toBe("inline");
    expect(pdf.mimeType).toBe("application/pdf");
    expect(image.kind).toBe("inline");
    expect(image.mimeType).toBe("image/png");
  });
});
