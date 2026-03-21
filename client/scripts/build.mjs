import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  SEO_ROUTES,
  REPAYMENT_AMOUNTS,
  DSR_INCOMES,
  REFINANCE_BALANCES,
  PREPAYMENT_AMOUNTS,
  STUDENT_LOAN_BALANCES,
  MORTGAGE_AMOUNTS,
  JEONSE_LOAN_AMOUNTS,
  STEPPING_STONE_AMOUNTS,
  LTV_DTI_AMOUNTS,
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

// 파라미터 라우트 집합 (priority/changefreq 분기용)
const paramPaths = new Set([
  ...REPAYMENT_AMOUNTS.map((a) => `/repayment/${a}`),
  ...DSR_INCOMES.map((i) => `/dsr/${i}`),
  ...REFINANCE_BALANCES.map((b) => `/refinance/${b}`),
  ...PREPAYMENT_AMOUNTS.map((a) => `/prepayment-fee/${a}`),
  ...STUDENT_LOAN_BALANCES.map((b) => `/student-loan/${b}`),
  ...MORTGAGE_AMOUNTS.map((a) => `/mortgage-compare/${a}`),
  ...JEONSE_LOAN_AMOUNTS.map((a) => `/jeonse-loan/${a}`),
  ...STEPPING_STONE_AMOUNTS.map((a) => `/stepping-stone-loan/${a}`),
  ...LTV_DTI_AMOUNTS.map((a) => `/ltv-dti/${a}`),
]);

const basePriority = {
  "/": "1.0",
  "/refinance": "0.9",
  "/dsr": "0.9",
  "/repayment": "0.9",
  "/prepayment-fee": "0.8",
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
  const urls = SEO_ROUTES.map((path) => {
    const { changefreq, priority } = getRouteConfig(path);
    const loc = path === "/" ? `${baseUrl}/` : `${baseUrl}${path}`;
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

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
