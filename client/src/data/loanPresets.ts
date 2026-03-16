import type { DsrInput, RefinanceInput, RepaymentInput } from "@/lib/validators";

export const LOAN_BADGE_MESSAGE = "2026년 3월 계산식 기준";
export const LOAN_ASSUMPTION_NOTE =
  "중도상환수수료·보증료·은행별 우대금리는 단순화했고, 실제 승인 한도는 금융사 정책에 따라 달라질 수 있습니다.";

export const TERM_OPTIONS = [12, 24, 36, 60, 84, 120, 180, 240, 360] as const;
export const DSR_LIMIT_OPTIONS = [0.4, 0.5, 0.6] as const;

export const refinancePresets: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  input: RefinanceInput;
}> = [
  {
    key: "office-worker",
    label: "직장인 갈아타기",
    description: "금리 1%p 이상 낮아지는 일반적인 사례",
    input: {
      balance: 120_000_000,
      currentRate: 5.8,
      newRate: 4.2,
      remainingMonths: 240,
      newTermMonths: 240,
      refinanceFee: 900_000,
    },
  },
  {
    key: "short-term",
    label: "잔여 5년",
    description: "잔여기간이 짧을 때도 갈아타기가 유리한지 확인",
    input: {
      balance: 60_000_000,
      currentRate: 6.4,
      newRate: 4.7,
      remainingMonths: 60,
      newTermMonths: 60,
      refinanceFee: 600_000,
    },
  },
];

export const dsrPresets: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  input: DsrInput;
}> = [
  {
    key: "single-income",
    label: "연봉 7,200만",
    description: "기존 원리금 부담이 적은 기본 시나리오",
    input: {
      annualIncome: 72_000_000,
      existingAnnualDebtService: 8_400_000,
      dsrLimit: 0.4,
      newLoanRate: 4.5,
      termMonths: 360,
    },
  },
  {
    key: "double-income",
    label: "연소득 1.1억",
    description: "기존 신용대출이 조금 있는 경우",
    input: {
      annualIncome: 110_000_000,
      existingAnnualDebtService: 15_000_000,
      dsrLimit: 0.4,
      newLoanRate: 4.2,
      termMonths: 360,
    },
  },
];

export const repaymentPresets: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  input: RepaymentInput;
}> = [
  {
    key: "apartment",
    label: "주택담보 3억",
    description: "30년 만기 주담대 상환방식 비교",
    input: {
      principal: 300_000_000,
      annualRate: 4.2,
      termMonths: 360,
    },
  },
  {
    key: "credit-loan",
    label: "신용대출 5천만",
    description: "5년 만기 신용대출의 현금흐름 차이",
    input: {
      principal: 50_000_000,
      annualRate: 6.3,
      termMonths: 60,
    },
  },
];
