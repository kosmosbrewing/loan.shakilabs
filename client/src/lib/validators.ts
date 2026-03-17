import { z } from "zod";

const amountSchema = z.coerce.number().int().min(100_000).max(2_000_000_000);
const optionalAmountSchema = z.coerce.number().int().min(0).max(2_000_000_000);
const incomeSchema = z.coerce.number().int().min(0).max(1_000_000_000);
const rateSchema = z.coerce.number().min(0).max(30);
const termSchema = z.coerce.number().int().min(1).max(480);
const dsrSchema = z.coerce.number().min(0.1).max(1);

export const refinanceInputSchema = z.object({
  balance: amountSchema,
  currentRate: rateSchema,
  newRate: rateSchema,
  remainingMonths: termSchema,
  newTermMonths: termSchema,
  refinanceFee: optionalAmountSchema,
});

export const dsrInputSchema = z.object({
  annualIncome: incomeSchema,
  existingAnnualDebtService: optionalAmountSchema,
  dsrLimit: dsrSchema,
  newLoanRate: rateSchema,
  termMonths: termSchema,
});

export const repaymentInputSchema = z.object({
  principal: amountSchema,
  annualRate: rateSchema,
  termMonths: termSchema,
});

export const prepaymentFeeInputSchema = z.object({
  originalLoanAmount: amountSchema.max(5_000_000_000),
  repaymentAmount: optionalAmountSchema.max(5_000_000_000),
  feeRate: z.coerce.number().min(0).max(5),
  chargePeriodMonths: termSchema.max(120),
  elapsedMonths: z.coerce.number().int().min(0).max(120),
  annualFreeRate: z.coerce.number().min(0).max(100),
});

export const studentLoanInputSchema = z.object({
  loanBalance: amountSchema.max(500_000_000),
  annualIncome: incomeSchema,
  thresholdIncome: incomeSchema.max(100_000_000),
  repaymentRate: z.coerce.number().min(0).max(100),
  voluntaryRepayment: optionalAmountSchema.max(500_000_000),
  interestRate: z.coerce.number().min(0).max(10),
});

export type RefinanceInput = z.infer<typeof refinanceInputSchema>;
export type DsrInput = z.infer<typeof dsrInputSchema>;
export type RepaymentInput = z.infer<typeof repaymentInputSchema>;
export type PrepaymentFeeInput = z.infer<typeof prepaymentFeeInputSchema>;
export type StudentLoanInput = z.infer<typeof studentLoanInputSchema>;

export const DEFAULT_REFINANCE_INPUT: RefinanceInput = {
  balance: 120_000_000,
  currentRate: 5.8,
  newRate: 4.2,
  remainingMonths: 240,
  newTermMonths: 240,
  refinanceFee: 900_000,
};

export const DEFAULT_DSR_INPUT: DsrInput = {
  annualIncome: 72_000_000,
  existingAnnualDebtService: 8_400_000,
  dsrLimit: 0.4,
  newLoanRate: 4.5,
  termMonths: 360,
};

export const DEFAULT_REPAYMENT_INPUT: RepaymentInput = {
  principal: 300_000_000,
  annualRate: 4.2,
  termMonths: 360,
};

export const DEFAULT_PREPAYMENT_FEE_INPUT: PrepaymentFeeInput = {
  originalLoanAmount: 300_000_000,
  repaymentAmount: 100_000_000,
  feeRate: 1.2,
  chargePeriodMonths: 36,
  elapsedMonths: 14,
  annualFreeRate: 10,
};

export const DEFAULT_STUDENT_LOAN_INPUT: StudentLoanInput = {
  loanBalance: 28_000_000,
  annualIncome: 42_000_000,
  thresholdIncome: 30_370_000,
  repaymentRate: 20,
  voluntaryRepayment: 0,
  interestRate: 1.7,
};

function readField<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

export function sanitizeRefinanceInput(input?: Partial<RefinanceInput>): RefinanceInput {
  return {
    balance: readField(amountSchema, input?.balance, DEFAULT_REFINANCE_INPUT.balance),
    currentRate: readField(rateSchema, input?.currentRate, DEFAULT_REFINANCE_INPUT.currentRate),
    newRate: readField(rateSchema, input?.newRate, DEFAULT_REFINANCE_INPUT.newRate),
    remainingMonths: readField(termSchema, input?.remainingMonths, DEFAULT_REFINANCE_INPUT.remainingMonths),
    newTermMonths: readField(termSchema, input?.newTermMonths, DEFAULT_REFINANCE_INPUT.newTermMonths),
    refinanceFee: readField(optionalAmountSchema, input?.refinanceFee, DEFAULT_REFINANCE_INPUT.refinanceFee),
  };
}

export function sanitizeDsrInput(input?: Partial<DsrInput>): DsrInput {
  return {
    annualIncome: readField(incomeSchema, input?.annualIncome, DEFAULT_DSR_INPUT.annualIncome),
    existingAnnualDebtService: readField(
      optionalAmountSchema,
      input?.existingAnnualDebtService,
      DEFAULT_DSR_INPUT.existingAnnualDebtService,
    ),
    dsrLimit: readField(dsrSchema, input?.dsrLimit, DEFAULT_DSR_INPUT.dsrLimit),
    newLoanRate: readField(rateSchema, input?.newLoanRate, DEFAULT_DSR_INPUT.newLoanRate),
    termMonths: readField(termSchema, input?.termMonths, DEFAULT_DSR_INPUT.termMonths),
  };
}

export function sanitizeRepaymentInput(input?: Partial<RepaymentInput>): RepaymentInput {
  return {
    principal: readField(amountSchema, input?.principal, DEFAULT_REPAYMENT_INPUT.principal),
    annualRate: readField(rateSchema, input?.annualRate, DEFAULT_REPAYMENT_INPUT.annualRate),
    termMonths: readField(termSchema, input?.termMonths, DEFAULT_REPAYMENT_INPUT.termMonths),
  };
}

export function sanitizePrepaymentFeeInput(input?: Partial<PrepaymentFeeInput>): PrepaymentFeeInput {
  return {
    originalLoanAmount: readField(
      amountSchema.max(5_000_000_000),
      input?.originalLoanAmount,
      DEFAULT_PREPAYMENT_FEE_INPUT.originalLoanAmount,
    ),
    repaymentAmount: readField(
      optionalAmountSchema.max(5_000_000_000),
      input?.repaymentAmount,
      DEFAULT_PREPAYMENT_FEE_INPUT.repaymentAmount,
    ),
    feeRate: readField(z.coerce.number().min(0).max(5), input?.feeRate, DEFAULT_PREPAYMENT_FEE_INPUT.feeRate),
    chargePeriodMonths: readField(
      termSchema.max(120),
      input?.chargePeriodMonths,
      DEFAULT_PREPAYMENT_FEE_INPUT.chargePeriodMonths,
    ),
    elapsedMonths: readField(
      z.coerce.number().int().min(0).max(120),
      input?.elapsedMonths,
      DEFAULT_PREPAYMENT_FEE_INPUT.elapsedMonths,
    ),
    annualFreeRate: readField(
      z.coerce.number().min(0).max(100),
      input?.annualFreeRate,
      DEFAULT_PREPAYMENT_FEE_INPUT.annualFreeRate,
    ),
  };
}

export function sanitizeStudentLoanInput(input?: Partial<StudentLoanInput>): StudentLoanInput {
  return {
    loanBalance: readField(
      amountSchema.max(500_000_000),
      input?.loanBalance,
      DEFAULT_STUDENT_LOAN_INPUT.loanBalance,
    ),
    annualIncome: readField(incomeSchema, input?.annualIncome, DEFAULT_STUDENT_LOAN_INPUT.annualIncome),
    thresholdIncome: readField(
      incomeSchema.max(100_000_000),
      input?.thresholdIncome,
      DEFAULT_STUDENT_LOAN_INPUT.thresholdIncome,
    ),
    repaymentRate: readField(
      z.coerce.number().min(0).max(100),
      input?.repaymentRate,
      DEFAULT_STUDENT_LOAN_INPUT.repaymentRate,
    ),
    voluntaryRepayment: readField(
      optionalAmountSchema.max(500_000_000),
      input?.voluntaryRepayment,
      DEFAULT_STUDENT_LOAN_INPUT.voluntaryRepayment,
    ),
    interestRate: readField(
      z.coerce.number().min(0).max(10),
      input?.interestRate,
      DEFAULT_STUDENT_LOAN_INPUT.interestRate,
    ),
  };
}
