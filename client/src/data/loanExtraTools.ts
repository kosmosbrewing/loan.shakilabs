export const PREPAYMENT_FEE_UPDATED = "2026-03-17";
export const STUDENT_LOAN_UPDATED = "2026-03-17";

export const PREPAYMENT_FEE_SOURCES = [
  {
    name: "KB국민은행",
    url: "https://obank.kbstar.com/quics?page=C019205",
    basis: "중도상환수수료 계산식 안내",
  },
  {
    name: "금융감독원",
    url: "https://www.fss.or.kr",
    basis: "금융상품 비교·설명자료 일반 원칙",
  },
] as const;

export const STUDENT_LOAN_SOURCES = [
  {
    name: "교육부",
    url: "https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&lev=0&statusYN=W&s=moe&m=020402&opType=N&boardSeq=101630",
    basis: "2026학년도 1학기 학자금대출 기본계획",
  },
  {
    name: "한국장학재단",
    url: "https://www.kosaf.go.kr/ko/tuition.do?pg=tuition05_03_01",
    basis: "취업 후 상환 학자금대출 안내",
  },
] as const;

export const PREPAYMENT_FEE_FAQS = [
  {
    q: "중도상환수수료는 어떻게 계산하나요?",
    a: "조기상환 원금에서 연간 면제한도를 제외한 금액에 수수료율과 남은 부과기간 비율을 곱해 참고 계산합니다.",
  },
  {
    q: "왜 총 대출만기가 아니라 부과기간을 입력하나요?",
    a: "실무에서는 3년 같은 수수료 부과기간만 별도로 두는 경우가 많아 실제 부담을 더 직관적으로 확인할 수 있기 때문입니다.",
  },
] as const;

export const STUDENT_LOAN_FAQS = [
  {
    q: "이 계산기는 어떤 학자금대출을 기준으로 하나요?",
    a: "취업 후 상환 학자금대출의 연간 의무상환액을 빠르게 추정하는 계산기입니다.",
  },
  {
    q: "기준소득과 상환율은 바뀔 수 있나요?",
    a: "네. 교육부와 국세청 고시에 따라 매년 바뀔 수 있으므로 기본값을 확인하고 필요하면 직접 수정해야 합니다.",
  },
] as const;
