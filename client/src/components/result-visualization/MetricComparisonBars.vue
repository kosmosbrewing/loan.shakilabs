<script setup lang="ts">
import { computed, useId } from "vue";
import { positiveBarWidth } from "@/utils/chartMath";

type BarValue = { key: string; label: string; value: number; highlight?: boolean; detail?: string };
type Metric = { key: string; label: string; values: readonly BarValue[] };
const props = defineProps<{
  title: string;
  note: string;
  metrics: readonly Metric[];
  formatValue: (value: number) => string;
}>();
const titleId = `metric-bars-${useId()}`;
const maxima = computed(() => new Map(props.metrics.map((metric) => [
  metric.key,
  Math.max(...metric.values.map((item) => item.value), 0),
])));
</script>

<template>
  <section class="retro-panel overflow-hidden" :aria-labelledby="titleId">
    <div class="p-4 pb-2">
      <h3 :id="titleId" class="text-caption font-semibold text-foreground">{{ title }}</h3>
      <p class="mt-1 text-tiny leading-relaxed text-muted-foreground">{{ note }}</p>
    </div>
    <div class="space-y-5 p-4 pt-2">
      <div v-for="metric in metrics" :key="metric.key" class="space-y-3">
        <p class="border-b border-border/50 pb-1.5 text-tiny font-semibold text-muted-foreground">{{ metric.label }}</p>
        <div v-for="item in metric.values" :key="item.key" class="space-y-1.5">
          <div class="flex items-baseline justify-between gap-3 text-caption">
            <span class="font-semibold" :class="item.highlight ? 'text-primary' : 'text-foreground'">{{ item.label }}</span>
            <strong class="shrink-0 tabular-nums" :class="item.highlight ? 'text-primary' : 'text-foreground'">{{ formatValue(item.value) }}</strong>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-muted/55">
            <svg viewBox="0 0 100 12" preserveAspectRatio="none" class="block h-full w-full" aria-hidden="true">
              <rect
                :width="positiveBarWidth(item.value, maxima.get(metric.key) ?? 0)"
                height="12"
                rx="4"
                :class="item.highlight ? 'fill-primary' : 'fill-muted-foreground/45'"
              />
            </svg>
          </div>
          <p v-if="item.detail" class="text-tiny text-muted-foreground">{{ item.detail }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
