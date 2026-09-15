// 빌드마다 자동 실행되는 폰트 서브셋 무결성 게이트 (scripts/build.mjs에서 호출).
// 브라우저를 다시 띄우지 않는 빠른 정적 검사만 한다: dist 파일 존재·woff2 매직바이트·
// byte budget·manifest sha256 일치·CSS에서 실제 참조 여부.
//
// 왜 이 게이트가 필요한가: 314c382가 조용히 41자 숫자 전용 서브셋으로 좁히면서
// h1 제목의 한글이 폴백되는 회귀가 생겼는데, 이걸 잡는 자동 검증이 하나도 없었다.
// document.fonts.check()는 이 환경에서 항상 true를 반환하는 가짜 게이트라 쓰지 않는다
// (docs/BRAND_FONT_SUBSET.md §6) — 문자 커버리지 자체는 fontTools cmap 대조로만 판정
// 가능하고, 그건 렌더 스캔 때 별도로 증명했다. 이 스크립트는 "그 결과물이 그대로
// 배포되는지"(크기·해시·참조)를 빌드마다 값싸게 재확인하는 역할이다.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { clientRoot as configuredClientRoot, fontJobs, readBrandFontCharacters } from "./font-subset-config.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const clientRoot = configuredClientRoot ?? resolve(scriptRoot, "..");
const distRoot = resolve(clientRoot, "dist");
const manifest = JSON.parse(readFileSync(resolve(scriptRoot, "font-subset-manifest.json"), "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(`[verify-fonts] ${message}`);
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

assert(
  manifest.characterSha256 === hash(readBrandFontCharacters()),
  "brand-font-charset.txt changed since last `npm run fonts:subset` — manifest is stale",
);

const manifestFonts = new Map(manifest.fonts.map((font) => [font.publicName, font]));

const cssDir = resolve(distRoot, "assets");
const css = existsSync(cssDir)
  ? readdirSync(cssDir)
      .filter((file) => file.endsWith(".css"))
      .map((file) => readFileSync(resolve(cssDir, file), "utf8"))
      .join("\n")
  : "";
const indexHtmlPath = resolve(distRoot, "index.html");
const html = existsSync(indexHtmlPath) ? readFileSync(indexHtmlPath, "utf8") : "";

for (const fontJob of fontJobs) {
  const fontPath = resolve(distRoot, "fonts", fontJob.publicName);
  assert(existsSync(fontPath), `Missing shipped font: ${fontJob.publicName}`);

  const font = readFileSync(fontPath);
  const manifestFont = manifestFonts.get(fontJob.publicName);

  assert(font.subarray(0, 4).toString("ascii") === "wOF2", `${fontJob.publicName} is not WOFF2`);
  assert(
    font.byteLength <= fontJob.maxBytes,
    `${fontJob.publicName} is ${font.byteLength}B, exceeds its ${fontJob.maxBytes}B budget`,
  );
  assert(manifestFont?.bytes === font.byteLength, `${fontJob.publicName} manifest size is stale`);
  assert(manifestFont?.sha256 === hash(font), `${fontJob.publicName} manifest hash does not match shipped file`);
  assert(css.includes(`/fonts/${fontJob.publicName}`), `Built CSS misses reference to ${fontJob.publicName}`);
  // 이전 num-v1 서브셋이 여전히 참조돼 있으면(교체 누락) 여기서 잡는다.
  assert(!css.includes("GmarketSansBold-num-v1"), "Stale reference to GmarketSansBold-num-v1.woff2 in built CSS");

  if (fontJob.preload) {
    assert(html.includes(`/fonts/${fontJob.publicName}`), `Index preload misses ${fontJob.publicName}`);
  }
}

console.log(`[verify-fonts] Validated ${fontJobs.length} brand font subset(s).`);
