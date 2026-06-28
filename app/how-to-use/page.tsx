import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  Gauge,
  MessageCircle,
  Presentation,
  SearchCheck,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getDemoAnalysis } from "@/lib/demo-analysis";

const exampleAnalysis = getDemoAnalysis("en");

const exampleFiles = [
  {
    title: "Riyadh Smart Parking RFP",
    description: "The tender document TenderLens uses to find requirements.",
    href: "/demo-docs/riyadh-smart-parking-rfp.pdf",
    format: "PDF",
  },
  {
    title: "Najm Urban Mobility Proposal",
    description: "A fictional vendor response used to check compliance.",
    href: "/demo-docs/najm-urban-mobility-proposal.docx",
    format: "DOCX",
  },
  {
    title: "Technical Compliance Addendum",
    description: "Extra technical evidence for bilingual support, hosting, and uptime.",
    href: "/demo-docs/technical-compliance-addendum.pdf",
    format: "PDF",
  },
];

const steps = [
  {
    title: "Upload files or use example files",
    body: "Add tender, proposal, text, or image files. If you only want to test the app, use the preloaded fictional files.",
    icon: UploadCloud,
  },
  {
    title: "Run the analysis",
    body: "TenderLens reads the documents, finds requirements, checks evidence, and builds a simple compliance checklist.",
    icon: SearchCheck,
  },
  {
    title: "Ask questions",
    body: "Use Ask TenderLens to ask about risks, missing items, evidence, next steps, or Arabic summaries.",
    icon: MessageCircle,
  },
  {
    title: "Download the result",
    body: "Save the analysis as PDF, Word DOCX, or text for your submission review or team discussion.",
    icon: Download,
  },
];

const expectedResults = [
  "Overall result with a score out of 100.",
  "Checklist showing each requirement, status, risk, and response.",
  "Evidence quotes so users can see why TenderLens made a decision.",
  "Questions to Ask for vendor or client clarifications.",
  "Tender Map and Briefing Deck views created from the same analysis.",
];

const exampleQuestions = [
  "What are the biggest risks before submission?",
  "Which requirements are only partially met?",
  "What should I ask the vendor next?",
  "Summarize the findings in Arabic.",
];

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-graphite hover:text-teal">
            <ArrowLeft className="h-4 w-4" />
            Back to TenderLens AI
          </Link>
          <div className="flex items-center gap-3">
            <Image src="/brand/tenderlens-logo.png" alt="TenderLens AI logo" width={44} height={44} className="rounded-xl" />
            <div>
              <div className="font-semibold">TenderLens AI</div>
              <div className="text-sm text-graphite">Simple guide for tender review</div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="rounded-[28px] bg-ink p-7 text-white shadow-soft sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white/80">
            <BookOpen className="h-4 w-4 text-amber" />
            How to use TenderLens AI
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Review tender documents without getting lost in the details.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
            TenderLens AI helps you compare tender requirements against proposal evidence. It highlights what is compliant, what needs attention, and what to ask next.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal px-5 font-semibold text-white">
              Open the app
            </Link>
            <a
              href="/demo-docs/riyadh-smart-parking-rfp.pdf"
              download
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-5 font-semibold text-white"
            >
              Download example files
            </a>
          </div>
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-table">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal/10 text-teal">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">What problem does it solve?</h2>
                <p className="mt-2 text-sm leading-6 text-graphite">
                  Tender documents are long, detailed, and easy to misread. TenderLens turns them into a checklist with evidence so users can review faster and with more confidence.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-table">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-cobalt/10 text-cobalt">
                <Presentation className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">What do you get?</h2>
                <p className="mt-2 text-sm leading-6 text-graphite">
                  A scored analysis, cited checklist, Tender Map, Briefing Deck, clarification questions, chat answers, and downloadable reports.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="rounded-2xl border border-line bg-white p-5 shadow-table">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper font-semibold text-teal">{index + 1}</span>
                  <Icon className="h-5 w-5 text-teal" />
                </div>
                <h2 className="mt-5 text-lg font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-graphite">{step.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">
                <Gauge className="h-4 w-4" />
                Example Analysis Result
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">What the output looks like after analysis</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-graphite">
                This preview uses the public fictional example files. Real uploaded files generate their own Gemini analysis.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-paper p-4 text-center">
              <div className="text-4xl font-semibold text-ink">{exampleAnalysis.score}</div>
              <div className="text-xs font-semibold uppercase text-graphite">/100 score</div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="border-b border-line bg-paper px-4 py-3 font-semibold">Checklist preview</div>
              <div className="divide-y divide-line">
                {exampleAnalysis.matrix.slice(0, 4).map((row) => (
                  <div key={row.requirement} className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_110px_90px]">
                    <div>
                      <div className="font-semibold leading-6">{row.requirement}</div>
                      <div className="mt-1 text-sm text-graphite">{row.response}</div>
                    </div>
                    <span className="inline-flex h-fit w-fit items-center gap-1.5 rounded-lg border border-teal/20 bg-teal/10 px-2.5 py-1.5 text-xs font-semibold text-teal">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {row.status}
                    </span>
                    <span className="inline-flex h-fit w-fit items-center gap-1.5 rounded-lg border border-amber/25 bg-amber/10 px-2.5 py-1.5 text-xs font-semibold text-amber">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {row.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <aside className="grid gap-4">
              <div className="rounded-2xl border border-line bg-paper p-5">
                <h3 className="font-semibold">Executive brief</h3>
                <p className="mt-3 text-sm leading-6 text-graphite">{exampleAnalysis.executiveBrief}</p>
              </div>
              <div className="rounded-2xl border border-line bg-ink p-5 text-white">
                <h3 className="font-semibold">What needs attention</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/75">
                  {exampleAnalysis.risks.slice(0, 3).map((risk) => (
                    <li key={risk}>- {risk}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-table">
          <h2 className="text-2xl font-semibold">Example files</h2>
          <p className="mt-2 text-sm leading-6 text-graphite">
            These fictional files are public so you can test TenderLens AI immediately. The in-app preloaded run uses a prepared sample result so you can test the interface without spending Gemini quota.
          </p>
          <div className="mt-5 grid gap-3">
            {exampleFiles.map((file) => (
              <a
                key={file.href}
                href={file.href}
                download
                className="flex items-center gap-3 rounded-xl border border-line bg-paper p-3 transition hover:border-teal hover:bg-white"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-cobalt">
                  {file.format === "DOCX" ? <FileArchive className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{file.title}</div>
                  <div className="text-sm text-graphite">{file.description}</div>
                </div>
                <span className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">{file.format}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <section className="rounded-2xl border border-line bg-white p-6 shadow-table">
            <h2 className="text-2xl font-semibold">Expected results</h2>
            <div className="mt-5 grid gap-2">
              {expectedResults.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-paper p-3 text-sm leading-6 text-graphite">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal" />
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-white p-6 shadow-table">
            <h2 className="text-2xl font-semibold">Example questions</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {exampleQuestions.map((question) => (
                <span key={question} className="rounded-full border border-line bg-paper px-3 py-2 text-sm font-semibold text-graphite">
                  {question}
                </span>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
