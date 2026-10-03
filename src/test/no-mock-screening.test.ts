import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// Guard: the live app must never ship fake sanctions data.
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("screening provider", () => {
  it("contains no mock sanctions database or mock fallback", () => {
    const offenders = walk("src")
      .filter((p) => /\.(ts|tsx)$/.test(p) && !p.includes("/test/") && !p.endsWith(".test.ts"))
      .filter((p) => /MOCK_DATABASE|MockProvider|VITE_SCREENING_PROVIDER/.test(readFileSync(p, "utf8")));
    expect(offenders).toEqual([]);
  });
});
