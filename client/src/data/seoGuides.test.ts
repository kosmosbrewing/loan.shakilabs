import { describe, expect, it } from "vitest";
import { LOAN_ABOUT_GUIDE } from "@/data/seoGuides";
import { LOAN_DATA_VERIFIED } from "@/data/loanPresets";
import { MORTGAGE_DATA_UPDATED } from "@/data/mortgageRates";

// /about은 예전에 "매월 금리 변동 시 즉시 반영합니다"라고 적었다. mortgageRates.ts는
// 2026-03 이후 커밋이 0건이고 저장소에 schedule 워크플로도 없으니 근거 없는 약속이었다.
// 여기서 막는 것은 두 가지다 — ① 주기를 약속하는 말이 다시 들어오는 것,
// ② 확인일이 상수에서 떨어져 나와 산문에 손으로 박히는 것.
describe("LOAN_ABOUT_GUIDE 데이터 출처 문단", () => {
  const dataSection = LOAN_ABOUT_GUIDE.sections?.find((section) =>
    section.h2.includes("데이터 출처"),
  );

  it("데이터 출처 문단이 존재한다", () => {
    expect(dataSection).toBeDefined();
  });

  it("계산식 기준일과 금리표 확인일을 둘 다 상수에서 읽어 적는다", () => {
    expect(dataSection!.body).toContain(LOAN_DATA_VERIFIED);
    expect(dataSection!.body).toContain(MORTGAGE_DATA_UPDATED);
  });

  // 계산식 기준일과 금리 데이터 확인일은 다른 것이다. 하나로 묶으면 둘 중 하나가 거짓이 된다.
  it("두 날짜를 서로 다른 값으로 유지한다", () => {
    expect(LOAN_DATA_VERIFIED).not.toBe(MORTGAGE_DATA_UPDATED);
    expect(LOAN_DATA_VERIFIED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(MORTGAGE_DATA_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // 근거 없는 주기 약속 금지. 앱 전체 가이드 본문·FAQ까지 훑는다.
  it("갱신 주기를 약속하는 문구가 앱 어디에도 없다", async () => {
    const guides = await import("@/data/seoGuides");
    const banned = [
      "매월 금리 변동 시 즉시 반영",
      "매일 갱신",
      "실시간으로 갱신",
      "실시간 반영합니다",
      "주기적으로 갱신",
      "정기적으로 갱신",
      "매주 갱신",
      "상시 갱신",
    ];

    const corpus = Object.values(guides)
      .filter((value) => typeof value === "object" && value !== null)
      .map((guide) => JSON.stringify(guide))
      .join("\n");

    for (const phrase of banned) {
      expect(corpus, `금지 문구가 남아 있다: ${phrase}`).not.toContain(phrase);
    }
  });
});
