// 디딤돌대출 (내집마련 디딤돌 대출) — 2026년 3월 기준
// 출처: 한국주택금융공사 금리안내

export const STEPPING_STONE_UPDATED = "2026-03-19";

/** 소득구간별 기본 고정금리 (%) — 일반 */
export const GENERAL_RATES: readonly { maxIncome: number; label: string; rates: Record<string, number> }[] = [
  { maxIncome: 20_000_000, label: "2천만원 이하", rates: { "10": 2.85, "15": 2.95, "20": 3.05, "30": 3.10 } },
  { maxIncome: 40_000_000, label: "2천~4천만원", rates: { "10": 3.20, "15": 3.30, "20": 3.40, "30": 3.45 } },
  { maxIncome: 70_000_000, label: "4천~7천만원", rates: { "10": 3.55, "15": 3.65, "20": 3.75, "30": 3.80 } },
  { maxIncome: 85_000_000, label: "7천~8,500만원", rates: { "10": 3.90, "15": 4.00, "20": 4.10, "30": 4.15 } },
];

/** 소득구간별 기본 고정금리 (%) — 신혼/생애최초 (0.3%p 우대) */
export const SPECIAL_RATES: readonly { maxIncome: number; label: string; rates: Record<string, number> }[] = [
  { maxIncome: 20_000_000, label: "2천만원 이하", rates: { "10": 2.55, "15": 2.65, "20": 2.75, "30": 2.80 } },
  { maxIncome: 40_000_000, label: "2천~4천만원", rates: { "10": 2.90, "15": 3.00, "20": 3.10, "30": 3.15 } },
  { maxIncome: 70_000_000, label: "4천~7천만원", rates: { "10": 3.25, "15": 3.35, "20": 3.45, "30": 3.50 } },
  { maxIncome: 85_000_000, label: "7천~8,500만원", rates: { "10": 3.60, "15": 3.70, "20": 3.80, "30": 3.85 } },
];

/** 대출 한도 */
export const LOAN_LIMITS = {
  general: 200_000_000,
  firstTime: 240_000_000,
  newlywed: 320_000_000,
  singleUnder30: 150_000_000,
} as const;

/** 소득 자격 (부부합산 연소득) */
export const INCOME_LIMITS = {
  general: 60_000_000,
  firstTimeOrMultiChild: 70_000_000,
  newlywed: 85_000_000,
} as const;

/** 주택 가격 상한 */
export const PROPERTY_LIMITS = {
  general: 500_000_000,
  newlywedOrMultiChild: 600_000_000,
  singleUnder30: 300_000_000,
} as const;

/** LTV / DTI */
export const LTV_RATE = 0.7;
export const LTV_RATE_FIRST_TIME_NON_METRO = 0.8;
export const DTI_RATE = 0.6;

/** 대출 기간 옵션 (년) */
export const TERM_YEAR_OPTIONS = [10, 15, 20, 30] as const;

export type BorrowerType = "general" | "firstTime" | "newlywed";

export const BORROWER_TYPE_LABELS: Record<BorrowerType, string> = {
  general: "일반",
  firstTime: "생애최초",
  newlywed: "신혼가구",
};

export const STEPPING_STONE_AMOUNTS = [10000, 15000, 20000, 30000, 40000];

export const STEPPING_STONE_PRESETS: readonly { key: string; label: string; description: string }[] = [
  { key: "newlywed-4", label: "신혼 4억 아파트", description: "신혼가구, 연소득 6천만, 30년" },
  { key: "first-3", label: "생애최초 3억", description: "생애최초, 연소득 5천만, 20년" },
  { key: "general-2", label: "일반 2억 주택", description: "일반, 연소득 4천만, 30년" },
];

export const STEPPING_STONE_FAQS: readonly { q: string; a: string }[] = [
  {
    q: "디딤돌대출 신청 자격은 어떻게 되나요?",
    a: "세대원 전원 무주택, 부부합산 연소득 일반 6천만원·생애최초 7천만원·신혼 8,500만원 이하, 순자산 5.11억원 이하, NICE 신용점수 350점 이상이어야 합니다.",
  },
  {
    q: "디딤돌대출 금리는 어떻게 결정되나요?",
    a: "부부합산 연소득 구간과 대출 기간(10~30년)에 따라 고정금리가 달라집니다. 신혼·생애최초는 0.3%p 우대되며, 다자녀·청약저축 가입기간 등 추가 우대금리가 적용될 수 있습니다.",
  },
  {
    q: "디딤돌대출 최대 한도는 얼마인가요?",
    a: "일반 2억원, 생애최초 2.4억원, 신혼가구 3.2억원이 한도이며, LTV 70%(생애최초 비수도권 80%), DTI 60% 이내여야 합니다.",
  },
  {
    q: "디딤돌대출 상환 방식은 어떤 것이 있나요?",
    a: "원리금균등, 원금균등(체감식), 체증식 분할상환 3가지가 있으며, 거치기간은 1년 또는 비거치를 선택할 수 있습니다. 대출 실행 후 상환 방식 변경은 불가합니다.",
  },
];

export const STEPPING_STONE_SOURCES = [
  { name: "한국주택금융공사", url: "https://www.hf.go.kr/ko/sub01/sub01_02_03.do", basis: "디딤돌대출 금리 고시" },
  { name: "마이홈포털", url: "https://www.myhome.go.kr/", basis: "디딤돌대출 자격·한도 안내" },
];
