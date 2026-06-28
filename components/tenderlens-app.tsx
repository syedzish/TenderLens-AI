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
  SearchCheck,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import type { AppLanguage, ChatHistoryMessage } from "@/lib/chat";
import type { ComplianceMatrixRow, ComplianceResult, ComplianceStatus, RiskLevel } from "@/lib/compliance";
import { buildBriefingDeck, buildClarificationQuestions, buildTenderMap } from "@/lib/derived-features";
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  validateUploadManifest,
  type ValidatedUploadFile,
} from "@/lib/security";

type WorkspaceTab = "analysis" | "ask" | "map" | "deck" | "questions";

type ExampleFile = {
  label: string;
  description: string;
  path: string;
  downloadPath: string;
  name: string;
  type: string;
  format: "PDF" | "DOCX";
};

const EXAMPLE_FILES: ExampleFile[] = [
  {
    label: "RFP example",
    description: "Sample request for proposal document.",
    path: "/demo-docs/riyadh-smart-parking-rfp.pdf",
    downloadPath: "/demo-docs/riyadh-smart-parking-rfp.pdf",
    name: "Riyadh Smart Parking RFP.pdf",
    type: "application/pdf",
    format: "PDF",
  },
  {
    label: "Proposal example",
    description: "Sample proposal response document.",
    path: "/demo-docs/najm-urban-mobility-proposal.docx",
    downloadPath: "/demo-docs/najm-urban-mobility-proposal.docx",
    name: "Najm Urban Mobility Proposal.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    format: "DOCX",
  },
  {
    label: "Technical addendum",
    description: "Sample technical compliance addendum.",
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
    previewNotice:
      "Preview mode: no files have been analyzed yet. Upload files or run the preloaded example to replace this with real results.",
    verify: "AI-generated review. Verify before making procurement decisions.",
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
    previewNotice: "وضع المعاينة: لم يتم تحليل ملفات بعد. ارفع ملفاتك أو حلل الملفات الجاهزة لاستبدال هذه النتائج بنتائج حقيقية.",
    verify: "مراجعة مولدة بالذكاء الاصطناعي. تحقق قبل اتخاذ قرارات الشراء.",
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
}: {
  icon: typeof ClipboardCheck;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-graphite">{description}</p> : null}
      </div>
    </div>
  );
}

export function TenderLensApp() {
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ComplianceResult | null>(SAMPLE_RESULT);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("analysis");
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isExporting, setIsExporting] = useState<null | "txt" | "pdf" | "docx">(null);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingSlide, setOnboardingSlide] = useState<0 | 1>(0);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatHistoryMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me about the biggest risks, why a requirement is partial, or what you should ask the vendor next.",
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const text = labels[language];
  const isRtl = language === "ar";
  const currentResult = result ?? SAMPLE_RESULT;
  const activeRow = currentResult.matrix[Math.min(activeRowIndex, currentResult.matrix.length - 1)];
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
    () => buildTenderMap(currentResult, files.length ? files.map((file) => file.name) : EXAMPLE_FILES.map((file) => file.name)),
    [currentResult, files],
  );
  const briefingDeck = useMemo(() => buildBriefingDeck(currentResult), [currentResult]);
  const clarificationQuestions = useMemo(() => buildClarificationQuestions(currentResult), [currentResult]);
  const compliantCount = currentResult.matrix.filter((row) => row.status === "Compliant").length;
  const riskCount = currentResult.matrix.filter((row) => row.risk !== "Low" || row.status !== "Compliant").length;

  function mergeFiles(nextFiles: File[]) {
    const merged = [...files, ...nextFiles].slice(0, MAX_FILE_COUNT);
    setFiles(merged);
    setError(null);
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
    try {
      const loaded = await loadExampleFiles();
      setShowExamples(false);
      await runAnalysis(loaded);
    } catch (exampleError) {
      const message = exampleError instanceof Error ? exampleError.message : "Example files could not be loaded.";
      setError(message);
    }
  }

  async function sendChatMessage(question?: string) {
    const message = (question ?? chatInput).trim();
    if (!message || !result) return;

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
      body.append("analysis", JSON.stringify(result));
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

  async function downloadReport(format: "txt" | "pdf" | "docx") {
    if (!result) return;
    setIsExporting(format);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          format,
          result,
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
    const rows = tenderMap.nodes
      .slice(0, 16)
      .map((node, index) => {
        const x = 80 + (index % 4) * 220;
        const y = 80 + Math.floor(index / 4) * 120;
        return `<g><rect x="${x}" y="${y}" width="170" height="58" rx="14" fill="#ffffff" stroke="#d8e1e4"/><text x="${x + 14}" y="${y + 34}" font-size="12" fill="#101214">${node.label
          .replace(/[<&>]/g, "")
          .slice(0, 26)}</text></g>`;
      })
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="980" height="560" viewBox="0 0 980 560"><rect width="980" height="560" fill="#faf7ef"/><text x="48" y="42" font-size="24" font-family="Arial" fill="#101214">TenderLens AI Tender Map</text>${rows}</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
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
    <main dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-paper text-ink">
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
                <div className="inline-flex rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">1 of 2</div>
                <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight text-ink">{text.onboardingOne}</h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-graphite">{text.onboardingOneBody}</p>
                <div className="mt-8 grid gap-3 rounded-2xl bg-mist p-4 sm:grid-cols-3">
                  {[
                    ["Extract requirements", SearchCheck],
                    ["Match evidence", ShieldCheck],
                    ["Highlight risks", AlertTriangle],
                  ].map(([item, Icon]) => (
                    <div key={item as string} className="rounded-xl bg-white p-4 text-sm font-semibold text-ink">
                      <Icon className="mb-3 h-5 w-5 text-teal" />
                      {item as string}
                    </div>
                  ))}
                </div>
              </div>
              ) : (
              <div className="rounded-2xl border border-line bg-white p-6 ring-2 ring-teal/30">
                <div className="inline-flex rounded-full bg-cobalt/10 px-3 py-1 text-sm font-semibold text-cobalt">2 of 2</div>
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
                <button type="button" onClick={() => setOnboardingSlide(0)} className={`h-2.5 w-8 rounded-full ${onboardingSlide === 0 ? "bg-teal" : "bg-line"}`} aria-label="Slide 1" />
                <button type="button" onClick={() => setOnboardingSlide(1)} className={`h-2.5 w-8 rounded-full ${onboardingSlide === 1 ? "bg-teal" : "bg-line"}`} aria-label="Slide 2" />
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
              <SectionHeader icon={Files} title={text.exampleTitle} description={text.exampleDescription} />
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
              {EXAMPLE_FILES.map((file) => (
                <div key={file.name} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-teal/10 text-teal">
                      <FileCheck2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-ink">{file.label}</div>
                      <div className="text-sm text-graphite">{file.description}</div>
                    </div>
                  </div>
                  <a href={file.downloadPath} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-paper px-3 text-sm font-semibold text-ink">
                    <Download className="h-4 w-4" />
                    {file.format}
                  </a>
                </div>
              ))}
            </div>
            <button type="button" onClick={runExampleAnalysis} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 font-semibold text-white shadow-table">
              {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              {text.useExamples}
            </button>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/brand/tenderlens-logo.png" width={52} height={52} alt="" className="rounded-2xl shadow-table" />
            <div>
              <h1 className="text-2xl font-semibold leading-none text-ink">TenderLens AI</h1>
              <p className="mt-1 text-sm text-graphite">{text.appSubtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/how-to-use" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-mist">
              <BookOpen className="h-4 w-4 text-cobalt" />
              {text.howToUse}
            </Link>
            <div className="inline-flex h-11 items-center rounded-xl border border-line bg-white p-1" aria-label={text.language}>
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
            <div className="flex h-11 overflow-hidden rounded-xl border border-line bg-white">
              {(["pdf", "docx", "txt"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => void downloadReport(format)}
                  disabled={!result || Boolean(isExporting)}
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

      <div className="mx-auto grid max-w-[1560px] gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="grid gap-4 self-start">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <SectionHeader icon={UploadCloud} title={text.uploadTitle} description={text.uploadHelp} />
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => (files.length ? void runAnalysis() : fileInputRef.current?.click())}
                disabled={isAnalyzing}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 font-semibold text-white shadow-table transition hover:bg-[#066865] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                {files.length ? text.runSelected : text.uploadRun}
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
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-cobalt/30 bg-cobalt/5 px-4 font-semibold text-cobalt transition hover:bg-cobalt/10 disabled:opacity-60"
              >
                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Files className="h-5 w-5" />}
                {text.runExample}
              </button>
              <button
                type="button"
                onClick={() => setShowExamples(true)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-paper px-4 font-semibold text-ink transition hover:bg-white"
              >
                <Eye className="h-5 w-5 text-teal" />
                {text.viewExample}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <SectionHeader
                icon={FileCheck2}
                title={text.analyzedFiles}
                description={`Upload up to ${MAX_FILE_COUNT} files. ${formatBytes(MAX_FILE_SIZE_BYTES)} per file.`}
              />
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm font-semibold text-ink"
              >
                <Plus className="h-4 w-4" />
                {text.addMore}
              </button>
            </div>
            <div className="mt-5 grid gap-2">
              {files.length ? (
                files.map((file) => {
                  const Icon = fileIcon(file);
                  return (
                    <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-xl border border-line bg-paper p-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-cobalt">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-ink">{file.name}</div>
                        <div className="text-xs text-graphite">
                          {formatBytes(file.size)} · {extensionLabel(file)}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {hasAnalyzed ? text.analyzed : text.ready}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((item) => item !== file))}
                        className="grid h-9 w-9 place-items-center rounded-full text-graphite hover:bg-white"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
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

        <section className="grid min-w-0 gap-4">
          {error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 p-4 text-sm font-semibold text-danger" role="alert">
              {error}
            </div>
          ) : null}
          {!hasAnalyzed ? (
            <div className="rounded-2xl border border-cobalt/20 bg-cobalt/5 p-4 text-sm font-semibold leading-6 text-cobalt">
              {text.previewNotice}
            </div>
          ) : null}

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="grid gap-5 xl:grid-cols-[1fr_360px] xl:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">
                  <Gauge className="h-4 w-4" />
                  {text.overall}
                </div>
                <h2 className="mt-4 text-3xl font-semibold leading-tight text-ink">
                  {currentResult.score >= 80 ? "Strong response with a few checks" : "Good foundation with risks to resolve"}
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-graphite">{currentResult.executiveBrief}</p>
              </div>
              <div className="flex items-center gap-5 rounded-2xl border border-line bg-paper p-4">
                <ScoreRing score={currentResult.score} />
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-teal">
                    <CheckCircle2 className="h-4 w-4" />
                    {compliantCount} compliant rows
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-amber">
                    <AlertTriangle className="h-4 w-4" />
                    {riskCount} items need attention
                  </div>
                  <p className="text-xs leading-5 text-graphite">{text.verify}</p>
                </div>
              </div>
            </div>
          </section>

          <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 shadow-table" aria-label="TenderLens workspace tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                    activeTab === tab.id ? "bg-ink text-white" : "text-graphite hover:bg-paper hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {activeTab === "analysis" ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-table">
                <div className="border-b border-line bg-paper px-5 py-4">
                  <SectionHeader icon={ClipboardCheck} title={text.checklist} description="Every row links a requirement to evidence and risk." />
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
                        {row.status}
                      </span>
                      <span className={`text-sm font-semibold ${riskStyles[row.risk]}`}>{row.risk}</span>
                      <span className="text-sm leading-6 text-graphite">{row.response}</span>
                    </button>
                  ))}
                </div>
              </section>

              <aside className="grid gap-4 self-start">
                <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                  <SectionHeader icon={FileText} title={text.evidence} description="Selected evidence for the active requirement." />
                  <div className="mt-4 grid gap-3">
                    {activeRow.citations.map((citation, index) => (
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
                  <SectionHeader icon={AlertTriangle} title={text.attention} description="Risks that may need clarification." />
                  <ul className="mt-4 grid gap-2 text-sm leading-6 text-graphite">
                    {(currentResult.risks.length ? currentResult.risks : ["No major risks listed."]).map((risk) => (
                      <li key={risk} className="rounded-xl bg-amber/10 p-3 text-amber">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-line bg-white p-5 shadow-table">
                  <SectionHeader icon={SearchCheck} title={text.checked} />
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

          {activeTab === "ask" ? (
            <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <SectionHeader icon={MessageCircle} title={text.ask} description="Ask follow-up questions about the documents, evidence, risks, and next steps." />
              {!result ? <div className="mt-4 rounded-xl border border-line bg-paper p-4 text-sm text-graphite">{text.noResult}</div> : null}
              <div className="mt-5 grid min-h-[460px] grid-rows-[1fr_auto] rounded-2xl border border-line bg-paper">
                <div className="grid content-start gap-3 overflow-y-auto p-4">
                  {chatMessages.map((message, index) => (
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
                      TenderLens is checking the evidence...
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-line p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {[
                      "What are the biggest risks?",
                      "Why is this partial?",
                      "What should I ask the vendor?",
                      "Summarize this in Arabic",
                    ].map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void sendChatMessage(question)}
                        disabled={!result || isChatting}
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
                      disabled={!result || isChatting}
                      className="min-h-12 flex-1 rounded-xl border border-line bg-white px-4 text-sm outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={!result || !chatInput.trim() || isChatting}
                      className="grid h-12 w-12 place-items-center rounded-xl bg-teal text-white shadow-table disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
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
                <SectionHeader icon={GitBranch} title={text.map} description="A simple view of how files, requirements, evidence, risks, and actions connect." />
                <button type="button" onClick={downloadTenderMap} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink">
                  <Download className="h-4 w-4 text-teal" />
                  SVG
                </button>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
                {(["file", "requirement", "risk", "action"] as const).map((kind) => (
                  <div key={kind} className="rounded-2xl border border-line bg-paper p-4">
                    <h3 className="font-semibold capitalize text-ink">{kind}</h3>
                    <div className="mt-3 grid gap-2">
                      {tenderMap.nodes
                        .filter((node) => node.kind === kind)
                        .slice(0, 5)
                        .map((node) => (
                          <div key={node.id} className="rounded-xl bg-white p-3 text-sm text-graphite">
                            {node.label}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-line bg-ink p-5 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Layers3 className="h-4 w-4 text-amber" />
                  Evidence path
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/80">
                  {tenderMap.edges.slice(0, 10).map((edge, index) => (
                    <span key={`${edge.from}-${edge.to}-${index}`} className="rounded-full bg-white/10 px-3 py-1">
                      {edge.label}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "deck" ? (
            <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <SectionHeader icon={Presentation} title={text.deck} description="A lightweight stakeholder briefing created from the analysis result." />
                <button type="button" onClick={() => void downloadReport("pdf")} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink">
                  <Download className="h-4 w-4 text-teal" />
                  PDF
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {briefingDeck.map((slide, index) => (
                  <article key={slide.title} className="min-h-60 rounded-2xl border border-line bg-paper p-5">
                    <div className="text-xs font-semibold uppercase text-teal">
                      {index + 1} · {slide.eyebrow}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-ink">{slide.title}</h3>
                    <ul className="mt-4 grid gap-2 text-sm leading-6 text-graphite">
                      {slide.bullets.slice(0, 4).map((bullet) => (
                        <li key={bullet} className="rounded-xl bg-white p-3">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === "questions" ? (
            <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <SectionHeader icon={CircleHelp} title={text.questions} description="Practical questions to send to the vendor or project owner before submission." />
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
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
