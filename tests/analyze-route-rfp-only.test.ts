import { afterEach, describe, expect, it, vi } from "vitest";

import type { ComplianceResult } from "../lib/compliance";

vi.mock("@/lib/gemini", () => ({
  analyzeDocuments: vi.fn(async (): Promise<ComplianceResult> => ({
    score: 75,
    executiveBrief: "The response demonstrates a strong understanding of the RFP.",
    matrix: [
      {
        requirement: "Bid security must equal 1.5% of the proposed contract value.",
        category: "Commercial",
        status: "Compliant",
        risk: "Low",
        response: "Bid security will be provided.",
        citations: [{ file: "dammam-smart-street-lighting-rfp-test.pdf", quote: "Bid security must equal 1.5%." }],
      },
    ],
    trace: ["Read tender", "Mapped response", "Drafted matrix"],
    risks: [],
    nextActions: [],
  })),
}));

import { POST } from "../app/api/analyze/route";

const originalGeminiKey = process.env.GEMINI_API_KEY;

afterEach(() => {
  process.env.GEMINI_API_KEY = originalGeminiKey;
});

function requestWithFiles(files: File[], ip: string) {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));

  return new Request("http://localhost/api/analyze", {
    method: "POST",
    body,
    headers: {
      "x-real-ip": ip,
    },
  });
}

describe("analyze route RFP-only handling", () => {
  it("does not allow RFP requirement text to be scored as vendor compliance evidence", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const pdfBytes = new TextEncoder().encode("%PDF-1.4\nTender requirement text");

    const response = await POST(
      requestWithFiles(
        [new File([pdfBytes], "dammam-smart-street-lighting-rfp-test.pdf", { type: "application/pdf" })],
        "rfp-only-route-test",
      ),
    );
    const payload: { result?: ComplianceResult; meta?: { responseEvidenceDetected?: boolean } } = await response.json();

    expect(response.status).toBe(200);
    expect(payload.meta?.responseEvidenceDetected).toBe(false);
    expect(payload.result?.score).toBe(0);
    expect(payload.result?.matrix.every((row) => row.status === "Gap")).toBe(true);
    expect(payload.result?.executiveBrief).toContain("no vendor proposal or response evidence");
  });
});
