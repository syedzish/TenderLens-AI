# TenderLens AI Build Bookmark

## Status

- [x] Phase 1: Create and push minimal public GitHub repo.
- [x] Hard pause: User connected `syedzish/TenderLens-AI` to Vercel.
- [x] Phase 2.1: Scaffold Next.js app for Vercel.
- [x] Phase 2.2: Add upload/security guardrails with tests.
- [x] Phase 2.3: Add public fictional demo docs and PDFs.
- [x] Phase 2.4: Build Gemini compliance matrix API route.
- [x] Phase 2.5: Build premium TenderLens AI workbench UI.
- [x] Phase 2.6: Configure local secret without committing it.
- [x] Phase 2.7: Verify tests, build, guardrails, API route, and secret hygiene.
- [x] Phase 2.8: Publish final app to GitHub for Vercel redeploy.
- [x] Phase 3.0: Create upgrade handoff files before UI approval images.
- [x] Phase 3.1: Generate UI/logo/onboarding approval images and stop for user approval.
- [x] Phase 3.2: Implement approved TenderLens AI upgrade.
  - [x] Add tests for new guardrails, derived features, chat validation, exports, and document processing.
  - [x] Add document processing, Gemini chat support, export helpers, and API routes.
  - [x] Add approved logo asset to `public/brand/tenderlens-logo.png`.
  - [x] Finish premium app UI, How to Use page, README cleanup, build fixes, and browser verification.
  - [x] Commit, push, and verify Vercel redeploy.

## Notes

- Keep `confidential/`, `.env.local`, `.agents/`, `.tools/`, and build artifacts out of Git.
- Use `GEMINI_MODEL=gemini-2.5-flash-lite`.
- Uploaded documents are transient and must not be persisted or logged.
- Current gate: user approved UI/logo/onboarding assets; coding is allowed.
- Current task: complete. Next task, if needed, is manual judging QA with the deployed URL and Gemini quota.
- Active implementation order: tests first, document intake, Gemini chat/export APIs, derived features, premium UI, verification.
- Latest task: verified analysis accuracy and security hygiene; added risk calibration and server-side upload signature checks.

## Verification Log

- `npm test` passed: 3 files, 7 tests.
- `npm run build` passed with Next.js production output.
- Server route tests cover missing-key and unsupported-file rejection states.
- Secret scan found no Gemini/API-key-like tokens in commit-bound files.
- Local browser/dev-server verification could not run because this session's approval usage limit blocked starting the dev server.
- Phase 3.0 handoff docs created:
  - `docs/handoff/TENDERLENS_UPGRADE_PLAN.md`
  - `docs/handoff/DECISIONS.md`
  - `docs/handoff/UI_APPROVAL_NOTES.md`
- Phase 3.1 approval concepts generated in Codex chat:
  - desktop dashboard
  - mobile dashboard
  - onboarding popup
  - How to Use page
  - logo/brand preview
- Phase 3.2 red/green progress:
  - `npm test` failed first for missing derived/chat/export modules.
  - Implemented derived feature, chat, export, document processing, and route helpers.
  - `npm test` passed: 7 files, 16 tests.
  - `npm run build` initially failed on a TypeScript `Response` body type in `app/api/export/route.ts`; fix in progress.
  - Fixed export response body typing and wired `language` into analysis requests.
  - Added `/how-to-use`, premium logo asset, DOCX example files, chat/export APIs, and final UI copy cleanup.
  - Removed public Markdown demo files and removed Markdown from supported upload types.
  - Added `.tmp/` to `.gitignore` for local verification artifacts.
  - `npm test` passed: 7 files, 16 tests.
  - `npm run build` passed with routes: `/`, `/how-to-use`, `/api/analyze`, `/api/chat`, `/api/export`.
  - Production browser smoke passed on desktop and mobile:
    - onboarding skip
    - preloaded files modal open/close
    - Analysis, Ask TenderLens, Tender Map, Briefing Deck, Questions to Ask tabs
    - preview-mode notice
  - Public-file secret scan found no pasted API key or Google API-key-like token in commit-bound files.
  - Committed upgrade as `4103a90` and pushed to `origin/main`.
  - GitHub commit status reported Vercel success: "Deployment has completed."
  - Deployed URLs returned HTTP 200:
    - `https://tender-lens-ai-nine.vercel.app`
    - `https://tender-lens-ai-nine.vercel.app/how-to-use`
- 2026-06-28 accuracy/security verification:
  - Extracted bundled example DOCX text and verified expected truth set:
    - bid security validity is partial
    - bilingual support is compliant
    - uptime/support/data residency/API/sustainability are compliant
    - ISO certification/security evidence is partial
    - go-live date is late and high risk
    - training seats are partial unless remote extra seats are accepted
  - Deployed `/api/analyze` returned HTTP 200 with a 10-row cited matrix using `gemini-2.5-flash-lite`.
  - Found one accuracy issue: late go-live was returned as `Partial / Low`; added deterministic risk calibration so missed delivery deadlines become `High` and partial low-risk mandatory gaps become at least `Medium`.
  - Added upload content signature validation for PDF, DOCX, TXT, JPG/JPEG, PNG, and WEBP before Gemini processing.
  - Added npm `overrides` for patched `postcss@8.5.15`; `npm audit --json` reports 0 vulnerabilities.
  - `npm test` passed: 7 files, 18 tests.
  - `npm run build` passed.
  - Production browser smoke passed on desktop and mobile after security changes.
  - Pushed commit `3a51e6c`; Vercel reported deployment success.
  - Deployed home and guide URLs returned HTTP 200.
  - Final deployed `/api/analyze` retry returned HTTP 200 and calibrated the late go-live row as `Partial / High`.
