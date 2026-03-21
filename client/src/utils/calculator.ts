import type { DsrInput, MortgageCompareInput, RefinanceInput, RepaymentInput } from "@/lib/validators";
import {
  sanitizeDsrInput,
  sanitizeMortgageCompareInput,
  sanitizeRefinanceInput,
  sanitizeRepaymentInput,
} from "@/lib/validators";
import { BANK_MORTGAGE_RATES, type BankMortgageRate } from "@/data/mortgageRates";

export interface PaymentPlanSummary {
  monthlyPayment: number;
  firstPayment: number;
  lastPayment: number;
  averagePayment: number;
  totalInterest: number;
  totalRepayment: number;
}

export interface RefinanceResult {
  currentPlan: PaymentPlanSummary;
  newPlan: PaymentPlanSummary;
  monthlySavings: number;
  netSavings: number;
  breakEvenMonths: number | null;
  isSwitchWorthIt: boolean;
}

export interface DsrResult {
  allowedAnnualDebtService: number;
  availableMonthlyBudget: number;
  maxLoanAmount: number;
  estimatedTotalInterest: number;
  estimatedTotalRepayment: number;
  currentDsr: number;
}

export interface RepaymentComparisonResult {
  annuity: PaymentPlanSummary;
  equalPrincipal: PaymentPlanSummary;
  interestGap: number;
  firstMonthGap: number;
}

function monthlyRate(annualRate: number): number {
  return annualRate / 12 / 100;
}

function roundCurrency(amount: number): number {
  return Math.round(amount);
}

export function calcMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  const rate = monthlyRate(annualRate);
  if (rate === 0) return roundCurrency(principal / months);
  const factor = (1 + rate) ** months;
  return roundCurrency((principal * rate * factor) / (factor - 1));
}

export function calcAnnuityPlan(principal: number, annualRate: number, months: number): PaymentPlanSummary {
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, months);
  const totalRepayment = roundCurrency(monthlyPayment * months);
  const totalInterest = roundCurrency(totalRepayment - principal);
  return {
    monthlyPayment,
    firstPayment: monthlyPayment,
    lastPayment: monthlyPayment,
    averagePayment: monthlyPayment,
    totalInterest,
    totalRepayment,
  };
}

export function calcEqualPrincipalPlan(
  principal: number,
  annualRate: number,
  months: number,
): PaymentPlanSummary {
  if (months <= 0) {
    return {
      monthlyPayment: 0,
      firstPayment: 0,
      lastPayment: 0,
      averagePayment: 0,
      totalInterest: 0,
      totalRepayment: 0,
    };
  }

  const rate = monthlyRate(annualRate);
  const monthlyPrincipal = principal / months;
  let remaining = principal;
  let totalRepayment = 0;
  let firstPayment = 0;
  let lastPayment = 0;

  for (let month = 1; month <= months; month += 1) {
    const payment = roundCurrency(monthlyPrincipal + remaining * rate);
    totalRepayment += payment;
    if (month === 1) firstPayment = payment;
    if (month === months) lastPayment = payment;
    remaining = Math.max(0, remaining - monthlyPrincipal);
  }

  const totalInterest = roundCurrency(totalRepayment - principal);
  return {
    monthlyPayment: roundCurrency(totalRepayment / months),
    firstPayment,
    lastPayment,
    averagePayment: roundCurrency(totalRepayment / months),
    totalInterest,
    totalRepayment: roundCurrency(totalRepayment),
  };
}

export function invertLoanPrincipal(payment: number, annualRate: number, months: number): number {
  if (payment <= 0 || months <= 0) return 0;
  const rate = monthlyRate(annualRate);
  if (rate === 0) return roundCurrency(payment * months);
  const factor = (1 + rate) ** months;
  return roundCurrency((payment * (factor - 1)) / (rate * factor));
}

export function calcRefinance(input: RefinanceInput): RefinanceResult {
  const normalized = sanitizeRefinanceInput(input);
  const currentPlan = calcAnnuityPlan(
    normalized.balance,
    normalized.currentRate,
    normalized.remainingMonths,
  );
  const newPlan = calcAnnuityPlan(normalized.balance, normalized.newRate, normalized.newTermMonths);
  const monthlySavings = roundCurrency(currentPlan.monthlyPayment - newPlan.monthlyPayment);
  const netSavings = roundCurrency(
    currentPlan.totalInterest - newPlan.totalInterest - normalized.refinanceFee,
  );
  const breakEvenMonths =
    monthlySavings > 0 ? Math.ceil(normalized.refinanceFee / monthlySavings) : null;

  return {
    currentPlan,
    newPlan,
    monthlySavings,
    netSavings,
    breakEvenMonths,
    isSwitchWorthIt:
      netSavings > 0 &&
      (breakEvenMonths === null || breakEvenMonths <= normalized.remainingMonths),
  };
}

export function calcDsrLimit(input: DsrInput): DsrResult {
  const normalized = sanitizeDsrInput(input);
  const allowedAnnualDebtService = Math.max(
    0,
    roundCurrency(normalized.annualIncome * normalized.dsrLimit - normalized.existingAnnualDebtService),
  );
  const availableMonthlyBudget = roundCurrency(allowedAnnualDebtService / 12);
  const maxLoanAmount = invertLoanPrincipal(
    availableMonthlyBudget,
    normalized.newLoanRate,
    normalized.termMonths,
  );
  const estimatedTotalRepayment = roundCurrency(availableMonthlyBudget * normalized.termMonths);

  return {
    allowedAnnualDebtService,
    availableMonthlyBudget,
    maxLoanAmount,
    estimatedTotalInterest: roundCurrency(Math.max(0, estimatedTotalRepayment - maxLoanAmount)),
    estimatedTotalRepayment,
    currentDsr:
      normalized.annualIncome > 0
        ? normalized.existingAnnualDebtService / normalized.annualIncome
        : 0,
  };
}

export interface BankCompareRow {
  id: string;
  bank: string;
  fixedMinRate: number;
  fixedMaxRate: number;
  variableMinRate: number;
  variableMaxRate: number;
  bestRate: number;
  bestMonthlyPayment: number;
  bestTotalInterest: number;
  bestTotalRepayment: number;
  worstRate: number;
  worstMonthlyPayment: number;
  worstTotalInterest: number;
}

export interface MortgageCompareResult {
  loanAmount: number;
  termMonths: number;
  repaymentMethod: string;
  banks: BankCompareRow[];
  bestBank: BankCompareRow | null;
  monthlyPaymentRange: number;
  totalInterestRange: number;
}

function calcPlanSummaryForRate(
  principal: number,
  annualRate: number,
  months: number,
  method: "annuity" | "equalPrincipal",
): PaymentPlanSummary {
  return method === "annuity"
    ? calcAnnuityPlan(principal, annualRate, months)
    : calcEqualPrincipalPlan(principal, annualRate, months);
}

export function compareMortgageRates(
  input: MortgageCompareInput,
  banks: readonly BankMortgageRate[] = BANK_MORTGAGE_RATES,
): MortgageCompareResult {
  const normalized = sanitizeMortgageCompareInput(input);
  const { loanAmount, termMonths, repaymentMethod } = normalized;

  const rows: BankCompareRow[] = banks.map((bank) => {
    const rates = [bank.fixedMin, bank.fixedMax, bank.variableMin, bank.variableMax];
    const bestRate = Math.min(...rates);
    const worstRate = Math.max(...rates);

    const bestPlan = calcPlanSummaryForRate(loanAmount, bestRate, termMonths, repaymentMethod);
    const worstPlan = calcPlanSummaryForRate(loanAmount, worstRate, termMonths, repaymentMethod);

    return {
      id: bank.id,
      bank: bank.bank,
      fixedMinRate: bank.fixedMin,
      fixedMaxRate: bank.fixedMax,
      variableMinRate: bank.variableMin,
      variableMaxRate: bank.variableMax,
      bestRate,
      bestMonthlyPayment: bestPlan.monthlyPayment,
      bestTotalInterest: bestPlan.totalInterest,
      bestTotalRepayment: bestPlan.totalRepayment,
      worstRate,
      worstMonthlyPayment: worstPlan.monthlyPayment,
      worstTotalInterest: worstPlan.totalInterest,
    };
  });

  // 최저금리 기준 오름차순 정렬
  rows.sort((a, b) => a.bestRate - b.bestRate);

  const bestBank = rows.length > 0 ? rows[0] : null;
  const monthlyPaymentRange =
    rows.length >= 2
      ? roundCurrency(rows[rows.length - 1].bestMonthlyPayment - rows[0].bestMonthlyPayment)
      : 0;
  const totalInterestRange =
    rows.length >= 2
      ? roundCurrency(rows[rows.length - 1].bestTotalInterest - rows[0].bestTotalInterest)
      : 0;

  return {
    loanAmount,
    termMonths,
    repaymentMethod,
    banks: rows,
    bestBank,
    monthlyPaymentRange,
    totalInterestRange,
  };
}

export function compareRepaymentPlans(input: RepaymentInput): RepaymentComparisonResult {
  const normalized = sanitizeRepaymentInput(input);
  const annuity = calcAnnuityPlan(normalized.principal, normalized.annualRate, normalized.termMonths);
  const equalPrincipal = calcEqualPrincipalPlan(
    normalized.principal,
    normalized.annualRate,
    normalized.termMonths,
  );

  return {
    annuity,
    equalPrincipal,
    interestGap: roundCurrency(annuity.totalInterest - equalPrincipal.totalInterest),
    firstMonthGap: roundCurrency(equalPrincipal.firstPayment - annuity.monthlyPayment),
  };
}
