import { describe, expect, it } from "vitest";
import { formatPercentValue, formatRatioAsPercent } from "./utils";
import {
  DEFAULT_DSR_INPUT,
  DEFAULT_JEONSE_LOAN_INPUT,
  DEFAULT_LTV_DTI_INPUT,
  DEFAULT_MORTGAGE_COMPARE_INPUT,
  DEFAULT_PREPAYMENT_FEE_INPUT,
  DEFAULT_STEPPING_STONE_INPUT,
} from "./validators";
import { calcSteppingStoneLoan } from "@/utils/steppingStoneLoanCalc";
import { calcLtvDti } from "@/utils/ltvDtiCalc";
import { calcDsrLimit, compareMortgageRates } from "@/utils/calculator";
import { calcJeonseLoan, calcPrepaymentFee } from "@/utils/loanExtraCalculator";
import { JEONSE_LOAN_PRODUCTS } from "@/data/jeonseLoan";

// 금리·비율을 화면에 찍는 지점마다 "이 값이 비율인가 퍼센트인가"를 못 박는다.
// 2026-07: 퍼센트 값을 비율용 포맷터에 넘겨 100배가 더 곱해졌고
// /stepping-stone-loan 상단이 "적용 금리 360.00%"로 나갔다. 그 재발을 막는 테스트다.

describe("금리 표시 단위 계약", () => {
  it("적용 금리(퍼센트 단위)는 100배 되지 않는다 — 360.00% 회귀 방지", () => {
    const result = calcSteppingStoneLoan(DEFAULT_STEPPING_STONE_INPUT);

    // 계산기 내부는 rate/100으로 쓰므로 이 값은 퍼센트 단위다
    expect(result.applicableRate).toBeGreaterThan(1);
    expect(result.applicableRate).toBeLessThan(10);

    const shown = formatPercentValue(result.applicableRate, 2);
    expect(shown).toBe("3.60%");
    expect(shown).not.toBe("360.00%");
  });

  it("LTV·DTI·DSR 한도(비율 단위)는 100배 해서 보여준다", () => {
    const result = calcLtvDti(DEFAULT_LTV_DTI_INPUT);

    for (const ratio of [result.ltvRate, result.dtiRate, result.dsrRate]) {
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThanOrEqual(1);
    }

    expect(formatRatioAsPercent(result.ltvRate, 0)).toBe("40%");
    expect(formatRatioAsPercent(result.dtiRate, 0)).toBe("40%");
    expect(formatRatioAsPercent(result.dsrRate, 0)).toBe("40%");
    // 4000%가 나오면 비율에 100을 곱한 뒤 포맷터가 또 곱한 것이다
    expect(formatRatioAsPercent(result.ltvRate, 0)).not.toBe("4000%");
  });

  it("입력 금리(퍼센트 단위)는 그대로 표시된다", () => {
    expect(formatPercentValue(DEFAULT_LTV_DTI_INPUT.loanRate, 1)).toBe("4.5%");
    expect(formatPercentValue(DEFAULT_JEONSE_LOAN_INPUT.annualRate, 1)).toBe("3.5%");
  });

  it("전세대출 상품 금리(퍼센트 단위)는 그대로 표시된다", () => {
    const result = calcJeonseLoan(DEFAULT_JEONSE_LOAN_INPUT);
    expect(formatPercentValue(result.annualRate, 1)).toBe("3.5%");

    for (const product of JEONSE_LOAN_PRODUCTS) {
      expect(product.minRate).toBeGreaterThan(1);
      expect(product.minRate).toBeLessThan(10);
      expect(formatPercentValue(product.minRate, 1)).toBe(`${product.minRate.toFixed(1)}%`);
    }
  });

  it("은행 비교 금리(퍼센트 단위)는 그대로 표시된다", () => {
    const { banks } = compareMortgageRates(DEFAULT_MORTGAGE_COMPARE_INPUT);
    expect(banks.length).toBeGreaterThan(0);
    for (const row of banks) {
      expect(row.bestRate).toBeGreaterThan(1);
      expect(row.bestRate).toBeLessThan(10);
      // 325.00% 같은 값이 나오면 이중 곱이다
      expect(Number(formatPercentValue(row.bestRate, 2).replace("%", ""))).toBeLessThan(10);
    }
  });

  it("DSR 사용률·중도상환 실효 부담률(비율 단위)은 100배 해서 보여준다", () => {
    const dsr = calcDsrLimit(DEFAULT_DSR_INPUT);
    expect(dsr.currentDsr).toBeGreaterThan(0);
    expect(dsr.currentDsr).toBeLessThan(1);
    expect(formatRatioAsPercent(dsr.currentDsr, 1)).toBe("11.7%");

    const prepay = calcPrepaymentFee(DEFAULT_PREPAYMENT_FEE_INPUT);
    expect(prepay.effectiveRate).toBeGreaterThan(0);
    expect(prepay.effectiveRate).toBeLessThan(1);
    expect(formatRatioAsPercent(prepay.effectiveRate, 2)).toBe("0.51%");
  });
});
