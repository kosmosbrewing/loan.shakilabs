import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  SEO_ROUTES,
  SITEMAP_ROUTES,
  PARAM_ROUTES,
} from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const sitemapPath = resolve(projectRoot, "public", "sitemap.xml");
const viteSsgBin = resolve(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite-ssg.cmd" : "vite-ssg"
);

// 파라미터 라우트 집합 (priority/changefreq 분기용).
// 현재는 모든 변종이 canonical 통합되어 사이트맵에 오르지 않지만, 통합을 되돌리면
// (seo-routes.mjs의 VARIANT_FAMILIES에서 패밀리 제거) 이 분기가 그대로 다시 동작한다.
const paramPaths = new Set(PARAM_ROUTES);

const basePriority = {
  "/": "1.0",
  "/refinance": "0.9",
  "/dsr": "0.9",
  "/repayment": "0.9",
  "/prepayment-fee": "0.8",
  "/jeonse-guarantee-fee": "0.9",
  "/student-loan": "0.8",
  "/mortgage-compare": "0.9",
  "/jeonse-loan": "0.9",
  "/stepping-stone-loan": "0.9",
  "/ltv-dti": "0.9",
  "/about": "0.4",
  "/terms": "0.3",
  "/privacy": "0.3",
};

function getRouteConfig(path) {
  if (basePriority[path]) {
    return {
      changefreq: path === "/" ? "weekly" : ["about", "terms", "privacy"].some((s) => path.includes(s)) ? "monthly" : "weekly",
      priority: basePriority[path],
    };
  }
  if (paramPaths.has(path)) {
    return { changefreq: "monthly", priority: "0.7" };
  }
  return { changefreq: "monthly", priority: "0.5" };
}

function resolveBuildDate() {
  const candidate = process.env.BUILD_DATE?.trim();
  if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }

  return new Date().toISOString().slice(0, 10);
}

function renderSitemap(buildDate) {
  const baseUrl = "https://shakilabs.com/loan";
  // 사이트맵은 canonical 대표 URL만 담는다 (통합 변종 제외 — 프리렌더는 SEO_ROUTES 전체 유지)
  const urls = SITEMAP_ROUTES.map((path) => {
    const { changefreq, priority } = getRouteConfig(path);
    const loc = path === "/" ? baseUrl : `${baseUrl}${path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(projectRoot, "dist", "index.html")
    : resolve(projectRoot, "dist", `${route.slice(1)}.html`);
}

// 404 화면은 제목 한 줄과 복귀 링크뿐(실측 75자)이다. index.html 셸이 모든 라우트에 심는
// AdSense 로더가 여기까지 따라오면 Auto ads가 본문 없는 화면에 슬롯을 만들고, 이는 구글
// "Valuable Inventory" 정책 위반이다. noindex는 색인만 막을 뿐 정책 판정은 로더의 존재로
// 하므로 파일에서 태그 자체를 걷어낸다. 셸을 공유하는 다른 라우트는 건드리지 않는다.
function removeAdsenseLoaderFromNotFound() {
  const outputPath = routeOutputPath("/404");
  if (!existsSync(outputPath)) return;

  const html = readFileSync(outputPath, "utf8");
  const nextHtml = html.replace(
    /\n?\s*<script[^>]*\bdata-adsense="true"[^>]*><\/script>/gi,
    "",
  );
  writeFileSync(outputPath, nextHtml, "utf8");
}

function removeRenderedNoscriptFallbacks() {
  for (const route of [...SEO_ROUTES, "/404"]) {
    const outputPath = routeOutputPath(route);
    if (!existsSync(outputPath)) continue;

    const html = readFileSync(outputPath, "utf8");
    const nextHtml = html.replace(
      /\n?\s*<noscript>[\s\S]*?<\/noscript>/i,
      "",
    );
    writeFileSync(outputPath, nextHtml, "utf8");
  }
}

const buildDate = resolveBuildDate();

mkdirSync(dirname(sitemapPath), { recursive: true });
writeFileSync(sitemapPath, renderSitemap(buildDate), "utf8");

const result = spawnSync(viteSsgBin, ["build"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    BUILD_DATE: buildDate,
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

removeRenderedNoscriptFallbacks();
removeAdsenseLoaderFromNotFound();

// 폰트 서브셋 무결성 게이트 — 빌드마다 항상 돈다. 314c382가 숫자 전용 서브셋으로
// 조용히 좁혔던 회귀를 다시 만들지 않도록, 검증을 사람이 기억해서 돌리는 별도
// 절차가 아니라 build 파이프라인에 강제로 배선한다.
const fontsVerifyResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "verify-fonts.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

if (fontsVerifyResult.status !== 0) {
  process.exit(fontsVerifyResult.status ?? 1);
}

const validationResult = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "validate-static-output.mjs")],
  {
    cwd: projectRoot,
    stdio: "inherit",
  }
);

if (validationResult.status !== 0) {
  process.exit(validationResult.status ?? 1);
}

// 액센트·의미색 토큰 게이트(DESIGN_CLEANUP_PLAN §4.2). 게이트가 앱마다 있고 없으면
// 함대 작업 때 특정 앱만 검사를 건너뛴다 — 이 저장소 라이브 결함의 공통 뿌리였다.
const accentGate = spawnSync(
  process.execPath,
  [resolve(projectRoot, "scripts", "verify-accent-tokens.mjs")],
  { cwd: projectRoot, stdio: "inherit" }
);

process.exit(accentGate.status ?? 1);
