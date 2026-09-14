import type { PrimaryNavigationItem } from "@shakilabs/ui";

/** 2차 내비(LoanTabNavigation)와 모바일 드로어(AppHeader)가 공유하는 단일 출처.
 * v3 §3.3-1 — 목록을 두 곳에 복제하지 않는다. */
export const LOAN_TABS: readonly PrimaryNavigationItem[] = [
  { key: "home", label: "대출 도구", to: "/", href: "/loan" },
  { key: "refinance", label: "갈아타기", to: "/refinance" },
  { key: "dsr", label: "DSR", to: "/dsr" },
  { key: "repayment", label: "상환방식", to: "/repayment" },
  { key: "prepayment", label: "중도상환", to: "/prepayment-fee" },
  { key: "student", label: "학자금", to: "/student-loan" },
];
