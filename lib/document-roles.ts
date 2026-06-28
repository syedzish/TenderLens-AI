function normalizeName(fileName: string): string {
  return fileName.toLowerCase().replace(/[_\s.]+/g, "-");
}

const RESPONSE_EVIDENCE_PATTERN =
  /\b(proposal|response|vendor|supplier|bid|submission|offer|quotation|quote|addendum|compliance|technical-response)\b/;
const TENDER_REQUIREMENT_PATTERN = /\b(rfp|tender|request-for-proposal|requirements?|scope|specification|tor)\b/;

export function hasLikelyResponseEvidenceFile(fileNames: string[]): boolean {
  return fileNames.some((fileName) => {
    const normalized = normalizeName(fileName);
    if (RESPONSE_EVIDENCE_PATTERN.test(normalized)) return true;
    return !TENDER_REQUIREMENT_PATTERN.test(normalized);
  });
}
