import { z } from "zod";

// 숫자 필드 = zod 스키마 + 범위. 스키마는 타입 추론·형식 검증용이고, sanitize는 범위를 직접 읽어 클램프한다.
//
// 예전에는 amountSchema(max 20억)에 뷰별 .max(50억)을 덧씌웠는데, zod는 두 검사를 모두 통과해야 해서
// 뷰 상한이 무효였다 — 집값 25억을 넣으면 조용히 기본값 7억으로 되돌아가는 오답이 났다.
// 그래서 상한은 필드마다 한 번만 적고, 범위 밖 입력은 기본값으로 바꾸지 않고 경계로 클램프한다.
interface NumField {
  schema: z.ZodType<number>;
  min: number;
  max: number;
  int: boolean;
}

function numField(min: number, max: number, int: boolean): NumField {
  const base = z.coerce.number().min(min).max(max);
  return { schema: int ? base.int() : base, min, max, int };
}

const AMOUNT_MAX = 2_000_000_000;
const amount = (max = AMOUNT_MAX) => numField(100_000, max, true);
const optionalAmount = (max = AMOUNT_MAX) => numField(0, max, true);
const income = (max = 1_000_000_000) => numField(0, max, true);
const rate = (max = 30) => numField(0, max, false);
const term = (max = 480) => numField(1, max, true);
const ratio = (min: number, max: number) => numField(min, max, false);

// 각 계산기가 쓰는 필드 정의 — 스키마와 sanitize가 같은 객체를 읽는다
const FIELDS = {
  refinance: {
    balance: amount(),
    currentRate: rate(),
    newRate: rate(),
    remainingMonths: term(),
    newTermMonths: term(),
    refinanceFee: optionalAmount(),
  },
  dsr: {
    annualIncome: income(),
    existingAnnualDebtService: optionalAmount(),
    dsrLimit: ratio(0.1, 1),
    newLoanRate: rate(),
    termMonths: term(),
  },
  repayment: { principal: amount(), annualRate: rate(), termMonths: term() },
  prepayment: {
    originalLoanAmount: amount(5_000_000_000),
    repaymentAmount: optionalAmount(5_000_000_000),
    feeRate: ratio(0, 5),
    chargePeriodMonths: term(120),
    elapsedMonths: numField(0, 120, true),
    annualFreeRate: ratio(0, 100),
  },
  studentLoan: {
    loanBalance: amount(500_000_000),
    annualIncome: income(),
    thresholdIncome: income(100_000_000),
    repaymentRate: ratio(0, 100),
    voluntaryRepayment: optionalAmount(500_000_000),
    interestRate: rate(10),
  },
  jeonseLoan: { depositAmount: amount(5_000_000_000), annualRate: rate(), termMonths: term() },
  mortgageCompare: { loanAmount: amount(5_000_000_000), termMonths: term() },
  steppingStone: {
    householdIncome: income(),
    propertyPrice: amount(5_000_000_000),
    termYears: numField(10, 30, true),
  },
  ltvDti: {
    propertyPrice: amount(10_000_000_000),
    annualIncome: income(),
    existingDebtPayment: optionalAmount(),
    loanRate: rate(),
    termMonths: term(),
  },
} as const;

// 클램프가 일어났을 때 화면에 알리기 위한 필드 이름. 조용히 자르면 입력칸(200억)과 결과(100억)가
// 어긋난 채 남아 또 다른 조용한 오답이 된다.
const FIELD_LABELS: Record<string, string> = {
  balance: "대출 잔액",
  refinanceFee: "대환 비용",
  annualIncome: "연소득",
  householdIncome: "부부합산 연소득",
  existingAnnualDebtService: "기존 대출 연 상환액",
  existingDebtPayment: "기존 대출 연 상환액",
  principal: "대출 원금",
  originalLoanAmount: "최초 대출 금액",
  repaymentAmount: "중도상환 금액",
  loanBalance: "학자금 잔액",
  thresholdIncome: "상환기준소득",
  voluntaryRepayment: "자발 상환액",
  depositAmount: "전세보증금",
  loanAmount: "대출 금액",
  propertyPrice: "주택 가격",
  currentRate: "현재 금리",
  newRate: "신규 금리",
  annualRate: "금리",
  loanRate: "금리",
  newLoanRate: "금리",
  interestRate: "이자율",
  feeRate: "수수료율",
  annualFreeRate: "연 면제 비율",
  repaymentRate: "상환율",
  dsrLimit: "DSR 한도",
  remainingMonths: "잔여 기간",
  newTermMonths: "신규 기간",
  termMonths: "대출 기간",
  chargePeriodMonths: "수수료 부과 기간",
  elapsedMonths: "경과 개월",
  termYears: "대출 기간",
};

export interface ClampNotice {
  key: string;
  label: string;
  entered: number;
  applied: number;
}

/** 입력이 범위 밖이라 잘린 필드 목록. 비어 있으면 입력 그대로 계산된 것이다. */
export function clampNotices(kind: keyof typeof FIELDS, input: Record<string, unknown>): ClampNotice[] {
  const fields = FIELDS[kind] as Record<string, NumField>;
  const notices: ClampNotice[] = [];
  for (const [key, field] of Object.entries(fields)) {
    const raw = input[key];
    if (typeof raw !== "number" || !Number.isFinite(raw)) continue;
    if (raw >= field.min && raw <= field.max) continue;
    notices.push({
      key,
      label: FIELD_LABELS[key] ?? key,
      entered: raw,
      applied: Math.min(field.max, Math.max(field.min, raw)),
    });
  }
  return notices;
}

type SchemaOf<T extends Record<string, NumField>> = { [K in keyof T]: T[K]["schema"] };
function schemasOf<T extends Record<string, NumField>>(fields: T): SchemaOf<T> {
  return Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, f.schema])) as SchemaOf<T>;
}

export const refinanceInputSchema = z.object(schemasOf(FIELDS.refinance));
export const dsrInputSchema = z.object(schemasOf(FIELDS.dsr));
export const repaymentInputSchema = z.object(schemasOf(FIELDS.repayment));
export const prepaymentFeeInputSchema = z.object(schemasOf(FIELDS.prepayment));
export const studentLoanInputSchema = z.object(schemasOf(FIELDS.studentLoan));

const repaymentMethodValues = ["annuity", "equalPrincipal"] as const;
export type RepaymentMethod = (typeof repaymentMethodValues)[number];

export const jeonseLoanInputSchema = z.object({ ...schemasOf(FIELDS.jeonseLoan), isInterestOnly: z.boolean() });

export const mortgageCompareInputSchema = z.object({
  ...schemasOf(FIELDS.mortgageCompare),
  repaymentMethod: z.enum(repaymentMethodValues),
});

const borrowerTypeValues = ["general", "firstTime", "newlywed"] as const;
export type BorrowerType = (typeof borrowerTypeValues)[number];

export const steppingStoneLoanInputSchema = z.object({
  ...schemasOf(FIELDS.steppingStone),
  borrowerType: z.enum(borrowerTypeValues),
  isMetro: z.boolean(),
});

const regionTypeValues = ["speculative", "nonRegulated"] as const;
const borrowerCategoryValues = ["general", "firstTime", "lowIncome"] as const;

export const ltvDtiInputSchema = z.object({
  ...schemasOf(FIELDS.ltvDti),
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

/**
 * 숫자 입력 정규화. 범위 밖이면 기본값으로 되돌리지 않고 경계로 클램프한다 — 25억을 넣은 사용자에게
 * 7억 결과를 보여 주는 조용한 오답보다, 상한 100억으로 잘린 결과가 계산기로서 정직하다.
 * 숫자로 읽을 수 없는 값(빈 문자열·NaN·null)만 기본값으로 간다.
 */
function readNumber(field: NumField, value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === "" || typeof value === "boolean") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const clamped = Math.min(field.max, Math.max(field.min, n));
  return field.int ? Math.round(clamped) : clamped;
}

function readAll<T extends Record<string, NumField>>(
  fields: T,
  input: Partial<Record<keyof T, unknown>> | undefined,
  defaults: Record<keyof T, number>,
): Record<keyof T, number> {
  const out = {} as Record<keyof T, number>;
  for (const key of Object.keys(fields) as (keyof T)[]) out[key] = readNumber(fields[key], input?.[key], defaults[key]);
  return out;
}

export function sanitizeRefinanceInput(input?: Partial<RefinanceInput>): RefinanceInput {
  return readAll(FIELDS.refinance, input, DEFAULT_REFINANCE_INPUT);
}

export function sanitizeDsrInput(input?: Partial<DsrInput>): DsrInput {
  return readAll(FIELDS.dsr, input, DEFAULT_DSR_INPUT);
}

export function sanitizeRepaymentInput(input?: Partial<RepaymentInput>): RepaymentInput {
  return readAll(FIELDS.repayment, input, DEFAULT_REPAYMENT_INPUT);
}

export function sanitizePrepaymentFeeInput(input?: Partial<PrepaymentFeeInput>): PrepaymentFeeInput {
  return readAll(FIELDS.prepayment, input, DEFAULT_PREPAYMENT_FEE_INPUT);
}

export function sanitizeJeonseLoanInput(input?: Partial<JeonseLoanInput>): JeonseLoanInput {
  return {
    ...readAll(FIELDS.jeonseLoan, input, DEFAULT_JEONSE_LOAN_INPUT),
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
    ...readAll(FIELDS.mortgageCompare, input, DEFAULT_MORTGAGE_COMPARE_INPUT),
    repaymentMethod: parseRepaymentMethod(input?.repaymentMethod) ?? DEFAULT_MORTGAGE_COMPARE_INPUT.repaymentMethod,
  };
}

export function sanitizeStudentLoanInput(input?: Partial<StudentLoanInput>): StudentLoanInput {
  return readAll(FIELDS.studentLoan, input, DEFAULT_STUDENT_LOAN_INPUT);
}

function parseBorrowerType(value: unknown): BorrowerType | null {
  return typeof value === "string" && borrowerTypeValues.includes(value as BorrowerType)
    ? (value as BorrowerType)
    : null;
}

export function sanitizeSteppingStoneLoanInput(input?: Partial<SteppingStoneLoanInput>): SteppingStoneLoanInput {
  return {
    ...readAll(FIELDS.steppingStone, input, DEFAULT_STEPPING_STONE_INPUT),
    borrowerType: parseBorrowerType(input?.borrowerType) ?? DEFAULT_STEPPING_STONE_INPUT.borrowerType,
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
    ...readAll(FIELDS.ltvDti, input, DEFAULT_LTV_DTI_INPUT),
    region: parseRegionType(input?.region) ?? DEFAULT_LTV_DTI_INPUT.region,
    borrowerCategory: parseBorrowerCategory(input?.borrowerCategory) ?? DEFAULT_LTV_DTI_INPUT.borrowerCategory,
  };
}
