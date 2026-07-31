<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShRankedBars — 이 파일은 loan 패널 크롬과 '제한' 표기만 맡는다.
import { computed } from "vue";
import { ShRankedBars } from "@shakilabs/ui";
import type { RankedBarItem } from "@shakilabs/ui";

type Constraint = { key: string; label: string; value: number; limiting?: boolean; detail?: string };
const props = defineProps<{
  title: string;
  items: readonly Constraint[];
  formatValue: (value: number) => string;
}>();

// '제한' 표기는 라벨에 접미해 유지한다 — 이 배지가 화면의 핵심 신호다
const rankedItems = computed<RankedBarItem[]>(() => props.items.map((item) => ({
  key: item.key,
  label: item.limiting ? `${item.label} · 제한` : item.label,
  value: item.value,
  highlight: item.limiting,
  detail: item.detail,
})));

function format(value: number | null): string {
  return value === null ? "-" : props.formatValue(value);
}
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="p-4">
      <ShRankedBars
        :title="title"
        note="가장 짧은 한도가 실제 대출 가능액을 제한합니다."
        :items="rankedItems"
        :format-value="format"
      />
    </div>
  </section>
</template>
