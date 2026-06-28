# TenderLens AI

TenderLens AI is a Vercel-ready AI document assistant for tender and RFP review. Upload tender/proposal files, or use the public example files, and the Gemini-powered agent returns a scored compliance analysis with citations, risks, next actions, chat answers, a Tender Map, a Briefing Deck, and downloadable reports.

Preloaded example files use a prepared sample result so judges can test the interface without spending Gemini quota. Uploaded files use the server-side Gemini workflow.

## Example Files

Public fictional sample documents are included for judging:

- [Riyadh Smart Parking RFP](public/demo-docs/riyadh-smart-parking-rfp.pdf)
- [Najm Urban Mobility Proposal](public/demo-docs/najm-urban-mobility-proposal.docx)
- [Technical Compliance Addendum](public/demo-docs/technical-compliance-addendum.pdf)

The in-app **How to use** page also links to these files.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local `.env.local` based on `.env.example`.
3. Run the app:
   ```bash
   npm run dev
   ```

## Gemini API Key

1. Open [Google AI Studio API keys](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Click **Create API key**.
4. Copy the key into local/Vercel environment variables only:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-2.5-flash-lite`
   - Optional: `GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-3.1-flash-lite,gemini-3.5-flash,gemini-2.5-flash`

The app uses the free Gemini Developer API flow with an AI Studio project API key and keeps the key server-side. If a model is quota-limited or temporarily unavailable, TenderLens tries configured fallback models before showing a friendly retry message.

## Vercel Deployment

Import this public GitHub repo into Vercel and set:

- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-2.5-flash-lite`
- Optional: `GEMINI_FALLBACK_MODELS`

Recommended optional fallback value:

```text
GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-3.1-flash-lite,gemini-3.5-flash,gemini-2.5-flash
```

Use this if the primary model hits a temporary quota/model error. TenderLens tries `GEMINI_MODEL` first, then each fallback model in order, and only shows the user a retry message if every configured model fails. Add it in **Vercel Project Settings -> Environment Variables**, select Production and Preview, then redeploy.

Every push to `main` redeploys the app.

## Security Guardrails

- Accepted files: `.pdf`, `.docx`, `.txt`, `.jpg`, `.jpeg`, `.png`, `.webp`.
- Legacy `.doc` files are rejected with a friendly request to save as PDF or DOCX.
- Max 5 files per analysis.
- Max 4 MB per file.
- Max 12 MB total upload payload.
- Client and server validation both enforce limits.
- Filenames are sanitized before use.
- Empty, malformed, and unsupported files are rejected.
- Uploaded documents are processed transiently and not persisted.
- Document text is treated as untrusted evidence, never instructions.
- A short cooldown protects free Gemini quota.

## Scripts

- `npm run dev` - local development server.
- `npm test` - unit tests for guardrails, chat validation, exports, derived features, and result normalization.
- `npm run build` - production build for Vercel.
