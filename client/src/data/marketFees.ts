// 2025.10 기준 오픈마켓 4개 수수료 데이터
// 마켓별 수수료 구조가 다르므로 타입을 분리

export type CategoryKey = "clothing" | "food" | "electronics" | "living" | "beauty";
export type SmartStoreTier = "micro" | "small1" | "small2" | "small3" | "normal";
export type SmartStoreSource = "naverShopping" | "marketingLink";
export type CoupangMode = "marketplace" | "rocketGrowth";
export type FulfillmentSize = "xs" | "small" | "medium" | "large" | "xl" | "xxl";

export type MarketKey = "smartstore" | "coupang" | "elevenst" | "gmarket";
export type OwnStoreKey = "own_tosspay" | "own_naverorder" | "own_naverpay" | "own_kakaopay" | "own_payco";
export type CompareKey = MarketKey | OwnStoreKey;
export type OwnStoreRateMap = Partial<Record<SmartStoreTier, number>>;
export const VAT_MULTIPLIER = 1.1;

export interface ChannelMeta {
  key: CompareKey;
  name: string;
  shortName: string;
  color: string;
}

// 마켓 메타 정보
export const MARKET_META: Record<MarketKey, ChannelMeta> = {
  smartstore: { key: "smartstore", name: "스마트스토어", shortName: "네쇼", color: "#03C75A" },
  coupang: { key: "coupang", name: "쿠팡", shortName: "쿠팡", color: "#E31937" },
  elevenst: { key: "elevenst", name: "11번가", shortName: "11번", color: "#FF6B00" },
  gmarket: { key: "gmarket", name: "G마켓/옥션", shortName: "G마켓", color: "#00B050" },
};

export const MARKET_ORDER: MarketKey[] = ["smartstore", "coupang", "elevenst", "gmarket"];

export const OWN_STORE_RATES: Record<OwnStoreKey, OwnStoreRateMap> = {
  // 공개 요금표는 일반 3.4%(VAT 별도)만 제공되고, 영중소 우대는 관리자 화면에서 별도 반영됨.
  own_tosspay: { normal: 0.034 },
  // 네이버페이 주문형 수수료 (매출등급별, VAT 포함) — 스마트스토어 주문관리 수수료와 동일 체계
  own_naverorder: {
    micro: 0.01947,
    small1: 0.02563,
    small2: 0.02728,
    small3: 0.03003,
    normal: 0.0363,
  },
  // 네이버페이 결제형 카드 수수료 (매출액 구간별, VAT 포함)
  own_naverpay: {
    micro: 0.0099,
    small1: 0.01595,
    small2: 0.0176,
    small3: 0.02035,
    normal: 0.0275,
  },
  // 카카오페이 온라인 쇼핑몰 단독 계약 기준 (매출액 구간별, VAT 별도)
  own_kakaopay: {
    micro: 0.009,
    small1: 0.0145,
    small2: 0.0215,
    small3: 0.0235,
    normal: 0.032,
  },
  // PAYCO는 공개 범위(1.8%~3.4%, VAT 별도)만 확인돼 상세 단계는 문의가 필요하다.
  // 계산은 공개 하한/상한만 반영하고, 중간 구간은 보수적으로 상한 fallback을 사용한다.
  own_payco: {
    micro: 0.018,
    normal: 0.034,
  },
};

export const OWN_STORE_META: Record<OwnStoreKey, ChannelMeta> = {
  own_tosspay: { key: "own_tosspay", name: "자사몰 · 토스페이먼츠", shortName: "토스PG", color: "#0064FF" },
  own_naverorder: { key: "own_naverorder", name: "자사몰 · 네이버페이 주문형", shortName: "N주문", color: "#03C75A" },
  own_naverpay: { key: "own_naverpay", name: "자사몰 · 네이버페이 결제형", shortName: "N결제", color: "#03C75A" },
  own_kakaopay: { key: "own_kakaopay", name: "자사몰 · 카카오페이", shortName: "카카오", color: "#FFCD00" },
  own_payco: { key: "own_payco", name: "자사몰 · 페이코", shortName: "PAYCO", color: "#FA2828" },
};

export const OWN_STORE_ORDER: OwnStoreKey[] = ["own_tosspay", "own_naverorder", "own_naverpay", "own_kakaopay", "own_payco"];

const SMARTSTORE_TIER_ORDER: SmartStoreTier[] = ["micro", "small1", "small2", "small3", "normal"];
const OWN_STORE_VAT_EXCLUSIVE_KEYS: OwnStoreKey[] = ["own_tosspay", "own_kakaopay", "own_payco"];

export function resolveOwnStoreRate(gatewayKey: OwnStoreKey, tier: SmartStoreTier): number {
  const rates = OWN_STORE_RATES[gatewayKey];
  const requestedIndex = SMARTSTORE_TIER_ORDER.indexOf(tier);

  for (let index = requestedIndex; index < SMARTSTORE_TIER_ORDER.length; index += 1) {
    const candidate = rates[SMARTSTORE_TIER_ORDER[index]];
    if (candidate != null) return candidate;
  }

  for (let index = requestedIndex - 1; index >= 0; index -= 1) {
    const candidate = rates[SMARTSTORE_TIER_ORDER[index]];
    if (candidate != null) return candidate;
  }

  throw new Error(`Missing own store rate config for ${gatewayKey}`);
}

export function isOwnStoreVatExclusive(gatewayKey: OwnStoreKey): boolean {
  return OWN_STORE_VAT_EXCLUSIVE_KEYS.includes(gatewayKey);
}

export function resolveOwnStoreEffectiveRate(gatewayKey: OwnStoreKey, tier: SmartStoreTier): number {
  const rate = resolveOwnStoreRate(gatewayKey, tier);
  return isOwnStoreVatExclusive(gatewayKey) ? rate * VAT_MULTIPLIER : rate;
}

export const ALL_CHANNEL_META: Record<CompareKey, ChannelMeta> = {
  ...MARKET_META,
  ...OWN_STORE_META,
};

// 스마트스토어 수수료 (2025.06 개편 반영)
export const SMARTSTORE = {
  // 주문관리 수수료 (매출등급별, VAT 포함, 2025.10.01 인하 반영)
  orderFee: {
    micro: 0.01947,   // 영세 (연매출 3억 이하)
    small1: 0.02563,  // 중소1 (연매출 3~5억)
    small2: 0.02728,  // 중소2 (연매출 5~10억)
    small3: 0.03003,  // 중소3 (연매출 10~30억)
    normal: 0.0363,   // 일반 (연매출 30억 초과)
  } as Record<SmartStoreTier, number>,

  // 판매 수수료 (VAT 별도 → 실제 부담은 ×1.1)
  saleFee: {
    naverShopping: 0.0273,   // 네이버쇼핑 유입
    marketingLink: 0.0091,   // 마케팅 링크 유입 (SNS/블로그)
  } as Record<SmartStoreSource, number>,

  // 배송비에 주문관리 수수료만 적용 (판매 수수료 미적용)
  shippingFeeApplied: "orderFee" as const,
} as const;

// 스마트스토어 매출등급 구간 (연매출 기준)
export const SMARTSTORE_TIER_THRESHOLDS: { tier: SmartStoreTier; maxRevenue: number }[] = [
  { tier: "micro",  maxRevenue: 300_000_000 },   // 3억 이하
  { tier: "small1", maxRevenue: 500_000_000 },   // 5억 이하
  { tier: "small2", maxRevenue: 1_000_000_000 }, // 10억 이하
  { tier: "small3", maxRevenue: 3_000_000_000 }, // 30억 이하
  { tier: "normal", maxRevenue: Infinity },       // 30억 초과
];

// 스마트스토어 매출등급 라벨
export const SMARTSTORE_TIER_LABELS: Record<SmartStoreTier, string> = {
  micro: "영세 (3억 이하)",
  small1: "중소1 (3~5억)",
  small2: "중소2 (5~10억)",
  small3: "중소3 (10~30억)",
  normal: "일반 (30억 초과)",
};

// 스마트스토어 유입 경로 라벨
export const SMARTSTORE_SOURCE_LABELS: Record<SmartStoreSource, string> = {
  naverShopping: "네이버쇼핑",
  marketingLink: "마케팅링크",
};

// 쿠팡 수수료
export const COUPANG = {
  categoryFee: {
    clothing: 0.105,
    food: 0.106,
    electronics: 0.078,
    living: 0.078,
    beauty: 0.096,
  } as Record<CategoryKey, number>,

  // 배송비 수수료율 (유료배송 시)
  shippingFeeRate: 0.033,

  // 로켓그로스 물류비 (건당 입고+출고 합산, 2025.01.06 개편)
  fulfillmentFee: {
    xs: 700,       // 초소형 (≤20cm, <500g)    입고 100 + 출고 600
    small: 950,    // 소형   (≤30cm, <1kg)     입고 150 + 출고 800
    medium: 1400,  // 중형   (≤40cm, <3kg)     입고 200 + 출고 1200
    large: 2100,   // 대형   (≤60cm, <6kg)     입고 300 + 출고 1800
    xl: 3000,      // 특대형 (≤80cm, <10kg)    입고 500 + 출고 2500
    xxl: 4300,     // 초대형 (>80cm, ≥10kg)    입고 800 + 출고 3500
  } as Record<FulfillmentSize, number>,
} as const;

// 쿠팡 판매 방식 라벨
export const COUPANG_MODE_LABELS: Record<CoupangMode, string> = {
  marketplace: "마켓플레이스",
  rocketGrowth: "로켓그로스",
};

// 쿠팡 물류 크기 라벨
export const FULFILLMENT_SIZE_LABELS: Record<FulfillmentSize, string> = {
  xs: "초소형 (20cm·500g 이하)",
  small: "소형 (30cm·1kg 이하)",
  medium: "중형 (40cm·3kg 이하)",
  large: "대형 (60cm·6kg 이하)",
  xl: "특대형 (80cm·10kg 이하)",
  xxl: "초대형 (80cm 초과·10kg 초과)",
};

// 11번가 수수료
export const ELEVENST = {
  categoryFee: {
    clothing: 0.13,
    food: 0.13,
    electronics: 0.10,
    living: 0.13,
    beauty: 0.13,
  } as Record<CategoryKey, number>,

  // 배송비 수수료율 (유료배송 시)
  shippingFeeRate: 0.033,
} as const;

// G마켓/옥션 수수료 (대표값 기준 합산 — 세부 카테고리는 G마켓·옥션 별도 확인 필요)
export const GMARKET = {
  categoryFee: {
    clothing: 0.13,
    food: 0.13,
    electronics: 0.09,
    living: 0.13,
    beauty: 0.13,
  } as Record<CategoryKey, number>,

  // 배송비 수수료율 (유료배송 시)
  shippingFeeRate: 0.033,
} as const;

// 마켓별 월정액(서버 이용료) — FAQ·비교표에서 참조
export const MONTHLY_FEES: Partial<Record<MarketKey, { amount: number; threshold: string }>> = {
  coupang: { amount: 55_000, threshold: "월 판매 100만원 초과" },
  elevenst: { amount: 77_000, threshold: "월 구매확정 500만원 초과" },
  gmarket: { amount: 55_000, threshold: "월 판매 500만원 초과" },
};

// 수수료 데이터 최종 업데이트 날짜 (2025.10 인하 반영, 2026.03 재검증 — 변동 없음)
export const FEE_DATA_UPDATED = "2025.10";
export const FEE_DATA_VERIFIED = "2026.03";
