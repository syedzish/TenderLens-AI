import { describe, expect, it } from "vitest";

import { DEMO_FILE_NAMES, getDemoAnalysis, isDemoFileSet } from "../lib/demo-analysis";

describe("verified demo analysis", () => {
  it("recognizes the preloaded files regardless of upload order", () => {
    expect(isDemoFileSet([...DEMO_FILE_NAMES].reverse())).toBe(true);
    expect(
      isDemoFileSet([
        "Riyadh Smart Parking RFP.pdf",
        "Najm Urban Mobility Proposal.docx",
        "Technical Compliance Addendum.pdf",
      ]),
    ).toBe(true);
    expect(isDemoFileSet(["najm-urban-mobility-proposal.docx", "technical-compliance-addendum.pdf"])).toBe(false);
  });

  it("returns Arabic demo analysis when Arabic is selected", () => {
    const result = getDemoAnalysis("ar");

    expect(result.executiveBrief).toContain("العرض قوي");
    expect(result.trace[0]).toContain("تم");
  });
});
