<script setup lang="ts">
import { useId } from "vue";
import { bulletWidth } from "@/utils/chartMath";

defineProps<{
  title: string;
  value: number;
  limit: number;
  formatValue: (value: number) => string;
}>();
const titleId = `bullet-${useId()}`;
</script>

<template>
  <section class="retro-panel p-4 space-y-3" :aria-labelledby="titleId">
    <div class="flex items-baseline justify-between gap-3">
      <h3 :id="titleId" class="text-caption font-semibold text-foreground">{{ title }}</h3>
      <strong class="text-caption tabular-nums" :class="value > limit ? 'text-fee' : 'text-primary'">
        {{ formatValue(value) }} / {{ formatValue(limit) }}
      </strong>
    </div>
    <div class="relative h-4 overflow-hidden rounded-full bg-muted/60" role="progressbar" :aria-valuenow="Math.min(100, value / limit * 100)" aria-valuemin="0" aria-valuemax="100">
      <svg viewBox="0 0 100 16" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
        <rect :width="bulletWidth(value, limit)" height="16" rx="5" :class="value > limit ? 'fill-fee' : 'fill-primary'" />
        <line x1="99" y1="0" x2="99" y2="16" class="stroke-foreground" stroke-width="1" />
      </svg>
    </div>
    <p class="text-tiny text-muted-foreground">막대 끝은 선택한 규제 한도이며 초과 여부는 숫자로 함께 표시합니다.</p>
  </section>
</template>
