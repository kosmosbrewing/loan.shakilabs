import { useHead } from "@unhead/vue";
import { toValue, type MaybeRefOrGetter } from "vue";
import { useRoute } from "vue-router";
import { getSiteUrl } from "@/lib/site";

// 함대 제목 레시피(2026-10-03 개정) — 네이버는 검색 결과 제목을 약 35자에서 자른다.
// 옛 레시피 `<페이지 제목> | 대출 계산기 | ShakiLabs`는 가운데 접미사(" | 대출 계산기 | ShakiLabs",
// 13자)가 핵심 구절과 브랜드를 밀어내 잘려 보이게 만들었다. 이제 페이지 종류에 따라 두 모양을 쓴다.
// - "tool"(계산기·가이드, 기본값): `<페이지 제목> | ShakiLabs`
// - "site"(소개·이용약관·개인정보처리방침·404): `<페이지 제목> · <앱 이름> | ShakiLabs`
//   앱 이름까지 빼면 "이용약관 | ShakiLabs"가 shakilabs.com 아래 12개 앱에서 똑같아져
//   도메인 안에서 중복 제목이 된다. 정책 페이지는 검색 유입이 목적이 아니라 35자 절단이 문제되지 않는다.
// 홈은 `<앱 이름> | ShakiLabs`(= title에 앱 이름 자체를 넘기면 "tool" 모양 그대로 일치한다).
export const APP_NAME = "대출 계산기";
const TITLE_SUFFIX = " | ShakiLabs";
const SITE_APP_SUFFIX = ` · ${APP_NAME}`;
export type TitleKind = "tool" | "site";

// 호출부가 옛 접미사를 그대로 넘겨도 두 번 붙지 않게 벗겨 낸다.
// 긴 것부터 검사해야 " | ShakiLabs"만 먼저 벗겨지고 앱 이름이 남는 일이 없다.
const LEGACY_TITLE_SUFFIXES = [
  ` | ${APP_NAME}${TITLE_SUFFIX}`,
  `${SITE_APP_SUFFIX}${TITLE_SUFFIX}`,
  " | shakilabs.com/loan",
  ` | ${APP_NAME}`,
  SITE_APP_SUFFIX,
  TITLE_SUFFIX,
] as const;

type SEOOptions = {
  title: MaybeRefOrGetter<string>;
  description: MaybeRefOrGetter<string>;
  ogImage?: MaybeRefOrGetter<string | undefined>;
  noindex?: MaybeRefOrGetter<boolean | undefined>;
  jsonLd?: MaybeRefOrGetter<
    Record<string, unknown> | Record<string, unknown>[] | undefined
  >;
  /**
   * 변종 URL을 대표 URL로 통합할 때 지정한다 ("/repayment" 등).
   * canonical·hreflang·og:url이 모두 이 경로 기준으로 계산된다.
   */
  canonicalPath?: MaybeRefOrGetter<string | undefined>;
  /** 기본 "tool". 소개·약관·개인정보·404만 "site"로 넘긴다(위 레시피 주석 참고). */
  titleKind?: MaybeRefOrGetter<TitleKind | undefined>;
};

/** 문서 제목·og:title·twitter:title이 모두 이 함수 하나를 거친다 — 레시피를 두 곳에 적지 않는다. */
export function buildPageTitle(rawTitle: string, kind: TitleKind = "tool"): string {
  const trimmed = rawTitle.trim();
  let baseTitle = trimmed;

  for (const suffix of LEGACY_TITLE_SUFFIXES) {
    if (baseTitle.endsWith(suffix)) {
      baseTitle = baseTitle.slice(0, -suffix.length).trimEnd();
      break;
    }
  }

  if (!baseTitle || baseTitle === APP_NAME) {
    return `${APP_NAME}${TITLE_SUFFIX}`;
  }

  return kind === "site"
    ? `${baseTitle}${SITE_APP_SUFFIX}${TITLE_SUFFIX}`
    : `${baseTitle}${TITLE_SUFFIX}`;
}

export function useSEO({
  title,
  description,
  ogImage,
  noindex = false,
  jsonLd,
  canonicalPath,
  titleKind,
}: SEOOptions): void {
  const route = useRoute();

  useHead(() => {
    const resolvedTitle = buildPageTitle(toValue(title), toValue(titleKind) ?? "tool");
    const resolvedDescription = toValue(description);
    const resolvedNoindex = Boolean(toValue(noindex));
    const resolvedOgImage = toValue(ogImage);
    const resolvedJsonLd = toValue(jsonLd);
    const resolvedJsonLdArray = Array.isArray(resolvedJsonLd)
      ? resolvedJsonLd.filter(
          (entry): entry is Record<string, unknown> =>
            Boolean(entry) && typeof entry === "object"
        )
      : resolvedJsonLd && typeof resolvedJsonLd === "object"
        ? [resolvedJsonLd]
        : [];
    const siteUrl = getSiteUrl().replace(/\/+$/, "");
    // canonicalPath가 지정되면 실제 경로 대신 대표 경로로 canonical류 메타를 통일한다
    const currentPath = toValue(canonicalPath) ?? (route.path || "/");
    const currentUrl = currentPath === "/" ? siteUrl : `${siteUrl}${currentPath}`;

    return {
      htmlAttrs: {
        lang: "ko",
      },
      title: resolvedTitle,
      link: currentUrl
        ? [
            { rel: "canonical", href: currentUrl },
            { rel: "alternate", hreflang: "ko", href: currentUrl },
            { rel: "alternate", hreflang: "x-default", href: currentUrl },
          ]
        : [],
      meta: [
        { name: "description", content: resolvedDescription },
        { property: "og:title", content: resolvedTitle },
        { property: "og:description", content: resolvedDescription },
        { name: "twitter:title", content: resolvedTitle },
        { name: "twitter:description", content: resolvedDescription },
        ...(currentUrl ? [{ property: "og:url", content: currentUrl }] : []),
        ...(resolvedNoindex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
        ...(resolvedOgImage
          ? [
              { property: "og:image", content: resolvedOgImage },
              { name: "twitter:image", content: resolvedOgImage },
            ]
          : []),
      ],
      script: resolvedJsonLdArray.map((entry, index) => ({
        key: `json-ld-${index}`,
        type: "application/ld+json",
        textContent: JSON.stringify(entry),
      })),
    };
  });
}
