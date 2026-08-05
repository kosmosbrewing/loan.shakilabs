<script setup lang="ts">
import { useSEO } from "@/composables/useSEO";

const props = defineProps<{
  title: string;
  description: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  /** 변종 URL을 대표 URL로 canonical 통합할 때 대표 경로 ("/repayment" 등) */
  canonicalPath?: string;
}>();

useSEO({
  title: () => props.title,
  description: () => props.description,
  jsonLd: () => props.jsonLd,
  noindex: () => props.noindex,
  canonicalPath: () => props.canonicalPath,
});
</script>

<template>
</template>
