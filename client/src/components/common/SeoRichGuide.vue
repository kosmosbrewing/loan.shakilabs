<script setup lang="ts">
import { chunkParagraph } from "../../data/paragraphs";
/**
 * SEO 리치 가이드 섹션 컴포넌트
 * 각 계산기 뷰 하단에 도메인 가이드 + FAQ + 체크리스트를 출력하여
 * vite-ssg SSR 시 HTML에 실제 텍스트가 반영되도록 한다.
 */
export interface GuideSection {
  h2: string;
  // 문자열 그대로(기존 호출부) 또는 문단 배열 — 250자를 넘는 긴 섹션(BRIEF-V8)은 배열로 넘겨
  // 각 문단을 200자 이내로 쪼갠다. 문장 삭제·숫자 변경 없음(seller #3, commit 831fb89와 같은 규칙).
  body: string | string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideChecklist {
  title: string;
  items: string[];
}

export interface GuideSource {
  label: string;
  url: string;
}

defineProps<{
  title: string;
  intro: string;
  sections?: GuideSection[];
  faqs?: GuideFaq[];
  checklist?: GuideChecklist;
  sources?: GuideSource[];
  disclaimer?: string;
}>();

// body가 문자열이면 문단 1개로, 배열이면 그대로 — 호출부 양쪽을 한 규칙으로 렌더한다.
function paragraphsOf(body: string | string[]): string[] {
  // v8b: 문자열이면 렌더 시점에 문장 경계로 ≤250자 문단으로 나눈다(데이터 쪽 분할을 놓친 경로까지 한 규칙)
  return Array.isArray(body) ? body : chunkParagraph(body);
}
</script>

<template>
  <section class="seo-rich-guide space-y-4 rounded-lg border border-border/40 bg-muted/10 p-4 md:p-6">
    <header class="space-y-2">
      <h2 class="text-xl font-bold text-foreground">{{ title }}</h2>
      <p class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{{ intro }}</p>
    </header>

    <div v-if="sections && sections.length > 0" class="space-y-4">
      <article
        v-for="(s, i) in sections"
        :key="`sec-${i}`"
        class="space-y-2"
      >
        <h3 class="text-base font-semibold text-foreground">{{ s.h2 }}</h3>
        <p
          v-for="(paragraph, pIdx) in paragraphsOf(s.body)"
          :key="`sec-${i}-p-${pIdx}`"
          class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground"
        >{{ paragraph }}</p>
      </article>
    </div>

    <div v-if="checklist && checklist.items.length > 0" class="space-y-2">
      <h3 class="text-base font-semibold text-foreground">{{ checklist.title }}</h3>
      <ul class="ml-4 max-w-[65ch] list-disc space-y-1 text-sm text-muted-foreground">
        <li v-for="(item, i) in checklist.items" :key="`chk-${i}`">
          {{ item }}
        </li>
      </ul>
    </div>

    <div v-if="faqs && faqs.length > 0" class="space-y-3">
      <h3 class="text-base font-semibold text-foreground">자주 묻는 질문 (FAQ)</h3>
      <div
        v-for="(faq, i) in faqs"
        :key="`faq-${i}`"
        class="space-y-1"
      >
        <p class="max-w-[65ch] text-sm font-semibold text-foreground">Q. {{ faq.q }}</p>
        <p class="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">A. {{ faq.a }}</p>
      </div>
    </div>

    <div v-if="sources && sources.length > 0" class="space-y-2">
      <h3 class="text-base font-semibold text-foreground">공식 출처</h3>
      <ul class="ml-4 max-w-[65ch] list-disc space-y-1 text-sm text-muted-foreground">
        <li v-for="(src, i) in sources" :key="`src-${i}`">
          <a
            :href="src.url"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2 hover:text-foreground"
          >{{ src.label }}</a>
        </li>
      </ul>
    </div>

    <p
      v-if="disclaimer"
      class="max-w-[65ch] border-t border-border/40 pt-3 text-xs text-muted-foreground"
    >
      {{ disclaimer }}
    </p>
  </section>
</template>
