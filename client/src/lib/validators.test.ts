import { describe, expect, it } from "vitest";
import {
  DEFAULT_JEONSE_LOAN_INPUT,
  DEFAULT_LTV_DTI_INPUT,
  DEFAULT_MORTGAGE_COMPARE_INPUT,
  DEFAULT_PREPAYMENT_FEE_INPUT,
  DEFAULT_STEPPING_STONE_INPUT,
  sanitizeJeonseLoanInput,
  sanitizeLtvDtiInput,
  sanitizeMortgageCompareInput,
  sanitizePrepaymentFeeInput,
  sanitizeSteppingStoneLoanInput,
  clampNotices,
} from "./validators";
import { calcLtvDti } from "@/utils/ltvDtiCalc";

// 회귀: 기저 스키마의 max(20억)에 뷰별 .max(50~100억)을 덧씌워도 zod는 둘 다 검사해 뷰 상한이 무효였다.
// 집값 25억을 넣으면 readField가 실패해 기본값 7억으로 조용히 되돌아갔고, 화면은 7억 기준 결과를 냈다.
describe("입력 상한 — 뷰별 상한이 실제로 적용된다", () => {
  it("/ltv-dti 집값 25억은 25억 그대로 남고 절대한도 15~25억 구간(4억)이 나온다", () => {
    const n = sanitizeLtvDtiInput({ ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 2_500_000_000 });
    expect(n.propertyPrice).toBe(2_500_000_000);
    const r = calcLtvDti({ ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 2_500_000_000, annualIncome: 300_000_000 });
    expect(r.maxByLtv).toBe(1_000_000_000);
    expect(r.maxByAbsolute).toBe(400_000_000);
    expect(r.finalMaxLoan).toBe(400_000_000);
    expect(r.limitingFactor).toBe("절대한도");
    // 25억 + 100만원부터는 25억 초과 구간(2억)
    expect(calcLtvDti({ ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 2_501_000_000, annualIncome: 300_000_000 }).finalMaxLoan).toBe(200_000_000);
  });

  it("20억 초과 입력이 기본값으로 되돌아가는 일이 없다 — 다섯 계산기 전부", () => {
    expect(sanitizeLtvDtiInput({ propertyPrice: 3_000_000_000 }).propertyPrice).toBe(3_000_000_000);
    expect(sanitizePrepaymentFeeInput({ originalLoanAmount: 3_000_000_000, repaymentAmount: 2_500_000_000 })).toMatchObject({
      originalLoanAmount: 3_000_000_000,
      repaymentAmount: 2_500_000_000,
    });
    expect(sanitizeJeonseLoanInput({ depositAmount: 2_500_000_000 }).depositAmount).toBe(2_500_000_000);
    expect(sanitizeMortgageCompareInput({ loanAmount: 4_000_000_000 }).loanAmount).toBe(4_000_000_000);
    expect(sanitizeSteppingStoneLoanInput({ propertyPrice: 2_200_000_000 }).propertyPrice).toBe(2_200_000_000);
    // 기본값과 같아진 필드가 하나도 없어야 "조용한 리셋 0건"
    expect(sanitizeLtvDtiInput({ propertyPrice: 3_000_000_000 }).propertyPrice).not.toBe(DEFAULT_LTV_DTI_INPUT.propertyPrice);
    expect(sanitizePrepaymentFeeInput({ originalLoanAmount: 3_000_000_000 }).originalLoanAmount).not.toBe(DEFAULT_PREPAYMENT_FEE_INPUT.originalLoanAmount);
    expect(sanitizeJeonseLoanInput({ depositAmount: 2_500_000_000 }).depositAmount).not.toBe(DEFAULT_JEONSE_LOAN_INPUT.depositAmount);
    expect(sanitizeMortgageCompareInput({ loanAmount: 4_000_000_000 }).loanAmount).not.toBe(DEFAULT_MORTGAGE_COMPARE_INPUT.loanAmount);
    expect(sanitizeSteppingStoneLoanInput({ propertyPrice: 2_200_000_000 }).propertyPrice).not.toBe(DEFAULT_STEPPING_STONE_INPUT.propertyPrice);
  });
});

describe("입력 범위 — 범위 밖은 기본값이 아니라 경계로 클램프", () => {
  it("상한을 넘으면 상한으로 잘린다", () => {
    expect(sanitizeLtvDtiInput({ propertyPrice: 20_000_000_000 }).propertyPrice).toBe(10_000_000_000);
    expect(sanitizeJeonseLoanInput({ depositAmount: 9_000_000_000 }).depositAmount).toBe(5_000_000_000);
    expect(sanitizeLtvDtiInput({ loanRate: 45 }).loanRate).toBe(30);
    expect(sanitizeLtvDtiInput({ termMonths: 600 }).termMonths).toBe(480);
  });

  it("하한 아래·음수·0은 하한으로 올라온다", () => {
    expect(sanitizeLtvDtiInput({ propertyPrice: 0 }).propertyPrice).toBe(100_000);
    expect(sanitizeLtvDtiInput({ propertyPrice: -5 }).propertyPrice).toBe(100_000);
    expect(sanitizeLtvDtiInput({ existingDebtPayment: -1 }).existingDebtPayment).toBe(0);
    expect(sanitizeLtvDtiInput({ termMonths: 0 }).termMonths).toBe(1);
  });

  it("정수 필드의 소수·문자열 숫자는 반올림·변환되고, 숫자가 아닌 값만 기본값으로 간다", () => {
    expect(sanitizeLtvDtiInput({ propertyPrice: 700_000_000.6 }).propertyPrice).toBe(700_000_001);
    expect(sanitizeLtvDtiInput({ propertyPrice: "2500000000" as unknown as number }).propertyPrice).toBe(2_500_000_000);
    expect(sanitizeLtvDtiInput({ propertyPrice: Number.NaN }).propertyPrice).toBe(DEFAULT_LTV_DTI_INPUT.propertyPrice);
    expect(sanitizeLtvDtiInput({ propertyPrice: "abc" as unknown as number }).propertyPrice).toBe(DEFAULT_LTV_DTI_INPUT.propertyPrice);
    expect(sanitizeLtvDtiInput({}).propertyPrice).toBe(DEFAULT_LTV_DTI_INPUT.propertyPrice);
  });
});

describe("클램프 알림 — 잘린 사실을 화면에 알릴 수 있다", () => {
  it("범위 안 입력에는 알림이 없다", () => {
    expect(clampNotices("ltvDti", { ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 2_500_000_000 })).toEqual([]);
    expect(clampNotices("prepayment", { ...DEFAULT_PREPAYMENT_FEE_INPUT })).toEqual([]);
  });

  it("상한을 넘긴 필드만 라벨·입력값·적용값과 함께 보고한다", () => {
    const notices = clampNotices("ltvDti", { ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 20_000_000_000, loanRate: 45 });
    expect(notices).toEqual([
      { key: "propertyPrice", label: "주택 가격", entered: 20_000_000_000, applied: 10_000_000_000 },
      { key: "loanRate", label: "금리", entered: 45, applied: 30 },
    ]);
    // 알림의 적용값은 sanitize 결과와 같은 값이어야 한다 — 화면과 계산이 어긋나지 않는다
    const sanitized = sanitizeLtvDtiInput({ ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 20_000_000_000, loanRate: 45 });
    for (const n of notices) expect(sanitized[n.key as keyof typeof sanitized]).toBe(n.applied);
  });

  it("숫자가 아닌 값은 클램프가 아니라 기본값이므로 알리지 않는다", () => {
    expect(clampNotices("ltvDti", { propertyPrice: Number.NaN })).toEqual([]);
    expect(clampNotices("ltvDti", {})).toEqual([]);
  });
});
