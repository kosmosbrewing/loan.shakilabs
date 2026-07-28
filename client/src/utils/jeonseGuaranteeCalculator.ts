import {
  DEBT_TIER_INDEX,
  GUARANTEE_LIMIT_METRO,
  GUARANTEE_LIMIT_OTHER,
  GUARANTEE_RATE_TABLE,
  type GuaranteeDebtTier,
  type GuaranteeHousingType,
} from "@/data/jeonseGuarantee";

export interface JeonseGuaranteeInput {
  deposit: number;
  months: number;
  housingType: GuaranteeHousingType;
  debtTier: GuaranteeDebtTier;
  discountRate: number;
  isMetropolitan: boolean;
}

export interface JeonseGuaranteeResult {
  annualRate: number;
  periodLabel: string;
  totalFee: number;
  discountedFee: number;
  discountAmount: number;
  monthlyEquivalent: number;
  limit: number;
  isOverLimit: boolean;
}

export function calcJeonseGuaranteeFee(input: JeonseGuaranteeInput): JeonseGuaranteeResult {
  const deposit = Math.max(0, input.deposit);
  const months = Math.max(1, Math.floor(input.months));
  const discountRate = Math.min(0.6, Math.max(0, input.discountRate));

  const tier = GUARANTEE_RATE_TABLE.find((row) => months <= row.maxMonths)
    ?? GUARANTEE_RATE_TABLE[GUARANTEE_RATE_TABLE.length - 1]!;
  const annualRate = tier[input.housingType][DEBT_TIER_INDEX[input.debtTier]]!;

  // 보증료 = 보증금 × 연요율 × (기간/12) — 공식 산식(일수/365)의 개월 근사
  const totalFee = Math.round(deposit * (annualRate / 100) * (months / 12));
  const discountAmount = Math.round(totalFee * discountRate);
  const discountedFee = totalFee - discountAmount;

  const limit = input.isMetropolitan ? GUARANTEE_LIMIT_METRO : GUARANTEE_LIMIT_OTHER;

  return {
    annualRate,
    periodLabel: tier.label,
    totalFee,
    discountedFee,
    discountAmount,
    monthlyEquivalent: Math.round(discountedFee / months),
    limit,
    isOverLimit: deposit > limit,
  };
}
