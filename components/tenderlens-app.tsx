"use client";

import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Download,
  Eye,
  FileArchive,
  FileCheck2,
  FileImage,
  FileText,
  Files,
  Gauge,
  GitBranch,
  Languages,
  Layers3,
  Loader2,
  MessageCircle,
  Plus,
  Presentation,
  RefreshCcw,
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, type ReactNode } from "react";

import type { AppLanguage, ChatHistoryMessage } from "@/lib/chat";
import type { ComplianceMatrixRow, ComplianceResult, ComplianceStatus, RiskLevel } from "@/lib/compliance";
import { getDemoAnalysis, isDemoFileSet } from "@/lib/demo-analysis";
import { buildBriefingDeck, buildClarificationQuestions, buildTenderMap, type TenderMap } from "@/lib/derived-features";
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  validateUploadManifest,
  type ValidatedUploadFile,
} from "@/lib/security";

type WorkspaceTab = "analysis" | "ask" | "map" | "deck" | "questions";

type ExampleFile = {
  path: string;
  downloadPath: string;
  name: string;
  type: string;
  format: "PDF" | "DOCX";
};

const EXAMPLE_FILES: ExampleFile[] = [
  {
    path: "/demo-docs/riyadh-smart-parking-rfp.pdf",
    downloadPath: "/demo-docs/riyadh-smart-parking-rfp.pdf",
    name: "Riyadh Smart Parking RFP.pdf",
    type: "application/pdf",
    format: "PDF",
  },
  {
    path: "/demo-docs/najm-urban-mobility-proposal.docx",
    downloadPath: "/demo-docs/najm-urban-mobility-proposal.docx",
    name: "Najm Urban Mobility Proposal.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    format: "DOCX",
  },
  {
    path: "/demo-docs/technical-compliance-addendum.pdf",
    downloadPath: "/demo-docs/technical-compliance-addendum.pdf",
    name: "Technical Compliance Addendum.pdf",
    type: "application/pdf",
    format: "PDF",
  },
];

const SAMPLE_RESULT: ComplianceResult = {
  score: 75,
  executiveBrief:
    "The proposal has a strong technical foundation, but bid security validity, certification timing, and go-live date need clarification before submission.",
  matrix: [
    {
      requirement: "Bid security must remain valid for at least 120 days.",
      category: "Commercial",
      status: "Partial",
      risk: "Medium",
      response: "The response includes bid security, but the validity period is shorter than requested.",
      citations: [
        {
          file: "Proposal example",
          page: "page 12",
          quote: "Bid security is valid for 90 days from submission.",
        },
      ],
    },
    {
      requirement: "Portal and resident notifications must support Arabic and English.",
      category: "Functional",
      status: "Compliant",
      risk: "Low",
      response: "The proposal states that operator screens and resident messages are bilingual.",
      citations: [
        {
          file: "Technical addendum",
          quote: "Arabic and English labels are supported across the portal and notification templates.",
        },
      ],
    },
    {
      requirement: "Production go-live must complete by the requested deadline.",
      category: "Delivery",
      status: "Partial",
      risk: "High",
      response: "The proposed go-live date appears later than the tender deadline.",
      citations: [
        {
          file: "Proposal example",
          quote: "Go-live is planned for 15 October 2026 after staged acceptance.",
        },
      ],
    },
    {
      requirement: "Hosted service must meet the required uptime commitment.",
      category: "SLA",
      status: "Compliant",
      risk: "Low",
      response: "The addendum commits to the required uptime level.",
      citations: [
        {
          file: "Technical addendum",
          quote: "Najm commits to 99.5% monthly uptime for the hosted production service.",
        },
      ],
    },
  ],
  trace: ["Checked uploaded files", "Found tender requirements", "Matched evidence", "Marked risks"],
  risks: [
    "Bid security validity is shorter than requested.",
    "Go-live timing needs confirmation.",
    "Certification timeline needs supporting evidence.",
  ],
  nextActions: [
    "Ask the vendor to extend bid security validity to 120 days.",
    "Request confirmation of the go-live date.",
    "Ask for certification evidence or an accepted alternative.",
  ],
};

const labels = {
  en: {
    appSubtitle: "AI tender review workspace",
    howToUse: "How to use",
    language: "Language",
    download: "Download report",
    uploadTitle: "Upload tender/RFP files",
    uploadHelp: "PDF, DOCX, TXT, JPG, PNG, WEBP. We do not save your files.",
    uploadRun: "Upload files & Run Analysis",
    runSelected: "Run Analysis",
    or: "OR",
    runExample: "Run Analysis with preloaded files",
    viewExample: "View preloaded files",
    analyzedFiles: "Analyzed files",
    addMore: "Add more files",
    noFiles: "No files selected yet.",
    ready: "Ready",
    analyzed: "Analyzed",
    overall: "Overall result",
    checklist: "Checklist",
    attention: "What needs attention",
    evidence: "Evidence",
    next: "Next steps",
    checked: "What TenderLens checked",
    analysis: "Analysis",
    ask: "Ask TenderLens",
    map: "Tender Map",
    deck: "Briefing Deck",
    questions: "Questions to Ask",
    askPlaceholder: "Ask anything about these documents...",
    noResult: "Run an analysis first so TenderLens can answer using your documents.",
    downloadTxt: "TXT",
    downloadPdf: "PDF",
    downloadDocx: "DOCX",
    exampleTitle: "Example Files",
    exampleDescription: "Use these fictional files to test TenderLens AI without uploading your own documents.",
    useExamples: "Use these files",
    close: "Close",
    onboardingOne: "Understand tender documents faster",
    onboardingOneBody:
      "TenderLens AI reads tender and proposal files, finds requirements, checks evidence, and highlights risks.",
    onboardingTwo: "Three simple steps",
    stepUpload: "Upload files or use example files",
    stepWait: "Wait for results",
    stepAsk: "Ask questions about your documents",
    stepDownload: "Download the analysis",
    nextSlide: "Next",
    getStarted: "Get started",
    skip: "Skip",
    slideOne: "Slide 1",
    slideTwo: "Slide 2",
    slideCounterOne: "1 of 2",
    slideCounterTwo: "2 of 2",
    onboardingChecks: ["Extract requirements", "Match evidence", "Highlight risks"],
    previewNotice: "Start your analysis by uploading files or running the preloaded example.",
    startTitle: "Start your analysis",
    startBody:
      "Upload tender files or run the preloaded example. TenderLens will then fill this workspace with a score, checklist, evidence, map, deck, and questions. Using the \"Run Analysis with preloaded files\" button (or uploading the exact example files) will generate pre-generated stored output. This is done to save Gemini API quota. You can use the App for live analysis by bringing your own files and uploading them.",
    emptyOverallTitle: "No analysis yet",
    emptyOverallBody: "Your overall score and executive summary will appear here after TenderLens checks the files.",
    emptyChecklistTitle: "No requirements checked yet",
    emptyChecklistBody: "TenderLens will list each requirement, the matching evidence, and the risk level after analysis.",
    emptyEvidenceTitle: "Evidence will appear after analysis",
    emptyEvidenceBody: "Select a checklist row after analysis to see the exact supporting quote.",
    emptyAttentionTitle: "No risks found yet",
    emptyAttentionBody: "Risks and clarification points will appear here once the agent reviews the documents.",
    emptyCheckedTitle: "Nothing checked yet",
    emptyCheckedBody: "TenderLens will show the simple review steps it completed after analysis.",
    emptyMapTitle: "Your document map will appear here",
    emptyMapBody: "After analysis, this map will connect files, requirements, evidence, risks, and next actions.",
    emptyDeckTitle: "Slides will appear after analysis",
    emptyDeckBody: "TenderLens will build a short briefing deck from the same analysis without another AI call.",
    emptyQuestionsTitle: "Questions will appear after analysis",
    emptyQuestionsBody: "TenderLens will turn risks into simple questions you can ask the vendor or project owner.",
    examplePreparedNote: "Preloaded files use a prepared sample result so you can test the interface without spending Gemini quota.",
    sampleRun: "Prepared example",
    startFresh: "Start fresh",
    pptx: "PPTX",
    svg: "SVG",
    verify: "AI-generated review. Verify before making procurement decisions.",
    uploadLimit: (count: number, size: string) => `Upload up to ${count} files. ${size} per file.`,
    resultTitleStrong: "Strong response with a few checks",
    resultTitleRisk: "Good foundation with risks to resolve",
    compliantRows: (count: number) => `${count} compliant rows`,
    riskRows: (count: number) => `${count} items need attention`,
    checklistDesc: "Every row links a requirement to evidence and risk.",
    evidenceDesc: "Selected evidence for the active requirement.",
    attentionDesc: "Risks that may need clarification.",
    noMajorRisks: "No major risks listed.",
    askDesc: "Ask follow-up questions about the documents, evidence, risks, and next steps.",
    chatIntro: "Ask me about the biggest risks, why a requirement is partial, or what you should ask the vendor next.",
    thinking: "TenderLens is checking the evidence...",
    quickQuestions: [
      "What are the biggest risks?",
      "Why is this partial?",
      "What should I ask the vendor?",
      "Summarize this in Arabic",
    ],
    mapDesc: "A simple view of how files, requirements, evidence, risks, and actions connect.",
    mapKinds: {
      file: "Files",
      requirement: "Requirements",
      risk: "Risks",
      evidence: "Evidence",
      action: "Actions",
    },
    evidencePath: "Evidence path",
    mapOutcome: "Risks & actions",
    deckDesc: "A lightweight stakeholder briefing created from the analysis result.",
    questionsDesc: "Practical questions to send to the vendor or project owner before submission.",
    removeFile: "Remove file",
    sendMessage: "Send message",
    mapSvgTitle: "TenderLens AI Tender Map",
    exampleFiles: [
      {
        label: "RFP example",
        description: "The fictional tender document TenderLens uses to find requirements.",
      },
      {
        label: "Proposal example",
        description: "A fictional vendor response used to check compliance.",
      },
      {
        label: "Technical addendum",
        description: "Extra technical evidence for language support, hosting, uptime, and security.",
      },
    ],
    statuses: {
      Compliant: "Compliant",
      Partial: "Partial",
      Gap: "Gap",
      "Needs Review": "Needs Review",
    },
    risks: {
      Low: "Low",
      Medium: "Medium",
      High: "High",
    },
  },
  ar: {
    appSubtitle: "مساحة مراجعة المناقصات بالذكاء الاصطناعي",
    howToUse: "طريقة الاستخدام",
    language: "اللغة",
    download: "تنزيل التقرير",
    uploadTitle: "ارفع ملفات المناقصة",
    uploadHelp: "PDF و DOCX و TXT وصور. لا نحفظ ملفاتك.",
    uploadRun: "ارفع الملفات وابدأ التحليل",
    runSelected: "ابدأ التحليل",
    or: "أو",
    runExample: "حلل الملفات الجاهزة",
    viewExample: "عرض الملفات الجاهزة",
    analyzedFiles: "الملفات المحللة",
    addMore: "إضافة ملفات",
    noFiles: "لم يتم اختيار ملفات بعد.",
    ready: "جاهز",
    analyzed: "تم التحليل",
    overall: "النتيجة العامة",
    checklist: "قائمة المتطلبات",
    attention: "ما يحتاج الانتباه",
    evidence: "الأدلة",
    next: "الخطوات التالية",
    checked: "ما الذي فحصه TenderLens",
    analysis: "التحليل",
    ask: "اسأل TenderLens",
    map: "خريطة المناقصة",
    deck: "ملخص العرض",
    questions: "أسئلة يجب طرحها",
    askPlaceholder: "اسأل أي شيء عن هذه المستندات...",
    noResult: "ابدأ التحليل أولا حتى يجيب TenderLens بناء على مستنداتك.",
    downloadTxt: "TXT",
    downloadPdf: "PDF",
    downloadDocx: "DOCX",
    exampleTitle: "ملفات مثال",
    exampleDescription: "استخدم هذه الملفات الخيالية لتجربة TenderLens AI بدون رفع ملفاتك.",
    useExamples: "استخدام هذه الملفات",
    close: "إغلاق",
    onboardingOne: "افهم مستندات المناقصة بسرعة",
    onboardingOneBody: "يقرأ TenderLens AI ملفات المناقصة والعرض، ويجد المتطلبات، ويفحص الأدلة، ويبرز المخاطر.",
    onboardingTwo: "ثلاث خطوات بسيطة",
    stepUpload: "ارفع الملفات أو استخدم ملفات المثال",
    stepWait: "انتظر النتائج",
    stepAsk: "اسأل عن مستنداتك",
    stepDownload: "نزل التحليل",
    nextSlide: "التالي",
    getStarted: "ابدأ",
    skip: "تخطي",
    slideOne: "الشريحة 1",
    slideTwo: "الشريحة 2",
    slideCounterOne: "1 من 2",
    slideCounterTwo: "2 من 2",
    onboardingChecks: ["استخراج المتطلبات", "مطابقة الأدلة", "إبراز المخاطر"],
    previewNotice: "ابدأ التحليل برفع الملفات أو تشغيل المثال الجاهز.",
    startTitle: "ابدأ التحليل",
    startBody:
      "ارفع ملفات المناقصة أو شغل المثال الجاهز. سيملأ TenderLens هذه المساحة بالنتيجة والقائمة والأدلة والخريطة والعرض والأسئلة. سيؤدي استخدام زر \"حلل الملفات الجاهزة\" (أو رفع ملفات المثال المحددة) إلى إنتاج مخرجات مخزنة ومعدة مسبقًا. يتم ذلك لتوفير حصة Gemini API. يمكنك استخدام التطبيق لإجراء تحليل مباشر عن طريق جلب ملفاتك الخاصة ورفعها.",
    emptyOverallTitle: "لا يوجد تحليل بعد",
    emptyOverallBody: "ستظهر النتيجة العامة والملخص التنفيذي هنا بعد فحص الملفات.",
    emptyChecklistTitle: "لم يتم فحص أي متطلبات بعد",
    emptyChecklistBody: "سيعرض TenderLens كل متطلب والدليل المرتبط به ومستوى المخاطر بعد التحليل.",
    emptyEvidenceTitle: "ستظهر الأدلة بعد التحليل",
    emptyEvidenceBody: "اختر صفا من القائمة بعد التحليل لرؤية الاقتباس الداعم.",
    emptyAttentionTitle: "لا توجد مخاطر بعد",
    emptyAttentionBody: "ستظهر المخاطر ونقاط التوضيح هنا بعد مراجعة المستندات.",
    emptyCheckedTitle: "لم يتم الفحص بعد",
    emptyCheckedBody: "سيعرض TenderLens خطوات المراجعة البسيطة التي أنجزها بعد التحليل.",
    emptyMapTitle: "ستظهر خريطة المستندات هنا",
    emptyMapBody: "بعد التحليل، ستربط الخريطة الملفات والمتطلبات والأدلة والمخاطر والإجراءات التالية.",
    emptyDeckTitle: "ستظهر الشرائح بعد التحليل",
    emptyDeckBody: "سيبني TenderLens عرضا موجزا من نفس نتيجة التحليل بدون استدعاء إضافي للذكاء الاصطناعي.",
    emptyQuestionsTitle: "ستظهر الأسئلة بعد التحليل",
    emptyQuestionsBody: "سيحول TenderLens المخاطر إلى أسئلة بسيطة يمكن طرحها على المورد أو مالك المشروع.",
    examplePreparedNote: "تستخدم الملفات الجاهزة نتيجة عينة معدة مسبقا حتى تجرب الواجهة بدون استهلاك حصة Gemini.",
    sampleRun: "مثال معد مسبقا",
    startFresh: "بدء جديد",
    pptx: "PPTX",
    svg: "SVG",
    verify: "مراجعة مولدة بالذكاء الاصطناعي. تحقق قبل اتخاذ قرارات الشراء.",
    uploadLimit: (count: number, size: string) => `يمكن رفع ${count} ملفات كحد أقصى. ${size} لكل ملف.`,
    resultTitleStrong: "عرض قوي مع بعض النقاط التي تحتاج مراجعة",
    resultTitleRisk: "أساس جيد مع مخاطر يجب حلها",
    compliantRows: (count: number) => `${count} بنود ممتثلة`,
    riskRows: (count: number) => `${count} بنود تحتاج انتباها`,
    checklistDesc: "كل صف يربط المتطلب بالدليل ومستوى المخاطر.",
    evidenceDesc: "الدليل المختار للمتطلب النشط.",
    attentionDesc: "مخاطر قد تحتاج إلى توضيح.",
    noMajorRisks: "لا توجد مخاطر رئيسية مدرجة.",
    askDesc: "اسأل أسئلة متابعة عن المستندات والأدلة والمخاطر والخطوات التالية.",
    chatIntro: "اسألني عن أكبر المخاطر، أو سبب اعتبار متطلب ما جزئيا، أو ما الذي يجب سؤاله للمورد.",
    thinking: "يقوم TenderLens بمراجعة الأدلة...",
    quickQuestions: ["ما أكبر المخاطر؟", "لماذا هذا البند جزئي؟", "ما الذي يجب أن أسأله للمورد؟", "لخص النتائج بالعربية"],
    mapDesc: "عرض بسيط يوضح ارتباط الملفات والمتطلبات والأدلة والمخاطر والإجراءات.",
    mapKinds: {
      file: "الملفات",
      requirement: "المتطلبات",
      risk: "المخاطر",
      evidence: "الأدلة",
      action: "الإجراءات",
    },
    evidencePath: "مسار الأدلة",
    mapOutcome: "المخاطر والإجراءات",
    deckDesc: "ملخص خفيف لأصحاب المصلحة يتم إنشاؤه من نتيجة التحليل.",
    questionsDesc: "أسئلة عملية لإرسالها إلى المورد أو مالك المشروع قبل التقديم.",
    removeFile: "إزالة الملف",
    sendMessage: "إرسال الرسالة",
    mapSvgTitle: "خريطة المناقصة من TenderLens AI",
    exampleFiles: [
      {
        label: "مثال طلب تقديم عروض",
        description: "ملف مناقصة خيالي يستخدمه TenderLens لاستخراج المتطلبات.",
      },
      {
        label: "مثال عرض المورد",
        description: "رد مورد خيالي يستخدم لفحص الامتثال.",
      },
      {
        label: "ملحق الامتثال الفني",
        description: "أدلة فنية إضافية عن اللغة والاستضافة والتوافر والأمن.",
      },
    ],
    statuses: {
      Compliant: "ممتثل",
      Partial: "جزئي",
      Gap: "فجوة",
      "Needs Review": "يحتاج مراجعة",
    },
    risks: {
      Low: "منخفض",
      Medium: "متوسط",
      High: "عال",
    },
  },
} as const;

const statusStyles: Record<ComplianceStatus, string> = {
  Compliant: "border-teal/20 bg-teal/10 text-teal",
  Partial: "border-amber/25 bg-amber/10 text-amber",
  Gap: "border-danger/25 bg-danger/10 text-danger",
  "Needs Review": "border-cobalt/25 bg-cobalt/10 text-cobalt",
};

const riskStyles: Record<RiskLevel, string> = {
  Low: "text-teal",
  Medium: "text-amber",
  High: "text-danger",
};

function formatBytes(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.ceil(size / 1024))} KB`;
}

function extensionLabel(file: File | ValidatedUploadFile | { name: string }) {
  const extension = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
  return extension.slice(0, 5);
}

function fileIcon(file: File | { name: string }) {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp")) {
    return FileImage;
  }
  if (lower.endsWith(".docx")) {
    return FileArchive;
  }
  return FileText;
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full bg-white shadow-table">
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: `conic-gradient(#087b78 ${score * 3.6}deg, #f0e8d8 0deg)`,
        }}
      />
      <div className="relative grid h-[86px] w-[86px] place-items-center rounded-full bg-white">
        <div className="text-center">
          <div className="text-[30px] font-semibold leading-none text-ink">{score}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase text-graphite/60">/100</div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: ComplianceStatus }) {
  if (status === "Compliant") return <CheckCircle2 className="h-4 w-4" />;
  return <AlertTriangle className="h-4 w-4" />;
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  colorClass = "bg-teal/10 text-teal",
}: {
  icon: typeof ClipboardCheck;
  title: string;
  description?: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-graphite">{description}</p> : null}
      </div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  body,
  action,
  colorClass = "bg-teal/10 text-teal",
}: {
  icon: typeof ClipboardCheck;
  title: string;
  body: string;
  action?: ReactNode;
  colorClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/70 p-6 text-center">
      <div className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-graphite">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function escapeSvg(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapSvgText(input: string, maxChars = 24, maxLines = 3): string[] {
  const words = input.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }

    if (lines.length === maxLines) break;
  }

  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\.*$/, "")}...`;
  }

  return lines.length ? lines : [input.slice(0, maxChars)];
}

function buildTenderMapSvg(
  map: TenderMap,
  title: string,
  columnTitles: { file: string; requirement: string; evidence: string; outcome: string },
): string {
  const width = 1120;
  const groups = {
    file: map.nodes.filter((node) => node.kind === "file").slice(0, 4),
    requirement: map.nodes.filter((node) => node.kind === "requirement").slice(0, 6),
    evidence: map.nodes.filter((node) => node.kind === "evidence").slice(0, 6),
    outcome: map.nodes.filter((node) => node.kind === "risk" || node.kind === "action").slice(0, 8),
  };
  const maxRows = Math.max(groups.file.length, groups.requirement.length, groups.evidence.length, groups.outcome.length, 3);
  const height = 160 + maxRows * 118;
  const columns = {
    file: { x: 48, title: columnTitles.file },
    requirement: { x: 310, title: columnTitles.requirement },
    evidence: { x: 596, title: columnTitles.evidence },
    outcome: { x: 850, title: columnTitles.outcome },
  };
  const positions = new Map<string, { x: number; y: number; w: number; h: number }>();

  function color(node: TenderMap["nodes"][number]) {
    if (node.kind === "file") return { fill: "#fffdf8", stroke: "#d7dfda", text: "#101214", pill: "#285ed8" };
    if (node.kind === "requirement") return { fill: "#fff7e8", stroke: "#e8c98f", text: "#101214", pill: "#bd750f" };
    if (node.kind === "evidence") return { fill: "#edf9f5", stroke: "#9ad7cc", text: "#101214", pill: "#087b78" };
    if (node.risk === "High") return { fill: "#fff1ef", stroke: "#e9a7a0", text: "#101214", pill: "#b42318" };
    if (node.risk === "Medium") return { fill: "#fff7e8", stroke: "#e8c98f", text: "#101214", pill: "#bd750f" };
    return { fill: "#eef4ff", stroke: "#b6c8f3", text: "#101214", pill: "#285ed8" };
  }

  function renderNode(node: TenderMap["nodes"][number], x: number, y: number) {
    const w = node.kind === "requirement" || node.kind === "evidence" ? 220 : 190;
    const h = 72;
    positions.set(node.id, { x, y, w, h });
    const colors = color(node);
    const lines = wrapSvgText(node.label, node.kind === "requirement" || node.kind === "evidence" ? 26 : 22, 3);
    const textLines = lines
      .map((line, index) => `<text x="${x + 16}" y="${y + 28 + index * 16}" font-size="13" font-family="Arial, sans-serif" fill="${colors.text}">${escapeSvg(line)}</text>`)
      .join("");

    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="1.4"/><circle cx="${x + w - 22}" cy="${y + 20}" r="5" fill="${colors.pill}"/>${textLines}<title>${escapeSvg(node.label)}</title></g>`;
  }

  const nodes = [
    ...groups.file.map((node, index) => renderNode(node, columns.file.x, 108 + index * 118)),
    ...groups.requirement.map((node, index) => renderNode(node, columns.requirement.x, 108 + index * 118)),
    ...groups.evidence.map((node, index) => renderNode(node, columns.evidence.x, 108 + index * 118)),
    ...groups.outcome.map((node, index) => renderNode(node, columns.outcome.x, 108 + index * 118)),
  ].join("");

  const edges = map.edges
    .map((edge) => {
      const from = positions.get(edge.from);
      const to = positions.get(edge.to);
      if (!from || !to) return "";
      const sx = from.x + from.w;
      const sy = from.y + from.h / 2;
      const tx = to.x;
      const ty = to.y + to.h / 2;
      const midX = sx + (tx - sx) / 2;
      return `<path d="M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}" fill="none" stroke="#7b8a8d" stroke-width="1.4" opacity="0.65" marker-end="url(#arrow)"/><text x="${midX - 28}" y="${(sy + ty) / 2 - 6}" font-size="10" font-family="Arial, sans-serif" fill="#526063">${escapeSvg(edge.label)}</text>`;
    })
    .join("");

  const headings = Object.values(columns)
    .map((column) => `<text x="${column.x}" y="82" font-size="12" font-weight="700" font-family="Arial, sans-serif" fill="#526063" letter-spacing="0">${escapeSvg(column.title)}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeSvg(title)}" style="width:100%;height:auto;display:block"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7b8a8d"/></marker></defs><rect width="${width}" height="${height}" rx="28" fill="#f5f1e8"/><rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="24" fill="#fffdf8" stroke="#d7dfda"/><text x="48" y="56" font-size="25" font-weight="700" font-family="Arial, sans-serif" fill="#101214">${escapeSvg(title)}</text>${headings}${edges}${nodes}</svg>`;
}

export function TenderLensApp() {
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("analysis");
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isExporting, setIsExporting] = useState<null | "txt" | "pdf" | "docx" | "pptx">(null);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingSlide, setOnboardingSlide] = useState<0 | 1>(0);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatHistoryMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const text = labels[language];
  const isRtl = language === "ar";
  const isExampleSelection = isDemoFileSet(files.map((file) => file.name));
  const currentResult = hasAnalyzed ? (isExampleSelection ? getDemoAnalysis(language) : result) : null;
  const displayFileNames = files.map((file, index) => (isExampleSelection ? text.exampleFiles[index]?.label ?? file.name : file.name));
  const activeRow = currentResult?.matrix[Math.min(activeRowIndex, currentResult.matrix.length - 1)] ?? null;
  const validation = useMemo(
    () =>
      validateUploadManifest(
        files.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      ),
    [files],
  );
  const tenderMap = useMemo(
    () =>
      currentResult
        ? buildTenderMap(
            currentResult,
            files.length ? displayFileNames : EXAMPLE_FILES.map((file, index) => text.exampleFiles[index]?.label ?? file.name),
            language,
          )
        : null,
    [currentResult, displayFileNames, files.length, language, text.exampleFiles],
  );
  const tenderMapSvg = useMemo(
    () =>
      tenderMap
        ? buildTenderMapSvg(tenderMap, text.mapSvgTitle, {
            file: text.mapKinds.file,
            requirement: text.mapKinds.requirement,
            evidence: text.mapKinds.evidence,
            outcome: text.mapOutcome,
          })
        : "",
    [tenderMap, text.mapKinds.evidence, text.mapKinds.file, text.mapKinds.requirement, text.mapOutcome, text.mapSvgTitle],
  );
  const briefingDeck = useMemo(() => (currentResult ? buildBriefingDeck(currentResult, language) : []), [currentResult, language]);
  const clarificationQuestions = useMemo(() => (currentResult ? buildClarificationQuestions(currentResult, language) : []), [currentResult, language]);
  const compliantCount = currentResult?.matrix.filter((row) => row.status === "Compliant").length ?? 0;
  const riskCount = currentResult?.matrix.filter((row) => row.risk !== "Low" || row.status !== "Compliant").length ?? 0;
  const visibleMessages: ChatHistoryMessage[] = chatMessages.length
    ? chatMessages
    : [{ role: "assistant", content: text.chatIntro }];

  function statusLabel(status: ComplianceStatus): string {
    return text.statuses[status];
  }

  function riskLabel(risk: RiskLevel): string {
    return text.risks[risk];
  }

  function mergeFiles(nextFiles: File[]) {
    const merged = [...files, ...nextFiles].slice(0, MAX_FILE_COUNT);
    setFiles(merged);
    setResult(null);
    setHasAnalyzed(false);
    setChatMessages([]);
    setActiveRowIndex(0);
    setError(null);
  }

  function removeFile(fileToRemove: File) {
    setFiles(files.filter((file) => file !== fileToRemove));
    setResult(null);
    setHasAnalyzed(false);
    setChatMessages([]);
    setActiveRowIndex(0);
    setError(null);
  }

  function startFresh() {
    setFiles([]);
    setResult(null);
    setHasAnalyzed(false);
    setActiveTab("analysis");
    setActiveRowIndex(0);
    setError(null);
    setChatInput("");
    setChatMessages([]);
  }

  async function loadExampleFiles() {
    const loaded = await Promise.all(
      EXAMPLE_FILES.map(async (file) => {
        const response = await fetch(file.path);
        if (!response.ok) throw new Error(`Could not load ${file.name}`);
        const blob = await response.blob();
        return new File([blob], file.name, { type: file.type });
      }),
    );

    setFiles(loaded);
    return loaded;
  }

  async function runAnalysis(inputFiles?: File[]) {
    const selected = inputFiles ?? files;
    setResult(null);
    setHasAnalyzed(false);
    setChatMessages([]);
    setActiveRowIndex(0);
    const manifest = validateUploadManifest(
      selected.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    );

    if (!manifest.ok) {
      setError(manifest.errors.join(" "));
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const body = new FormData();
      selected.forEach((file) => body.append("files", file));
      body.append("language", language);

      const response = await fetch("/api/analyze", { method: "POST", body });
      const payload: { result?: ComplianceResult; error?: string } = await response.json();

      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "Analysis failed.");
      }

      setResult(payload.result);
      setHasAnalyzed(true);
      setActiveTab("analysis");
      setActiveRowIndex(0);
    } catch (analysisError) {
      const message = analysisError instanceof Error ? analysisError.message : "Analysis failed.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function runExampleAnalysis() {
    setError(null);
    setIsAnalyzing(true);

    try {
      const loaded = await loadExampleFiles();
      setShowExamples(false);
      setFiles(loaded);
      setResult(getDemoAnalysis(language));
      setHasAnalyzed(true);
      setActiveTab("analysis");
      setActiveRowIndex(0);
      setChatMessages([]);
    } catch (exampleError) {
      const message = exampleError instanceof Error ? exampleError.message : "Example files could not be loaded.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function sendChatMessage(question?: string) {
    const message = (question ?? chatInput).trim();
    if (!message || !currentResult) return;

    const nextMessages: ChatHistoryMessage[] = [...chatMessages, { role: "user", content: message }];
    setChatMessages(nextMessages);
    setChatInput("");
    setIsChatting(true);
    setActiveTab("ask");

    try {
      const body = new FormData();
      body.append("message", message);
      body.append("language", language);
      body.append("history", JSON.stringify(chatMessages.slice(-6)));
      body.append("analysis", JSON.stringify(currentResult));
      files.forEach((file) => body.append("files", file));

      const response = await fetch("/api/chat", { method: "POST", body });
      const payload: { answer?: string; error?: string } = await response.json();

      if (!response.ok || !payload.answer) {
        throw new Error(payload.error ?? "TenderLens could not answer.");
      }

      setChatMessages([...nextMessages, { role: "assistant", content: payload.answer }]);
    } catch (chatError) {
      const messageText = chatError instanceof Error ? chatError.message : "TenderLens could not answer.";
      setChatMessages([...nextMessages, { role: "assistant", content: messageText }]);
    } finally {
      setIsChatting(false);
    }
  }

  async function downloadReport(format: "txt" | "pdf" | "docx" | "pptx") {
    if (!currentResult) return;
    setIsExporting(format);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          format,
          result: currentResult,
          files: files.map((file) => file.name),
          language,
        }),
      });

      if (!response.ok) {
        const payload: { error?: string } = await response.json();
        throw new Error(payload.error ?? "Download failed.");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition") ?? "";
      const fileName = contentDisposition.match(/filename="([^"]+)"/)?.[1] ?? `tenderlens-analysis.${format}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      const message = exportError instanceof Error ? exportError.message : "Download failed.";
      setError(message);
    } finally {
      setIsExporting(null);
    }
  }

  function downloadTenderMap() {
    if (!tenderMapSvg) return;
    const blob = new Blob([tenderMapSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tenderlens-tender-map.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const tabs: Array<{ id: WorkspaceTab; label: string; icon: typeof ClipboardCheck }> = [
    { id: "analysis", label: text.analysis, icon: ClipboardCheck },
    { id: "ask", label: text.ask, icon: MessageCircle },
    { id: "map", label: text.map, icon: GitBranch },
    { id: "deck", label: text.deck, icon: Presentation },
    { id: "questions", label: text.questions, icon: CircleHelp },
  ];

  return (
    <main dir={isRtl ? "rtl" : "ltr"} className="min-h-screen overflow-x-hidden bg-paper text-ink">
      <input
        ref={fileInputRef}
        className="sr-only"
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          setFiles(selected);
          void runAnalysis(selected);
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={addMoreInputRef}
        className="sr-only"
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/jpeg,image/png,image/webp"
        onChange={(event) => {
          mergeFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = "";
        }}
      />

      {showOnboarding ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/50 bg-paper shadow-[0_30px_90px_rgba(16,18,20,0.35)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <Image src="/brand/tenderlens-logo.png" width={40} height={40} alt="" className="rounded-xl" />
                <span className="font-semibold text-ink">TenderLens AI</span>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboarding(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink transition hover:bg-mist"
                aria-label={text.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 lg:p-8">
              {onboardingSlide === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-6 ring-2 ring-teal/30">
                <div className="inline-flex rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">{text.slideCounterOne}</div>
                <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight text-ink">{text.onboardingOne}</h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-graphite">{text.onboardingOneBody}</p>
                <div className="mt-8 grid gap-3 rounded-2xl bg-mist p-4 sm:grid-cols-3">
                  {[
                    { label: text.onboardingChecks[0], icon: SearchCheck },
                    { label: text.onboardingChecks[1], icon: ShieldCheck },
                    { label: text.onboardingChecks[2], icon: AlertTriangle },
                  ].map(({ label, icon: Icon }) => (
                    <div key={label} className="rounded-xl bg-white p-4 text-sm font-semibold text-ink">
                      <Icon className="mb-3 h-5 w-5 text-teal" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              ) : (
              <div className="rounded-2xl border border-line bg-white p-6 ring-2 ring-teal/30">
                <div className="inline-flex rounded-full bg-cobalt/10 px-3 py-1 text-sm font-semibold text-cobalt">{text.slideCounterTwo}</div>
                <h2 className="mt-5 text-3xl font-semibold leading-tight text-ink">{text.onboardingTwo}</h2>
                <div className="mt-6 grid gap-3">
                  {[text.stepUpload, text.stepWait, text.stepAsk, text.stepDownload].map((step, index) => (
                    <div key={step} className="flex items-center gap-4 rounded-xl border border-line bg-paper p-4">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-teal text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="font-medium text-ink">{step}</span>
                    </div>
                  ))}
                </div>
                <Link href="/how-to-use" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cobalt">
                  <BookOpen className="h-4 w-4" />
                  {text.howToUse} TenderLens AI
                </Link>
              </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-line px-6 py-5">
              <div className="flex gap-2">
                <button type="button" onClick={() => setOnboardingSlide(0)} className={`h-2.5 w-8 rounded-full ${onboardingSlide === 0 ? "bg-teal" : "bg-line"}`} aria-label={text.slideOne} />
                <button type="button" onClick={() => setOnboardingSlide(1)} className={`h-2.5 w-8 rounded-full ${onboardingSlide === 1 ? "bg-teal" : "bg-line"}`} aria-label={text.slideTwo} />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowOnboarding(false)} className="h-11 rounded-xl border border-line bg-white px-5 font-semibold text-graphite">
                  {text.skip}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onboardingSlide === 0) {
                      setOnboardingSlide(1);
                      return;
                    }

                    setShowOnboarding(false);
                  }}
                  className="h-11 rounded-xl bg-teal px-5 font-semibold text-white shadow-table"
                >
                  {onboardingSlide === 0 ? text.nextSlide : text.getStarted}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showExamples ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-line bg-paper p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <SectionHeader icon={Files} title={text.exampleTitle} description={text.exampleDescription} colorClass="bg-slate-500/10 text-slate-600" />
              <button
                type="button"
                onClick={() => setShowExamples(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white"
                aria-label={text.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3">
              {EXAMPLE_FILES.map((file, index) => (
                <div key={file.name} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal/10 text-teal">
                      <FileCheck2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-ink">{text.exampleFiles[index].label}</div>
                      <div className="text-sm text-graphite">{text.exampleFiles[index].description}</div>
                    </div>
                  </div>
                  <a href={file.downloadPath} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-paper px-3 text-sm font-semibold text-ink">
                    <Download className="h-4 w-4" />
                    {file.format}
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-cobalt/20 bg-cobalt/5 p-3 text-sm font-semibold leading-6 text-cobalt">
              {text.examplePreparedNote}
            </div>
            <button type="button" onClick={runExampleAnalysis} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 font-semibold text-white shadow-table">
              {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {text.useExamples}
            </button>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/brand/tenderlens-logo.png" width={52} height={52} alt="" className="rounded-2xl bg-white shadow-table" />
            <div>
              <h1 className="text-2xl font-semibold leading-none text-white">TenderLens AI</h1>
              <p className="mt-1 text-sm text-white/70">{text.appSubtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/how-to-use" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-mist">
              <BookOpen className="h-4 w-4 text-cobalt" />
              {text.howToUse}
            </Link>
            <div className="inline-flex h-11 items-center rounded-xl border border-white/15 bg-white p-1" aria-label={text.language}>
              {(["en", "ar"] as AppLanguage[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={`h-9 rounded-lg px-3 text-sm font-semibold transition ${
                    language === item ? "bg-teal text-white" : "text-graphite hover:bg-mist"
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex h-11 overflow-hidden rounded-xl border border-white/15 bg-white">
              {(["pdf", "docx", "txt"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => void downloadReport(format)}
                  disabled={!currentResult || Boolean(isExporting)}
                  className="inline-flex min-w-14 items-center justify-center gap-2 border-r border-line px-3 text-sm font-semibold text-ink last:border-r-0 hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isExporting === format ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4 text-teal" />}
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1700px] items-start gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:px-8">
        <aside className="grid w-full min-w-0 max-w-full gap-4 self-start overflow-hidden">
          <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft">
            <SectionHeader icon={UploadCloud} title={text.uploadTitle} description={text.uploadHelp} colorClass="bg-teal/10 text-teal" />
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => (files.length ? void runAnalysis() : fileInputRef.current?.click())}
                disabled={isAnalyzing}
                className="inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 whitespace-normal rounded-xl bg-teal px-4 text-center font-semibold leading-snug text-white shadow-table transition hover:bg-[#066865] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                <span className="min-w-0 break-words">{files.length ? text.runSelected : text.uploadRun}</span>
              </button>
              <div className="flex items-center gap-3 text-xs font-semibold text-graphite/70">
                <span className="h-px flex-1 bg-line" />
                {text.or}
                <span className="h-px flex-1 bg-line" />
              </div>
              <button
                type="button"
                onClick={runExampleAnalysis}
                disabled={isAnalyzing}
                className="inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 whitespace-normal rounded-xl border border-cobalt/30 bg-cobalt/5 px-4 text-center font-semibold leading-snug text-cobalt transition hover:bg-cobalt/10 disabled:opacity-60"
              >
                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Files className="h-5 w-5" />}
                <span className="min-w-0 break-words">{text.runExample}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowExamples(true)}
                className="inline-flex min-h-11 w-full max-w-full items-center justify-center gap-2 whitespace-normal rounded-xl border border-line bg-paper px-4 text-center font-semibold leading-snug text-ink transition hover:bg-white"
              >
                <Eye className="h-5 w-5 text-teal" />
                <span className="min-w-0 break-words">{text.viewExample}</span>
              </button>
            </div>
          </section>

          <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-3">
              <SectionHeader
                icon={FileCheck2}
                title={text.analyzedFiles}
                description={text.uploadLimit(MAX_FILE_COUNT, formatBytes(MAX_FILE_SIZE_BYTES))}
                colorClass="bg-emerald-500/10 text-emerald-600"
              />
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                {(files.length || hasAnalyzed) ? (
                  <button
                    type="button"
                    onClick={startFresh}
                    className="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 whitespace-normal rounded-xl border border-line bg-white px-3 text-center text-sm font-semibold leading-snug text-graphite"
                  >
                    <RefreshCcw className="h-4 w-4 text-amber" />
                    <span className="min-w-0 break-words">{text.startFresh}</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => addMoreInputRef.current?.click()}
                  className="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 whitespace-normal rounded-xl border border-line bg-paper px-3 text-center text-sm font-semibold leading-snug text-ink"
                >
                  <Plus className="h-4 w-4" />
                  <span className="min-w-0 break-words">{text.addMore}</span>
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              {files.length ? (
                files.map((file, index) => {
                  const Icon = fileIcon(file);
                  return (
                    <div key={`${file.name}-${file.size}`} className="grid min-w-0 gap-3 rounded-xl border border-line bg-paper p-3 sm:grid-cols-[auto_minmax(0,1fr)]">
                      <div className={`grid h-11 w-11 place-items-center rounded-xl bg-white ${
                        Icon === FileImage ? "text-purple-600" : Icon === FileArchive ? "text-indigo-600" : "text-sky-600"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
                        <div className="min-w-0">
                          <div className="break-words font-semibold leading-5 text-ink">{displayFileNames[index]}</div>
                          <div className="mt-1 text-xs text-graphite">
                            {formatBytes(file.size)} · {extensionLabel(file)}
                          </div>
                        </div>
                        <span className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="whitespace-normal">{hasAnalyzed ? text.analyzed : text.ready}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(file)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-graphite hover:bg-white"
                          aria-label={text.removeFile}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-line bg-paper p-4 text-sm text-graphite">{text.noFiles}</div>
              )}
            </div>
            {!validation.ok && files.length > 0 ? (
              <div className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm leading-6 text-danger" role="alert">
                {validation.errors.join(" ")}
              </div>
            ) : null}
          </section>
        </aside>

        <section className="grid min-w-0 gap-4 overflow-hidden">
          {error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm font-semibold leading-6 text-danger" role="alert" aria-live="polite">
              {error}
            </div>
          ) : null}
          {!hasAnalyzed ? (
            <div className="rounded-[28px] border border-ink/10 bg-ink p-6 text-white shadow-soft">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/80">
                <Sparkles className="h-4 w-4 text-amber" />
                {text.previewNotice}
              </div>
              <div className="mt-5">
                <h2 className="text-3xl font-semibold leading-tight">{text.startTitle}</h2>
                <p className="mt-3 max-w-[80ch] text-base leading-7 text-white/72">{text.startBody}</p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => (files.length ? void runAnalysis() : fileInputRef.current?.click())}
                  disabled={isAnalyzing}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white shadow-table disabled:opacity-60 transition-transform active:scale-97 hover:bg-[#066865]"
                >
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  {files.length ? text.runSelected : text.uploadRun}
                </button>
                <button
                  type="button"
                  onClick={runExampleAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white disabled:opacity-60 transition-transform active:scale-97 hover:bg-white/20"
                >
                  <Files className="h-4 w-4" />
                  {text.runExample}
                </button>
              </div>
            </div>
          ) : null}

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            {currentResult ? (
              <div className="grid gap-5 xl:grid-cols-[1fr_360px] xl:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">
                    <Gauge className="h-4 w-4" />
                    {text.overall}
                  </div>
                  {isExampleSelection ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-cobalt/10 px-3 py-1 text-xs font-semibold text-cobalt">
                      <Sparkles className="h-3.5 w-3.5" />
                      {text.sampleRun}
                    </div>
                  ) : null}
                  <h2 className="mt-4 text-3xl font-semibold leading-tight text-ink">
                    {currentResult.score >= 80 ? text.resultTitleStrong : text.resultTitleRisk}
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-graphite">{currentResult.executiveBrief}</p>
                </div>
                <div className="flex items-center gap-5 rounded-2xl border border-line bg-paper p-4">
                  <ScoreRing score={currentResult.score} />
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-teal">
                      <CheckCircle2 className="h-4 w-4" />
                      {text.compliantRows(compliantCount)}
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-amber">
                      <AlertTriangle className="h-4 w-4" />
                      {text.riskRows(riskCount)}
                    </div>
                    <p className="text-xs leading-5 text-graphite">{text.verify}</p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyPanel
                icon={Gauge}
                title={text.emptyOverallTitle}
                body={text.emptyOverallBody}
                colorClass="bg-indigo-500/10 text-indigo-600"
                action={
                  <div className="flex flex-col justify-center gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => (files.length ? void runAnalysis() : fileInputRef.current?.click())}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
                    >
                      <UploadCloud className="h-4 w-4" />
                      {files.length ? text.runSelected : text.uploadRun}
                    </button>
                    <button
                      type="button"
                      onClick={runExampleAnalysis}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink"
                    >
                      <Files className="h-4 w-4 text-cobalt" />
                      {text.runExample}
                    </button>
                  </div>
                }
              />
            )}
          </section>

          <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 shadow-table" aria-label="TenderLens workspace tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const tabIconColors: Record<WorkspaceTab, string> = {
                analysis: "text-cobalt",
                ask: "text-fuchsia-600",
                map: "text-amber",
                deck: "text-rose-600",
                questions: "text-cyan-600",
              };
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                    activeTab === tab.id ? "bg-ink text-white" : "text-graphite hover:bg-paper hover:text-ink"
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-colors ${activeTab === tab.id ? "text-white" : tabIconColors[tab.id]}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {activeTab === "analysis" && currentResult ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-table">
                <div className="border-b border-line bg-paper px-5 py-4">
                  <SectionHeader icon={ClipboardCheck} title={text.checklist} description={text.checklistDesc} colorClass="bg-cobalt/10 text-cobalt" />
                </div>
                <div className="divide-y divide-line">
                  {currentResult.matrix.map((row, index) => (
                    <button
                      key={`${row.requirement}-${index}`}
                      type="button"
                      onClick={() => setActiveRowIndex(index)}
                      className={`grid w-full gap-3 px-5 py-4 text-left transition lg:grid-cols-[minmax(0,1.2fr)_130px_90px_minmax(0,1fr)] ${
                        activeRowIndex === index ? "bg-teal/5" : "hover:bg-paper"
                      }`}
                    >
                      <span>
                        <span className="block font-semibold leading-6 text-ink">{row.requirement}</span>
                        <span className="mt-1 block text-sm text-graphite">{row.category}</span>
                      </span>
                      <span className={`inline-flex h-fit w-fit items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${statusStyles[row.status]}`}>
                        <StatusIcon status={row.status} />
                        {statusLabel(row.status)}
                      </span>
                      <span className={`text-sm font-semibold ${riskStyles[row.risk]}`}>{riskLabel(row.risk)}</span>
                      <span className="text-sm leading-6 text-graphite">{row.response}</span>
                    </button>
                  ))}
                </div>
              </section>

              <aside className="grid gap-4 self-start">
                <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                  <SectionHeader icon={FileText} title={text.evidence} description={text.evidenceDesc} colorClass="bg-sky-500/10 text-sky-600" />
                  <div className="mt-4 grid gap-3">
                    {activeRow?.citations.map((citation, index) => (
                      <figure key={`${citation.file}-${index}`} className="rounded-xl border border-line bg-paper p-4">
                        <figcaption className="text-sm font-semibold text-ink">
                          {citation.file} {citation.page ? <span className="text-graphite">· {citation.page}</span> : null}
                        </figcaption>
                        <blockquote className="mt-3 border-l-2 border-teal pl-3 text-sm leading-6 text-graphite">{citation.quote}</blockquote>
                      </figure>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                  <SectionHeader icon={AlertTriangle} title={text.attention} description={text.attentionDesc} colorClass="bg-danger/10 text-danger" />
                  <ul className="mt-4 grid gap-2 text-sm leading-6 text-graphite">
                    {(currentResult.risks.length ? currentResult.risks : [text.noMajorRisks]).map((risk) => (
                      <li key={risk} className="rounded-xl bg-amber/10 p-3 text-amber">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                  <SectionHeader icon={SearchCheck} title={text.checked} colorClass="bg-violet-500/10 text-violet-600" />
                  <ol className="mt-4 grid gap-2 text-sm leading-6 text-graphite">
                    {currentResult.trace.map((step, index) => (
                      <li key={`${step}-${index}`} className="flex gap-3">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal/10 text-xs font-semibold text-teal">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>
              </aside>
            </div>
          ) : null}

          {activeTab === "analysis" && !currentResult ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                <SectionHeader icon={ClipboardCheck} title={text.checklist} description={text.checklistDesc} colorClass="bg-cobalt/10 text-cobalt" />
                <div className="mt-5">
                  <EmptyPanel icon={ClipboardCheck} title={text.emptyChecklistTitle} body={text.emptyChecklistBody} colorClass="bg-cobalt/10 text-cobalt" />
                </div>
              </section>
              <aside className="grid gap-4 self-start">
                <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                  <SectionHeader icon={FileText} title={text.evidence} description={text.evidenceDesc} colorClass="bg-sky-500/10 text-sky-600" />
                  <div className="mt-5">
                    <EmptyPanel icon={FileText} title={text.emptyEvidenceTitle} body={text.emptyEvidenceBody} colorClass="bg-sky-500/10 text-sky-600" />
                  </div>
                </section>
                <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                  <SectionHeader icon={AlertTriangle} title={text.attention} description={text.attentionDesc} colorClass="bg-danger/10 text-danger" />
                  <div className="mt-5">
                    <EmptyPanel icon={AlertTriangle} title={text.emptyAttentionTitle} body={text.emptyAttentionBody} colorClass="bg-danger/10 text-danger" />
                  </div>
                </section>
                <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                  <SectionHeader icon={SearchCheck} title={text.checked} colorClass="bg-violet-500/10 text-violet-600" />
                  <div className="mt-5">
                    <EmptyPanel icon={SearchCheck} title={text.emptyCheckedTitle} body={text.emptyCheckedBody} colorClass="bg-violet-500/10 text-violet-600" />
                  </div>
                </section>
              </aside>
            </div>
          ) : null}

          {activeTab === "ask" ? (
            <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <SectionHeader icon={MessageCircle} title={text.ask} description={text.askDesc} colorClass="bg-fuchsia-500/10 text-fuchsia-600" />
              {!currentResult ? <div className="mt-4 rounded-xl border border-line bg-paper p-4 text-sm text-graphite">{text.noResult}</div> : null}
              <div className="mt-5 grid min-h-[460px] grid-rows-[1fr_auto] rounded-2xl border border-line bg-paper">
                <div className="grid content-start gap-3 overflow-y-auto p-4">
                  {visibleMessages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[780px] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role === "user" ? "bg-teal text-white" : "border border-line bg-white text-graphite"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isChatting ? (
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-sm text-graphite">
                      <Loader2 className="h-4 w-4 animate-spin text-teal" />
                      {text.thinking}
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-line p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {text.quickQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void sendChatMessage(question)}
                        disabled={!currentResult || isChatting}
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-graphite hover:border-cobalt hover:text-cobalt disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void sendChatMessage();
                    }}
                  >
                    <input
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder={text.askPlaceholder}
                      disabled={!currentResult || isChatting}
                      className="min-h-12 flex-1 rounded-xl border border-line bg-white px-4 text-sm outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={!currentResult || !chatInput.trim() || isChatting}
                      className="grid h-12 w-12 place-items-center rounded-xl bg-teal text-white shadow-table disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={text.sendMessage}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "map" ? (
            <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <SectionHeader icon={GitBranch} title={text.map} description={text.mapDesc} colorClass="bg-amber/10 text-amber" />
                <button
                  type="button"
                  onClick={downloadTenderMap}
                  disabled={!tenderMapSvg}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4 text-teal" />
                  {text.svg}
                </button>
              </div>
              {tenderMap && tenderMapSvg ? (
                <>
                  <div className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-paper p-3 shadow-table">
                    <div className="min-w-[920px]" dangerouslySetInnerHTML={{ __html: tenderMapSvg }} />
                  </div>
                  <div className="mt-4 rounded-2xl border border-line bg-ink p-5 text-white">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Layers3 className="h-4 w-4 text-amber" />
                      {text.evidencePath}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/80">
                      {tenderMap.edges.slice(0, 10).map((edge, index) => (
                        <span key={`${edge.from}-${edge.to}-${index}`} className="rounded-full bg-white/10 px-3 py-1">
                          {edge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6">
                  <EmptyPanel icon={GitBranch} title={text.emptyMapTitle} body={text.emptyMapBody} colorClass="bg-amber/10 text-amber" />
                </div>
              )}
            </section>
          ) : null}

          {activeTab === "deck" ? (
            <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <SectionHeader icon={Presentation} title={text.deck} description={text.deckDesc} colorClass="bg-rose-500/10 text-rose-600" />
                <button
                  type="button"
                  onClick={() => void downloadReport("pptx")}
                  disabled={!currentResult || Boolean(isExporting)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4 text-teal" />
                  {isExporting === "pptx" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {text.pptx}
                </button>
              </div>
              {briefingDeck.length ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {briefingDeck.map((slide, index) => (
                    <article key={slide.title} className="min-h-60 rounded-[24px] border border-line bg-paper p-5 shadow-table">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold uppercase text-teal">
                          {index + 1} · {slide.eyebrow}
                        </div>
                        <Presentation className="h-4 w-4 text-cobalt" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold leading-snug text-ink">{slide.title}</h3>
                      <ul className="mt-4 grid gap-2 text-sm leading-6 text-graphite">
                        {slide.bullets.slice(0, 4).map((bullet) => (
                          <li key={bullet} className="rounded-xl border border-line bg-white p-3">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyPanel icon={Presentation} title={text.emptyDeckTitle} body={text.emptyDeckBody} colorClass="bg-rose-500/10 text-rose-600" />
                </div>
              )}
            </section>
          ) : null}

          {activeTab === "questions" ? (
            <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <SectionHeader icon={CircleHelp} title={text.questions} description={text.questionsDesc} colorClass="bg-cyan-500/10 text-cyan-600" />
              {clarificationQuestions.length ? (
                <div className="mt-6 grid gap-3">
                  {clarificationQuestions.map((item, index) => (
                    <article key={`${item.question}-${index}`} className="rounded-2xl border border-line bg-paper p-4">
                      <div className="flex items-start gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber/15 text-sm font-semibold text-amber">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold leading-6 text-ink">{item.question}</h3>
                          <p className="mt-2 text-sm leading-6 text-graphite">{item.why}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyPanel icon={CircleHelp} title={text.emptyQuestionsTitle} body={text.emptyQuestionsBody} colorClass="bg-cyan-500/10 text-cyan-600" />
                </div>
              )}
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
