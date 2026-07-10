import type { JeonseLoanInput } from "@/lib/validators";

export const JEONSE_LOAN_UPDATED = "2026-07-10";

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
    minRate: 2.2,
    maxRate: 3.3,
    maxAmount: 150_000_000,
    maxTermMonths: 120,
  },
  {
    id: "buttimok",
    name: "버팀목 전세대출",
    description: "무주택 세대주, 연소득 5천만원 이하, 일반가구 수도권 보증금 3억원 이내",
    minRate: 2.5,
    maxRate: 3.5,
    maxAmount: 120_000_000,
    maxTermMonths: 120,
  },
  {
    id: "general",
    name: "일반 전세대출 (시중은행)",
    description: "사용자 비교용 금리 가정, 실제 한도·금리는 금융상품별 확인",
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
    input: { depositAmount: 100_000_000, annualRate: 2.5, termMonths: 120, isInterestOnly: true },
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
  { name: "주택도시기금", url: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020301.jsp", basis: "청년전용 버팀목 금리·한도" },
  { name: "주택도시기금", url: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020101.jsp", basis: "일반 버팀목 금리·한도" },
  { name: "금융감독원", url: "https://finlife.fss.or.kr/", basis: "전세대출 상품 비교" },
];

export const JEONSE_LOAN_FAQS = [
  {
    q: "전세대출 이자만 내는 것과 원리금 상환은 어떻게 다른가요?",
    a: "이자만 납부(거치식)는 매달 이자만 내고 만기에 원금을 일시상환합니다. 원리금 상환은 매달 원금+이자를 함께 갚으므로 총이자가 적지만 월 부담이 큽니다.",
  },
  {
    q: "청년 전용 버팀목 대출 조건은 무엇인가요?",
    a: "만 19~34세 무주택 세대주, 부부합산 연소득 5천만원 이하, 순자산 3.45억원 이하가 기본 조건입니다. 금리는 연 2.2~3.3%, 한도는 최대 1.5억원이며 만 25세 미만 단독세대주는 최대 1.2억원입니다.",
  },
  {
    q: "전세대출 금리는 고정인가요, 변동인가요?",
    a: "주택도시기금 버팀목 상품은 국토교통부 고시에 따른 변동금리이며, 시중은행 상품도 COFIX 등에 연동된 변동금리가 많습니다. 상품별 금리 유형과 조정 주기를 약정 전에 확인해야 합니다.",
  },
  {
    q: "전세대출 보증보험료는 얼마인가요?",
    a: "HUG(주택도시보증공사), SGI서울보증, HF(한국주택금융공사) 보증이 필요하며 보증료는 대출금액의 0.1~0.3% 수준입니다. 이 계산기에서는 보증료를 별도 반영하지 않습니다.",
  },
];
