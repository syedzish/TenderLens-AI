# TenderLens AI

TenderLens AI is a Vercel-ready compliance matrix agent for tender and RFP review. Upload up to three tender/proposal documents and the Gemini-powered agent returns a scored compliance matrix with citations, risks, next actions, and an executive brief.

## Demo Pack

Public fictional sample documents are included for judging:

- [Riyadh Smart Parking RFP](public/demo-docs/riyadh-smart-parking-rfp.md)
- [Najm Urban Mobility Proposal](public/demo-docs/najm-urban-mobility-proposal.md)
- [Technical Compliance Addendum](public/demo-docs/technical-compliance-addendum.md)

PDF copies are also available in `public/demo-docs/`.

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
   - `GEMINI_MODEL=gemini-3.5-flash`

The app uses the free Gemini Developer API flow and keeps the key server-side.

## Vercel Deployment

Import this public GitHub repo into Vercel and set:

- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-3.5-flash`

Every push to `main` redeploys the app.

## Security Guardrails

- Only `.pdf`, `.txt`, and `.md` files are accepted.
- Max 3 files per analysis.
- Max 1.5 MB per file.
- Max 3 MB total upload payload.
- Client and server validation both enforce limits.
- Filenames are sanitized before use.
- Empty, malformed, and unsupported files are rejected.
- Uploaded documents are processed transiently and not persisted.
- Document text is treated as untrusted evidence, never instructions.
- A short cooldown protects free Gemini quota.

## Scripts

- `npm run dev` - local development server.
- `npm test` - unit tests for guardrails and result normalization.
- `npm run build` - production build for Vercel.
