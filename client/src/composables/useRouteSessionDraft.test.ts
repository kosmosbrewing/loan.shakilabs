import { describe, expect, it } from "vitest";
import { parseRouteSessionDraft } from "./useRouteSessionDraft";

describe("route session draft", () => {
  const now = new Date("2026-07-11T06:00:00Z").getTime();

  it("accepts a same-route draft within eight hours", () => {
    const raw = JSON.stringify({ path: "/dsr?i=50000000&t=360", savedAt: now - 60_000 });
    expect(parseRouteSessionDraft(raw, "/dsr", now)?.path).toBe("/dsr?i=50000000&t=360");
  });

  it("rejects expired, malformed, and cross-route drafts", () => {
    expect(parseRouteSessionDraft("not-json", "/dsr", now)).toBeNull();
    expect(parseRouteSessionDraft(JSON.stringify({ path: "/repayment?x=1", savedAt: now }), "/dsr", now)).toBeNull();
    expect(parseRouteSessionDraft(JSON.stringify({ path: "/dsr?i=1", savedAt: now - 9 * 60 * 60 * 1000 }), "/dsr", now)).toBeNull();
  });
});
