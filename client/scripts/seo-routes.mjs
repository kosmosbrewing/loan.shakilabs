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

export const SEO_ROUTES = [
  "/",
  "/repayment",
  "/dsr",
  "/refinance",
  "/prepayment-fee",
  "/student-loan",
  "/mortgage-compare",
  "/jeonse-loan",
  "/stepping-stone-loan",
  "/ltv-dti",
  "/about",
  "/terms",
  "/privacy",
  ...REPAYMENT_AMOUNTS.map((a) => `/repayment/${a}`),
  ...DSR_INCOMES.map((i) => `/dsr/${i}`),
  ...REFINANCE_BALANCES.map((b) => `/refinance/${b}`),
  ...PREPAYMENT_AMOUNTS.map((a) => `/prepayment-fee/${a}`),
  ...STUDENT_LOAN_BALANCES.map((b) => `/student-loan/${b}`),
  ...MORTGAGE_AMOUNTS.map((a) => `/mortgage-compare/${a}`),
  ...JEONSE_LOAN_AMOUNTS.map((a) => `/jeonse-loan/${a}`),
  ...STEPPING_STONE_AMOUNTS.map((a) => `/stepping-stone-loan/${a}`),
  ...LTV_DTI_AMOUNTS.map((a) => `/ltv-dti/${a}`),
];
