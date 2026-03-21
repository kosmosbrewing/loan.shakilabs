import { describe, expect, it } from "vitest";
import {
  calcAnnuityPlan,
  calcDsrLimit,
  calcEqualPrincipalPlan,
  calcMonthlyPayment,
  calcRefinance,
  compareMortgageRates,
  compareRepaymentPlans,
  invertLoanPrincipal,
} from "@/utils/calculator";
import {
  DEFAULT_DSR_INPUT,
  DEFAULT_MORTGAGE_COMPARE_INPUT,
  DEFAULT_PREPAYMENT_FEE_INPUT,
  DEFAULT_REFINANCE_INPUT,
  DEFAULT_REPAYMENT_INPUT,
  DEFAULT_STUDENT_LOAN_INPUT,
  sanitizeDsrInput,
  sanitizeMortgageCompareInput,
  sanitizePrepaymentFeeInput,
  sanitizeRefinanceInput,
  sanitizeRepaymentInput,
  sanitizeStudentLoanInput,
} from "@/lib/validators";
import {
  calcJeonseLoan,
  calcPrepaymentFee,
  calcStudentLoanRepayment,
} from "@/utils/loanExtraCalculator";
import { calcSteppingStoneLoan } from "@/utils/steppingStoneLoanCalc";
import { calcLtvDti } from "@/utils/ltvDtiCalc";
import {
  DEFAULT_STEPPING_STONE_INPUT,
  DEFAULT_LTV_DTI_INPUT,
  sanitizeSteppingStoneLoanInput,
  sanitizeLtvDtiInput,
} from "@/lib/validators";

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

describe("compareMortgageRates", () => {
  it("은행들을 최저금리 기준 오름차순으로 정렬한다", () => {
    const result = compareMortgageRates(DEFAULT_MORTGAGE_COMPARE_INPUT);
    for (let i = 1; i < result.banks.length; i++) {
      expect(result.banks[i].bestRate).toBeGreaterThanOrEqual(result.banks[i - 1].bestRate);
    }
  });

  it("최저금리 은행을 bestBank로 반환한다", () => {
    const result = compareMortgageRates(DEFAULT_MORTGAGE_COMPARE_INPUT);
    expect(result.bestBank).not.toBeNull();
    expect(result.bestBank!.bestRate).toBe(result.banks[0].bestRate);
  });

  it("월 상환액 차이와 총이자 차이를 계산한다", () => {
    const result = compareMortgageRates(DEFAULT_MORTGAGE_COMPARE_INPUT);
    expect(result.monthlyPaymentRange).toBeGreaterThan(0);
    expect(result.totalInterestRange).toBeGreaterThan(0);
  });

  it("대출금액이 크면 총이자 차이도 커진다", () => {
    const small = compareMortgageRates({ loanAmount: 100_000_000, termMonths: 360, repaymentMethod: "annuity" });
    const large = compareMortgageRates({ loanAmount: 500_000_000, termMonths: 360, repaymentMethod: "annuity" });
    expect(large.totalInterestRange).toBeGreaterThan(small.totalInterestRange);
  });

  it("잘못된 입력은 기본값으로 sanitize된다", () => {
    expect(sanitizeMortgageCompareInput({ loanAmount: -1 })).toEqual(DEFAULT_MORTGAGE_COMPARE_INPUT);
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

describe("calcJeonseLoan", () => {
  it("거치식은 매달 이자만 납부한다", () => {
    const result = calcJeonseLoan({
      depositAmount: 200_000_000,
      annualRate: 3.6,
      termMonths: 24,
      isInterestOnly: true,
    });
    // 월 이자 = 2억 × 3.6% / 12 = 600,000
    expect(result.monthlyPayment).toBe(600_000);
    expect(result.monthlyInterest).toBe(600_000);
    expect(result.totalInterest).toBe(14_400_000);
    expect(result.totalRepayment).toBe(214_400_000);
  });

  it("원리금균등은 총이자가 거치식보다 적다", () => {
    const io = calcJeonseLoan({
      depositAmount: 200_000_000,
      annualRate: 3.5,
      termMonths: 120,
      isInterestOnly: true,
    });
    const amort = calcJeonseLoan({
      depositAmount: 200_000_000,
      annualRate: 3.5,
      termMonths: 120,
      isInterestOnly: false,
    });
    expect(amort.totalInterest).toBeLessThan(io.totalInterest);
  });

  it("상품별 비교에서 한도 초과 시 eligible이 false", () => {
    const result = calcJeonseLoan({
      depositAmount: 300_000_000,
      annualRate: 3.5,
      termMonths: 24,
      isInterestOnly: true,
    });
    // 청년전용은 2억 한도 → 3억은 초과
    const youth = result.productComparison.find((p) => p.product.id === "youth");
    expect(youth?.eligible).toBe(false);
  });
});

describe("calcSteppingStoneLoan", () => {
  it("생애최초 소득 5천만·주택 4억이면 자격 충족", () => {
    const result = calcSteppingStoneLoan(DEFAULT_STEPPING_STONE_INPUT);
    expect(result.eligible).toBe(true);
    expect(result.applicableRate).toBeGreaterThan(0);
    expect(result.effectiveLoanAmount).toBeGreaterThan(0);
    expect(result.effectiveLoanAmount).toBeLessThanOrEqual(240_000_000);
  });

  it("소득 초과하면 자격 미충족", () => {
    const result = calcSteppingStoneLoan({
      ...DEFAULT_STEPPING_STONE_INPUT,
      borrowerType: "general",
      householdIncome: 70_000_000,
    });
    expect(result.eligible).toBe(false);
    expect(result.ineligibleReasons.length).toBeGreaterThan(0);
  });

  it("신혼가구는 한도가 3.2억", () => {
    const result = calcSteppingStoneLoan({
      householdIncome: 60_000_000,
      propertyPrice: 500_000_000,
      borrowerType: "newlywed",
      termYears: 30,
      isMetro: true,
    });
    expect(result.maxLoanByLimit).toBe(320_000_000);
  });

  it("원금균등이 원리금균등보다 총이자가 적다", () => {
    const result = calcSteppingStoneLoan(DEFAULT_STEPPING_STONE_INPUT);
    expect(result.equalPrincipalPlan.totalInterest).toBeLessThan(result.annuityPlan.totalInterest);
  });

  it("잘못된 입력은 기본값으로 sanitize된다", () => {
    expect(sanitizeSteppingStoneLoanInput({ termYears: 5 })).toEqual(DEFAULT_STEPPING_STONE_INPUT);
  });
});

describe("calcLtvDti", () => {
  it("규제지역 일반 무주택자 LTV는 40%", () => {
    const result = calcLtvDti(DEFAULT_LTV_DTI_INPUT);
    expect(result.ltvRate).toBe(0.4);
    expect(result.maxByLtv).toBe(280_000_000);
  });

  it("DSR이 가장 제한적일 수 있다 (스트레스 금리 적용)", () => {
    const result = calcLtvDti(DEFAULT_LTV_DTI_INPUT);
    expect(result.stressRate).toBe(3.0);
    expect(result.finalMaxLoan).toBeGreaterThan(0);
    expect(result.finalMaxLoan).toBeLessThanOrEqual(result.maxByLtv);
  });

  it("비규제지역은 LTV 70%, 스트레스 금리 1.5%", () => {
    const result = calcLtvDti({
      ...DEFAULT_LTV_DTI_INPUT,
      region: "nonRegulated",
    });
    expect(result.ltvRate).toBe(0.7);
    expect(result.stressRate).toBe(1.5);
  });

  it("생애최초는 규제지역에서도 LTV 70%", () => {
    const result = calcLtvDti({
      ...DEFAULT_LTV_DTI_INPUT,
      borrowerCategory: "firstTime",
    });
    expect(result.ltvRate).toBe(0.7);
  });

  it("잘못된 입력은 기본값으로 sanitize된다", () => {
    expect(sanitizeLtvDtiInput({ loanRate: -1 })).toEqual(DEFAULT_LTV_DTI_INPUT);
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
