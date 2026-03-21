// LTV / DTI / DSR 규제 한도 — 2025.10.15 대책 반영
// 출처: 금융위원회, 한국은행

export const LTV_DTI_UPDATED = "2026-03-19";

export type RegionType = "speculative" | "nonRegulated";

export const REGION_LABELS: Record<RegionType, string> = {
  speculative: "규제지역 (서울·경기 12곳)",
  nonRegulated: "비규제지역",
};

/** LTV 한도 (무주택자 기준) */
export const LTV_LIMITS: Record<RegionType, { general: number; firstTime: number; lowIncome: number }> = {
  speculative: { general: 0.4, firstTime: 0.7, lowIncome: 0.6 },
  nonRegulated: { general: 0.7, firstTime: 0.8, lowIncome: 0.7 },
};

/** DTI 한도 */
export const DTI_LIMITS: Record<RegionType, number> = {
  speculative: 0.4,
  nonRegulated: 0.6,
};

/** DSR 한도 (은행권) */
export const DSR_LIMIT_BANK = 0.4;
export const DSR_LIMIT_NON_BANK = 0.5;

/** 주택 시가별 절대 대출 한도 (규제지역) */
export const ABSOLUTE_LIMITS: readonly { maxPrice: number; label: string; limit: number }[] = [
  { maxPrice: 1_500_000_000, label: "15억원 이하", limit: 600_000_000 },
  { maxPrice: 2_500_000_000, label: "15~25억원", limit: 400_000_000 },
  { maxPrice: Number.POSITIVE_INFINITY, label: "25억원 초과", limit: 200_000_000 },
];

/** 스트레스 DSR 가산금리 (3단계, 2025.07~) */
export const STRESS_RATES: Record<RegionType, number> = {
  speculative: 3.0,
  nonRegulated: 1.5,
};

export type BorrowerCategory = "general" | "firstTime" | "lowIncome";

export const BORROWER_LABELS: Record<BorrowerCategory, string> = {
  general: "일반 무주택자",
  firstTime: "생애최초 구입자",
  lowIncome: "서민 실수요자",
};

export const LTV_DTI_AMOUNTS = [30000, 50000, 70000, 100000, 150000];

export const LTV_DTI_PRESETS: readonly { key: string; label: string; description: string }[] = [
  { key: "apt-10", label: "서울 10억 아파트", description: "규제지역, 연소득 8천만, 30년" },
  { key: "apt-5", label: "수도권 5억", description: "규제지역, 연소득 6천만, 30년" },
  { key: "local-3", label: "지방 3억", description: "비규제, 연소득 5천만, 20년" },
];

export const LTV_DTI_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "LTV, DTI, DSR은 각각 무엇인가요?",
    a: "LTV(담보인정비율)는 주택 가격 대비 대출 비율, DTI(총부채상환비율)는 연소득 대비 연간 원리금+이자 상환 비율, DSR(총부채원리금상환비율)은 모든 대출의 원리금 상환 비율입니다. 세 가지 중 가장 낮은 금액이 최종 한도가 됩니다.",
  },
  {
    q: "스트레스 DSR이란 무엇인가요?",
    a: "금리 상승 위험에 대비하여 실제 금리보다 높은 가산금리(스트레스 금리)를 적용해 DSR을 산정하는 제도입니다. 2025년 7월부터 3단계가 시행되어 규제지역 주담대는 3.0%p가 가산됩니다.",
  },
  {
    q: "생애최초 주택구입자는 어떤 혜택이 있나요?",
    a: "규제지역에서도 LTV 70%(일반 40%)가 적용되어 더 많은 대출이 가능합니다. 비규제지역은 80%까지 가능하며, 6개월 이내 전입(실거주) 의무가 있습니다.",
  },
  {
    q: "규제지역은 어디인가요?",
    a: "2025년 10.15 대책 이후 서울 25개구 전체와 경기 12곳(과천, 광명, 성남 분당·수정·중원구, 수원 영통·장안·팔달구, 안양 동안구, 용인 수지구, 의왕, 하남)이 투기과열지구+조정대상지역으로 지정되어 있습니다.",
  },
];

export const LTV_DTI_SOURCES = [
  { name: "금융위원회", url: "https://www.fsc.go.kr/", basis: "대출규제 정책 안내" },
  { name: "한국은행 경제통계", url: "https://ecos.bok.or.kr/", basis: "주택담보대출 규제 통계" },
];
