import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_ROUTES,
  SITEMAP_ROUTES,
  CANONICAL_OVERRIDES,
} from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const repositoryRoot = resolve(projectRoot, "..");
const distRoot = resolve(projectRoot, "dist");
const canonicalBase = "https://shakilabs.com/loan";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function routeOutputPath(route) {
  return route === "/"
    ? resolve(distRoot, "index.html")
    : resolve(distRoot, `${route.slice(1)}.html`);
}

function validateVercelConfig(configPath) {
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const rewrites = config.rewrites ?? [];
  const indexRewrites = rewrites.filter(
    (rewrite) => rewrite.destination === "/index.html"
  );
  const routeRewrite = rewrites.find(
    (rewrite) => rewrite.source === "/loan/:path*"
  );

  assert(config.cleanUrls === true, `${configPath}: cleanUrls must be true`);
  assert(indexRewrites.length === 0, `${configPath}: index.html catch-all rewrite is forbidden`);
  assert(routeRewrite?.destination === "/:path*",
    `${configPath}: loan rewrite must preserve the requested path`);
}

function validateRoute(route) {
  const outputPath = routeOutputPath(route);
  assert(existsSync(outputPath), `Missing static output for ${route}: ${outputPath}`);

  const html = readFileSync(outputPath, "utf8");
  // canonical 통합 변종은 대표 URL을 가리켜야 한다 (self-canonical이면 준-doorway로 회귀)
  const canonicalRoute = CANONICAL_OVERRIDES[route] ?? route;
  const expectedCanonical =
    canonicalRoute === "/" ? canonicalBase : `${canonicalBase}${canonicalRoute}`;
  const actualCanonical = html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>/)?.[1];
  const h1Count = html.match(/<h1\b/gi)?.length ?? 0;

  assert(actualCanonical === expectedCanonical,
    `Invalid canonical for ${route}: expected ${expectedCanonical}`);
  assert(/<title>[^<]+<\/title>/.test(html), `Missing title for ${route}`);
  assert(h1Count === 1, `Expected one H1 for ${route}, found ${h1Count}`);
  assert(html.includes('id="app"'), `Missing app root for ${route}`);
}

// 사이트맵 = 대표 URL 전수 포함 + canonical 통합 변종 0건 (양방향 검증)
function validateSitemap() {
  const sitemapPath = resolve(distRoot, "sitemap.xml");
  assert(existsSync(sitemapPath), `Missing sitemap output: ${sitemapPath}`);

  const sitemap = readFileSync(sitemapPath, "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const locSet = new Set(locs);

  for (const route of SITEMAP_ROUTES) {
    const loc = route === "/" ? canonicalBase : `${canonicalBase}${route}`;
    assert(locSet.has(loc), `Sitemap missing canonical route: ${loc}`);
  }
  for (const variant of Object.keys(CANONICAL_OVERRIDES)) {
    const loc = `${canonicalBase}${variant}`;
    assert(!locSet.has(loc), `Sitemap must not list canonicalized variant: ${loc}`);
  }
  assert(locs.length === SITEMAP_ROUTES.length,
    `Sitemap URL count mismatch: expected ${SITEMAP_ROUTES.length}, found ${locs.length}`);
}

// 애드센스 필수 3요소는 방침을 다시 쓸 때 가장 먼저 사라지는 문장들이다.
// 심사에서 이게 빠지면 광고 배선과 무관하게 사이트 전체가 거절되므로 빌드에서 강제한다.
// 운영자 신원(13자산 공통 기준)도 같은 이유로 함께 잠근다.
function validatePolicyDisclosures() {
  const privacy = readFileSync(routeOutputPath("/privacy"), "utf8");
  const terms = readFileSync(routeOutputPath("/terms"), "utf8");

  for (const link of ["https://adssettings.google.com", "https://www.aboutads.info/choices"]) {
    assert(privacy.includes(link), `/privacy must keep the AdSense opt-out link ${link}`);
  }
  assert(/제3자 광고 사업자는 쿠키를 사용/.test(privacy),
    "/privacy must disclose third-party advertising cookies");
  assert(/맞춤 광고/.test(privacy), "/privacy must disclose personalized advertising");

  for (const [route, html] of [["/privacy", privacy], ["/terms", terms]]) {
    assert(html.includes("운영: ShakiLabs"), `${route} must name the operator`);
    assert(html.includes("skdba1313@gmail.com"), `${route} must publish a contact address`);
  }

  // 이 앱은 대출 계산기다. "금융 자문이 아님" 고지가 빠지면 YMYL 심사에서 가장 먼저 걸린다.
  assert(/금융상품판매업자|금융상품자문업자/.test(terms),
    "/terms must disclaim being a financial product seller/advisor");
  assert(/대출모집인/.test(terms), "/terms must disclaim being a registered loan broker");
}

validateVercelConfig(resolve(repositoryRoot, "vercel.json"));
validateVercelConfig(resolve(projectRoot, "vercel.json"));
SEO_ROUTES.forEach(validateRoute);
validateSitemap();
validatePolicyDisclosures();

const notFoundPath = resolve(distRoot, "404.html");
assert(existsSync(notFoundPath), "Missing custom 404.html output");
const notFoundHtml = readFileSync(notFoundPath, "utf8");
assert(/name="robots" content="noindex,nofollow"/.test(notFoundHtml),
  "404.html must be noindex,nofollow");
// 본문이 수십 자뿐인 화면에 광고를 실으면 "Valuable Inventory" 위반이다. noindex는 색인만
// 막고 정책 판정은 로더의 존재로 하므로, 셸에서 물려받은 태그가 지워졌는지 여기서 확인한다.
assert(!/adsbygoogle|googlesyndication/i.test(notFoundHtml),
  "404.html must not load the AdSense script (Valuable Inventory: no ads on a contentless screen)");
// 역방향: 정상 라우트의 광고 배선까지 지우면 안 된다. 홈이 로더를 계속 들고 있어야 한다.
const homeHtml = readFileSync(routeOutputPath("/"), "utf8");
assert(/googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/.test(homeHtml),
  "/ must keep the AdSense loader (the 404 fix must not strip it from real routes)");

console.log(
  `Validated ${SEO_ROUTES.length} SEO routes (${SITEMAP_ROUTES.length} sitemap URLs, ` +
  `${Object.keys(CANONICAL_OVERRIDES).length} canonicalized variants) and custom 404 output.`
);
