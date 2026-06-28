import { Document, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";

import type { AppLanguage } from "@/lib/chat";
import type { ComplianceResult } from "@/lib/compliance";

export type ExportFormat = "txt" | "pdf" | "docx";

export type ReportExportInput = {
  format: ExportFormat;
  result: ComplianceResult;
  files: string[];
  language: AppLanguage;
};

export type ReportExport = {
  fileName: string;
  contentType: string;
  body: Uint8Array;
};

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function reportBaseName(): string {
  return `tenderlens-analysis-${todayStamp()}`;
}

function linesForReport({ result, files, language }: Omit<ReportExportInput, "format">): string[] {
  const isArabic = language === "ar";
  const labels = isArabic
    ? {
        title: "تقرير تحليل TenderLens AI",
        files: "الملفات التي تم تحليلها",
        score: "النتيجة",
        summary: "الملخص التنفيذي",
        checklist: "قائمة المتطلبات",
        evidence: "الأدلة",
        risks: "المخاطر",
        next: "الخطوات التالية",
        disclaimer: "مراجعة مولدة بالذكاء الاصطناعي. تحقق قبل اتخاذ قرارات الشراء.",
      }
    : {
        title: "TenderLens AI Analysis Report",
        files: "Analyzed files",
        score: "Score",
        summary: "Executive summary",
        checklist: "Checklist",
        evidence: "Evidence",
        risks: "Risks",
        next: "Next steps",
        disclaimer: "AI-generated review. Verify before making procurement decisions.",
      };

  const rows = result.matrix.flatMap((row, index) => [
    `${index + 1}. ${row.requirement}`,
    `   Status: ${row.status} | Risk: ${row.risk} | Category: ${row.category}`,
    `   Response: ${row.response}`,
    ...row.citations.map((citation) => `   Evidence (${citation.file}${citation.page ? ` ${citation.page}` : ""}): ${citation.quote}`),
  ]);

  return [
    labels.title,
    "=".repeat(labels.title.length),
    "",
    `${labels.score}: ${result.score}/100`,
    "",
    labels.files,
    ...files.map((file) => `- ${file}`),
    "",
    labels.summary,
    result.executiveBrief,
    "",
    labels.checklist,
    ...rows,
    "",
    labels.risks,
    ...(result.risks.length ? result.risks.map((risk) => `- ${risk}`) : ["- No major risks listed."]),
    "",
    labels.next,
    ...(result.nextActions.length ? result.nextActions.map((action) => `- ${action}`) : ["- Review the analysis with your team."]),
    "",
    labels.disclaimer,
  ];
}

export function buildPlainTextReport(input: Omit<ReportExportInput, "format">): string {
  return linesForReport(input).join("\n");
}

function textToUint8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

async function createPdf(input: Omit<ReportExportInput, "format">): Promise<Uint8Array> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const lines = linesForReport(input);
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = margin;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line || " ", pageWidth - margin * 2) as string[];
    for (const segment of wrapped) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(segment, margin, y);
      y += 15;
    }
  }

  return new Uint8Array(doc.output("arraybuffer"));
}

async function createDocx(input: Omit<ReportExportInput, "format">): Promise<Uint8Array> {
  const document = new Document({
    sections: [
      {
        properties: {},
        children: linesForReport(input).map(
          (line) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: line || " ",
                  bold: line.endsWith("Report") || line === "Executive summary" || line === "Checklist",
                }),
              ],
            }),
        ),
      },
    ],
  });

  return new Uint8Array(await Packer.toBuffer(document));
}

export async function createReportExport(input: ReportExportInput): Promise<ReportExport> {
  if (input.format === "txt") {
    return {
      fileName: `${reportBaseName()}.txt`,
      contentType: "text/plain; charset=utf-8",
      body: textToUint8(buildPlainTextReport(input)),
    };
  }

  if (input.format === "pdf") {
    return {
      fileName: `${reportBaseName()}.pdf`,
      contentType: "application/pdf",
      body: await createPdf(input),
    };
  }

  return {
    fileName: `${reportBaseName()}.docx`,
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    body: await createDocx(input),
  };
}
