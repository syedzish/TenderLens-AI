import type { ComplianceMatrixRow, ComplianceResult } from "@/lib/compliance";

type AppLanguage = "en" | "ar";

const TENDER_MAP_ROW_LIMIT = 6;

export type TenderMapNodeKind = "file" | "requirement" | "risk" | "evidence" | "action";

export type TenderMapNode = {
  id: string;
  label: string;
  kind: TenderMapNodeKind;
  status?: ComplianceMatrixRow["status"];
  risk?: ComplianceMatrixRow["risk"];
};

export type TenderMapEdge = {
  from: string;
  to: string;
  label: string;
};

export type TenderMap = {
  nodes: TenderMapNode[];
  edges: TenderMapEdge[];
};

export type BriefingSlide = {
  title: string;
  eyebrow: string;
  bullets: string[];
};

export type ClarificationQuestion = {
  question: string;
  why: string;
  sourceRequirement: string;
  risk: ComplianceMatrixRow["risk"];
};

function slug(input: string, fallback: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalized || fallback;
}

function uniquePush<T extends { id: string }>(items: T[], item: T) {
  if (!items.some((existing) => existing.id === item.id)) {
    items.push(item);
  }
}

function firstWords(input: string, limit = 12): string {
  const words = input.split(/\s+/).filter(Boolean);
  return words.length > limit ? `${words.slice(0, limit).join(" ")}...` : input;
}

const text = {
  en: {
    risk: { Low: "Low risk", Medium: "Medium risk", High: "High risk" },
    edges: { hasRisk: "has risk", supports: "supports", cites: "cites", leadsTo: "leads to" },
    deck: {
      snapshot: "Snapshot",
      overall: "Overall result",
      score: "Score",
      strengths: "Strengths",
      wins: "Top compliance wins",
      noWins: "No fully compliant rows found yet.",
      attention: "Attention",
      risks: "Biggest risks",
      noRisks: "No major risks detected.",
      evidence: "Evidence",
      highlights: "Evidence highlights",
      noEvidence: "No evidence highlights available.",
      action: "Action",
      next: "Next actions",
      review: "Review requirements with the project team.",
    },
    questions: {
      clarify: "Can you clarify how you will satisfy this requirement",
      itemWithRisk: "item with",
      risk: "risk",
      recommended: "This action was recommended by TenderLens AI.",
      nextAction: "Recommended next action",
    },
  },
  ar: {
    risk: { Low: "مخاطر منخفضة", Medium: "مخاطر متوسطة", High: "مخاطر عالية" },
    edges: { hasRisk: "لديه مخاطر", supports: "يدعم", cites: "يستشهد", leadsTo: "يقود إلى" },
    deck: {
      snapshot: "لمحة",
      overall: "النتيجة العامة",
      score: "النتيجة",
      strengths: "نقاط القوة",
      wins: "أهم نقاط الامتثال",
      noWins: "لم يتم العثور على بنود ممتثلة بالكامل بعد.",
      attention: "الانتباه",
      risks: "أكبر المخاطر",
      noRisks: "لا توجد مخاطر رئيسية.",
      evidence: "الأدلة",
      highlights: "أبرز الأدلة",
      noEvidence: "لا توجد أدلة بارزة متاحة.",
      action: "إجراء",
      next: "الإجراءات التالية",
      review: "راجع المتطلبات مع فريق المشروع.",
    },
    questions: {
      clarify: "يرجى توضيح كيفية تلبية هذا المتطلب",
      itemWithRisk: "بند",
      risk: "بمستوى مخاطر",
      recommended: "هذا الإجراء أوصى به TenderLens AI.",
      nextAction: "إجراء موصى به",
    },
  },
} as const;

export function buildTenderMap(result: ComplianceResult, files: string[], language: AppLanguage = "en"): TenderMap {
  const copy = text[language];
  const nodes: TenderMapNode[] = [];
  const edges: TenderMapEdge[] = [];

  for (const file of files) {
    uniquePush(nodes, {
      id: `file-${slug(file, "document")}`,
      label: file,
      kind: "file",
    });
  }

  const visibleRows = result.matrix.slice(0, TENDER_MAP_ROW_LIMIT);

  visibleRows.forEach((row, index) => {
    const requirementId = `requirement-${index}-${slug(row.requirement, "requirement")}`;
    const riskId = `risk-${index}-${row.risk.toLowerCase()}`;

    nodes.push({
      id: requirementId,
      label: firstWords(row.requirement),
      kind: "requirement",
      status: row.status,
      risk: row.risk,
    });

    uniquePush(nodes, {
      id: riskId,
      label: copy.risk[row.risk],
      kind: "risk",
      risk: row.risk,
    });

    edges.push({
      from: requirementId,
      to: riskId,
      label: copy.edges.hasRisk,
    });

    row.citations.forEach((citation, citationIndex) => {
      const fileId = `file-${slug(citation.file, "document")}`;
      const evidenceId = `evidence-${index}-${citationIndex}`;

      uniquePush(nodes, {
        id: fileId,
        label: citation.file,
        kind: "file",
      });

      nodes.push({
        id: evidenceId,
        label: firstWords(citation.quote, 10),
        kind: "evidence",
      });

      edges.push(
        {
          from: fileId,
          to: requirementId,
          label: copy.edges.supports,
        },
        {
          from: requirementId,
          to: evidenceId,
          label: copy.edges.cites,
        },
      );
    });
  });

  const actionSlots = Math.max(0, TENDER_MAP_ROW_LIMIT - visibleRows.length);

  const actionSource = nodes.find((node) => node.kind === "risk" && node.risk !== "Low") ?? nodes.find((node) => node.kind === "risk");

  if (actionSource) {
    result.nextActions.slice(0, actionSlots).forEach((action, index) => {
      const actionId = `action-${index}`;
      nodes.push({
        id: actionId,
        label: firstWords(action, 10),
        kind: "action",
      });

      edges.push({
        from: actionSource.id,
        to: actionId,
        label: copy.edges.leadsTo,
      });
    });
  }

  return { nodes, edges };
}

export function buildBriefingDeck(result: ComplianceResult, language: AppLanguage = "en"): BriefingSlide[] {
  const copy = text[language].deck;
  const compliant = result.matrix.filter((row) => row.status === "Compliant").slice(0, 3);
  const risky = result.matrix.filter((row) => row.risk !== "Low" || row.status !== "Compliant").slice(0, 4);
  const evidence = result.matrix.flatMap((row) =>
    row.citations.slice(0, 1).map((citation) => `${firstWords(row.requirement, 8)}: ${citation.quote}`),
  );

  return [
    {
      eyebrow: copy.snapshot,
      title: copy.overall,
      bullets: [`${copy.score}: ${result.score}/100`, result.executiveBrief],
    },
    {
      eyebrow: copy.strengths,
      title: copy.wins,
      bullets: compliant.length ? compliant.map((row) => row.requirement) : [copy.noWins],
    },
    {
      eyebrow: copy.attention,
      title: copy.risks,
      bullets: risky.length ? risky.map((row) => `${text[language].risk[row.risk]}: ${row.requirement}`) : [copy.noRisks],
    },
    {
      eyebrow: copy.evidence,
      title: copy.highlights,
      bullets: evidence.length ? evidence.slice(0, 4) : [copy.noEvidence],
    },
    {
      eyebrow: copy.action,
      title: copy.next,
      bullets: result.nextActions.length ? result.nextActions.slice(0, 5) : [copy.review],
    },
  ];
}

export function buildClarificationQuestions(result: ComplianceResult, language: AppLanguage = "en"): ClarificationQuestion[] {
  const copy = text[language].questions;
  const rowQuestions = result.matrix
    .filter((row) => row.status !== "Compliant" || row.risk !== "Low")
    .slice(0, 6)
    .map((row) => ({
      question:
        language === "ar"
          ? `${copy.clarify}: ${row.requirement}`
          : `${copy.clarify}: ${row.requirement.charAt(0).toLowerCase() + row.requirement.slice(1)}`,
      why:
        language === "ar"
          ? `${copy.itemWithRisk} ${row.status} ${copy.risk} ${text.ar.risk[row.risk]}. ${row.response}`
          : `${row.status} ${copy.itemWithRisk} ${row.risk.toLowerCase()} ${copy.risk}. ${row.response}`,
      sourceRequirement: row.requirement,
      risk: row.risk,
    }));

  const actionQuestions = result.nextActions.slice(0, 4).map((action, index) => ({
    question: action.endsWith("?") ? action : `${action}?`,
    why: result.risks[index] ?? copy.recommended,
    sourceRequirement: result.matrix[index]?.requirement ?? copy.nextAction,
    risk: result.matrix[index]?.risk ?? "Medium",
  }));

  return [...rowQuestions, ...actionQuestions].slice(0, 8);
}
