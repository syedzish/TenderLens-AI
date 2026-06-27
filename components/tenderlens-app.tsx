"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Gauge,
  Loader2,
  Play,
  SearchCheck,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ComplianceMatrixRow, ComplianceResult, ComplianceStatus, RiskLevel } from "@/lib/compliance";
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
  validateUploadManifest,
} from "@/lib/security";

const DEMO_DOCS = [
  {
    name: "riyadh-smart-parking-rfp.md",
    path: "/demo-docs/riyadh-smart-parking-rfp.md",
    pdfPath: "/demo-docs/riyadh-smart-parking-rfp.pdf",
    label: "RFP",
  },
  {
    name: "najm-urban-mobility-proposal.md",
    path: "/demo-docs/najm-urban-mobility-proposal.md",
    pdfPath: "/demo-docs/najm-urban-mobility-proposal.pdf",
    label: "Proposal",
  },
  {
    name: "technical-compliance-addendum.md",
    path: "/demo-docs/technical-compliance-addendum.md",
    pdfPath: "/demo-docs/technical-compliance-addendum.pdf",
    label: "Addendum",
  },
] as const;

const SAMPLE_RESULT: ComplianceResult = {
  score: 78,
  executiveBrief:
    "The response is broadly aligned with the smart parking tender, with strong technical coverage and remaining risk around bid security validity, rollout date, and staff training volume.",
  matrix: [
    {
      requirement: "Bid security must equal 2% and remain valid for 120 days.",
      category: "Commercial",
      status: "Partial",
      risk: "Medium",
      response: "A bid bond is included, but the validity period is shorter than the RFP requirement.",
      citations: [
        {
          file: "najm-urban-mobility-proposal.md",
          quote: "Bid security: 2% of contract value, valid for 90 days from submission.",
        },
      ],
    },
    {
      requirement: "Platform must provide Arabic and English operator interfaces.",
      category: "Product",
      status: "Compliant",
      risk: "Low",
      response: "The proposal confirms bilingual operator portals and resident notifications.",
      citations: [
        {
          file: "najm-urban-mobility-proposal.md",
          quote: "The operator portal and resident notifications are available in Arabic and English.",
        },
      ],
    },
    {
      requirement: "Production service must meet 99.5% monthly uptime.",
      category: "SLA",
      status: "Compliant",
      risk: "Low",
      response: "The proposal commits to the required monthly uptime level.",
      citations: [
        {
          file: "technical-compliance-addendum.md",
          quote: "Najm commits to 99.5% monthly uptime for the hosted production service.",
        },
      ],
    },
    {
      requirement: "Rollout must complete by 30 September 2026.",
      category: "Delivery",
      status: "Gap",
      risk: "High",
      response: "The delivery plan misses the requested deadline by two weeks.",
      citations: [
        {
          file: "najm-urban-mobility-proposal.md",
          quote: "Go-live is planned for 15 October 2026 after staged district acceptance.",
        },
      ],
    },
  ],
  trace: ["Validated files", "Extracted obligations", "Matched evidence", "Scored risks"],
  risks: ["Bid security validity is short by 30 days.", "Go-live date is later than the tender deadline."],
  nextActions: ["Request a revised bid bond validity letter.", "Ask for an accelerated deployment commitment."],
};

const statusStyles: Record<ComplianceStatus, string> = {
  Compliant: "border-teal/20 bg-teal/10 text-teal",
  Partial: "border-amber/20 bg-amber/10 text-amber",
  Gap: "border-danger/20 bg-danger/10 text-danger",
  "Needs Review": "border-cobalt/20 bg-cobalt/10 text-cobalt",
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

  return `${Math.ceil(size / 1024)} KB`;
}

function StatusIcon({ status }: { status: ComplianceStatus }) {
  if (status === "Compliant") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "Gap") {
    return <XCircle className="h-4 w-4" />;
  }

  return <AlertTriangle className="h-4 w-4" />;
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative grid h-28 w-28 place-items-center rounded-full bg-white shadow-table">
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: `conic-gradient(#087b78 ${score * 3.6}deg, #e5ebf0 0deg)`,
        }}
      />
      <div className="relative grid h-[86px] w-[86px] place-items-center rounded-full bg-white">
        <div className="text-center">
          <div className="text-[28px] font-semibold leading-none text-ink">{score}</div>
          <div className="mt-1 text-[11px] font-medium uppercase text-graphite/60">score</div>
        </div>
      </div>
    </div>
  );
}

function GuardrailLine() {
  return (
    <div className="grid gap-2 rounded-lg border border-line bg-paper p-3 text-xs text-graphite">
      <div className="flex items-center gap-2 font-semibold text-ink">
        <ShieldCheck className="h-4 w-4 text-teal" />
        Upload guardrails
      </div>
      <div className="grid gap-1">
        <span>PDF, TXT, MD only</span>
        <span>Max {MAX_FILE_COUNT} files</span>
        <span>{formatBytes(MAX_FILE_SIZE_BYTES)} per file</span>
        <span>{formatBytes(MAX_TOTAL_UPLOAD_BYTES)} total payload</span>
      </div>
    </div>
  );
}

function EmptyMatrix() {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-lg border border-dashed border-line bg-white">
      <div className="max-w-sm text-center">
        <SearchCheck className="mx-auto h-10 w-10 text-teal" />
        <h2 className="mt-4 text-xl font-semibold text-ink">Compliance Matrix</h2>
        <p className="mt-2 text-sm leading-6 text-graphite">
          Load the demo pack or upload tender evidence to generate a cited matrix.
        </p>
      </div>
    </div>
  );
}

function EvidencePanel({ row }: { row?: ComplianceMatrixRow }) {
  if (!row) {
    return (
      <div className="rounded-lg border border-line bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <FileText className="h-4 w-4 text-cobalt" />
          Evidence
        </div>
        <p className="mt-4 text-sm leading-6 text-graphite">
          Select a matrix row to inspect cited document evidence.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <FileText className="h-4 w-4 text-cobalt" />
        Evidence
      </div>
      <div className="mt-4 grid gap-3">
        {row.citations.map((citation, index) => (
          <figure key={`${citation.file}-${index}`} className="rounded-lg border border-line bg-paper p-4">
            <figcaption className="flex items-center justify-between gap-3 text-xs font-semibold text-graphite">
              <span>{citation.file}</span>
              {citation.page ? <span>{citation.page}</span> : null}
            </figcaption>
            <blockquote className="mt-3 border-l-2 border-teal pl-3 text-sm leading-6 text-ink">
              {citation.quote}
            </blockquote>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function TenderLensApp() {
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ComplianceResult | null>(SAMPLE_RESULT);
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);
  const [resultMode, setResultMode] = useState<"sample" | "analysis">("sample");

  const uploadValidation = useMemo(
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

  const activeRow = result?.matrix[activeRowIndex];
  const compliantCount = result?.matrix.filter((row) => row.status === "Compliant").length ?? 0;

  useEffect(() => {
    setActiveRowIndex(0);
  }, [result]);

  async function loadDemoFiles() {
    const loaded = await Promise.all(
      DEMO_DOCS.map(async (doc) => {
        const response = await fetch(doc.path);

        if (!response.ok) {
          throw new Error(`Could not load ${doc.name}`);
        }

        const text = await response.text();
        return new File([text], doc.name, { type: "text/markdown" });
      }),
    );

    setFiles(loaded);
    setIsDemo(true);
    setResult(null);
    return loaded;
  }

  async function runAnalysis(inputFiles?: File[]) {
    const selectedFiles = inputFiles ?? files;
    const validation = validateUploadManifest(
      selectedFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    );

    if (!validation.ok) {
      setError(validation.errors.join(" "));
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const body = new FormData();
      selectedFiles.forEach((file) => body.append("files", file));

      const response = await fetch("/api/analyze", {
        method: "POST",
        body,
      });
      const payload: { result?: ComplianceResult; error?: string } = await response.json();

      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "Analysis failed.");
      }

      setResult(payload.result);
      setResultMode("analysis");
    } catch (analysisError) {
      const message = analysisError instanceof Error ? analysisError.message : "Analysis failed.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function runDemoPack() {
    try {
      const demoFiles = await loadDemoFiles();
      await runAnalysis(demoFiles);
    } catch (demoError) {
      const message = demoError instanceof Error ? demoError.message : "Demo pack could not be loaded.";
      setError(message);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-ink">TenderLens AI</h1>
              <p className="text-sm text-graphite">Cited compliance matrix agent</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/demo-docs/riyadh-smart-parking-rfp.pdf"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-graphite transition hover:border-graphite/30 hover:text-ink"
            >
              <Download className="h-4 w-4" />
              Sample Docs
            </a>
            <button
              type="button"
              onClick={runDemoPack}
              disabled={isAnalyzing}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal px-4 text-sm font-semibold text-white shadow-table transition hover:bg-[#066865] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Demo Pack
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)_360px] lg:px-8">
        <aside className="grid gap-4 self-start">
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">Sources</h2>
                <p className="mt-1 text-xs text-graphite">{isDemo ? "Demo pack loaded" : "Private session"}</p>
              </div>
              <UploadCloud className="h-5 w-5 text-cobalt" />
            </div>

            <label className="mt-4 grid cursor-pointer place-items-center rounded-lg border border-dashed border-line bg-paper px-4 py-6 text-center transition hover:border-teal hover:bg-white">
              <UploadCloud className="h-7 w-7 text-teal" />
              <span className="mt-3 text-sm font-semibold text-ink">Upload tender files</span>
              <input
                className="sr-only"
                type="file"
                multiple
                accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                onChange={(event) => {
                  const selected = Array.from(event.target.files ?? []);
                  setFiles(selected);
                  setIsDemo(false);
                  setResult(null);
                  setError(null);
                }}
              />
            </label>

            <div className="mt-4 grid gap-2">
              {files.length > 0 ? (
                files.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-lg border border-line bg-white p-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-paper text-cobalt">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">{file.name}</div>
                      <div className="text-xs text-graphite">{formatBytes(file.size)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-line bg-white p-3 text-sm text-graphite">
                  No local files selected.
                </div>
              )}
            </div>

            {!uploadValidation.ok && files.length > 0 ? (
              <div className="mt-3 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm leading-5 text-danger">
                {uploadValidation.errors.join(" ")}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={isAnalyzing || !uploadValidation.ok || files.length === 0}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
              Run Agent
            </button>
          </div>

          <GuardrailLine />

          <div className="rounded-lg border border-line bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Clock3 className="h-4 w-4 text-amber" />
              Agent Trace
            </div>
            <div className="mt-4 grid gap-3">
              {(result?.trace ?? ["Waiting for files"]).map((step, index) => (
                <div key={`${step}-${index}`} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-paper text-[11px] font-semibold text-graphite">
                    {index + 1}
                  </span>
                  <span className="leading-5 text-graphite">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="grid gap-4">
          {error ? (
            <div className="rounded-lg border border-danger/20 bg-danger/10 p-4 text-sm font-medium text-danger">
              {error}
            </div>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-normal text-ink">Compliance Matrix</h2>
                <p className="mt-1 text-sm text-graphite">
                  {result
                    ? `${resultMode === "sample" ? "Sample preview" : "Agent run"} - ${result.matrix.length} obligations mapped with citations`
                    : "Awaiting analysis"}
                </p>
              </div>
              {result ? (
                <div className="flex items-center gap-4">
                  <ScoreRing score={result.score} />
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-graphite">
                      <Gauge className="h-4 w-4 text-teal" />
                      {compliantCount} compliant rows
                    </div>
                    <div className="flex items-center gap-2 text-graphite">
                      <AlertTriangle className="h-4 w-4 text-amber" />
                      {(result.risks.length || 0).toString()} open risks
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {result ? (
            <div className="overflow-hidden rounded-lg border border-line bg-white shadow-table">
              <div className="grid grid-cols-[1.4fr_120px_90px] border-b border-line bg-paper px-4 py-3 text-xs font-semibold uppercase text-graphite md:grid-cols-[1.5fr_120px_100px_1fr]">
                <span>Requirement</span>
                <span>Status</span>
                <span>Risk</span>
                <span className="hidden md:block">Evidence response</span>
              </div>
              <div className="divide-y divide-line">
                {result.matrix.map((row, index) => (
                  <button
                    type="button"
                    key={`${row.requirement}-${index}`}
                    onClick={() => setActiveRowIndex(index)}
                    className={`grid w-full grid-cols-[1.4fr_120px_90px] items-center gap-3 px-4 py-4 text-left transition md:grid-cols-[1.5fr_120px_100px_1fr] ${
                      activeRowIndex === index ? "bg-teal/5" : "bg-white hover:bg-paper"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5 text-ink">{row.requirement}</span>
                      <span className="mt-1 block text-xs font-medium text-graphite">{row.category}</span>
                    </span>
                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${statusStyles[row.status]}`}
                    >
                      <StatusIcon status={row.status} />
                      {row.status}
                    </span>
                    <span className={`text-sm font-semibold ${riskStyles[row.risk]}`}>{row.risk}</span>
                    <span className="hidden text-sm leading-5 text-graphite md:block">{row.response}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <EmptyMatrix />
          )}
        </section>

        <aside className="grid gap-4 self-start">
          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ClipboardCheck className="h-4 w-4 text-teal" />
              Executive Brief
            </div>
            <p className="mt-4 text-sm leading-6 text-graphite">{result?.executiveBrief ?? "No brief yet."}</p>
          </div>

          <EvidencePanel row={activeRow} />

          <div className="rounded-lg border border-line bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <AlertTriangle className="h-4 w-4 text-amber" />
              Risk Actions
            </div>
            <div className="mt-4 grid gap-4">
              <div>
                <h3 className="text-xs font-semibold uppercase text-graphite">Risks</h3>
                <ul className="mt-2 grid gap-2 text-sm leading-5 text-graphite">
                  {(result?.risks.length ? result.risks : ["No risk output yet."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase text-graphite">Next Actions</h3>
                <ul className="mt-2 grid gap-2 text-sm leading-5 text-graphite">
                  {(result?.nextActions.length ? result.nextActions : ["Run an analysis to populate actions."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-ink p-5 text-white">
            <div className="text-sm font-semibold">Public demo docs</div>
            <div className="mt-3 grid gap-2">
              {DEMO_DOCS.map((doc) => (
                <a
                  key={doc.name}
                  href={doc.path}
                  className="flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20"
                >
                  <span>{doc.label}</span>
                  <span className="flex items-center gap-2 text-xs text-white/70">
                    MD
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              ))}
              {DEMO_DOCS.map((doc) => (
                <a
                  key={`${doc.name}-pdf`}
                  href={doc.pdfPath}
                  className="flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20"
                >
                  <span>{doc.label}</span>
                  <span className="flex items-center gap-2 text-xs text-white/70">
                    PDF
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
