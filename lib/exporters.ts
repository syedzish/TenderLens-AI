import { Document, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";
import pptxgen from "pptxgenjs";

import type { AppLanguage } from "@/lib/chat";
import type { ComplianceResult } from "@/lib/compliance";
import { buildBriefingDeck } from "@/lib/derived-features";

export type ExportFormat = "txt" | "pdf" | "docx" | "pptx";

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

export function formatPptxBullet(input: string, maxLength = 118): string {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const cutAt = normalized.lastIndexOf(" ", maxLength - 1);
  const end = cutAt > maxLength * 0.65 ? cutAt : maxLength - 1;
  return `${normalized.slice(0, end).replace(/[.,;:\s]+$/, "")}...`;
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

async function createPptx(input: Omit<ReportExportInput, "format">): Promise<Uint8Array> {
  const isArabic = input.language === "ar";
  const deck = buildBriefingDeck(input.result, input.language);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "TenderLens AI";
  pptx.company = "TenderLens AI";
  pptx.subject = "Tender compliance briefing deck";
  pptx.title = "TenderLens AI Briefing Deck";
  pptx.rtlMode = isArabic;
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
  };

  deck.forEach((deckSlide, index) => {
    const slide = pptx.addSlide();
    const accent = index % 3 === 0 ? "087B78" : index % 3 === 1 ? "BD750F" : "285ED8";
    const softAccent = index % 3 === 0 ? "EDF9F5" : index % 3 === 1 ? "FFF7E8" : "EEF4FF";
    const lineAccent = index % 3 === 0 ? "9AD7CC" : index % 3 === 1 ? "E8C98F" : "B6C8F3";

    slide.background = { color: "101214" };
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.35,
      y: 0.3,
      w: 12.65,
      h: 6.9,
      rectRadius: 0.16,
      fill: { color: "FFFDF8" },
      line: { color: "D7DFDA", width: 1 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35,
      y: 0.3,
      w: 0.18,
      h: 6.9,
      fill: { color: accent },
      line: { color: accent, transparency: 100 },
    });
    slide.addText("TenderLens AI", {
      x: 0.75,
      y: 0.58,
      w: 2.2,
      h: 0.28,
      fontSize: 12,
      bold: true,
      color: accent,
      align: isArabic ? "right" : "left",
    });
    slide.addText(`${index + 1} / ${deck.length}`, {
      x: 11.1,
      y: 0.58,
      w: 1.2,
      h: 0.28,
      fontSize: 10,
      bold: true,
      color: "526063",
      align: "right",
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.72,
      y: 5.55,
      w: 3.2,
      h: 0.82,
      rectRadius: 0.12,
      fill: { color: "101214" },
      line: { color: "101214", transparency: 100 },
    });
    slide.addText(`${input.language === "ar" ? "النتيجة" : "Score"} ${input.result.score}/100`, {
      x: 1,
      y: 5.78,
      w: 2.64,
      h: 0.24,
      fontSize: 16,
      bold: true,
      color: "FFFFFF",
      breakLine: false,
      fit: "shrink",
      align: "center",
      rtlMode: isArabic,
    });
    slide.addText(deckSlide.eyebrow, {
      x: 0.75,
      y: 1.1,
      w: 3.1,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: accent,
      align: isArabic ? "right" : "left",
      rtlMode: isArabic,
    });
    slide.addText(deckSlide.title, {
      x: 0.75,
      y: 1.5,
      w: 5.35,
      h: 2.2,
      fontSize: 38,
      bold: true,
      color: "101214",
      breakLine: false,
      fit: "shrink",
      align: isArabic ? "right" : "left",
      rtlMode: isArabic,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.35,
      y: 1.12,
      w: 5.95,
      h: 5.28,
      rectRadius: 0.14,
      fill: { color: "F5F1E8" },
      line: { color: "D7DFDA", width: 1 },
    });
    slide.addText(input.language === "ar" ? "النقاط المهمة" : "Key points", {
      x: 6.7,
      y: 1.38,
      w: 5.2,
      h: 0.32,
      fontSize: 18,
      bold: true,
      color: "101214",
      align: isArabic ? "right" : "left",
      rtlMode: isArabic,
    });

    deckSlide.bullets.slice(0, 4).forEach((bullet, bulletIndex) => {
      const y = 1.95 + bulletIndex * 1.04;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.7,
        y,
        w: 5.25,
        h: 0.86,
        rectRadius: 0.08,
        fill: { color: bulletIndex % 2 === 0 ? softAccent : "FFFFFF" },
        line: { color: bulletIndex % 2 === 0 ? lineAccent : "D7DFDA", transparency: 15 },
      });
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 6.9,
        y: y + 0.22,
        w: 0.3,
        h: 0.3,
        fill: { color: accent },
        line: { color: accent, transparency: 100 },
      });
      slide.addText(String(bulletIndex + 1), {
        x: 6.9,
        y: y + 0.255,
        w: 0.3,
        h: 0.18,
        fontSize: 8,
        bold: true,
        color: "FFFFFF",
        align: "center",
      });
      slide.addText(formatPptxBullet(bullet), {
        x: 7.35,
        y: y + 0.16,
        w: 4.35,
        h: 0.5,
        margin: 0.04,
        fontSize: 13,
        color: "283038",
        fit: "shrink",
        breakLine: false,
        align: isArabic ? "right" : "left",
        rtlMode: isArabic,
      });
    });
    slide.addText(input.language === "ar" ? "مراجعة مولدة بالذكاء الاصطناعي. تحقق قبل اتخاذ قرارات الشراء." : "AI-generated review. Verify before making procurement decisions.", {
      x: 0.75,
      y: 6.62,
      w: 11.8,
      h: 0.22,
      fontSize: 9,
      color: "526063",
      align: isArabic ? "right" : "left",
      rtlMode: isArabic,
    });
  });

  const output = await pptx.write({ outputType: "uint8array", compression: true });
  if (output instanceof Uint8Array) return output;
  if (output instanceof ArrayBuffer) return new Uint8Array(output);
  return new TextEncoder().encode(String(output));
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

  if (input.format === "pptx") {
    return {
      fileName: `tenderlens-briefing-deck-${todayStamp()}.pptx`,
      contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      body: await createPptx(input),
    };
  }

  return {
    fileName: `${reportBaseName()}.docx`,
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    body: await createDocx(input),
  };
}
