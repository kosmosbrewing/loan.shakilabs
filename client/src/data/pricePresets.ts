export interface PricePreset {
  value: number;
  label: string;
}

// 빠른 선택 가격 프리셋
export const PRICE_PRESETS: PricePreset[] = [
  { value: 10_000, label: "1만" },
  { value: 30_000, label: "3만" },
  { value: 50_000, label: "5만" },
  { value: 100_000, label: "10만" },
  { value: 300_000, label: "30만" },
];

// 월 판매 건수 빠른 선택 프리셋
export const QTY_PRESETS: PricePreset[] = [
  { value: 50, label: "50건" },
  { value: 100, label: "100건" },
  { value: 300, label: "300건" },
  { value: 500, label: "500건" },
];

// 기본값
export const DEFAULT_PRICE = 30_000;
export const DEFAULT_SHIPPING_FEE = 3_000;
export const DEFAULT_MONTHLY_QTY = 100;
