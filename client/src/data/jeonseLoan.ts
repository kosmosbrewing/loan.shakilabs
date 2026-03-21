import type { JeonseLoanInput } from "@/lib/validators";

export const JEONSE_LOAN_UPDATED = "2026-03-19";

export type JeonseLoanProduct = "youth" | "buttimok" | "general";

export interface JeonseLoanProductInfo {
  id: JeonseLoanProduct;
  name: string;
  description: string;
  minRate: number;
  maxRate: number;
  maxAmount: number;
  maxTermMonths: number;
}

// 2026년 기준 주요 전세대출 상품 금리 (주택도시기금·금융위원회·각 은행)
export const JEONSE_LOAN_PRODUCTS: readonly JeonseLoanProductInfo[] = [
  {
    id: "youth",
    name: "청년 전용 버팀목",
    description: "만 19~34세, 연소득 5천만원 이하, 전세보증금 3억원 이내",
    minRate: 1.5,
    maxRate: 2.1,
    maxAmount: 200_000_000,
    maxTermMonths: 120,
  },
  {
    id: "buttimok",
    name: "버팀목 전세대출",
    description: "무주택 세대주, 연소득 6천만원 이하, 전세보증금 5억원 이내",
    minRate: 2.1,
    maxRate: 2.9,
    maxAmount: 200_000_000,
    maxTermMonths: 120,
  },
  {
    id: "general",
    name: "일반 전세대출 (시중은행)",
    description: "별도 소득·나이 제한 없음, 은행별 금리 상이",
    minRate: 3.5,
    maxRate: 5.0,
    maxAmount: 500_000_000,
    maxTermMonths: 360,
  },
] as const;

export const JEONSE_DEPOSIT_PRESETS = [
  50_000_000, 100_000_000, 200_000_000, 300_000_000, 400_000_000,
] as const;

export const jeonseLoanPresets: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  input: JeonseLoanInput;
}> = [
  {
    key: "youth-1",
    label: "청년 1억",
    description: "청년전용 버팀목 금리 적용",
    input: { depositAmount: 100_000_000, annualRate: 1.8, termMonths: 120, isInterestOnly: true },
  },
  {
    key: "general-3",
    label: "일반 3억",
    description: "시중은행 전세대출 기준",
    input: { depositAmount: 300_000_000, annualRate: 4.2, termMonths: 24, isInterestOnly: true },
  },
  {
    key: "repay-2",
    label: "원리금상환 2억",
    description: "원리금균등 상환 시나리오",
    input: { depositAmount: 200_000_000, annualRate: 3.5, termMonths: 120, isInterestOnly: false },
  },
];

export const JEONSE_LOAN_SOURCES = [
  { name: "주택도시기금", url: "https://nhuf.molit.go.kr/", basis: "버팀목·청년전용 전세대출 금리 고시" },
  { name: "금융감독원", url: "https://finlife.fss.or.kr/", basis: "전세대출 상품 비교" },
];

export const JEONSE_LOAN_FAQS = [
  {
    q: "전세대출 이자만 내는 것과 원리금 상환은 어떻게 다른가요?",
    a: "이자만 납부(거치식)는 매달 이자만 내고 만기에 원금을 일시상환합니다. 원리금 상환은 매달 원금+이자를 함께 갚으므로 총이자가 적지만 월 부담이 큽니다.",
  },
  {
    q: "청년 전용 버팀목 대출 조건은 무엇인가요?",
    a: "만 19~34세 무주택 세대주, 연소득 5천만원 이하(신혼부부는 합산 6천만원), 전세보증금 3억원 이내가 기본 조건이며, 연 1.5~2.1%의 저금리가 적용됩니다.",
  },
  {
    q: "전세대출 금리는 고정인가요, 변동인가요?",
    a: "정부 지원 상품(버팀목)은 대출기간 중 고정금리가 일반적이고, 시중은행 전세대출은 변동금리(COFIX 연동)가 많습니다. 변동금리는 6개월 또는 1년마다 금리가 조정됩니다.",
  },
  {
    q: "전세대출 보증보험료는 얼마인가요?",
    a: "HUG(주택도시보증공사), SGI서울보증, HF(한국주택금융공사) 보증이 필요하며 보증료는 대출금액의 0.1~0.3% 수준입니다. 이 계산기에서는 보증료를 별도 반영하지 않습니다.",
  },
];
