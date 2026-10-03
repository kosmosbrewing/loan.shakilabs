import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_ROUTES,
  SITEMAP_ROUTES,
  CANONICAL_OVERRIDES,
} from "./seo-routes.mjs";
import { validateUtilitiesAreGenerated } from "./validate-tailwind-utilities.mjs";

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

// 함대 제목 레시피(2026-10-03 개정) 게이트 — useSEO.buildPageTitle의 두 모양을 산출물에서 직접 본다.
// - 계산기·도구(기본): `<페이지 제목> | ShakiLabs` — 네이버는 제목을 ~35자에서 자르므로 가운데
//   앱 이름 접미사가 되살아나면 핵심 구절이 다시 잘린다.
// - 소개·약관·개인정보·404("site"): `<페이지 제목> · <앱 이름> | ShakiLabs` — 앱 이름이 빠지면
//   shakilabs.com 아래 12개 앱의 "이용약관 | ShakiLabs"가 서로 같은 제목이 된다.
// - 홈: `<앱 이름> | ShakiLabs`.
// 소스가 아니라 산출물을 본다: 셸 <title>과 뷰 제목이 어긋나거나 옛 가운데 접미사가 다시
// 붙어도 여기서 걸린다. 파라미터 변종도 대표 라우트와 같은 "tool" 모양을 따른다.
const TITLE_BRAND_SUFFIX = " | ShakiLabs";
const APP_NAME = "대출 계산기";
const SITE_TITLE_ROUTES = new Set(["/about", "/terms", "/privacy", "/404"]);
const MAX_PAGE_TITLE_CHARS = 40;

function validateTitleRecipe(html, route) {
  const titleTagCount = html.match(/<title\b/gi)?.length ?? 0;
  assert(titleTagCount === 1,
    `Expected exactly one <title> tag for ${route}, found ${titleTagCount}`);

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() ?? "";
  assert(title.endsWith(TITLE_BRAND_SUFFIX),
    `Title must end with "${TITLE_BRAND_SUFFIX}" for ${route}: ${title}`);
  const head = title.slice(0, -TITLE_BRAND_SUFFIX.length);
  assert(!head.includes(" | "),
    `Title must not carry a middle " | " segment for ${route}: ${title}`);

  let pageTitle;
  if (route === "/") {
    assert(head === APP_NAME,
      `Home title must be "${APP_NAME}${TITLE_BRAND_SUFFIX}": ${title}`);
    pageTitle = head;
  } else if (SITE_TITLE_ROUTES.has(route)) {
    const appSuffix = ` · ${APP_NAME}`;
    assert(head.endsWith(appSuffix),
      `Site page title must be "<page title>${appSuffix}${TITLE_BRAND_SUFFIX}" for ${route}: ${title}`);
    pageTitle = head.slice(0, -appSuffix.length);
  } else {
    pageTitle = head;
  }
  assert(pageTitle.length > 0 && pageTitle.length <= MAX_PAGE_TITLE_CHARS,
    `Page title must be 1-${MAX_PAGE_TITLE_CHARS} chars for ${route}: ${pageTitle.length} (${title})`);

  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  assert(description, `Missing meta description for ${route}`);
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
  // 셸의 noscript 폴백은 프리렌더된 본문과 중복 H1·중복 링크를 만든다.
  // build.mjs가 걷어내는데, 그 제거가 조용히 깨지면 여기서 잡는다.
  assert(!/<noscript>/i.test(html),
    `Rendered route must not retain the shell noscript for ${route}`);
  // 변종 라우트(canonicalRoute !== route)도 자기 자신의 제목을 렌더하므로 똑같이 검사한다 —
  // 레시피는 canonical 통합과 무관하게 산출되는 모든 <title>에 적용된다.
  validateTitleRecipe(html, route);
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
  return locSet;
}

function canonicalUrlFor(route) {
  return route === "/" ? canonicalBase : `${canonicalBase}${route}`;
}

// 라우터 소스에서 { path, redirect } 목록을 뜯어낸다.
// 라우터가 진실의 원천이고 seo-routes.mjs의 BASE_ROUTES는 사람이 손으로 맞추는 사본이다.
// 추출이 실패하면 폴백 없이 즉시 실패한다 — 조용히 0건을 검사하고 통과하면 게이트가 아니다.
function parseRouterRoutes(source) {
  const declarationIndex = source.indexOf("export const routes");
  assert(declarationIndex !== -1,
    "router/index.ts: `export const routes` declaration not found — the parity gate cannot read the router");

  const body = source.slice(declarationIndex);
  const marks = [...body.matchAll(/path:\s*"([^"]+)"/g)].map((match) => ({
    path: match[1],
    index: match.index,
  }));
  assert(marks.length > 0,
    "router/index.ts: no route paths could be extracted — parser drifted from the router source");

  return marks.map((mark, i) => ({
    path: mark.path,
    // 다음 path: 선언 전까지가 이 라우트의 본문이다
    redirect: /redirect:/.test(body.slice(mark.index, marks[i + 1]?.index ?? body.length)),
  }));
}

// 라우터 ↔ 사이트맵 양방향 대조 (car #46 / travel #45 규약 이식).
// 왜: SEO_ROUTES는 라우터의 손수 유지되는 사본이라 둘이 어긋나도 빌드·프리렌더·라이브가
// 전부 200을 돌려준다. 사람이 XML을 세는 것 말고는 잡을 방법이 없던 결함이다.
//  (1) 정적 라우트 → 사이트맵: 렌더되는 URL이 색인 후보 밖에 남으면 안 된다.
//  (2) 리다이렉트 라우트 → 사이트맵 제외: (1)만 검사하면 라우트를 리다이렉트로 되돌린 뒤
//      사이트맵에만 URL을 남기는 더 나쁜 모순 상태를 통과시키게 된다.
//  (3) 사이트맵 → 정적 라우트: 라우터에 없는 URL을 실으면 캐치올이 404 화면을 렌더한다.
function validateRouterSitemapParity(sitemapUrls) {
  const routerSource = readFileSync(
    resolve(projectRoot, "src", "router", "index.ts"),
    "utf8"
  );
  const routerRoutes = parseRouterRoutes(routerSource);
  // 파라미터·캐치올 라우트는 정적 URL이 아니다
  const isStatic = (route) => !route.redirect && !route.path.includes(":");
  const staticPaths = new Set(routerRoutes.filter(isStatic).map((route) => route.path));

  const indexRoute = routerRoutes.find((route) => route.path === "/");
  assert(indexRoute, "router/index.ts must register an index route");
  assert(!indexRoute.redirect,
    "Index route must render its own view: a redirect home canonicalizes to the target "
      + "page, and a page whose canonical points elsewhere cannot be listed in the sitemap");

  for (const route of routerRoutes.filter(isStatic)) {
    assert(sitemapUrls.has(canonicalUrlFor(route.path)),
      `Router route is missing from the sitemap: ${canonicalUrlFor(route.path)}`);
  }
  for (const route of routerRoutes.filter((candidate) => candidate.redirect)) {
    assert(!sitemapUrls.has(canonicalUrlFor(route.path)),
      `Sitemap must not list the redirect route: ${canonicalUrlFor(route.path)}`);
  }
  for (const route of SITEMAP_ROUTES) {
    assert(staticPaths.has(route),
      `Sitemap lists a URL with no static router route: ${canonicalUrlFor(route)}`);
  }
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
const sitemapUrls = validateSitemap();
validateRouterSitemapParity(sitemapUrls);
validatePolicyDisclosures();

const notFoundPath = resolve(distRoot, "404.html");
assert(existsSync(notFoundPath), "Missing custom 404.html output");
const notFoundHtml = readFileSync(notFoundPath, "utf8");
validateTitleRecipe(notFoundHtml, "/404");
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

const utilityCount = validateUtilitiesAreGenerated({ projectRoot, distRoot });

console.log(
  `Validated ${SEO_ROUTES.length} SEO routes (${SITEMAP_ROUTES.length} sitemap URLs, ` +
  `${Object.keys(CANONICAL_OVERRIDES).length} canonicalized variants), ` +
  `${utilityCount} generated colour utilities, and custom 404 output.`
);
