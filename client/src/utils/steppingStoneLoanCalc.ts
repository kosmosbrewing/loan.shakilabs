import type { SteppingStoneLoanInput } from "@/lib/validators";
import { sanitizeSteppingStoneLoanInput } from "@/lib/validators";
import { calcAnnuityPlan, calcEqualPrincipalPlan } from "@/utils/calculator";
import {
  GENERAL_RATES,
  SPECIAL_RATES,
  LOAN_LIMITS,
  LTV_RATE,
  LTV_RATE_FIRST_TIME_NON_METRO,
  DTI_RATE,
  PROPERTY_LIMITS,
  INCOME_LIMITS,
  type BorrowerType,
} from "@/data/steppingStoneLoan";

function roundWon(value: number): number {
  return Math.round(value);
}

export interface SteppingStoneLoanResult {
  eligible: boolean;
  ineligibleReasons: string[];
  applicableRate: number;
  incomeBracketLabel: string;
  maxLoanByLimit: number;
  maxLoanByLtv: number;
  maxLoanByDti: number;
  effectiveLoanAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  annuityPlan: { monthlyPayment: number; totalInterest: number };
  equalPrincipalPlan: { monthlyPayment: number; totalInterest: number; firstPayment: number };
}

/** 소득구간에 맞는 금리 조회 */
function findRate(
  income: number,
  termYears: number,
  borrowerType: BorrowerType,
): { rate: number; label: string } | null {
  const table = borrowerType === "general" ? GENERAL_RATES : SPECIAL_RATES;
  const termKey = String(termYears);
  for (const bracket of table) {
    if (income <= bracket.maxIncome) {
      const rate = bracket.rates[termKey];
      if (rate !== undefined) return { rate, label: bracket.label };
    }
  }
  return null;
}

/** 소득 자격 확인 */
function getIncomeLimit(borrowerType: BorrowerType): number {
  if (borrowerType === "newlywed") return INCOME_LIMITS.newlywed;
  if (borrowerType === "firstTime") return INCOME_LIMITS.firstTimeOrMultiChild;
  return INCOME_LIMITS.general;
}

/** 대출 한도 */
function getLoanLimit(borrowerType: BorrowerType): number {
  if (borrowerType === "newlywed") return LOAN_LIMITS.newlywed;
  if (borrowerType === "firstTime") return LOAN_LIMITS.firstTime;
  return LOAN_LIMITS.general;
}

/** 주택 가격 상한 */
function getPropertyLimit(borrowerType: BorrowerType): number {
  if (borrowerType === "newlywed") return PROPERTY_LIMITS.newlywedOrMultiChild;
  return PROPERTY_LIMITS.general;
}

export function calcSteppingStoneLoan(input: SteppingStoneLoanInput): SteppingStoneLoanResult {
  const normalized = sanitizeSteppingStoneLoanInput(input);
  const { householdIncome, propertyPrice, borrowerType, termYears, isMetro } = normalized;
  const termMonths = termYears * 12;

  const reasons: string[] = [];
  const incomeLimit = getIncomeLimit(borrowerType);
  if (householdIncome > incomeLimit) {
    reasons.push(`부부합산 연소득 ${(incomeLimit / 10000).toLocaleString()}만원 초과`);
  }
  const propertyLimit = getPropertyLimit(borrowerType);
  if (propertyPrice > propertyLimit) {
    reasons.push(`주택가격 ${(propertyLimit / 10000).toLocaleString()}만원 초과`);
  }

  // 금리 조회
  const rateInfo = findRate(householdIncome, termYears, borrowerType);
  const applicableRate = rateInfo?.rate ?? 4.15;
  const incomeBracketLabel = rateInfo?.label ?? "소득구간 초과";

  if (!rateInfo) {
    reasons.push("소득구간에 해당하는 금리 없음");
  }

  // 대출 한도 계산
  const maxLoanByLimit = getLoanLimit(borrowerType);

  const ltvRate = borrowerType === "firstTime" && !isMetro ? LTV_RATE_FIRST_TIME_NON_METRO : LTV_RATE;
  const maxLoanByLtv = roundWon(propertyPrice * ltvRate);

  // DTI 기준 한도: 연소득 × DTI비율 → 연간 허용 상환액 → 역산
  const annualAllowed = householdIncome * DTI_RATE;
  const monthlyAllowed = annualAllowed / 12;
  const maxLoanByDti = monthlyAllowed > 0 && applicableRate > 0
    ? roundWon((() => {
        const r = applicableRate / 100 / 12;
        const n = termMonths;
        const f = (1 + r) ** n;
        return (monthlyAllowed * (f - 1)) / (r * f);
      })())
    : 0;

  const effectiveLoanAmount = Math.min(maxLoanByLimit, maxLoanByLtv, maxLoanByDti);

  // 상환 계획
  const annuityPlan = calcAnnuityPlan(effectiveLoanAmount, applicableRate, termMonths);
  const equalPrincipalPlan = calcEqualPrincipalPlan(effectiveLoanAmount, applicableRate, termMonths);

  return {
    eligible: reasons.length === 0,
    ineligibleReasons: reasons,
    applicableRate,
    incomeBracketLabel,
    maxLoanByLimit,
    maxLoanByLtv,
    maxLoanByDti,
    effectiveLoanAmount,
    monthlyPayment: annuityPlan.monthlyPayment,
    totalInterest: annuityPlan.totalInterest,
    totalRepayment: annuityPlan.totalRepayment,
    annuityPlan: {
      monthlyPayment: annuityPlan.monthlyPayment,
      totalInterest: annuityPlan.totalInterest,
    },
    equalPrincipalPlan: {
      monthlyPayment: equalPrincipalPlan.averagePayment,
      totalInterest: equalPrincipalPlan.totalInterest,
      firstPayment: equalPrincipalPlan.firstPayment,
    },
  };
}
