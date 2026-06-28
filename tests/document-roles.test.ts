import { describe, expect, it } from "vitest";

import { hasLikelyResponseEvidenceFile } from "../lib/document-roles";

describe("document role detection", () => {
  it("treats an RFP-only PDF upload as missing vendor response evidence", () => {
    expect(hasLikelyResponseEvidenceFile(["dammam-smart-street-lighting-rfp-test.pdf"])).toBe(false);
  });

  it("detects proposal and response files as vendor response evidence", () => {
    expect(hasLikelyResponseEvidenceFile(["dammam-smart-street-lighting-rfp-test.pdf", "vendor-technical-proposal.pdf"])).toBe(true);
    expect(hasLikelyResponseEvidenceFile(["supplier-response.docx"])).toBe(true);
  });
});
