import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const EXCLUDED_DIRS = new Set([".git", ".next", ".tmp", ".tools", ".agents", "confidential", "node_modules"]);

function repositoryFiles(directory = process.cwd()): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const relativePath = relative(process.cwd(), fullPath).replace(/\\/g, "/");

    if (statSync(fullPath).isDirectory()) {
      return EXCLUDED_DIRS.has(entry) ? [] : repositoryFiles(fullPath);
    }

    return [relativePath];
  });
}

describe("public repository cleanliness", () => {
  it("does not track internal handoff artifacts", () => {
    const files = repositoryFiles();

    expect(files).not.toContain("BOOKMARK.md");
    expect(files.some((file) => file.startsWith("docs/handoff/"))).toBe(false);
    expect(existsSync("BOOKMARK.md")).toBe(false);
    expect(existsSync("docs/handoff")).toBe(false);
  });

  it("does not leave public references to removed internal artifacts", () => {
    const internalArtifactPattern = /BOOKMARK\.md|docs\/handoff|TENDERLENS_UPGRADE_PLAN|UI_APPROVAL_NOTES|ANTIGRAVITY_JOBS|antigravity_jobs/i;
    const offenders = repositoryFiles()
      .filter((file) => file !== "tests/public-repo-cleanliness.test.ts")
      .filter((file) => /\.(md|ts|tsx|js|mjs|json|css|example|gitignore)$/i.test(file))
      .filter((file) => internalArtifactPattern.test(readFileSync(file, "utf8")));

    expect(offenders).toEqual([]);
  });
});
