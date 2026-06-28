import { describe, expect, it } from "vitest";

import type { ComplianceResult } from "../lib/compliance";
import { buildPlainTextReport, createReportExport } from "../lib/exporters";

const result: ComplianceResult = {
  score: 82,
  executiveBrief: "Mostly compliant, with commercial clarifications.",
  matrix: [
    {
      requirement: "Submit audited financial statements.",
      category: "Eligibility",
      status: "Compliant",
      risk: "Low",
      response: "Audited statements are included.",
      citations: [{ file: "Proposal.pdf", quote: "Audited statements for 2025 are attached." }],
    },
  ],
  trace: ["Validated files", "Mapped obligations", "Checked evidence"],
  risks: ["One commercial clarification remains."],
  nextActions: ["Confirm bid bond validity."],
};

describe("report exporters", () => {
  it("builds a readable plain text report with score, files, evidence, and disclaimer", () => {
    const report = buildPlainTextReport({
      result,
      files: ["RFP.pdf", "Proposal.pdf"],
      language: "en",
    });

    expect(report).toContain("TenderLens AI Analysis Report");
    expect(report).toContain("Score: 82/100");
    expect(report).toContain("RFP.pdf");
    expect(report).toContain("Audited statements for 2025 are attached.");
    expect(report).toContain("AI-generated review. Verify before making procurement decisions.");
  });

  it("creates a text export with a safe filename and text content type", async () => {
    const exported = await createReportExport({
      format: "txt",
      result,
      files: ["RFP.pdf"],
      language: "en",
    });

    expect(exported.fileName).toMatch(/^tenderlens-analysis-\d{4}-\d{2}-\d{2}\.txt$/);
    expect(exported.contentType).toBe("text/plain; charset=utf-8");
    expect(new TextDecoder().decode(exported.body)).toContain("TenderLens AI Analysis Report");
  });

  it("creates a PPTX briefing deck export", async () => {
    const exported = await createReportExport({
      format: "pptx",
      result,
      files: ["RFP.pdf"],
      language: "en",
    });

    expect(exported.fileName).toMatch(/^tenderlens-briefing-deck-\d{4}-\d{2}-\d{2}\.pptx$/);
    expect(exported.contentType).toBe("application/vnd.openxmlformats-officedocument.presentationml.presentation");
    expect(exported.body.byteLength).toBeGreaterThan(1000);
  });
});
