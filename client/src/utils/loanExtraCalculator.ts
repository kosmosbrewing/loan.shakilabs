import type { PrepaymentFeeInput, StudentLoanInput } from "@/lib/validators";
import {
  sanitizePrepaymentFeeInput,
  sanitizeStudentLoanInput,
} from "@/lib/validators";

function roundWon(value: number): number {
  return Math.round(value);
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
