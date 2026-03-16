import type { DsrInput, RefinanceInput, RepaymentInput } from "@/lib/validators";
import {
  sanitizeDsrInput,
  sanitizeRefinanceInput,
  sanitizeRepaymentInput,
} from "@/lib/validators";

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
