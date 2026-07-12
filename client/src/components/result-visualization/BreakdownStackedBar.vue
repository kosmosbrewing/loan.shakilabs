<script setup lang="ts">
import { computed, useId } from "vue";
import { normalizeSegments } from "@/utils/chartMath";

type Segment = { key: string; label: string; value: number; tone: "primary" | "fee" | "muted" };
const props = defineProps<{
  title: string;
  note: string;
  segments: readonly Segment[];
  formatValue: (value: number) => string;
}>();
const titleId = `breakdown-${useId()}`;
const ratios = computed(() => normalizeSegments(props.segments.map((segment) => segment.value)));
const offsets = computed(() => ratios.value.map((_, index) => ratios.value.slice(0, index).reduce((sum, ratio) => sum + ratio, 0)));
</script>

<template>
  <section class="retro-panel p-4 space-y-3" :aria-labelledby="titleId">
    <div>
      <h3 :id="titleId" class="text-caption font-semibold text-foreground">{{ title }}</h3>
      <p class="mt-1 text-tiny text-muted-foreground">{{ note }}</p>
    </div>
    <svg viewBox="0 0 100 18" preserveAspectRatio="none" class="h-5 w-full overflow-hidden rounded-lg" role="img" :aria-labelledby="titleId">
      <rect
        v-for="(segment, index) in segments"
        :key="segment.key"
        :x="offsets[index] * 100"
        :width="ratios[index] * 100"
        height="18"
        :class="segment.tone === 'fee' ? 'fill-fee' : segment.tone === 'muted' ? 'fill-muted-foreground/45' : 'fill-primary'"
      />
    </svg>
    <dl class="grid gap-2 sm:grid-cols-2">
      <div v-for="segment in segments" :key="`${segment.key}-legend`" class="flex justify-between gap-3 text-caption">
        <dt class="text-muted-foreground">{{ segment.label }}</dt>
        <dd class="font-semibold tabular-nums">{{ formatValue(segment.value) }}</dd>
      </div>
    </dl>
  </section>
</template>
