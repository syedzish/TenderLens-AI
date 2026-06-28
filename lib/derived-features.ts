import type { ComplianceMatrixRow, ComplianceResult } from "@/lib/compliance";

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

export function buildTenderMap(result: ComplianceResult, files: string[]): TenderMap {
  const nodes: TenderMapNode[] = [];
  const edges: TenderMapEdge[] = [];

  for (const file of files) {
    uniquePush(nodes, {
      id: `file-${slug(file, "document")}`,
      label: file,
      kind: "file",
    });
  }

  result.matrix.forEach((row, index) => {
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
      label: `${row.risk} risk`,
      kind: "risk",
      risk: row.risk,
    });

    edges.push({
      from: requirementId,
      to: riskId,
      label: "has risk",
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
          label: "supports",
        },
        {
          from: requirementId,
          to: evidenceId,
          label: "cites",
        },
      );
    });
  });

  result.nextActions.slice(0, 5).forEach((action, index) => {
    const actionId = `action-${index}`;
    nodes.push({
      id: actionId,
      label: firstWords(action, 10),
      kind: "action",
    });

    const riskNode = nodes.find((node) => node.kind === "risk" && node.risk !== "Low");
    if (riskNode) {
      edges.push({
        from: riskNode.id,
        to: actionId,
        label: "leads to",
      });
    }
  });

  return { nodes, edges };
}

export function buildBriefingDeck(result: ComplianceResult): BriefingSlide[] {
  const compliant = result.matrix.filter((row) => row.status === "Compliant").slice(0, 3);
  const risky = result.matrix.filter((row) => row.risk !== "Low" || row.status !== "Compliant").slice(0, 4);
  const evidence = result.matrix.flatMap((row) =>
    row.citations.slice(0, 1).map((citation) => `${firstWords(row.requirement, 8)}: ${citation.quote}`),
  );

  return [
    {
      eyebrow: "Snapshot",
      title: "Overall result",
      bullets: [`Score: ${result.score}/100`, result.executiveBrief],
    },
    {
      eyebrow: "Strengths",
      title: "Top compliance wins",
      bullets: compliant.length ? compliant.map((row) => row.requirement) : ["No fully compliant rows found yet."],
    },
    {
      eyebrow: "Attention",
      title: "Biggest risks",
      bullets: risky.length ? risky.map((row) => `${row.risk}: ${row.requirement}`) : ["No major risks detected."],
    },
    {
      eyebrow: "Evidence",
      title: "Evidence highlights",
      bullets: evidence.length ? evidence.slice(0, 4) : ["No evidence highlights available."],
    },
    {
      eyebrow: "Action",
      title: "Next actions",
      bullets: result.nextActions.length ? result.nextActions.slice(0, 5) : ["Review requirements with the project team."],
    },
  ];
}

export function buildClarificationQuestions(result: ComplianceResult): ClarificationQuestion[] {
  const rowQuestions = result.matrix
    .filter((row) => row.status !== "Compliant" || row.risk !== "Low")
    .slice(0, 6)
    .map((row) => ({
      question: `Can you clarify how you will satisfy this requirement: ${
        row.requirement.charAt(0).toLowerCase() + row.requirement.slice(1)
      }`,
      why: `${row.status} item with ${row.risk.toLowerCase()} risk. ${row.response}`,
      sourceRequirement: row.requirement,
      risk: row.risk,
    }));

  const actionQuestions = result.nextActions.slice(0, 4).map((action, index) => ({
    question: action.endsWith("?") ? action : `${action}?`,
    why: result.risks[index] ?? "This action was recommended by TenderLens AI.",
    sourceRequirement: result.matrix[index]?.requirement ?? "Recommended next action",
    risk: result.matrix[index]?.risk ?? "Medium",
  }));

  return [...rowQuestions, ...actionQuestions].slice(0, 8);
}
