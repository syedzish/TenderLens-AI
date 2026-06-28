export type ComplianceStatus = "Compliant" | "Partial" | "Gap" | "Needs Review";
export type RiskLevel = "Low" | "Medium" | "High";

export type ComplianceCitation = {
  file: string;
  quote: string;
  page?: string;
};

export type ComplianceMatrixRow = {
  requirement: string;
  category: string;
  status: ComplianceStatus;
  risk: RiskLevel;
  response: string;
  citations: ComplianceCitation[];
};

export type ComplianceResult = {
  score: number;
  executiveBrief: string;
  matrix: ComplianceMatrixRow[];
  trace: string[];
  risks: string[];
  nextActions: string[];
};

const STATUSES: ComplianceStatus[] = ["Compliant", "Partial", "Gap", "Needs Review"];
const RISKS: RiskLevel[] = ["Low", "Medium", "High"];

export const FALLBACK_COMPLIANCE_RESULT: ComplianceResult = {
  score: 0,
  executiveBrief:
    "The compliance agent could not produce a structured matrix. Review the uploaded documents and try again with a tender/RFP plus response evidence.",
  matrix: [
    {
      requirement: "Structured compliance review",
      category: "System",
      status: "Needs Review",
      risk: "High",
      response: "No reliable structured output was available.",
      citations: [
        {
          file: "System",
          quote: "No document evidence could be converted into a compliance row.",
        },
      ],
    },
  ],
  trace: ["Validated upload", "Requested structured compliance matrix", "Returned fallback review"],
  risks: ["The AI response was malformed or unavailable."],
  nextActions: ["Retry with clear tender and proposal documents."],
};

export function isFallbackComplianceResult(result: ComplianceResult): boolean {
  return (
    result.score === FALLBACK_COMPLIANCE_RESULT.score &&
    result.matrix.length === FALLBACK_COMPLIANCE_RESULT.matrix.length &&
    result.matrix[0]?.requirement === FALLBACK_COMPLIANCE_RESULT.matrix[0].requirement &&
    result.matrix[0]?.response === FALLBACK_COMPLIANCE_RESULT.matrix[0].response
  );
}

export function forceNoResponseEvidenceResult(result: ComplianceResult, language: "en" | "ar" = "en"): ComplianceResult {
  const isArabic = language === "ar";
  const response = isArabic ? "لم يتم تقديم عرض مورد أو دليل استجابة." : "No vendor proposal or response evidence was provided.";

  return {
    score: 0,
    executiveBrief: isArabic
      ? "تم رفع مستندات متطلبات المناقصة فقط. لا يمكن قياس الامتثال لأن عرض المورد أو أدلة الاستجابة غير موجودة."
      : "Only tender/RFP requirement documents were uploaded. TenderLens cannot score compliance because no vendor proposal or response evidence was provided.",
    matrix: result.matrix.map((row) => ({
      ...row,
      status: "Gap",
      risk: "High",
      response,
    })),
    trace: [
      ...(result.trace.length ? result.trace.slice(0, 3) : ["Validated upload", "Extracted tender obligations"]),
      isArabic ? "لم يتم العثور على عرض مورد أو دليل استجابة." : "Detected tender/RFP-only upload with no vendor response evidence.",
    ],
    risks: [
      isArabic
        ? "لا توجد أدلة من المورد لمقارنة المتطلبات بها."
        : "No vendor response evidence was uploaded for compliance comparison.",
      isArabic
        ? "لا يمكن اعتبار متطلبات المناقصة نفسها دليلا على الامتثال."
        : "Tender/RFP requirement text cannot be used as proof of vendor compliance.",
    ],
    nextActions: [
      isArabic
        ? "ارفع عرض المورد أو مستند الاستجابة بجانب ملف المناقصة."
        : "Upload the vendor proposal or response document together with the RFP.",
      isArabic
        ? "أعد تشغيل التحليل بعد إضافة أدلة الاستجابة."
        : "Run the analysis again after adding response evidence.",
    ],
  };
}

function toObject(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const jsonText = fenced?.[1]?.trim() ?? trimmed;

    try {
      const parsed: unknown = JSON.parse(jsonText);
      return toObject(parsed);
    } catch {
      return null;
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toString(item))
    .filter(Boolean)
    .slice(0, 6);
}

function normalizeStatus(value: unknown): ComplianceStatus {
  const text = toString(value, "Needs Review");
  return STATUSES.includes(text as ComplianceStatus) ? (text as ComplianceStatus) : "Needs Review";
}

function normalizeRisk(value: unknown): RiskLevel {
  const text = toString(value, "Medium");
  return RISKS.includes(text as RiskLevel) ? (text as RiskLevel) : "Medium";
}

function normalizeCitations(value: unknown): ComplianceCitation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      file: toString(item.file, "Uploaded document"),
      page: toString(item.page),
      quote: toString(item.quote),
    }))
    .filter((citation) => citation.quote)
    .slice(0, 3);
}

function normalizeMatrix(value: unknown): ComplianceMatrixRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toObject(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      requirement: toString(item.requirement),
      category: toString(item.category, "Tender"),
      status: normalizeStatus(item.status),
      risk: normalizeRisk(item.risk),
      response: toString(item.response, "No response evidence found."),
      citations: normalizeCitations(item.citations),
    }))
    .filter((row) => row.requirement && row.citations.length > 0)
    .slice(0, 10);
}

function calibrateRisk(row: ComplianceMatrixRow): RiskLevel {
  if (row.status === "Compliant") {
    return row.risk;
  }

  const combined = `${row.requirement} ${row.category} ${row.response}`.toLowerCase();
  const deadlineMiss =
    /\b(go-live|deadline|no later than|completed by|delivery)\b/.test(combined) &&
    /\b(after|later|late|delay|delayed|miss|missed|past)\b/.test(combined);

  if (deadlineMiss) {
    return "High";
  }

  if (row.status === "Gap") {
    return row.risk === "Low" ? "High" : row.risk;
  }

  if (row.status === "Partial" && row.risk === "Low") {
    return "Medium";
  }

  return row.risk;
}

function calibrateMatrix(matrix: ComplianceMatrixRow[]): ComplianceMatrixRow[] {
  return matrix.map((row) => ({
    ...row,
    risk: calibrateRisk(row),
  }));
}

export function normalizeComplianceResult(value: unknown): ComplianceResult {
  const object = toObject(value);

  if (!object) {
    return FALLBACK_COMPLIANCE_RESULT;
  }

  const matrix = calibrateMatrix(normalizeMatrix(object.matrix));

  if (matrix.length === 0) {
    return FALLBACK_COMPLIANCE_RESULT;
  }

  const score = typeof object.score === "number" ? object.score : Number(object.score);

  return {
    score: Number.isFinite(score) ? Math.min(100, Math.max(0, Math.round(score))) : 0,
    executiveBrief: toString(object.executiveBrief, FALLBACK_COMPLIANCE_RESULT.executiveBrief),
    matrix,
    trace: toStringList(object.trace).length
      ? toStringList(object.trace)
      : ["Validated upload", "Extracted tender obligations", "Matched evidence", "Drafted matrix"],
    risks: toStringList(object.risks),
    nextActions: toStringList(object.nextActions),
  };
}
