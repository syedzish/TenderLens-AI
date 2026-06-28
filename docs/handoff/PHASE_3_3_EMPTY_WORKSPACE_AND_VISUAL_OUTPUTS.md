# TenderLens AI Phase 3.3 Handoff Plan

## Goal

Implement the approved repair plan for first-load empty workspace behavior, Gemini fallback/error handling, premium on-page Tender Map, PPTX Briefing Deck export, clearer demo messaging, and responsive UI polish.

## Product Decisions

- On first visit, keep the app workspace visible, but show empty/instructional states. Do not render the prepared demo analysis as if it already ran.
- Preloaded example files use the local verified demo result to save Gemini free-tier quota. The UI must say this clearly so users understand it is a sample run.
- Uploaded files use the server-side Gemini workflow with the AI Studio project API key stored in Vercel as `GEMINI_API_KEY`.
- Model fallbacks are configured through `GEMINI_FALLBACK_MODELS`; the primary model remains `GEMINI_MODEL`.
- Tender Map and Briefing Deck must be visible in the app, not only downloadable.
- Briefing Deck download should be PPTX. Analysis report downloads remain PDF, DOCX, and TXT.
- UI direction: premium procurement command center, warmer surfaces, darker anchor panels, teal/cobalt/amber semantic accents, no horizontal overflow.

## Implementation Tasks

1. **State and empty workspace**
   - Update `components/tenderlens-app.tsx` so the displayed analysis result is nullable until `hasAnalyzed` is true.
   - Add localized empty-state copy for overall result, checklist, evidence, map, deck, questions, chat, and downloads.
   - Keep tabs visible; show empty panels when no result exists.
   - Disable export/chat actions until analysis exists.

2. **Reset and file-row UX**
   - Add a localized `Start fresh` action after files or results exist.
   - Reset `files`, `result`, `hasAnalyzed`, `error`, `chatMessages`, `activeTab`, and `activeRowIndex`.
   - Fix analyzed-file rows with responsive wrapping and non-shrinking status badges.

3. **Gemini fallback and errors**
   - Add a helper under `lib/` for model candidate parsing and retryable error classification.
   - Update `/api/analyze` and `/api/chat` to try the primary model then fallback models for quota/rate/transient/model-unavailable errors.
   - Return friendly localized errors for quota, temporary service problems, and unavailable model settings.
   - Do not retry malformed uploads or invalid content.

4. **Tender Map**
   - Replace the current grouped-card map with an SVG graph component rendered on page.
   - Use the same SVG markup for export to avoid mismatched page/download visuals.
   - Show files, requirements, evidence, risks, and actions with labeled curved edges and risk/status color.

5. **Briefing Deck**
   - Keep on-page slide cards and upgrade visual styling.
   - Add PPTX export using `pptxgenjs`.
   - Extend export code or add a dedicated route so the deck download returns `application/vnd.openxmlformats-officedocument.presentationml.presentation`.

6. **How to Use**
   - Add **Example Analysis Result** as a screenshot-style preview/card based on the demo analysis.
   - Add copy explaining preloaded examples use a prepared result to avoid spending quota.

7. **Verification**
   - Update/add tests for empty initial state helpers, fallback model order/classification, PPTX export, and text report compatibility.
   - Run `npm test`, `npm run build`, and `npm audit`.
   - Capture Playwright screenshots for desktop first-load, preloaded results, map tab, deck tab, Arabic, and mobile label layout.
   - Confirm no secrets are committed, commit, push `origin/main`, and check Vercel status.

## Current Status

- Started: 2026-06-28.
- Worktree was clean before changes.
- Local implementation completed:
  - first-load workspace shows empty instructional panels instead of default demo analysis
  - preloaded example result is clearly labeled as a prepared sample
  - Gemini analyze/chat routes use fallback model handling and friendlier quota/model messages
  - Tender Map renders as an on-page SVG graph and exports the same SVG
  - Briefing Deck renders on-page and exports PPTX through `pptxgenjs`
  - Start fresh clears selected files, result, chat, errors, and active state
  - How to Use includes an Example Analysis Result preview
  - Arabic prepared demo citation text is localized
- Verification completed:
  - `npm test` passed: 9 files / 26 tests
  - `npm run build` passed
  - `npm audit --json` reported 0 vulnerabilities
  - Playwright visual script passed and saved screenshots in `.tmp/screenshots`
  - repo secret scan found no API-key-like tokens outside ignored local folders
- Pushed implementation commit `5ed8cf6` to `origin/main`.
- Remaining: verify Vercel deployment.
