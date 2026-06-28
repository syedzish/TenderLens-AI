import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("TenderLens UI loading controls", () => {
  it("disables the empty-state run buttons while analysis is already running", () => {
    const source = readFileSync(join(process.cwd(), "components", "tenderlens-app.tsx"), "utf8");
    const start = source.indexOf("title={text.emptyOverallTitle}");
    const end = source.indexOf("<nav className=", start);
    const emptyOverallBlock = source.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(emptyOverallBlock.match(/disabled={isAnalyzing}/g)).toHaveLength(2);
  });
});
