import type { JeonseLoanInput, PrepaymentFeeInput, StudentLoanInput } from "@/lib/validators";
import {
  sanitizeJeonseLoanInput,
  sanitizePrepaymentFeeInput,
  sanitizeStudentLoanInput,
} from "@/lib/validators";
import { calcAnnuityPlan } from "@/utils/calculator";
import { JEONSE_LOAN_PRODUCTS, type JeonseLoanProductInfo } from "@/data/jeonseLoan";

function roundWon(value: number): number {
  return Math.round(value);
}

export interface JeonseLoanResult {
  depositAmount: number;
  annualRate: number;
  termMonths: number;
  isInterestOnly: boolean;
  monthlyInterest: number;
  totalInterest: number;
  monthlyPayment: number;
  totalRepayment: number;
  productComparison: Array<{
    product: JeonseLoanProductInfo;
    eligible: boolean;
    monthlyInterest: number;
    totalInterest: number;
  }>;
}

export function calcJeonseLoan(input: JeonseLoanInput): JeonseLoanResult {
  const normalized = sanitizeJeonseLoanInput(input);
  const { depositAmount, annualRate, termMonths, isInterestOnly } = normalized;
  const monthlyRate = annualRate / 100 / 12;

  let monthlyInterest: number;
  let totalInterest: number;
  let monthlyPayment: number;
  let totalRepayment: number;

  if (isInterestOnly) {
    // 거치식 (이자만 납부, 만기 일시상환)
    monthlyInterest = roundWon(depositAmount * monthlyRate);
    totalInterest = roundWon(monthlyInterest * termMonths);
    monthlyPayment = monthlyInterest;
    totalRepayment = depositAmount + totalInterest;
  } else {
    // 원리금균등
    const plan = calcAnnuityPlan(depositAmount, annualRate, termMonths);
    monthlyInterest = roundWon(depositAmount * monthlyRate); // 첫 달 이자
    totalInterest = plan.totalInterest;
    monthlyPayment = plan.monthlyPayment;
    totalRepayment = plan.totalRepayment;
  }

  // 상품별 비교 (최저금리 기준으로 계산)
  const productComparison = JEONSE_LOAN_PRODUCTS.map((product) => {
    const eligible = depositAmount <= product.maxAmount && termMonths <= product.maxTermMonths;
    const prodRate = product.minRate / 100 / 12;
    const prodMonthlyInterest = roundWon(depositAmount * prodRate);
    const prodTotalInterest = roundWon(prodMonthlyInterest * termMonths);
    return {
      product,
      eligible,
      monthlyInterest: prodMonthlyInterest,
      totalInterest: prodTotalInterest,
    };
  });

  return {
    depositAmount,
    annualRate,
    termMonths,
    isInterestOnly,
    monthlyInterest,
    totalInterest,
    monthlyPayment,
    totalRepayment,
    productComparison,
  };
}

export function calcPrepaymentFee(input: PrepaymentFeeInput) {
  const normalized = sanitizePrepaymentFeeInput(input);
  const remainingMonths = Math.max(0, normalized.chargePeriodMonths - normalized.elapsedMonths);
  const freeQuota = normalized.originalLoanAmount * (normalized.annualFreeRate / 100);
  const feeTargetAmount = Math.max(0, normalized.repaymentAmount - freeQuota);
  const feeRate = normalized.feeRate / 100;
  const proratedFee = remainingMonths > 0
    ? feeTargetAmount * feeRate * (remainingMonths / normalized.chargePeriodMonths)
    : 0;

  return {
    remainingMonths,
    freeQuota: roundWon(freeQuota),
    waivedAmount: roundWon(normalized.repaymentAmount - feeTargetAmount),
    feeTargetAmount: roundWon(feeTargetAmount),
    feeAmount: roundWon(proratedFee),
    effectiveRate: normalized.repaymentAmount > 0 ? proratedFee / normalized.repaymentAmount : 0,
  };
}

export function calcStudentLoanRepayment(input: StudentLoanInput) {
  const normalized = sanitizeStudentLoanInput(input);
  const baseExcessIncome = Math.max(0, normalized.annualIncome - normalized.thresholdIncome);
  const rawMandatoryRepayment = roundWon(baseExcessIncome * (normalized.repaymentRate / 100));
  const creditedMandatoryRepayment = Math.max(0, rawMandatoryRepayment - normalized.voluntaryRepayment);
  const estimatedInterest = roundWon(normalized.loanBalance * (normalized.interestRate / 100));
  const totalRepayment = Math.min(
    normalized.loanBalance + estimatedInterest,
    normalized.voluntaryRepayment + creditedMandatoryRepayment,
  );

  return {
    baseExcessIncome,
    rawMandatoryRepayment,
    creditedMandatoryRepayment,
    estimatedInterest,
    monthlyWithholding: roundWon(creditedMandatoryRepayment / 12),
    totalRepayment,
    balanceAfterYear: Math.max(0, normalized.loanBalance + estimatedInterest - totalRepayment),
  };
}
