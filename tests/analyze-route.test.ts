import { afterEach, describe, expect, it } from "vitest";

import { POST } from "../app/api/analyze/route";

const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalGoogleKey = process.env.GOOGLE_API_KEY;

afterEach(() => {
  process.env.GEMINI_API_KEY = originalGeminiKey;
  process.env.GOOGLE_API_KEY = originalGoogleKey;
});

function requestWithFiles(files: File[], ip: string) {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));

  return new Request("http://localhost/api/analyze", {
    method: "POST",
    body,
    headers: {
      "x-real-ip": ip,
    },
  });
}

describe("analyze route guardrails", () => {
  it("returns a missing-key state without exposing secrets", async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const response = await POST(
      requestWithFiles([new File(["hello"], "rfp.md", { type: "text/markdown" })], "missing-key-test"),
    );
    const payload: { error?: string } = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toBe("Gemini API key is not configured for this environment.");
  });

  it("rejects unsupported files before calling Gemini", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    const response = await POST(
      requestWithFiles([new File(["rows"], "pricing.xlsx", { type: "application/vnd.ms-excel" })], "reject-test"),
    );
    const payload: { error?: string } = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("pricing.xlsx is not a supported file type.");
  });
});
