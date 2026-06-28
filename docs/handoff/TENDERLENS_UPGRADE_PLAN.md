# TenderLens AI Upgrade Implementation Plan

> For agentic workers: keep this file, `BOOKMARK.md`, `docs/handoff/DECISIONS.md`, and `docs/handoff/UI_APPROVAL_NOTES.md` updated before and after every task. Do not start product code until the user approves the UI/logo/onboarding images.

**Goal:** Upgrade TenderLens AI into a premium bilingual tender-review workspace with document analysis, grounded chat, Tender Map, Briefing Deck, Questions to Ask, and downloadable reports.

**Architecture:** Keep the current Next.js App Router/Vercel architecture. Use server routes for Gemini analysis, chat, and export generation. Keep uploaded files transient in request memory; do not add a database or persistent user file storage.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, lucide-react, Gemini Developer API via `@google/genai`, Vercel, Vitest.

---

## Current State

- The app already has a working compliance matrix flow in `components/tenderlens-app.tsx`.
- The server analysis route is `app/api/analyze/route.ts`.
- Gemini calls are centralized in `lib/gemini.ts`.
- Upload validation currently lives in `lib/security.ts`.
- Existing public demo files live in `public/demo-docs/`.
- Current model target is `gemini-2.5-flash-lite`.
- Local secrets are ignored and must never be printed or committed.

## Product Shape

TenderLens AI should feel simple enough for a non-technical user:

1. User opens the app.
2. Onboarding popup explains what the app does.
3. User either uploads files or runs analysis with preloaded example files.
4. App shows analyzed files separately from the upload area.
5. App presents the result in plain language.
6. User can ask TenderLens questions about the documents and analysis.
7. User can view the Tender Map, Briefing Deck, and Questions to Ask.
8. User can download reports.

## Mandatory Approval Gates

- Gate 1: Plan approval: complete.
- Gate 2: Create/update handoff files only: this file, `BOOKMARK.md`, `DECISIONS.md`, `UI_APPROVAL_NOTES.md`.
- Gate 3: Generate UI/logo/onboarding approval images and stop.
- Gate 4: After explicit UI approval, start coding.
- Gate 5: Test locally, push, verify Vercel, and provide final notes.

No product code should be changed before Gate 4.

## File Responsibility Map

- `BOOKMARK.md`: current status, exact next action, verification history, known blockers.
- `docs/handoff/TENDERLENS_UPGRADE_PLAN.md`: implementation plan and task list.
- `docs/handoff/DECISIONS.md`: locked product/technical decisions.
- `docs/handoff/UI_APPROVAL_NOTES.md`: UI image prompts, approval status, requested changes.
- `components/tenderlens-app.tsx`: main workbench UI after Gate 4.
- `app/how-to-use/page.tsx`: detailed user walkthrough page after Gate 4.
- `app/api/analyze/route.ts`: analysis endpoint update after Gate 4.
- `app/api/chat/route.ts`: new grounded chat endpoint after Gate 4.
- `app/api/export/route.ts`: new report export endpoint after Gate 4.
- `lib/security.ts`: file-type, size, count, name, and payload validation.
- `lib/gemini.ts`: analysis and chat Gemini calls.
- `lib/document-processing.ts`: prepare supported files for Gemini.
- `lib/derived-features.ts`: Tender Map, Briefing Deck, and Questions to Ask generation from analysis result.
- `lib/exporters.ts`: PDF, DOCX, TXT export helpers.
- `lib/i18n.ts`: English/Arabic labels and language helpers.
- `public/brand/`: approved logo PNG and onboarding graphics after approval.

## Supported Files Decision

Support:

- `.pdf`
- `.docx`
- `.txt`
- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

Do not support:

- `.md` in public UI or server validation.
- legacy `.doc`; show "Please save this as PDF or DOCX and upload again."

User-facing copy:

- "Upload up to 5 small files. We do not save them."
- Detailed size/type limits appear only when an upload fails or when a user opens a help detail.

Initial guardrail target:

- max 5 files
- max 4 MB per file
- max 12 MB total payload
- request-only processing
- no document contents in logs

If build/runtime limits require lower sizes, update `DECISIONS.md` and UI copy together.

## Feature Details

### 1. Document Intake

- Replace "Sources" with a plain upload panel.
- Add "View preloaded files" beside upload.
- Add "Analyzed files" as its own section.
- Allow adding more files after initial selection.
- Allow removing a selected file before running analysis.
- For preloaded files, show friendly names and descriptions, not internal filenames.

### 2. Analysis

Keep the existing matrix behavior but rename UI sections:

- "Overall result"
- "Checklist"
- "What needs attention"
- "Evidence"
- "Next steps"
- "What TenderLens checked"

Keep citations visible and selectable.

### 3. Ask TenderLens Chat

Add a NotebookLM-like conversation panel named "Ask TenderLens".

The user can ask:

- "Why is this requirement partial?"
- "Which documents mention the bid bond?"
- "What should I ask the vendor?"
- "Summarize the biggest risks."
- Arabic equivalents.

Chat rules:

- Use documents and analysis result as context.
- Cite evidence when possible.
- If not enough evidence exists, say so plainly.
- Answer in Arabic if user selects Arabic or writes in Arabic.
- Do not persist chat messages outside the current browser session.
- Keep history short to control token usage.

### 4. Tender Map

Generate a lightweight graph from the analysis result without a new Gemini call.

Nodes:

- files
- requirements
- status/risk
- evidence
- next actions

Edges:

- file supports requirement
- requirement has risk
- risk leads to next action

Output:

- interactive UI map
- simple SVG/image export if practical

### 5. Briefing Deck

Generate a slide-style summary from the analysis result without a new Gemini call.

Slides:

1. Overall result
2. Top compliance wins
3. Biggest risks
4. Evidence highlights
5. Next actions

Output:

- app preview
- downloadable PDF or PPTX if practical

### 6. Questions To Ask

Create a practical helper from `risks`, `nextActions`, and matrix rows.

Examples:

- "Can you provide updated bid bond validity for 120 days?"
- "Can you confirm ISO 27001 certification or accepted alternative evidence?"
- "Can you commit to the requested go-live date?"

Use simple language and group questions by risk.

### 7. Downloads

Download options:

- Analysis as PDF
- Analysis as DOCX
- Analysis as TXT
- Tender Map as SVG/image if practical
- Briefing Deck as PDF/PPTX if practical

Reports must include:

- app name
- date/time
- analyzed file names
- score
- executive summary
- checklist/matrix
- evidence snippets
- risks
- next actions
- disclaimer: "AI-generated review. Verify before making procurement decisions."

### 8. Arabic Support

- Add EN/AR switch in the header.
- Use RTL layout for Arabic.
- Translate navigation and common labels.
- Gemini chat and analysis should answer in Arabic when Arabic is selected or the user asks in Arabic.
- Keep document citations in original language unless summarizing.

### 9. How To Use Page

Route: `/how-to-use`

Sections:

- What TenderLens AI does
- When to use it
- Step 1: Upload files or use example files
- Step 2: Run analysis
- Step 3: Read the result
- Step 4: Ask questions
- Step 5: Download reports
- Example files
- Example questions
- Expected output
- Privacy and limits

### 10. Onboarding Popup

Show on first load with a skip/close button.

Slide 1:

- headline: "Understand tender documents faster"
- text: "TenderLens AI reads your tender and proposal files, finds requirements, checks evidence, and highlights risks."

Slide 2:

- headline: "Three simple steps"
- steps: upload or use example files, wait for results, ask questions, download analysis.
- link: "How to use TenderLens AI"

## Implementation Task List

### Task 0: Approval Assets

Status: current task.

- Update handoff docs.
- Generate approval images:
  - desktop dashboard
  - mobile dashboard
  - onboarding popup
  - How to Use page
  - logo/brand preview
- Stop and ask for user approval.

### Task 1: Dependencies

Only after UI approval.

Likely packages:

- `mammoth` for DOCX text extraction
- `jspdf` for PDF exports or server-side PDF generation
- `docx` for DOCX exports
- optional `pptxgenjs` for deck export

Before installing, inspect package size and Vercel compatibility.

### Task 2: Validation And Document Preparation

- Update `lib/security.ts`.
- Add `lib/document-processing.ts`.
- Update tests.
- Ensure `.md` is rejected.
- Ensure `.doc` returns friendly error.

### Task 3: Analysis Route

- Update `app/api/analyze/route.ts`.
- Update `lib/gemini.ts`.
- Keep model configurable with `GEMINI_MODEL`.
- Ensure no document text is logged.

### Task 4: Derived Features

- Add `lib/derived-features.ts`.
- Create Tender Map, Briefing Deck, and Questions to Ask from `ComplianceResult`.
- Add unit tests.

### Task 5: Chat Route

- Add `app/api/chat/route.ts`.
- Add chat prompt in `lib/gemini.ts`.
- Validate message length, history length, supported files, and cooldown.
- Add tests for missing key, unsupported files, and language behavior.

### Task 6: Export Route

- Add `app/api/export/route.ts`.
- Add `lib/exporters.ts`.
- Support PDF, DOCX, TXT.
- Add tests for headers and basic content.

### Task 7: UI Shell

- Replace current minimal layout with approved premium workbench.
- Add language switch.
- Add onboarding popup.
- Add upload/preloaded-file flow.
- Add analyzed files section.

### Task 8: Results UI

- Add result sections with user-friendly headings.
- Add tabs or segmented controls for:
  - Analysis
  - Ask TenderLens
  - Tender Map
  - Briefing Deck
  - Questions to Ask
- Add download menu.

### Task 9: How To Use Page

- Add `/how-to-use`.
- Link from onboarding and main header.
- Include example file downloads.

### Task 10: Final Verification

- Run `npm test`.
- Run `npm run build`.
- Run local responsive browser checks at 375, 768, 1440 widths.
- Test demo flow.
- Test chat flow.
- Test exports.
- Push to GitHub.
- Verify Vercel deployment.

## Testing Acceptance Criteria

- App does not show Markdown files anywhere in public UI.
- User can run analysis with preloaded example files.
- User can upload supported files and add/remove files before analysis.
- User sees analyzed files in a separate section.
- User can chat with TenderLens about analysis and documents.
- Arabic switch changes labels and direction.
- Arabic question gets Arabic answer.
- Analysis, chat, map, deck, and questions are accessible from simple tabs.
- PDF, DOCX, and TXT downloads work for analysis.
- Missing API key shows a friendly non-secret error.
- Unsupported files show friendly errors.
- No secret or document text is logged.
- UI is usable on mobile and desktop.

## Notes For Future Agents

- Do not overwrite user secrets.
- Do not commit `confidential/`, `.env.local`, `.agents/`, or `.tools/`.
- Do not push until tests/build pass unless user explicitly asks.
- If interrupted, update `BOOKMARK.md` with exact current task and next command.
- Keep user-facing language simple. Avoid "agent trace", "payload", "manifest", and internal jargon in the UI.
