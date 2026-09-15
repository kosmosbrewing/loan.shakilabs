// GmarketSans 브랜드 폰트 서브셋 설정 — docs/BRAND_FONT_SUBSET.md 정본 참고.
//
// 왜 finance의 collectFontCharacters()(소스 grep)를 쓰지 않는가:
// .vue 소스를 훑으면 과대 수집된다(주석의 한글까지 세거나, GmarketSans가 실제로
// 적용되지 않는 텍스트까지 포함). GmarketSans는 h1 제목(font-brand)과 .retro-title,
// LoanResultHero의 강조 숫자에만 붙는데, 이 클래스를 쓰지 않는 나머지 UI 텍스트는
// 애초에 Pretendard로 렌더되므로 이 폰트에 담을 필요가 없다.
//
// 대신 이 문자셋은 dist 빌드 후 playwright(Chromium)로 SEO_ROUTES 전 라우트 +
// 404 페이지를 순회하며 computed fontFamily가 "GmarketSans"로 시작하는 리프 요소의
// textContent만 모아서 만들었다 (∪ NUMERAL_CHARACTERS). 매 빌드마다 브라우저를 띄우는
// 비용을 피하려고 결과를 scripts/brand-font-charset.txt로 체크인해 고정한다.
//
// UI 텍스트가 바뀌면(새 계산기 h1 추가, LoanResultHero에 새 은행명이 등장할 수 있는
// 로직 변경 등) 이 파일은 낡는다 — 렌더 스캔을 다시 돌려 brand-font-charset.txt를
// 갱신한 뒤 `npm run fonts:subset`을 실행해야 한다. 자동 검증은 없다(비용 대비 실익
// 낮음) — PR 리뷰에서 font-brand/retro-title 사용처 변경을 사람이 체크해야 한다.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
export const clientRoot = resolve(scriptRoot, "..");

export const fontJobs = [
  {
    source: resolve(clientRoot, "public/fonts/GmarketSansBold.woff"),
    output: resolve(clientRoot, "public/fonts/GmarketSansBold-brand-v1.woff2"),
    publicName: "GmarketSansBold-brand-v1.woff2",
    // 실측 8,052B. 렌더 스캔 기준(11KB 실측 사례)의 2배 여유인 24KB로 예산을 잡는다.
    maxBytes: 24 * 1024,
    // index.html에 preload 링크가 없다(Pretendard 두 웨이트만 preload) — 추가 범위 밖.
    preload: false,
  },
];

export const charsetFile = resolve(clientRoot, "scripts/brand-font-charset.txt");

export function readBrandFontCharacters() {
  return readFileSync(charsetFile, "utf8");
}
