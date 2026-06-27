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
          citations: [{ file: "proposal.md", quote: "Bid bond valid for 120 days." }],
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
    expect(result.matrix[0].citations[0].file).toBe("proposal.md");
    expect(result.trace).toEqual(["Read tender", "Mapped response"]);
  });

  it("returns a safe fallback result for malformed model output", () => {
    const result = normalizeComplianceResult("not-json");

    expect(result.score).toBe(0);
    expect(result.matrix[0].status).toBe("Needs Review");
    expect(result.executiveBrief).toContain("could not produce");
  });
});
