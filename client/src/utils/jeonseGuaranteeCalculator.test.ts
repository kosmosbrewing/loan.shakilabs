import { describe, expect, it } from "vitest";
import { calcJeonseGuaranteeFee } from "./jeonseGuaranteeCalculator";

const base = {
  deposit: 300_000_000,
  months: 24,
  housingType: "apartment" as const,
  debtTier: "le70" as const,
  discountRate: 0,
  isMetropolitan: true,
};

describe("calcJeonseGuaranteeFee", () => {
  it("아파트·부채비율 70% 이하·2년은 연 0.102%를 적용한다", () => {
    const result = calcJeonseGuaranteeFee(base);
    expect(result.annualRate).toBe(0.102);
    expect(result.periodLabel).toBe("1년 초과~2년");
    // 3억 × 0.102% × 2년 = 612,000원
    expect(result.totalFee).toBe(612_000);
    expect(result.monthlyEquivalent).toBe(25_500);
  });

  it("보증기간 경계 — 12개월은 1년 이내, 13개월부터 다음 구간", () => {
    expect(calcJeonseGuaranteeFee({ ...base, months: 12 }).annualRate).toBe(0.097);
    expect(calcJeonseGuaranteeFee({ ...base, months: 13 }).annualRate).toBe(0.102);
    expect(calcJeonseGuaranteeFee({ ...base, months: 61 }).annualRate).toBe(0.113);
  });

  it("주택유형·부채비율 구간별 요율 — 비아파트 80% 초과 2년은 0.184%", () => {
    const result = calcJeonseGuaranteeFee({
      ...base,
      housingType: "other",
      debtTier: "gt80",
    });
    expect(result.annualRate).toBe(0.184);
    // 3억 × 0.184% × 2년 = 1,104,000원
    expect(result.totalFee).toBe(1_104_000);
  });

  it("최고 요율 0.211% — 비아파트·80% 초과·5년 초과", () => {
    const result = calcJeonseGuaranteeFee({
      ...base,
      housingType: "other",
      debtTier: "gt80",
      months: 72,
    });
    expect(result.annualRate).toBe(0.211);
  });

  it("할인율을 적용한다 (사회배려계층 60%)", () => {
    const result = calcJeonseGuaranteeFee({ ...base, discountRate: 0.6 });
    expect(result.discountAmount).toBe(367_200);
    expect(result.discountedFee).toBe(244_800);
  });

  it("한도 초과를 판정한다 — 수도권 7억·그 외 5억", () => {
    expect(calcJeonseGuaranteeFee({ ...base, deposit: 700_000_000 }).isOverLimit).toBe(false);
    expect(calcJeonseGuaranteeFee({ ...base, deposit: 700_000_001 }).isOverLimit).toBe(true);
    expect(
      calcJeonseGuaranteeFee({ ...base, deposit: 500_000_001, isMetropolitan: false }).isOverLimit,
    ).toBe(true);
  });
});
