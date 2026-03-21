import type { LtvDtiInput } from "@/lib/validators";
import { sanitizeLtvDtiInput } from "@/lib/validators";
import {
  LTV_LIMITS,
  DTI_LIMITS,
  DSR_LIMIT_BANK,
  ABSOLUTE_LIMITS,
  STRESS_RATES,
} from "@/data/ltvDti";

function roundWon(value: number): number {
  return Math.round(value);
}

export interface LtvDtiResult {
  ltvRate: number;
  dtiRate: number;
  dsrRate: number;
  stressRate: number;
  maxByLtv: number;
  maxByAbsolute: number;
  maxByDti: number;
  maxByDsr: number;
  finalMaxLoan: number;
  limitingFactor: "LTV" | "DTI" | "DSR" | "절대한도";
  monthlyPayment: number;
  totalInterest: number;
}

/** 연 원리금 상환 역산: 월 허용액 → 최대 대출 원금 */
function invertPrincipal(monthlyBudget: number, annualRate: number, months: number): number {
  if (monthlyBudget <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return roundWon(monthlyBudget * months);
  const f = (1 + r) ** months;
  return roundWon((monthlyBudget * (f - 1)) / (r * f));
}

function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return roundWon(principal / months);
  const f = (1 + r) ** months;
  return roundWon((principal * r * f) / (f - 1));
}

export function calcLtvDti(input: LtvDtiInput): LtvDtiResult {
  const n = sanitizeLtvDtiInput(input);
  const { propertyPrice, annualIncome, existingDebtPayment, loanRate, termMonths, region, borrowerCategory } = n;

  // LTV
  const ltvRate = LTV_LIMITS[region][borrowerCategory];
  const maxByLtv = roundWon(propertyPrice * ltvRate);

  // 절대한도 (규제지역만)
  let maxByAbsolute = Number.POSITIVE_INFINITY;
  if (region === "speculative") {
    for (const tier of ABSOLUTE_LIMITS) {
      if (propertyPrice <= tier.maxPrice) {
        maxByAbsolute = tier.limit;
        break;
      }
    }
  }

  // DTI: (연소득 × DTI비율 - 기타대출 이자) → 신규대출 연간 원리금 허용 → 역산
  const dtiRate = DTI_LIMITS[region];
  const dtiAnnualAllowed = Math.max(0, annualIncome * dtiRate - existingDebtPayment);
  const dtiMonthlyAllowed = dtiAnnualAllowed / 12;
  const maxByDti = invertPrincipal(dtiMonthlyAllowed, loanRate, termMonths);

  // DSR: 스트레스 금리 적용
  const dsrRate = DSR_LIMIT_BANK;
  const stressRate = STRESS_RATES[region];
  const effectiveRate = loanRate + stressRate;
  const dsrAnnualAllowed = Math.max(0, annualIncome * dsrRate - existingDebtPayment);
  const dsrMonthlyAllowed = dsrAnnualAllowed / 12;
  const maxByDsr = invertPrincipal(dsrMonthlyAllowed, effectiveRate, termMonths);

  // 최종 한도
  const candidates = [
    { amount: maxByLtv, factor: "LTV" as const },
    { amount: maxByAbsolute, factor: "절대한도" as const },
    { amount: maxByDti, factor: "DTI" as const },
    { amount: maxByDsr, factor: "DSR" as const },
  ];
  candidates.sort((a, b) => a.amount - b.amount);
  const finalMaxLoan = Math.max(0, candidates[0].amount);
  const limitingFactor = candidates[0].factor;

  const monthlyPayment = calcMonthlyPayment(finalMaxLoan, loanRate, termMonths);
  const totalInterest = roundWon(monthlyPayment * termMonths - finalMaxLoan);

  return {
    ltvRate,
    dtiRate,
    dsrRate,
    stressRate,
    maxByLtv,
    maxByAbsolute: maxByAbsolute === Number.POSITIVE_INFINITY ? 0 : maxByAbsolute,
    maxByDti,
    maxByDsr,
    finalMaxLoan,
    limitingFactor,
    monthlyPayment,
    totalInterest: Math.max(0, totalInterest),
  };
}
