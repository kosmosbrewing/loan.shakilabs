// 오픈마켓 4개 정적 비교 데이터 (PaymentCompareView 패턴)
// 수치 계산용 marketFees.ts와 별개 — 이 파일은 문자열 기반 레퍼런스 비교표

export type OpenMarketKey = "smartstore" | "coupang" | "elevenst" | "gmarket";

export interface CompareCell {
  core: string;
  tooltip?: string;
  condition?: string;
}

// 힌트 테이블 렌더링용
export interface FeeRow {
  label: string;
  rate: string;
}

export interface FeeSection {
  subtitle: string;
  note?: string;
  rows: FeeRow[];
}

export interface SalesFeeBreakdown {
  sections: FeeSection[];
  footnote?: string;
}

export interface OpenMarketCompareMeta {
  key: OpenMarketKey;
  name: string;
  shortName: string;
  color: string;
  sourceName: string;
  sourceUrl: string;
  microBusinessRate: number;
  setupFee: CompareCell;
  salesFeeRange: CompareCell;
  salesFeeBreakdown?: SalesFeeBreakdown;
  shippingFeeRate: CompareCell;
  settlementCycle: CompareCell;
  note: CompareCell;
  noteBreakdown?: SalesFeeBreakdown;
  noteFeatures?: { label: string; value: string }[];
}

export const MARKET_COMPARE_UPDATED: string = "2025.10";
export const MARKET_COMPARE_VERIFIED: string = "2026.03";

export const OPEN_MARKETS: OpenMarketCompareMeta[] = [
  {
    key: "smartstore",
    name: "스마트스토어",
    shortName: "네쇼",
    color: "#03C75A",
    sourceName: "정산 기준 수수료율",
    sourceUrl: "https://help.sell.smartstore.naver.com/faq/content.help?faqId=15759",
    microBusinessRate: 2.95,
    setupFee: {
      core: "무료",
    },
    salesFeeRange: {
      core: "영세 2.95%~",
    },
    salesFeeBreakdown: {
      sections: [
        {
          subtitle: "주문관리 수수료",
          note: "VAT 포함 · 상품가+배송비",
          rows: [
            { label: "영세", rate: "1.947%" },
            { label: "중소1", rate: "2.563%" },
            { label: "중소2", rate: "2.728%" },
            { label: "중소3", rate: "3.003%" },
            { label: "일반", rate: "3.63%" },
          ],
        },
        {
          subtitle: "판매 수수료",
          note: "VAT 별도 · 상품가에만 적용",
          rows: [
            { label: "네이버쇼핑", rate: "2.73%" },
            { label: "마케팅링크", rate: "0.91%" },
          ],
        },
      ],
      footnote: "실부담 = 주문관리 + 판매 x 1.1(VAT)",
    },
    shippingFeeRate: {
      core: "주문관리만 과금",
      tooltip: "유료배송에만 주문관리 수수료가 부과됩니다. 판매 수수료는 미적용.",
    },
    settlementCycle: {
      core: "확정 후 1~2영업일",
    },
    note: {
      core: "등급+유입경로 분리형",
    },
    noteFeatures: [
      { label: "수수료 구조", value: "주문관리(등급별) + 판매(유입경로별) 이중 구조" },
      { label: "월정액", value: "없음" },
      { label: "배송비 과금", value: "주문관리 수수료만 적용 (판매 수수료 미적용)" },
      { label: "특징", value: "네이버쇼핑 노출·검색 최적화 가능" },
    ],
  },
  {
    key: "coupang",
    name: "쿠팡",
    shortName: "쿠팡",
    color: "#E31937",
    sourceName: "쿠팡 Wing 홈 (판매수수료 상세는 내부 확인)",
    sourceUrl: "https://wing.coupang.com/",
    microBusinessRate: 7.8,
    setupFee: {
      core: "무료",
    },
    salesFeeRange: {
      core: "영세 7.8%~",
    },
    salesFeeBreakdown: {
      sections: [
        {
          subtitle: "카테고리별 판매 수수료",
          rows: [
            { label: "가전/디지털", rate: "7.8%" },
            { label: "생활용품", rate: "7.8%" },
            { label: "뷰티", rate: "9.6%" },
            { label: "의류/패션", rate: "10.5%" },
            { label: "식품", rate: "10.6%" },
          ],
        },
      ],
      footnote: "월 판매 100만원 초과 시 서버이용료 55,000원/월",
    },
    shippingFeeRate: {
      core: "유료배송 3.3%",
    },
    settlementCycle: {
      core: "D+1~D+2 영업일",
      tooltip: "요일/정산 캘린더에 따라 실제 입금일이 달라질 수 있습니다.",
    },
    note: {
      core: "로켓그로스 물류비 별도",
    },
    noteFeatures: [
      { label: "수수료 구조", value: "카테고리별 단일 수수료" },
      { label: "월정액", value: "월 판매 100만원 초과 시 55,000원/월" },
      { label: "배송비 과금", value: "유료배송 3.3%" },
      { label: "특징", value: "로켓그로스 물류 대행·로켓배송 가능" },
    ],
    noteBreakdown: {
      sections: [
        {
          subtitle: "로켓그로스 물류비 (건당)",
          note: "입고+출고 합산",
          rows: [
            { label: "초소형 (20cm·500g 이하)", rate: "700원" },
            { label: "소형 (30cm·1kg 이하)", rate: "950원" },
            { label: "중형 (40cm·3kg 이하)", rate: "1,400원" },
            { label: "대형 (60cm·6kg 이하)", rate: "2,100원" },
            { label: "특대형 (80cm·10kg 이하)", rate: "3,000원" },
            { label: "초대형 (80cm·10kg 초과)", rate: "4,300원" },
          ],
        },
      ],
    },
  },
  {
    key: "elevenst",
    name: "11번가",
    shortName: "11번",
    color: "#FF6B00",
    sourceName: "11번가 셀러오피스 홈 (수수료 상세는 내부 확인)",
    sourceUrl: "https://soffice.11st.co.kr/",
    microBusinessRate: 10,
    setupFee: {
      core: "무료",
    },
    salesFeeRange: {
      core: "영세 10%~",
    },
    salesFeeBreakdown: {
      sections: [
        {
          subtitle: "카테고리별 판매 수수료",
          rows: [
            { label: "가전/디지털", rate: "10%" },
            { label: "의류/패션", rate: "13%" },
            { label: "식품", rate: "13%" },
            { label: "생활용품", rate: "13%" },
            { label: "뷰티", rate: "13%" },
          ],
        },
      ],
      footnote: "월 구매확정 500만원 초과 시 서버이용료 77,000원/월",
    },
    shippingFeeRate: {
      core: "유료배송 3.3%",
    },
    settlementCycle: {
      core: "확정 후 익영업일",
    },
    note: {
      core: "카테고리 단일형 구조",
    },
    noteFeatures: [
      { label: "수수료 구조", value: "카테고리별 단일 수수료" },
      { label: "월정액", value: "월 구매확정 500만원 초과 시 77,000원/월" },
      { label: "배송비 과금", value: "유료배송 3.3%" },
      { label: "특징", value: "SK그룹 연동 프로모션·셀러 지원 프로그램" },
    ],
  },
  {
    key: "gmarket",
    name: "G마켓/옥션",
    shortName: "G마켓",
    color: "#00B050",
    sourceName: "G마켓 서비스 이용료",
    sourceUrl: "https://item.esmplus.com/gmarket-service-fee.html",
    microBusinessRate: 9,
    setupFee: {
      core: "무료",
    },
    salesFeeRange: {
      core: "영세 9%~",
    },
    salesFeeBreakdown: {
      sections: [
        {
          subtitle: "카테고리별 판매 수수료",
          rows: [
            { label: "가전/디지털", rate: "9%" },
            { label: "의류/패션", rate: "13%" },
            { label: "식품", rate: "13%" },
            { label: "생활용품", rate: "13%" },
            { label: "뷰티", rate: "13%" },
          ],
        },
      ],
      footnote: "월 판매 500만원 초과 시 서버이용료 55,000원/월 · G마켓·옥션 세부 카테고리는 다를 수 있음",
    },
    shippingFeeRate: {
      core: "유료배송 3.3%",
    },
    settlementCycle: {
      core: "확정 후 익영업일",
    },
    note: {
      core: "대표값 기준 표기",
    },
    noteFeatures: [
      { label: "수수료 구조", value: "카테고리별 단일 수수료" },
      { label: "월정액", value: "월 판매 500만원 초과 시 55,000원/월" },
      { label: "배송비 과금", value: "유료배송 3.3%" },
      { label: "주의", value: "G마켓·옥션 세부 카테고리 정책이 다를 수 있음" },
    ],
  },
];

export const OPEN_MARKET_SOURCES: Array<{ name: string; url: string; basis: string }> = [
  {
    name: "스마트스토어",
    url: "https://help.sell.smartstore.naver.com/faq/content.help?faqId=15759",
    basis: "정산 기준 수수료율",
  },
  {
    name: "스마트스토어",
    url: "https://help.sell.smartstore.naver.com/faq/content.help?faqId=3713",
    basis: "Npay 수수료",
  },
  {
    name: "쿠팡",
    url: "https://wing.coupang.com/",
    basis: "쿠팡 Wing 홈 (판매수수료 상세는 내부 확인)",
  },
  {
    name: "11번가",
    url: "https://soffice.11st.co.kr/",
    basis: "11번가 셀러오피스 홈 (수수료 상세는 내부 확인)",
  },
  {
    name: "G마켓",
    url: "https://item.esmplus.com/gmarket-service-fee.html",
    basis: "서비스 이용료",
  },
  {
    name: "옥션",
    url: "https://item.esmplus.com/auction-service-fee.html",
    basis: "서비스 이용료",
  },
];
