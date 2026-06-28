import { describe, expect, it } from "vitest";

import { forceNoResponseEvidenceResult, normalizeComplianceResult, stabilizeComplianceResult } from "../lib/compliance";

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

  it("derives the displayed score from checklist rows instead of trusting the model score", () => {
    const result = normalizeComplianceResult({
      score: 99,
      executiveBrief: "The separate model score should not drive the displayed score.",
      matrix: [
        {
          requirement: "Hosted uptime must meet the required SLA.",
          category: "SLA",
          status: "Compliant",
          risk: "Low",
          response: "The bidder commits to the requested uptime.",
          citations: [{ file: "bidder-response.docx", quote: "We commit to the requested uptime." }],
        },
        {
          requirement: "Bid security must remain valid for the full period.",
          category: "Commercial",
          status: "Partial",
          risk: "Medium",
          response: "The bidder offers a shorter initial validity period.",
          citations: [{ file: "bidder-response.docx", quote: "The guarantee is valid for 120 days." }],
        },
        {
          requirement: "Data residency must be inside Saudi Arabia.",
          category: "Security",
          status: "Gap",
          risk: "High",
          response: "No Saudi data residency commitment was cited.",
          citations: [{ file: "bidder-response.docx", quote: "Disaster recovery is hosted in the UAE." }],
        },
      ],
      trace: ["Read tender", "Mapped response", "Scored rows"],
    });

    expect(result.score).toBe(50);
  });

  it("downgrades positive rows that cite only RFP requirement text as evidence", () => {
    const result = stabilizeComplianceResult(
      normalizeComplianceResult({
        score: 88,
        executiveBrief: "The bidder appears compliant.",
        matrix: [
          {
            requirement: "Arabic and English support must be available from day one.",
            category: "Functional",
            status: "Compliant",
            risk: "Low",
            response: "Arabic and English support is available.",
            citations: [{ file: "tenderlens-test-rfp-riyadh-digital-permits.pdf", quote: "The app must support Arabic and English from day one." }],
          },
          {
            requirement: "Bid security must remain valid for 150 days.",
            category: "Commercial",
            status: "Partial",
            risk: "Medium",
            response: "The bidder offers 120 days with possible extension.",
            citations: [{ file: "tenderlens-test-bidder-response-atlas-systems.docx", quote: "The bank letter is valid for 120 days." }],
          },
        ],
        trace: ["Read tender", "Mapped response", "Scored rows"],
      }),
      ["tenderlens-test-rfp-riyadh-digital-permits.pdf", "tenderlens-test-bidder-response-atlas-systems.docx"],
      "en",
    );

    expect(result.matrix[0].status).toBe("Gap");
    expect(result.matrix[0].risk).toBe("High");
    expect(result.matrix[0].response).toBe("No cited vendor proposal or response evidence was found for this row.");
    expect(result.score).toBe(25);
  });

  it("returns a safe fallback result for malformed model output", () => {
    const result = normalizeComplianceResult("not-json");

    expect(result.score).toBe(0);
    expect(result.matrix[0].status).toBe("Needs Review");
    expect(result.executiveBrief).toContain("could not produce");
  });

  it("forces RFP-only analysis to zero instead of treating requirements as response evidence", () => {
    const result = forceNoResponseEvidenceResult(
      normalizeComplianceResult({
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
        trace: ["Read tender", "Mapped response"],
      }),
      "en",
    );

    expect(result.score).toBe(0);
    expect(result.matrix[0].status).toBe("Gap");
    expect(result.matrix[0].risk).toBe("High");
    expect(result.matrix[0].response).toBe("No vendor proposal or response evidence was provided.");
    expect(result.executiveBrief).toContain("no vendor proposal or response evidence");
  });
});
