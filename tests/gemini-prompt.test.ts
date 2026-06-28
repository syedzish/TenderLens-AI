import { describe, expect, it } from "vitest";

import {
  ANALYSIS_RESPONSE_JSON_SCHEMA,
  buildAnalysisPrompt,
  buildChatPrompt,
} from "../lib/gemini";

const files = [
  {
    meta: {
      name: "tenderlens-test-rfp-riyadh-digital-permits.pdf",
      safeName: "tenderlens-test-rfp-riyadh-digital-permits.pdf",
      type: "application/pdf",
      size: 1024,
      extension: ".pdf" as const,
    },
    buffer: new ArrayBuffer(8),
  },
  {
    meta: {
      name: "tenderlens-test-bidder-response-atlas-systems.docx",
      safeName: "tenderlens-test-bidder-response-atlas-systems.docx",
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 1024,
      extension: ".docx" as const,
    },
    buffer: new ArrayBuffer(8),
  },
];

describe("Gemini prompt hardening", () => {
  it("does not ask Gemini to own the final numeric score", () => {
    expect(ANALYSIS_RESPONSE_JSON_SCHEMA.properties).not.toHaveProperty("score");
    expect(ANALYSIS_RESPONSE_JSON_SCHEMA.required).not.toContain("score");
  });

  it("forces role-separated, evidence-grounded compliance analysis", () => {
    const prompt = buildAnalysisPrompt(files, "en");

    expect(prompt).toContain("tender/RFP requirement source");
    expect(prompt).toContain("vendor response evidence");
    expect(prompt).toContain("Requirement-source documents are never proof of bidder compliance.");
    expect(prompt).toContain("Never mark Compliant or Partial using only tender/RFP requirement-source citations.");
    expect(prompt).toContain("Extract mandatory requirements in the order they appear");
    expect(prompt).toContain("Citations must be exact excerpts copied from uploaded documents");
    expect(prompt).toContain("Do not invent page numbers");
  });

  it("keeps chat answers grounded in uploaded evidence and normalized analysis", () => {
    const prompt = buildChatPrompt({
      message: "What is missing?",
      language: "en",
      history: [],
      analysis: {
        score: 50,
        executiveBrief: "Review result.",
        matrix: [],
        trace: [],
        risks: [],
        nextActions: [],
      },
    });

    expect(prompt).toContain("Use only the uploaded documents and normalized analysis");
    expect(prompt).toContain("If the answer is not supported by the evidence, say it was not found");
    expect(prompt).toContain("Do not infer missing facts");
  });
});
