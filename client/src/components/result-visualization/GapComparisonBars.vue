<script setup lang="ts">
// 차트 본체는 @shakilabs/ui ShGapBars(1위 대비 차이 막대) — 이 파일은 loan 패널 크롬과 선택지 수 규칙만 맡는다.
// 선택지가 둘뿐이면 차이 막대가 하나라 차이 크기와 무관하게 늘 꽉 찬다(길이가 아무것도 말하지 않는다).
// 그때는 0부터 그린 막대(ShMetricBars)로 되돌린다 — 자격 충족 상품 수처럼 입력에 따라 개수가 바뀌는 곳 때문.
import { computed } from "vue";
import { ShGapBars, ShMetricBars, gapsToBest } from "@shakilabs/ui";
import type { GapBarItem, GapDirection, MetricBarGroup } from "@shakilabs/ui";

const props = defineProps<{
  title: string;
  /** 두 모드 공통 설명(비교 기준) */
  note: string;
  /** 차이 막대일 때만 앞에 붙는 한 문장 — 막대가 무엇의 차이인지 */
  gapLead: string;
  /** 선택지가 둘 이하일 때 되돌아갈 막대의 지표 이름 */
  metricLabel: string;
  items: readonly GapBarItem[];
  formatValue: (value: number) => string;
  better: GapDirection;
}>();

const MIN_GAP_ITEMS = 3;
const available = computed(() => props.items.filter((item) => item.value !== null));
const useGap = computed(() => available.value.length >= MIN_GAP_ITEMS);

const fallbackMetrics = computed<MetricBarGroup[]>(() => {
  const rows = gapsToBest(available.value.map((item) => item.value), props.better);
  const best = new Set(rows.filter((row) => row.rank === 1).map((row) => row.index));
  return [{
    key: "value",
    label: props.metricLabel,
    values: available.value.map((item, index) => ({
      key: item.key,
      label: item.label,
      value: item.value ?? 0,
      highlight: best.has(index),
      detail: item.detail,
    })),
  }];
});
</script>

<template>
  <section class="retro-panel overflow-hidden">
    <div class="p-4 pb-0">
      <ShGapBars
        v-if="useGap"
        :items="items"
        :note="`${gapLead} ${note}`"
        :format-value="formatValue"
        :better="better"
        highlight-tone="success"
      >
        <template #header="{ titleId }">
          <h3 :id="titleId" class="sh-chart__heading">{{ title }}</h3>
        </template>
      </ShGapBars>
      <ShMetricBars v-else :metrics="fallbackMetrics" :note="note" :format-value="formatValue">
        <template #header="{ titleId }">
          <h3 :id="titleId" class="sh-chart__heading">{{ title }}</h3>
        </template>
      </ShMetricBars>
    </div>
    <div class="pb-4" />
  </section>
</template>
