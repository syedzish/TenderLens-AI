export type DocumentRole = "requirement" | "response";

export function normalizeDocumentName(fileName: string): string {
  return fileName.toLowerCase().replace(/[_\s.]+/g, "-");
}

const RESPONSE_EVIDENCE_PATTERN =
  /\b(proposal|response|vendor|supplier|bid|submission|offer|quotation|quote|addendum|compliance|technical-response)\b/;
const TENDER_REQUIREMENT_PATTERN = /\b(rfp|tender|request-for-proposal|requirements?|scope|specification|tor)\b/;

export function isLikelyTenderRequirementFile(fileName: string): boolean {
  const normalized = normalizeDocumentName(fileName);
  return TENDER_REQUIREMENT_PATTERN.test(normalized) && !RESPONSE_EVIDENCE_PATTERN.test(normalized);
}

export function isLikelyResponseEvidenceFile(fileName: string): boolean {
  const normalized = normalizeDocumentName(fileName);
  if (RESPONSE_EVIDENCE_PATTERN.test(normalized)) return true;
  return !TENDER_REQUIREMENT_PATTERN.test(normalized);
}

export function classifyDocumentRole(fileName: string): DocumentRole {
  return isLikelyResponseEvidenceFile(fileName) ? "response" : "requirement";
}

export function hasLikelyResponseEvidenceFile(fileNames: string[]): boolean {
  return fileNames.some(isLikelyResponseEvidenceFile);
}
