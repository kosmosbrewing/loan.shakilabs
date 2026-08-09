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

export const BASE_ROUTES = [
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
];

// 파라미터 변종 패밀리: [대표(canonical) 경로, 변종 파라미터 목록]
//
// 전수 유사도 감사(태그 제거 후 difflib) 결과 9개 패밀리 모두 최악 쌍이 0.98~1.00 이었고,
// 그중 6개 패밀리는 부모와 특정 자식이 100% 동일(1.0000)했다. 형제 간 차이가 SEO 문구의
// 금액 라벨뿐이라 doorway 수준이며, 본문을 늘려도 유사도가 내려가지 않는다(실증됨).
// 따라서 각 변종의 canonical·og:url·hreflang을 대표 URL로 통합하고 사이트맵에서 제외한다.
//
// URL·라우트·프리렌더 산출물은 그대로 유지한다.
// 프리렌더에서 빼면 SPA 빈 셸이 남아 soft-404가 되므로 금지. noindex도 쓰지 않는다
// (canonical과 색인 신호가 충돌한다).
//
// Reversible by design: when a family gains genuinely distinct per-variant content,
// remove its entry here. The routes rejoin the sitemap and regain self-canonical tags
// automatically — no other file needs editing.
export const VARIANT_FAMILIES = [
  ["/repayment", REPAYMENT_AMOUNTS],
  ["/dsr", DSR_INCOMES],
  ["/refinance", REFINANCE_BALANCES],
  ["/prepayment-fee", PREPAYMENT_AMOUNTS],
  ["/student-loan", STUDENT_LOAN_BALANCES],
  ["/mortgage-compare", MORTGAGE_AMOUNTS],
  ["/jeonse-loan", JEONSE_LOAN_AMOUNTS],
  ["/stepping-stone-loan", STEPPING_STONE_AMOUNTS],
  ["/ltv-dti", LTV_DTI_AMOUNTS],
];

// 프리렌더 대상 파라미터 경로 전수 (사이트맵 제외 여부와 무관하게 항상 생성한다)
export const PARAM_ROUTES = VARIANT_FAMILIES.flatMap(([canonical, values]) =>
  values.map((value) => `${canonical}/${value}`),
);

// 변종 경로 → 대표(canonical) 경로 매핑. 빌드 검증·SSG 메타가 같은 소스를 공유한다.
export const CANONICAL_OVERRIDES = Object.fromEntries(
  VARIANT_FAMILIES.flatMap(([canonical, values]) =>
    values.map((value) => [`${canonical}/${value}`, canonical]),
  ),
);

export const SEO_ROUTES = [...BASE_ROUTES, ...PARAM_ROUTES];

// 사이트맵에는 canonical 대표 URL만 노출한다 (변종은 canonical로 통합되므로 제외).
export const SITEMAP_ROUTES = SEO_ROUTES.filter(
  (route) => !(route in CANONICAL_OVERRIDES),
);
