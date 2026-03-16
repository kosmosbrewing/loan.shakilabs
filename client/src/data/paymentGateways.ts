import { VAT_MULTIPLIER } from "./marketFees";

export type PaymentGatewayKey =
  | "tosspayments"
  | "naverOrder"
  | "naverPayment"
  | "kakaopay"
  | "payco";

export interface CompareCell {
  core: string;
  tooltip?: string;
  condition?: string;
}

// 등급별 수수료 (힌트 테이블 렌더링용)
export interface CardFeeTier {
  tier: string;   // "영세", "중소1" 등
  rate: string;   // "0.99%" 등
}

export interface PaymentGatewayMeta {
  key: PaymentGatewayKey;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  sourceName: string;
  sourceUrl: string;
  microBusinessRate: number;
  setupFee: CompareCell;
  annualFee: CompareCell;
  cardFee: CompareCell;
  cardFeeTiers?: { tiers: CardFeeTier[]; vatNote: string };
  settlementCycle: CompareCell;
  note: CompareCell;
  noteFeatures?: { label: string; value: string }[];
}

// 네이버페이 결제형 vs 주문형 비교 (비고 힌트용)
export interface NaverPayCompareRow {
  label: string;
  payment: string;
  order: string;
}

export const NAVERPAY_COMPARISON: NaverPayCompareRow[] = [
  { label: "핵심 개념", payment: "자사몰 결제 수단 API 연동", order: "네이버 주문/배송 시스템 전체 이용" },
  { label: "UI/UX", payment: "자사몰 내 결제 완료", order: "네이버 주문서로 이동" },
  { label: "주문 관리", payment: "직접 DB·배송/CS 구현", order: "네이버페이센터 통합 관리" },
  { label: "단독 사용", payment: "불가 (PG 병행 필수)", order: "가능" },
  { label: "개발 용이성", payment: "높음 (JSON API, JS SDK)", order: "낮음 (XML API, Button SDK)" },
];

export const PAYMENT_DATA_UPDATED: string = "2026.03";
export const PAYMENT_DATA_VERIFIED: string = "2026.03";
const PAYMENT_GATEWAY_VAT_EXCLUSIVE_KEYS: PaymentGatewayKey[] = ["tosspayments", "kakaopay", "payco"];

export const PAYMENT_GATEWAYS: PaymentGatewayMeta[] = [
  {
    key: "tosspayments",
    name: "토스페이먼츠 (PG)",
    shortName: "토스PG",
    badge: "PG 인프라",
    color: "#0064FF",
    sourceName: "토스페이먼츠 수수료 안내",
    sourceUrl: "https://www.tosspayments.com/about/fee",
    microBusinessRate: 3.4,
    setupFee: {
      core: "22만원(1회)",
    },
    annualFee: {
      core: "11만원(매년)",
    },
    cardFee: {
      core: "공개 일반 3.4%",
    },
    cardFeeTiers: {
      tiers: [
        { tier: "일반", rate: "3.4%" },
      ],
      vatNote: "VAT 별도 · 영중소 우대는 관리자 화면에서 별도 반영",
    },
    settlementCycle: {
      core: "평균 5일 이내",
    },
    note: {
      core: "PG 전체 인프라",
    },
    noteFeatures: [
      { label: "결제 수단", value: "카드, 계좌이체, 가상계좌, 간편결제 등" },
      { label: "연동 방식", value: "REST API, JavaScript SDK" },
      { label: "고정 비용", value: "설정비 22만원 + 연 11만원" },
      { label: "단독 사용", value: "가능 (자체 PG 인프라)" },
      { label: "특징", value: "결제창·정산·위험관리 풀스택 제공" },
    ],
  },
  {
    key: "naverOrder",
    name: "네이버페이 주문형",
    shortName: "N주문",
    badge: "네이버쇼핑 연동",
    color: "#03C75A",
    sourceName: "주문형 가맹점 Npay 수수료 FAQ",
    sourceUrl: "https://help.admin.pay.naver.com/faq/content.help?faqId=1782",
    microBusinessRate: 1.947,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
    },
    cardFee: {
      core: "영세 1.947%~",
    },
    cardFeeTiers: {
      tiers: [
        { tier: "영세", rate: "1.947%" },
        { tier: "중소1", rate: "2.563%" },
        { tier: "중소2", rate: "2.728%" },
        { tier: "중소3", rate: "3.003%" },
        { tier: "일반", rate: "3.63%" },
      ],
      vatNote: "VAT 포함",
    },
    settlementCycle: {
      core: "주문형 정책 확인",
      tooltip: "정산 시점은 네이버페이 주문형 가맹 정책을 따릅니다.",
    },
    note: {
      core: "주문~배송 통합 관리",
    },
    noteFeatures: [
      { label: "결제 수단", value: "네이버페이 (카드, 계좌, 포인트)" },
      { label: "연동 방식", value: "XML API, Server-side Button SDK" },
      { label: "고정 비용", value: "없음" },
      { label: "특징", value: "네이버쇼핑 노출·주문·배송·CS 통합" },
    ],
  },
  {
    key: "naverPayment",
    name: "네이버페이 결제형",
    shortName: "N결제",
    badge: "자사몰 결제 연동",
    color: "#03C75A",
    sourceName: "결제형 Npay 수수료 FAQ",
    sourceUrl: "https://help.admin.pay.naver.com/faq/content.help?faqId=6522",
    microBusinessRate: 0.99,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
    },
    cardFee: {
      core: "영세 0.99%~",
    },
    cardFeeTiers: {
      tiers: [
        { tier: "영세", rate: "0.99%" },
        { tier: "중소1", rate: "1.595%" },
        { tier: "중소2", rate: "1.76%" },
        { tier: "중소3", rate: "2.035%" },
        { tier: "일반", rate: "2.75%" },
      ],
      vatNote: "VAT 포함",
    },
    settlementCycle: {
      core: "결제형 정책 확인",
      tooltip: "정산 시점은 네이버페이 결제형 연동 정책을 따릅니다.",
    },
    note: {
      core: "자사몰 결제 전용",
    },
    noteFeatures: [
      { label: "결제 수단", value: "네이버페이 (카드, 계좌, 포인트)" },
      { label: "연동 방식", value: "JSON API, Client-side JS SDK" },
      { label: "고정 비용", value: "없음" },
      { label: "특징", value: "자사몰에 결제 모듈만 연동" },
    ],
  },
  {
    key: "kakaopay",
    name: "카카오페이",
    shortName: "카카오",
    badge: "간편결제 중심",
    color: "#FFCD00",
    sourceName: "카카오페이 독립몰 가맹점 안내",
    sourceUrl: "https://partner.kakaopay.com/partner/online/application-information?mall_type=standalone",
    microBusinessRate: 0.9,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
    },
    cardFee: {
      core: "영세 0.9%~",
    },
    cardFeeTiers: {
      tiers: [
        { tier: "영세", rate: "0.9%" },
        { tier: "중소1", rate: "1.45%" },
        { tier: "중소2", rate: "2.15%" },
        { tier: "중소3", rate: "2.35%" },
        { tier: "일반", rate: "3.2%" },
      ],
      vatNote: "VAT 별도 · 카카오페이머니는 별도 체계",
    },
    settlementCycle: {
      core: "연동 PG 정책",
      tooltip: "정산 시점은 함께 연동한 PG의 정산 구조에 따라 달라집니다.",
    },
    note: {
      core: "PG 연동 비용 확인",
    },
    noteFeatures: [
      { label: "결제 수단", value: "카카오페이 (카드, 머니, 포인트)" },
      { label: "연동 방식", value: "REST API (Ready/Approve) · 단독 또는 PG 경유" },
      { label: "고정 비용", value: "없음" },
      { label: "단독 사용", value: "가능 (카카오페이 직접 가맹)" },
      { label: "특징", value: "카카오톡 기반 간편결제 · 높은 사용자 접근성" },
      { label: "주의", value: "PG 경유 시 PG 수수료 별도 발생 가능" },
    ],
  },
  {
    key: "payco",
    name: "페이코",
    shortName: "PAYCO",
    badge: "포인트 결제 특화",
    color: "#FA2828",
    sourceName: "PAYCO 파트너센터",
    sourceUrl: "https://partner.payco.com/",
    microBusinessRate: 1.8,
    setupFee: {
      core: "무료",
    },
    annualFee: {
      core: "무료",
    },
    cardFee: {
      core: "영세 1.8%~",
    },
    cardFeeTiers: {
      tiers: [
        { tier: "영세", rate: "1.8%" },
        { tier: "일반", rate: "3.4%" },
      ],
      vatNote: "VAT 별도 · 중간 등급 및 공식 공개 요금표는 PAYCO 문의 필요",
    },
    settlementCycle: {
      core: "제휴 정책 확인",
      tooltip: "PAYCO 가맹·제휴 구조에 따라 정산 주기가 달라질 수 있습니다.",
    },
    note: {
      core: "제휴·포인트 결제 강점",
    },
    noteFeatures: [
      { label: "결제 수단", value: "PAYCO 포인트, 카드, 계좌이체" },
      { label: "연동 방식", value: "PAYCO API · 직접 제휴 또는 PG 경유" },
      { label: "고정 비용", value: "없음" },
      { label: "단독 사용", value: "가능 (PAYCO 직접 제휴)" },
      { label: "특징", value: "포인트 적립·리워드 마케팅 특화" },
      { label: "주의", value: "중간 등급 및 공식 공개 요금표 비공개, 개별 문의 필요" },
    ],
  },
];

export function isPaymentGatewayVatExclusive(key: PaymentGatewayKey): boolean {
  return PAYMENT_GATEWAY_VAT_EXCLUSIVE_KEYS.includes(key);
}

export function getPaymentGatewayEffectiveRate(gateway: PaymentGatewayMeta): number {
  return isPaymentGatewayVatExclusive(gateway.key) ? gateway.microBusinessRate * VAT_MULTIPLIER : gateway.microBusinessRate;
}

export const PAYMENT_SOURCES = PAYMENT_GATEWAYS.map(({ name, sourceName, sourceUrl }) => ({
  name,
  url: sourceUrl,
  basis: sourceName,
}));
