import { describe, expect, it } from "vitest";

import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
  sanitizeFileName,
  validateUploadManifest,
} from "../lib/security";

describe("upload security guardrails", () => {
  it("sanitizes filenames without preserving path traversal", () => {
    expect(sanitizeFileName("../Tender Package?.pdf")).toBe("Tender_Package.pdf");
    expect(sanitizeFileName("  weird___name!!.md  ")).toBe("weird_name.md");
  });

  it("accepts only pdf, txt, and markdown files within size limits", () => {
    const result = validateUploadManifest([
      { name: "rfp.pdf", type: "application/pdf", size: 512_000 },
      { name: "proposal.md", type: "text/markdown", size: 128_000 },
      { name: "notes.txt", type: "text/plain", size: 64_000 },
    ]);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.files.map((file) => file.safeName)).toEqual([
      "rfp.pdf",
      "proposal.md",
      "notes.txt",
    ]);
  });

  it("rejects unsupported, empty, oversized, and excessive uploads", () => {
    const tooMany = validateUploadManifest([
      { name: "a.pdf", type: "application/pdf", size: 12 },
      { name: "b.pdf", type: "application/pdf", size: 12 },
      { name: "c.pdf", type: "application/pdf", size: 12 },
      { name: "d.pdf", type: "application/pdf", size: 12 },
    ]);

    const unsupported = validateUploadManifest([
      { name: "sheet.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 12 },
    ]);

    const empty = validateUploadManifest([
      { name: "blank.txt", type: "text/plain", size: 0 },
    ]);

    const perFile = validateUploadManifest([
      { name: "big.pdf", type: "application/pdf", size: MAX_FILE_SIZE_BYTES + 1 },
    ]);

    const total = validateUploadManifest([
      { name: "a.pdf", type: "application/pdf", size: MAX_TOTAL_UPLOAD_BYTES / 2 },
      { name: "b.pdf", type: "application/pdf", size: MAX_TOTAL_UPLOAD_BYTES / 2 + 1 },
    ]);

    expect(tooMany.errors).toContain(`Upload up to ${MAX_FILE_COUNT} files.`);
    expect(unsupported.errors).toContain("sheet.xlsx is not a supported file type.");
    expect(empty.errors).toContain("blank.txt is empty.");
    expect(perFile.errors).toContain("big.pdf is larger than 1.5 MB.");
    expect(total.errors).toContain("Total upload size must stay under 3 MB.");
  });
});
