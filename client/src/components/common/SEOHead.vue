<script setup lang="ts">
import { useSEO, type TitleKind } from "@/composables/useSEO";

const props = defineProps<{
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  /** 변종 URL을 대표 URL로 canonical 통합할 때 대표 경로 ("/repayment" 등) */
  canonicalPath?: string;
  /** 기본 "tool". 소개·약관·개인정보·404만 "site"로 넘긴다(useSEO의 레시피 주석 참고). */
  titleKind?: TitleKind;
}>();

useSEO({
  title: () => props.title,
  description: () => props.description,
  jsonLd: () => props.jsonLd,
  noindex: () => props.noindex,
  canonicalPath: () => props.canonicalPath,
  titleKind: () => props.titleKind,
});
</script>

<template>
</template>
