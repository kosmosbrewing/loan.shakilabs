<script setup lang="ts">
import { computed, useId } from "vue";
import { positiveBarWidth } from "@/utils/chartMath";

type Constraint = { key: string; label: string; value: number; limiting?: boolean; detail?: string };
const props = defineProps<{
  title: string;
  items: readonly Constraint[];
  formatValue: (value: number) => string;
}>();
const titleId = `constraints-${useId()}`;
const maximum = computed(() => Math.max(...props.items.map((item) => item.value), 0));
</script>

<template>
  <section class="retro-panel overflow-hidden" :aria-labelledby="titleId">
    <div class="p-4 pb-2">
      <h3 :id="titleId" class="text-caption font-semibold text-foreground">{{ title }}</h3>
      <p class="mt-1 text-tiny text-muted-foreground">가장 짧은 한도가 실제 대출 가능액을 제한합니다.</p>
    </div>
    <ol class="space-y-3 p-4 pt-2">
      <li v-for="item in items" :key="item.key" class="space-y-1.5">
        <div class="flex items-baseline justify-between gap-3 text-caption">
          <span class="font-semibold" :class="item.limiting ? 'text-primary' : 'text-foreground'">
            {{ item.label }}<span v-if="item.limiting" class="ml-1 text-tiny">제한</span>
          </span>
          <strong class="tabular-nums" :class="item.limiting ? 'text-primary' : 'text-foreground'">{{ formatValue(item.value) }}</strong>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-muted/55">
          <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
            <rect :width="positiveBarWidth(item.value, maximum)" height="12" rx="4" :class="item.limiting ? 'fill-primary' : 'fill-muted-foreground/45'" />
          </svg>
        </div>
        <p v-if="item.detail" class="text-tiny text-muted-foreground">{{ item.detail }}</p>
      </li>
    </ol>
  </section>
</template>
