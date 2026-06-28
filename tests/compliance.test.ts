import { describe, expect, it } from "vitest";

import { normalizeComplianceResult } from "../lib/compliance";

describe("compliance result normalization", () => {
  it("clamps scores and keeps only usable matrix rows with citations", () => {
    const result = normalizeComplianceResult({
      score: 140,
      executiveBrief: "Strong fit with a few commercial clarifications.",
      matrix: [
        {
          requirement: "Bid security",
          category: "Commercial",
          status: "Compliant",
          risk: "Low",
          response: "Bank guarantee is included.",
          citations: [{ file: "proposal.pdf", quote: "Bid bond valid for 120 days." }],
        },
        {
          requirement: "",
          category: "Empty",
          status: "Compliant",
          risk: "Low",
          response: "",
          citations: [],
        },
      ],
      trace: ["Read tender", "Mapped response"],
    });

    expect(result.score).toBe(100);
    expect(result.matrix).toHaveLength(1);
    expect(result.matrix[0].status).toBe("Compliant");
    expect(result.matrix[0].citations[0].file).toBe("proposal.pdf");
    expect(result.trace).toEqual(["Read tender", "Mapped response"]);
  });

  it("raises understated risks for partial mandatory gaps and missed delivery deadlines", () => {
    const result = normalizeComplianceResult({
      score: 75,
      executiveBrief: "Review result.",
      matrix: [
        {
          requirement: "Production go-live must be completed no later than 30 September 2026.",
          category: "Delivery",
          status: "Partial",
          risk: "Low",
          response: "Go-live is planned for 15 October 2026 after staged acceptance.",
          citations: [{ file: "proposal.pdf", quote: "Go-live is planned for 15 October 2026 after staged acceptance." }],
        },
        {
          requirement: "The supplier must deliver role-based training for at least 50 staff.",
          category: "Training",
          status: "Partial",
          risk: "Low",
          response: "The proposal includes 40 users with 10 more only under specific conditions.",
          citations: [{ file: "proposal.pdf", quote: "Najm includes role-based training for 40 municipal users." }],
        },
      ],
      trace: ["Read tender", "Mapped response", "Calibrated risk"],
    });

    expect(result.matrix[0].risk).toBe("High");
    expect(result.matrix[1].risk).toBe("Medium");
  });

  it("returns a safe fallback result for malformed model output", () => {
    const result = normalizeComplianceResult("not-json");

    expect(result.score).toBe(0);
    expect(result.matrix[0].status).toBe("Needs Review");
    expect(result.executiveBrief).toContain("could not produce");
  });
});
