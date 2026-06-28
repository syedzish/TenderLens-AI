import { describe, expect, it } from "vitest";

import type { ComplianceResult } from "../lib/compliance";
import {
  buildBriefingDeck,
  buildClarificationQuestions,
  buildTenderMap,
} from "../lib/derived-features";

const result: ComplianceResult = {
  score: 75,
  executiveBrief: "Strong technical response with a bid security clarification needed.",
  matrix: [
    {
      requirement: "Bid security must be valid for 120 days.",
      category: "Commercial",
      status: "Partial",
      risk: "Medium",
      response: "The proposal provides 90 days only.",
      citations: [{ file: "Proposal.pdf", quote: "Bid security is valid for 90 days." }],
    },
    {
      requirement: "Portal must support Arabic and English.",
      category: "Functional",
      status: "Compliant",
      risk: "Low",
      response: "Both languages are supported.",
      citations: [{ file: "Technical Addendum.pdf", quote: "Arabic and English labels are supported." }],
    },
  ],
  trace: ["Read files", "Mapped obligations", "Checked evidence"],
  risks: ["Bid security validity is shorter than requested."],
  nextActions: ["Ask the vendor to extend bid security validity to 120 days."],
};

describe("derived review features", () => {
  it("builds a tender map from files, requirements, risks, evidence, and actions", () => {
    const map = buildTenderMap(result, ["RFP.pdf", "Proposal.pdf", "Technical Addendum.pdf"]);

    expect(map.nodes.some((node) => node.label === "Proposal.pdf" && node.kind === "file")).toBe(true);
    expect(map.nodes.some((node) => node.label.includes("Bid security") && node.kind === "requirement")).toBe(true);
    expect(map.edges.some((edge) => edge.label === "cites")).toBe(true);
    expect(map.edges.some((edge) => edge.label === "leads to")).toBe(true);
  });

  it("builds a five-slide briefing deck without another model call", () => {
    const deck = buildBriefingDeck(result);

    expect(deck).toHaveLength(5);
    expect(deck[0].title).toBe("Overall result");
    expect(deck[3].bullets.join(" ")).toContain("Bid security");
  });

  it("turns risks and next actions into plain-language clarification questions", () => {
    const questions = buildClarificationQuestions(result);

    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].question).toContain("bid security");
    expect(questions[0].why).toContain("Partial");
  });

  it("localizes generated map, deck, and clarification helpers for Arabic", () => {
    const map = buildTenderMap(result, ["Proposal.pdf"], "ar");
    const deck = buildBriefingDeck(result, "ar");
    const questions = buildClarificationQuestions(result, "ar");

    expect(map.edges.some((edge) => edge.label === "يستشهد")).toBe(true);
    expect(deck[0].title).toBe("النتيجة العامة");
    expect(questions[0].question).toContain("يرجى توضيح");
  });
});
