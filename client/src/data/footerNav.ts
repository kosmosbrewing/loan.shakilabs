import type { SiteFooterLink, SiteFooterSection } from "@shakilabs/ui";

/** 푸터 계산기 목록 — 라우터의 실제 경로만 담는다(리다이렉트 별칭 제외) */
export const FOOTER_SECTIONS: readonly SiteFooterSection[] = [
  {
    title: "한도·심사",
    links: [
    { to: "/dsr", label: "DSR 계산" },
    { to: "/ltv-dti", label: "LTV·DTI·DSR" },
    ],
  },
  {
    title: "주택 대출",
    links: [
    { to: "/mortgage-compare", label: "주담대 금리 비교" },
    { to: "/jeonse-loan", label: "전세대출 이자" },
    { to: "/stepping-stone-loan", label: "디딤돌대출" },
    { to: "/jeonse-guarantee-fee", label: "전세보증보험료" },
    ],
  },
  {
    title: "상환·갈아타기",
    links: [
    { to: "/refinance", label: "대환대출 갈아타기" },
    { to: "/repayment", label: "상환방식 비교" },
    { to: "/prepayment-fee", label: "중도상환수수료" },
    { to: "/student-loan", label: "학자금 대출" },
    ],
  },
];

export const FOOTER_ALL_LINK: SiteFooterLink = {
  to: "/",
  label: "전체 계산기 보기 →",
};
