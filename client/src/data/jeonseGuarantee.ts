import type { GuideData } from "@/data/seoGuides";

// HUG 전세보증금반환보증 보증료율 (2025-03-31 개편 후, 2026 적용)
// 요율 매트릭스: 보증기간 구간 × 주택유형 × 부채비율 구간 — 연 0.097%~0.211%
// 검증일: 2026-07-28, 출처: HUG 공식 안내(khug.or.kr)
export const JEONSE_GUARANTEE_UPDATED = "2026-07-28";

export type GuaranteeHousingType = "apartment" | "other";
export type GuaranteeDebtTier = "le70" | "le80" | "gt80";

// [부채비율 70% 이하, 80% 이하, 80% 초과] 순서의 연 요율(%)
type RateRow = readonly [number, number, number];

export interface GuaranteePeriodTier {
  maxMonths: number; // 이 개월 수 이하에 적용
  label: string;
  apartment: RateRow;
  other: RateRow;
}

export const GUARANTEE_RATE_TABLE: readonly GuaranteePeriodTier[] = [
  { maxMonths: 12, label: "1년 이내", apartment: [0.097, 0.117, 0.137], other: [0.111, 0.142, 0.172] },
  { maxMonths: 24, label: "1년 초과~2년", apartment: [0.102, 0.124, 0.146], other: [0.117, 0.151, 0.184] },
  { maxMonths: 60, label: "2년 초과~5년", apartment: [0.107, 0.131, 0.154], other: [0.124, 0.161, 0.197] },
  { maxMonths: Number.POSITIVE_INFINITY, label: "5년 초과", apartment: [0.113, 0.138, 0.164], other: [0.132, 0.172, 0.211] },
] as const;

export const DEBT_TIER_INDEX: Record<GuaranteeDebtTier, number> = {
  le70: 0,
  le80: 1,
  gt80: 2,
};

export const DEBT_TIER_OPTIONS: { value: GuaranteeDebtTier; label: string }[] = [
  { value: "le70", label: "70% 이하" },
  { value: "le80", label: "70% 초과~80% 이하" },
  { value: "gt80", label: "80% 초과" },
];

// 보증금 한도
export const GUARANTEE_LIMIT_METRO = 700_000_000;
export const GUARANTEE_LIMIT_OTHER = 500_000_000;

// 할인 — 사회배려계층(저소득·다자녀·장애인·고령자 등) 최대 60%, 모범납세·전자계약·비대면 등 최대 10%
export const DISCOUNT_OPTIONS = [
  { value: 0, label: "해당 없음" },
  { value: 0.1, label: "전자계약·비대면 등 (10%)" },
  { value: 0.4, label: "사회배려계층 (40%)" },
  { value: 0.6, label: "사회배려계층 최대 (60%)" },
] as const;

export const JEONSE_GUARANTEE_SOURCES = [
  {
    name: "HUG 주택도시보증공사 — 전세보증금반환보증",
    url: "https://www.khug.or.kr/hug/web/ig/dr/igdr000001.jsp",
    basis: "보증료율 연 0.097~0.211%(기간·주택유형·부채비율별), 한도 수도권 7억·그 외 5억, 담보인정비율 90%",
  },
] as const;

export const JEONSE_GUARANTEE_FAQS = [
  {
    q: "보증료는 어떻게 계산되나요?",
    a: "보증금액 × 보증료율 × (보증기간 일수 ÷ 365)로 계산합니다. 보증료율은 보증기간·주택유형(아파트/그 외)·부채비율 구간에 따라 연 0.097%~0.211%로 달라지며, 이 계산기는 개월 수 기준으로 근사 계산합니다.",
  },
  {
    q: "부채비율은 무엇을 입력하나요?",
    a: "(주택의 선순위 채권 + 전세보증금) ÷ 주택가격입니다. 근저당이 없는 집이라면 전세가율과 같습니다. 70% 이하로 낮을수록 요율이 낮아지고, 80%를 초과하면 가장 높은 요율이 적용됩니다.",
  },
  {
    q: "누구나 가입할 수 있나요?",
    a: "보증금이 수도권 7억원·그 외 지역 5억원 이하이고, 주택가격의 90%(담보인정비율)에서 선순위 채권을 뺀 금액 이내여야 합니다. 전입신고·확정일자 등 대항요건도 갖춰야 하며, 사회배려계층은 보증료가 최대 60%까지 할인됩니다.",
  },
] as const;

export const LOAN_JEONSE_GUARANTEE_GUIDE: GuideData = {
  title: "전세보증금반환보증(HUG) 보증료 가이드 (2026년)",
  intro:
    "전세보증금반환보증은 임대인이 보증금을 돌려주지 못할 때 HUG가 대신 돌려주고 임대인에게 청구하는 제도로, 깡통전세·역전세 위험에 대한 가장 확실한 안전장치입니다. 보증료는 보증금액에 연 0.097%~0.211%의 요율을 보증기간만큼 곱해 산정하며, 2025년 3월 개편으로 부채비율이 낮은 안전한 계약일수록 요율이 낮아졌습니다.",
  sections: [
    {
      h2: "보증료를 결정하는 세 가지 축",
      body: "첫째는 보증기간(1년 이내부터 5년 초과까지 4구간), 둘째는 주택유형(아파트가 그 외 주택보다 낮음), 셋째는 부채비율 구간(70% 이하·80% 이하·80% 초과)입니다. 예를 들어 아파트·부채비율 70% 이하·2년 계약이면 연 0.102%가 적용되어 보증금 3억원 기준 2년 총 보증료가 약 61만원 수준이지만, 빌라·부채비율 80% 초과라면 연 0.184%로 같은 조건에서 약 110만원까지 올라갑니다.",
    },
    {
      h2: "가입 요건과 한도",
      body: "보증금이 수도권 7억원·그 외 지역 5억원 이하여야 하고, 주택가격의 90%(담보인정비율)에서 선순위 채권을 뺀 금액 이내여야 합니다. 이 요건을 넘는 계약은 보증 가입 자체가 불가능하므로, 계약 전에 깡통전세 진단으로 가입 가능 여부를 먼저 확인하는 순서가 안전합니다. 신청은 전세계약 기간의 절반이 지나기 전까지 가능합니다.",
    },
    {
      h2: "보증료 아끼는 법",
      body: "저소득·다자녀·장애인·고령자 등 사회배려계층은 최대 60%, 전자계약·비대면 신청·모범납세자 등은 최대 10% 할인을 받을 수 있습니다. 또 근저당이 있는 집을 피하거나 보증금을 낮춰 부채비율 구간을 한 단계 내리면 요율 자체가 내려갑니다. 연 십수만 원의 보증료가 아깝게 느껴질 수 있지만, 수억 원의 보증금을 지키는 비용으로는 가장 저렴한 보험입니다.",
    },
  ],
  faqs: [
    {
      q: "HF·SGI 보증과는 뭐가 다른가요?",
      a: "HF(주택금융공사) 전세지킴보증은 HF 전세자금보증 이용자 중심이고, SGI서울보증은 아파트 보증금 한도 제한이 없어 고액 전세에 적합합니다. 요율과 요건이 기관마다 다르므로 자신의 조건에서 가입 가능한 기관을 비교해 보세요.",
    },
    {
      q: "이미 계약했는데 지금 가입할 수 있나요?",
      a: "신규 계약은 계약 기간의 절반이 지나기 전까지, 갱신 계약은 갱신 계약서상 기간의 절반이 지나기 전까지 신청할 수 있습니다. 기한을 넘기면 가입이 거절되므로 서두르는 것이 좋습니다.",
    },
  ],
  disclaimer:
    "※ 본 계산은 HUG 공표 요율표 기준 참고용 추정이며, 실제 보증료·가입 가능 여부는 주택가격 산정 방식, 선순위 채권, 대항요건, 심사 결과에 따라 달라집니다. 정확한 금액은 HUG 안심전세앱 또는 영업점에서 확인하세요.",
};
