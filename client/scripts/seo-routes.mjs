// 파라미터 단위: 만 원 (URL 파라미터 × 10,000 = 원화)
export const REPAYMENT_AMOUNTS = [5000, 10000, 20000, 30000, 50000];
export const DSR_INCOMES = [3000, 5000, 7200, 10000, 15000];
export const REFINANCE_BALANCES = [5000, 10000, 15000, 20000, 30000];
export const PREPAYMENT_AMOUNTS = [5000, 10000, 20000, 30000];
export const STUDENT_LOAN_BALANCES = [1000, 2000, 3000, 5000];
export const MORTGAGE_AMOUNTS = [10000, 20000, 30000, 40000, 50000];
export const JEONSE_LOAN_AMOUNTS = [5000, 10000, 20000, 30000, 40000];
export const STEPPING_STONE_AMOUNTS = [10000, 15000, 20000, 30000, 40000];
export const LTV_DTI_AMOUNTS = [30000, 50000, 70000, 100000, 150000];

// repayment 금액 변종: 형제 간 고유 본문이 얇아(준-doorway) 대표 URL로 canonical을 통합한다.
// 라우트·프리렌더 산출물은 유지한다 (프리렌더에서 빼면 soft-404가 되므로 금지).
export const PARAM_ROUTES = REPAYMENT_AMOUNTS.map((a) => `/repayment/${a}`);

// 변종 경로 → 대표(canonical) 경로 매핑. 빌드 검증·SSG 메타가 같은 소스를 공유한다.
export const CANONICAL_OVERRIDES = Object.fromEntries(
  PARAM_ROUTES.map((route) => [route, "/repayment"])
);

export const SEO_ROUTES = [
  "/",
  "/repayment",
  "/dsr",
  "/refinance",
  "/prepayment-fee",
  "/jeonse-guarantee-fee",
  "/student-loan",
  "/mortgage-compare",
  "/jeonse-loan",
  "/stepping-stone-loan",
  "/ltv-dti",
  "/about",
  "/terms",
  "/privacy",
  ...PARAM_ROUTES,
  ...DSR_INCOMES.map((i) => `/dsr/${i}`),
  ...REFINANCE_BALANCES.map((b) => `/refinance/${b}`),
  ...PREPAYMENT_AMOUNTS.map((a) => `/prepayment-fee/${a}`),
  ...STUDENT_LOAN_BALANCES.map((b) => `/student-loan/${b}`),
  ...MORTGAGE_AMOUNTS.map((a) => `/mortgage-compare/${a}`),
  ...JEONSE_LOAN_AMOUNTS.map((a) => `/jeonse-loan/${a}`),
  ...STEPPING_STONE_AMOUNTS.map((a) => `/stepping-stone-loan/${a}`),
  ...LTV_DTI_AMOUNTS.map((a) => `/ltv-dti/${a}`),
];

// 사이트맵에는 canonical 대표 URL만 노출한다 (변종은 canonical로 통합되므로 제외).
export const SITEMAP_ROUTES = SEO_ROUTES.filter(
  (route) => !(route in CANONICAL_OVERRIDES)
);
