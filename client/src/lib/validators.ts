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

const repaymentMethodValues = ["annuity", "equalPrincipal"] as const;
export type RepaymentMethod = (typeof repaymentMethodValues)[number];

export const jeonseLoanInputSchema = z.object({
  depositAmount: amountSchema.max(5_000_000_000),
  annualRate: rateSchema,
  termMonths: termSchema,
  isInterestOnly: z.boolean(),
});

export const mortgageCompareInputSchema = z.object({
  loanAmount: amountSchema.max(5_000_000_000),
  termMonths: termSchema,
  repaymentMethod: z.enum(repaymentMethodValues),
});

const borrowerTypeValues = ["general", "firstTime", "newlywed"] as const;
export type BorrowerType = (typeof borrowerTypeValues)[number];

export const steppingStoneLoanInputSchema = z.object({
  householdIncome: incomeSchema,
  propertyPrice: amountSchema.max(5_000_000_000),
  borrowerType: z.enum(borrowerTypeValues),
  termYears: z.coerce.number().int().min(10).max(30),
  isMetro: z.boolean(),
});

const regionTypeValues = ["speculative", "nonRegulated"] as const;
const borrowerCategoryValues = ["general", "firstTime", "lowIncome"] as const;

export const ltvDtiInputSchema = z.object({
  propertyPrice: amountSchema.max(10_000_000_000),
  annualIncome: incomeSchema,
  existingDebtPayment: optionalAmountSchema,
  loanRate: rateSchema,
  termMonths: termSchema,
  region: z.enum(regionTypeValues),
  borrowerCategory: z.enum(borrowerCategoryValues),
});

export type RefinanceInput = z.infer<typeof refinanceInputSchema>;
export type DsrInput = z.infer<typeof dsrInputSchema>;
export type RepaymentInput = z.infer<typeof repaymentInputSchema>;
export type PrepaymentFeeInput = z.infer<typeof prepaymentFeeInputSchema>;
export type StudentLoanInput = z.infer<typeof studentLoanInputSchema>;
export type JeonseLoanInput = z.infer<typeof jeonseLoanInputSchema>;
export type MortgageCompareInput = z.infer<typeof mortgageCompareInputSchema>;
export type SteppingStoneLoanInput = z.infer<typeof steppingStoneLoanInputSchema>;
export type LtvDtiInput = z.infer<typeof ltvDtiInputSchema>;

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

export const DEFAULT_JEONSE_LOAN_INPUT: JeonseLoanInput = {
  depositAmount: 200_000_000,
  annualRate: 3.5,
  termMonths: 24,
  isInterestOnly: true,
};

export const DEFAULT_MORTGAGE_COMPARE_INPUT: MortgageCompareInput = {
  loanAmount: 300_000_000,
  termMonths: 360,
  repaymentMethod: "annuity",
};

export const DEFAULT_STUDENT_LOAN_INPUT: StudentLoanInput = {
  loanBalance: 28_000_000,
  annualIncome: 42_000_000,
  thresholdIncome: 30_370_000,
  repaymentRate: 20,
  voluntaryRepayment: 0,
  interestRate: 1.7,
};

export const DEFAULT_STEPPING_STONE_INPUT: SteppingStoneLoanInput = {
  householdIncome: 50_000_000,
  propertyPrice: 400_000_000,
  borrowerType: "firstTime",
  termYears: 30,
  isMetro: true,
};

export const DEFAULT_LTV_DTI_INPUT: LtvDtiInput = {
  propertyPrice: 700_000_000,
  annualIncome: 80_000_000,
  existingDebtPayment: 6_000_000,
  loanRate: 4.5,
  termMonths: 360,
  region: "speculative",
  borrowerCategory: "general",
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

export function sanitizeJeonseLoanInput(input?: Partial<JeonseLoanInput>): JeonseLoanInput {
  return {
    depositAmount: readField(amountSchema.max(5_000_000_000), input?.depositAmount, DEFAULT_JEONSE_LOAN_INPUT.depositAmount),
    annualRate: readField(rateSchema, input?.annualRate, DEFAULT_JEONSE_LOAN_INPUT.annualRate),
    termMonths: readField(termSchema, input?.termMonths, DEFAULT_JEONSE_LOAN_INPUT.termMonths),
    isInterestOnly: typeof input?.isInterestOnly === "boolean" ? input.isInterestOnly : DEFAULT_JEONSE_LOAN_INPUT.isInterestOnly,
  };
}

function parseRepaymentMethod(value: unknown): RepaymentMethod | null {
  return typeof value === "string" && repaymentMethodValues.includes(value as RepaymentMethod)
    ? (value as RepaymentMethod)
    : null;
}

export function sanitizeMortgageCompareInput(input?: Partial<MortgageCompareInput>): MortgageCompareInput {
  return {
    loanAmount: readField(amountSchema.max(5_000_000_000), input?.loanAmount, DEFAULT_MORTGAGE_COMPARE_INPUT.loanAmount),
    termMonths: readField(termSchema, input?.termMonths, DEFAULT_MORTGAGE_COMPARE_INPUT.termMonths),
    repaymentMethod: parseRepaymentMethod(input?.repaymentMethod) ?? DEFAULT_MORTGAGE_COMPARE_INPUT.repaymentMethod,
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

function parseBorrowerType(value: unknown): BorrowerType | null {
  return typeof value === "string" && borrowerTypeValues.includes(value as BorrowerType)
    ? (value as BorrowerType)
    : null;
}

export function sanitizeSteppingStoneLoanInput(input?: Partial<SteppingStoneLoanInput>): SteppingStoneLoanInput {
  return {
    householdIncome: readField(incomeSchema, input?.householdIncome, DEFAULT_STEPPING_STONE_INPUT.householdIncome),
    propertyPrice: readField(amountSchema.max(5_000_000_000), input?.propertyPrice, DEFAULT_STEPPING_STONE_INPUT.propertyPrice),
    borrowerType: parseBorrowerType(input?.borrowerType) ?? DEFAULT_STEPPING_STONE_INPUT.borrowerType,
    termYears: readField(z.coerce.number().int().min(10).max(30), input?.termYears, DEFAULT_STEPPING_STONE_INPUT.termYears),
    isMetro: typeof input?.isMetro === "boolean" ? input.isMetro : DEFAULT_STEPPING_STONE_INPUT.isMetro,
  };
}

function parseRegionType(value: unknown): LtvDtiInput["region"] | null {
  return typeof value === "string" && regionTypeValues.includes(value as LtvDtiInput["region"])
    ? (value as LtvDtiInput["region"])
    : null;
}

function parseBorrowerCategory(value: unknown): LtvDtiInput["borrowerCategory"] | null {
  return typeof value === "string" && borrowerCategoryValues.includes(value as LtvDtiInput["borrowerCategory"])
    ? (value as LtvDtiInput["borrowerCategory"])
    : null;
}

export function sanitizeLtvDtiInput(input?: Partial<LtvDtiInput>): LtvDtiInput {
  return {
    propertyPrice: readField(amountSchema.max(10_000_000_000), input?.propertyPrice, DEFAULT_LTV_DTI_INPUT.propertyPrice),
    annualIncome: readField(incomeSchema, input?.annualIncome, DEFAULT_LTV_DTI_INPUT.annualIncome),
    existingDebtPayment: readField(optionalAmountSchema, input?.existingDebtPayment, DEFAULT_LTV_DTI_INPUT.existingDebtPayment),
    loanRate: readField(rateSchema, input?.loanRate, DEFAULT_LTV_DTI_INPUT.loanRate),
    termMonths: readField(termSchema, input?.termMonths, DEFAULT_LTV_DTI_INPUT.termMonths),
    region: parseRegionType(input?.region) ?? DEFAULT_LTV_DTI_INPUT.region,
    borrowerCategory: parseBorrowerCategory(input?.borrowerCategory) ?? DEFAULT_LTV_DTI_INPUT.borrowerCategory,
  };
}
