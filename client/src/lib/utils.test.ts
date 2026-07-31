import { describe, expect, it } from "vitest";
import {
  formatNumber,
  formatWon,
  formatWonShort,
  formatRatioAsPercent,
  formatPercentValue,
  formatCurrency,
} from "./utils";

describe("utils formatters", () => {
  it("formatNumber/formatWon은 nullish를 '-'로 처리한다", () => {
    expect(formatNumber(null)).toBe("-");
    expect(formatNumber(12345)).toBe("12,345");

    expect(formatWon(undefined)).toBe("-");
    expect(formatWon(12345.6)).toBe("12,346원");
  });

  it("formatWonShort는 만/억 단위를 축약한다", () => {
    expect(formatWonShort(2_490_000)).toBe("249만원");
    expect(formatWonShort(100_000_000)).toBe("1억원");
    expect(formatWonShort(123_400_000)).toBe("1억 2,340만원");
    expect(formatWonShort(-54_000)).toBe("-5만원");
  });

  it("formatRatioAsPercent는 비율(0~1)에 100을 곱해 표기한다", () => {
    expect(formatRatioAsPercent(0.1234)).toBe("12.3%");
    expect(formatRatioAsPercent(0.1234, 2)).toBe("12.34%");
    expect(formatRatioAsPercent(0.0099, 2)).toBe("0.99%");
    expect(formatRatioAsPercent(null)).toBe("-");
  });

  it("formatPercentValue는 퍼센트 값에 100을 다시 곱하지 않는다", () => {
    // 회귀 방지: 적용 금리 3.6이 "360.00%"로 표시되던 이중 곱 사고
    expect(formatPercentValue(3.6, 2)).toBe("3.60%");
    expect(formatPercentValue(3.33, 2)).toBe("3.33%");
    expect(formatPercentValue(4.5, 1)).toBe("4.5%");
    expect(formatPercentValue(0)).toBe("0.0%");
    expect(formatPercentValue(undefined)).toBe("-");
  });

  it("두 포맷터는 같은 실수치를 같은 문자열로 만든다 (단위만 다르다)", () => {
    // 비율 0.036 == 퍼센트 3.6 — 어느 쪽 함수를 쓰든 결과가 같아야 계약이 일관된다
    expect(formatRatioAsPercent(0.036, 2)).toBe(formatPercentValue(3.6, 2));
    expect(formatRatioAsPercent(0.4, 0)).toBe(formatPercentValue(40, 0));
  });

  it("formatCurrency는 통화 규칙에 맞게 표기한다", () => {
    expect(formatCurrency(14900, "KRW")).toContain("14,900");
    expect(formatCurrency(12.34, "USD")).toContain("12.34");
    expect(formatCurrency(undefined, "KRW")).toBe("-");
  });
});
