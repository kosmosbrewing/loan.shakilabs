// scripts/brand-font-charset.txt(렌더 스캔으로 고정한 문자셋)를 읽어 fontTools로
// GmarketSans 서브셋을 재생성하고, 검증용 manifest(크기·해시)를 함께 남긴다.
// 실행: npm run fonts:subset (charset 파일을 갱신했을 때만 필요 — 평소 빌드는 dist에
// 이미 생성된 .woff2를 그대로 쓰고 verify-fonts.mjs가 무결성만 확인한다).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { charsetFile, clientRoot, fontJobs, readBrandFontCharacters } from "./font-subset-config.mjs";

const characters = readBrandFontCharacters();
const manifestPath = resolve(clientRoot, "scripts/font-subset-manifest.json");

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

const fonts = fontJobs.map((fontJob) => {
  // docs/BRAND_FONT_SUBSET.md §4 — --no-hinting만 쓴다.
  // --layout-features=''는 절대 쓰지 않는다: 커널링(GPOS)이 통째로 날아간다.
  const result = spawnSync(
    "python3",
    [
      "-m",
      "fontTools.subset",
      fontJob.source,
      `--text-file=${charsetFile}`,
      `--output-file=${fontJob.output}`,
      "--flavor=woff2",
      "--no-hinting",
    ],
    { encoding: "utf8" },
  );

  if (result.error || result.status !== 0) {
    const detail = result.error?.message ?? result.stderr.trim();
    throw new Error(`Font subsetting failed for ${fontJob.publicName}: ${detail}`);
  }

  const content = readFileSync(fontJob.output);
  if (content.byteLength > fontJob.maxBytes) {
    throw new Error(
      `${fontJob.publicName} is ${content.byteLength}B, exceeds its ${fontJob.maxBytes}B budget`,
    );
  }

  return {
    publicName: fontJob.publicName,
    bytes: content.byteLength,
    sha256: hash(content),
  };
});

const manifest = {
  schemaVersion: 1,
  characterCount: [...characters].length,
  characterSha256: hash(characters),
  fonts,
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${fonts.length} font(s) for ${manifest.characterCount} characters.`);
