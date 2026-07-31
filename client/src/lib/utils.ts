import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// 숫자 포맷: 1000 → "1,000"
export function formatNumber(num: number | null | undefined): string {
  if (num == null) return "-";
  return num.toLocaleString("ko-KR");
}

// 원화 원단위 포맷: 2345678 → "2,345,678원"
export function formatWon(amount: number | null | undefined): string {
  if (amount == null) return "-";
  return `${Math.round(amount).toLocaleString("ko-KR")}원`;
}

// 축약 원화 포맷 (공유카드, SummaryBanner용): 2490000 → "약 249만원"
export function formatWonShort(amount: number | null | undefined): string {
  if (amount == null) return "-";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const restMan = Math.round((abs % 100_000_000) / 10_000);
    if (restMan === 0) return `${sign}${eok}억원`;
    return `${sign}${eok}억 ${restMan.toLocaleString("ko-KR")}만원`;
  }

  if (abs >= 10_000) {
    const man = Math.round(abs / 10_000);
    return `${sign}${man.toLocaleString("ko-KR")}만원`;
  }

  return `${sign}${Math.round(abs).toLocaleString("ko-KR")}원`;
}

// 이 앱에는 단위가 다른 두 종류의 "rate"가 섞여 있다.
//   - 비율(0~1):   ltvRate 0.4, currentDsr 0.117, effectiveRate 0.0051
//   - 퍼센트(3.6): applicableRate 3.6, annualRate 4.2, minRate 2.2 (내부에서 /100 해서 씀)
// 예전엔 이름이 모호한 formatPercent 하나뿐이라 퍼센트 값을 넘겨 100배가 더 곱해지는
// 사고가 났다(적용 금리 3.6% → "360.00%"). 그래서 이름에 입력 단위를 박아 두 개로 나눈다.
// 호출부는 값의 단위를 보고 반드시 둘 중 하나를 골라야 한다.

/** 비율(0~1)을 퍼센트 문자열로: 0.1234 → "12.3%" */
export function formatRatioAsPercent(ratio: number | null | undefined, decimals = 1): string {
  if (ratio == null) return "-";
  return `${(ratio * 100).toFixed(decimals)}%`;
}

/** 이미 퍼센트 단위인 값을 문자열로: 3.6 → "3.6%" (100을 다시 곱하지 않는다) */
export function formatPercentValue(percent: number | null | undefined, decimals = 1): string {
  if (percent == null) return "-";
  return `${percent.toFixed(decimals)}%`;
}

// 통화 포맷: (14900, "KRW") → "₩14,900"
export function formatCurrency(amount: number | null | undefined, currency: string): string {
  if (amount == null) return "-";
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(amount);
}

// 만원 단위 → 한국어 레이블: 10000 → "1억", 5000 → "5천만", 7200 → "7200만"
export function formatManWon(manWon: number): string {
  if (manWon >= 10000) {
    const eok = manWon / 10000;
    return Number.isInteger(eok) ? `${eok}억` : `${eok}억`;
  }
  if (manWon >= 1000 && manWon % 1000 === 0) {
    return `${manWon / 1000}천만`;
  }
  return `${manWon.toLocaleString("ko-KR")}만`;
}

// 콤마 포함 입력값에서 숫자만 추출: "1,234,000" → 1234000
export function parseNumericInput(value: string): number {
  const num = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isNaN(num) ? 0 : Math.max(0, num);
}

// execCommand 기반 클립보드 복사 (Clipboard API 미지원 환경 폴백)
export function copyUsingExecCommand(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}
