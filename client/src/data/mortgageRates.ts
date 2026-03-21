import type { MortgageCompareInput } from "@/lib/validators";

export const MORTGAGE_DATA_UPDATED = "2026-03-19";

export interface BankMortgageRate {
  id: string;
  bank: string;
  fixedMin: number;
  fixedMax: number;
  variableMin: number;
  variableMax: number;
}

// 2026년 3월 기준 주요 시중은행 주택담보대출 금리 (한국은행 금융통계·각 은행 홈페이지)
export const BANK_MORTGAGE_RATES: readonly BankMortgageRate[] = [
  { id: "kb", bank: "KB국민", fixedMin: 3.33, fixedMax: 4.85, variableMin: 3.76, variableMax: 5.15 },
  { id: "shinhan", bank: "신한", fixedMin: 3.40, fixedMax: 4.90, variableMin: 3.70, variableMax: 5.20 },
  { id: "hana", bank: "하나", fixedMin: 3.38, fixedMax: 4.88, variableMin: 3.72, variableMax: 5.18 },
  { id: "woori", bank: "우리", fixedMin: 3.45, fixedMax: 5.00, variableMin: 3.80, variableMax: 5.30 },
  { id: "nh", bank: "NH농협", fixedMin: 3.30, fixedMax: 4.80, variableMin: 3.68, variableMax: 5.10 },
  { id: "ibk", bank: "IBK기업", fixedMin: 3.50, fixedMax: 5.10, variableMin: 3.85, variableMax: 5.25 },
  { id: "sc", bank: "SC제일", fixedMin: 3.55, fixedMax: 5.15, variableMin: 3.90, variableMax: 5.35 },
  { id: "kdb", bank: "KDB산업", fixedMin: 3.25, fixedMax: 4.70, variableMin: 3.60, variableMax: 5.00 },
] as const;

export const MORTGAGE_AMOUNT_PRESETS = [
  100_000_000, 200_000_000, 300_000_000, 400_000_000, 500_000_000,
] as const;

export const mortgageComparePresets: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  input: MortgageCompareInput;
}> = [
  {
    key: "apt-3",
    label: "아파트 3억",
    description: "30년 만기 원리금균등 기준",
    input: { loanAmount: 300_000_000, termMonths: 360, repaymentMethod: "annuity" },
  },
  {
    key: "apt-5",
    label: "아파트 5억",
    description: "30년 만기 원리금균등 기준",
    input: { loanAmount: 500_000_000, termMonths: 360, repaymentMethod: "annuity" },
  },
  {
    key: "short-2",
    label: "단기 2억",
    description: "10년 만기 원금균등 기준",
    input: { loanAmount: 200_000_000, termMonths: 120, repaymentMethod: "equalPrincipal" },
  },
];

export const MORTGAGE_COMPARE_SOURCES = [
  { name: "한국은행 경제통계시스템", url: "https://ecos.bok.or.kr/", basis: "주택담보대출 금리 동향" },
  { name: "금융감독원 금융상품통합비교공시", url: "https://finlife.fss.or.kr/", basis: "은행별 주담대 금리 비교" },
];

export const MORTGAGE_COMPARE_FAQS = [
  {
    q: "고정금리와 변동금리 중 어떤 것이 유리한가요?",
    a: "향후 금리 인상이 예상되면 고정금리가 유리하고, 금리 인하 기대가 크면 변동금리가 유리합니다. 대출 기간이 길수록 고정금리의 안정성이 중요해집니다.",
  },
  {
    q: "은행별 금리 차이가 나는 이유는 무엇인가요?",
    a: "은행마다 자금 조달 비용(COFIX, 금융채 등), 우대금리 조건, 리스크 관리 정책이 다르기 때문입니다. 같은 은행이라도 급여이체, 적금 가입 등 우대조건에 따라 최종 금리가 달라집니다.",
  },
  {
    q: "표시된 금리와 실제 대출 금리가 다를 수 있나요?",
    a: "네, 이 계산기는 각 은행의 공시 금리 범위를 기준으로 합니다. 실제 금리는 개인 신용등급, 담보 가치, 소득, 우대조건 충족 여부에 따라 달라집니다.",
  },
  {
    q: "주택담보대출 중도상환수수료는 얼마인가요?",
    a: "대부분 은행은 대출 후 3년 이내 조기상환 시 1.2~1.5% 내외의 중도상환수수료를 부과합니다. 3년 이후에는 면제가 일반적이며, 매년 대출잔액의 10~50%를 수수료 없이 상환 가능한 은행도 있습니다.",
  },
];
