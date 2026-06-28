# Phase 3.4 Tender Map And Deck Polish

## Goal

Polish the working TenderLens AI app without changing the core analysis workflow. Focus on the visible Tender Map overflow, the Briefing Deck display/export experience, optional Gemini fallback deployment guidance, and Antigravity handoff verification.

## Requested Changes

- Fix Tender Map first-column text overflow and marker overlap for long real filenames.
- Keep Tender Map SVG download, but make the on-page map and exported SVG cleaner.
- Replace Briefing Deck text cards with a premium slide carousel that resembles an actual presentation.
- Keep PPTX download and improve the generated PPTX visual style without using Gemini.
- Explain optional Vercel env var `GEMINI_FALLBACK_MODELS`.
- Review `antigravity_jobs` and verify whether its claimed work is present.

## Implementation Notes

- Main UI file: `components/tenderlens-app.tsx`.
- Export styling file: `lib/exporters.ts`.
- Deployment docs: `README.md`.
- Tracking file: `BOOKMARK.md`.
- The deck carousel must use the already-derived `buildBriefingDeck(...)` output and must not make another AI request.
- The PPTX exporter should remain based on `pptxgenjs`; do not add a separate Gemini styling call.
- Preserve transient upload behavior and secret hygiene.

## Antigravity Verification

- Root file inspected: `antigravity_jobs`.
- Claimed dashboard illustration exists at `public/brand/analysis-illustration.png` and is used on the empty start panel.
- Claimed onboarding redesign exists in `components/tenderlens-app.tsx`.
- Claimed premium icon color work exists in the tab and file-card icon styling.
- Claimed quota transparency copy exists in English and Arabic start/onboarding text.
- Issue found: onboarding slide 2 had a hardcoded English sentence. Fix by moving that copy into the language labels and rendering `text.onboardingTwoBody`.
- Repo cleanliness decision: move the note into this handoff area as `docs/handoff/ANTIGRAVITY_JOBS.md`, then remove the root `antigravity_jobs` file.

## Acceptance Checks

- `npm test` passed: 9 files / 26 tests.
- `npm run build` passed.
- Playwright screenshots passed and were written to `.tmp/screenshots/phase34`.
- Secret scan found no API-key-like tokens outside ignored local folders.
- `npm audit --json` reported 0 vulnerabilities.
- Git status must be checked again after commit/push.
