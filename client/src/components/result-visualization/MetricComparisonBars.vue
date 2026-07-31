<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShMetricBars — 이 파일은 loan 패널 크롬만 입힌다.
// 호출부 5곳의 props는 그대로 유지한다.
import { ShMetricBars } from "@shakilabs/ui";
import type { MetricBarGroup } from "@shakilabs/ui";

defineProps<{
  title: string;
  note: string;
  metrics: readonly MetricBarGroup[];
  formatValue: (value: number) => string;
}>();
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="p-4 pb-0">
      <ShMetricBars :metrics="metrics" :note="note" :format-value="formatValue">
        <template #header="{ titleId }">
          <h3 :id="titleId" class="sh-chart__heading">{{ title }}</h3>
        </template>
      </ShMetricBars>
    </div>
    <div class="pb-4" />
  </section>
</template>
