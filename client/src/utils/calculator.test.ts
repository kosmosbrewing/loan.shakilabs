import { describe, expect, it } from "vitest";
import {
  calcAnnuityPlan,
  calcDsrLimit,
  calcEqualPrincipalPlan,
  calcMonthlyPayment,
  calcRefinance,
  compareRepaymentPlans,
  invertLoanPrincipal,
} from "@/utils/calculator";
import {
  DEFAULT_DSR_INPUT,
  DEFAULT_PREPAYMENT_FEE_INPUT,
  DEFAULT_REFINANCE_INPUT,
  DEFAULT_REPAYMENT_INPUT,
  DEFAULT_STUDENT_LOAN_INPUT,
  sanitizeDsrInput,
  sanitizePrepaymentFeeInput,
  sanitizeRefinanceInput,
  sanitizeRepaymentInput,
  sanitizeStudentLoanInput,
} from "@/lib/validators";
import {
  calcPrepaymentFee,
  calcStudentLoanRepayment,
} from "@/utils/loanExtraCalculator";

describe("calcMonthlyPayment", () => {
  it("금리가 0%면 원금을 개월 수로 나눈다", () => {
    expect(calcMonthlyPayment(12_000_000, 0, 12)).toBe(1_000_000);
  });

  it("원리금균등 월 납입액을 계산한다", () => {
    expect(calcMonthlyPayment(100_000_000, 4.5, 360)).toBe(506_685);
  });
});

describe("상환 플랜", () => {
  it("원금균등이 원리금균등보다 총이자가 적다", () => {
    const annuity = calcAnnuityPlan(300_000_000, 4.2, 360);
    const equalPrincipal = calcEqualPrincipalPlan(300_000_000, 4.2, 360);

    expect(equalPrincipal.totalInterest).toBeLessThan(annuity.totalInterest);
    expect(equalPrincipal.firstPayment).toBeGreaterThan(annuity.monthlyPayment);
    expect(equalPrincipal.lastPayment).toBeLessThan(annuity.monthlyPayment);
  });

  it("월 납입 가능액에서 역산한 원금은 다시 같은 월 납입액을 만든다", () => {
    const principal = invertLoanPrincipal(1_300_000, 4.3, 360);
    expect(calcMonthlyPayment(principal, 4.3, 360)).toBeCloseTo(1_300_000, -2);
  });
});

describe("calcRefinance", () => {
  it("금리가 낮아지면 월 납입액과 총이자가 줄어든다", () => {
    const result = calcRefinance(DEFAULT_REFINANCE_INPUT);

    expect(result.newPlan.monthlyPayment).toBeLessThan(result.currentPlan.monthlyPayment);
    expect(result.newPlan.totalInterest).toBeLessThan(result.currentPlan.totalInterest);
    expect(result.isSwitchWorthIt).toBe(true);
  });

  it("비용이 과도하면 갈아타기가 불리할 수 있다", () => {
    const result = calcRefinance({
      ...DEFAULT_REFINANCE_INPUT,
      refinanceFee: 50_000_000,
    });

    expect(result.netSavings).toBeLessThan(0);
    expect(result.isSwitchWorthIt).toBe(false);
  });
});

describe("calcDsrLimit", () => {
  it("기존 원리금이 너무 크면 추가 한도가 0이 된다", () => {
    const result = calcDsrLimit({
      ...DEFAULT_DSR_INPUT,
      annualIncome: 40_000_000,
      existingAnnualDebtService: 20_000_000,
    });

    expect(result.allowedAnnualDebtService).toBe(0);
    expect(result.maxLoanAmount).toBe(0);
  });

  it("같은 월 납입 가능액이면 장기가 더 큰 한도를 만든다", () => {
    const shortTerm = calcDsrLimit({ ...DEFAULT_DSR_INPUT, termMonths: 120 });
    const longTerm = calcDsrLimit({ ...DEFAULT_DSR_INPUT, termMonths: 360 });

    expect(longTerm.maxLoanAmount).toBeGreaterThan(shortTerm.maxLoanAmount);
  });
});

describe("compareRepaymentPlans", () => {
  it("두 상환방식의 이자 차이를 계산한다", () => {
    const result = compareRepaymentPlans(DEFAULT_REPAYMENT_INPUT);

    expect(result.interestGap).toBeGreaterThan(0);
    expect(result.firstMonthGap).toBeGreaterThan(0);
  });
});

describe("sanitize input", () => {
  it("잘못된 갈아타기 입력은 기본값으로 대체한다", () => {
    expect(sanitizeRefinanceInput({ balance: -1 })).toEqual(DEFAULT_REFINANCE_INPUT);
  });

  it("잘못된 DSR 입력은 기본값으로 대체한다", () => {
    expect(sanitizeDsrInput({ dsrLimit: 9 })).toEqual(DEFAULT_DSR_INPUT);
  });

  it("잘못된 상환방식 입력은 기본값으로 대체한다", () => {
    expect(sanitizeRepaymentInput({ principal: 1 })).toEqual(DEFAULT_REPAYMENT_INPUT);
  });

  it("잘못된 중도상환 입력은 기본값으로 대체한다", () => {
    expect(sanitizePrepaymentFeeInput({ feeRate: 9 })).toEqual(DEFAULT_PREPAYMENT_FEE_INPUT);
  });

  it("잘못된 학자금 입력은 기본값으로 대체한다", () => {
    expect(sanitizeStudentLoanInput({ repaymentRate: 120 })).toEqual(DEFAULT_STUDENT_LOAN_INPUT);
  });
});

describe("loan extra calculator", () => {
  it("중도상환수수료를 잔여 부과기간 기준으로 계산한다", () => {
    const result = calcPrepaymentFee(DEFAULT_PREPAYMENT_FEE_INPUT);

    expect(result.remainingMonths).toBe(22);
    expect(result.waivedAmount).toBe(30_000_000);
    expect(result.feeAmount).toBe(513_333);
  });

  it("학부 취업후상환 의무상환액을 계산한다", () => {
    const result = calcStudentLoanRepayment(DEFAULT_STUDENT_LOAN_INPUT);

    expect(result.baseExcessIncome).toBe(11_630_000);
    expect(result.rawMandatoryRepayment).toBe(2_326_000);
    expect(result.monthlyWithholding).toBe(193_833);
  });
});
