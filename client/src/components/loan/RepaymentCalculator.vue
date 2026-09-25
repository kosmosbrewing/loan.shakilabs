<script setup lang="ts">
import { computed } from "vue";
import {
  ShButton,
  ShCalculatorSplit,
  ShField,
  ShInput,
  ShLabel,
  ShPairRow,
  ShSelect,
  ShTable,
  ShTableBody,
  ShTableCell,
  ShTableHead,
  ShTableHeader,
  ShTableRow,
} from "@shakilabs/ui";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanResultHero from "@/components/loan/LoanResultHero.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import MetricComparisonBars from "@/components/result-visualization/MetricComparisonBars.vue";
import { LOAN_ASSUMPTION_NOTE, TERM_OPTIONS, repaymentPresets } from "@/data/loanPresets";
import { useRepaymentCalculator } from "@/composables/useRepaymentCalculator";
import { formatWon, parseNumericInput } from "@/lib/utils";

const props = defineProps<{ initialPrincipal?: number }>();
const override = props.initialPrincipal ? { principal: props.initialPrincipal } : undefined;
const { state, result, applyPreset, reset } = useRepaymentCalculator(override);

const metrics = computed(() => [
  {
    label: "원리금균등 총이자",
    value: formatWon(result.value.annuity.totalInterest),
    helper: `매달 ${formatWon(result.value.annuity.monthlyPayment)} 고정`,
  },
  {
    label: "원금균등 총이자",
    value: formatWon(result.value.equalPrincipal.totalInterest),
    helper: `첫 달 ${formatWon(result.value.equalPrincipal.firstPayment)}`,
  },
  {
    label: "첫 달 납입 차이",
    value: formatWon(result.value.firstMonthGap),
    helper: "원금균등이 더 많이 납부",
  },
]);
const comparisonMetrics = computed(() => [
  {
    key: "first",
    label: "첫 달 납입액",
    values: [
      { key: "annuity", label: "원리금균등", value: result.value.annuity.firstPayment },
      { key: "equal", label: "원금균등", value: result.value.equalPrincipal.firstPayment },
    ],
  },
  {
    key: "interest",
    label: "전체 기간 총이자",
    values: [
      { key: "annuity", label: "원리금균등", value: result.value.annuity.totalInterest },
      { key: "equal", label: "원금균등", value: result.value.equalPrincipal.totalInterest, highlight: true },
    ],
  },
]);

function selectPreset(key: string): void {
  const preset = repaymentPresets.find((item) => item.key === key);
  if (preset) applyPreset(preset.input);
}
</script>

<template>
  <div class="space-y-4">
    <ShCalculatorSplit>
      <template #input>
        <LoanScenarioChips :items="repaymentPresets" @select="selectPreset" />
        <section class="retro-panel-muted p-4 space-y-4">
          <div class="grid gap-3 sm:grid-cols-3">
            <ShField class="sm:col-span-2">
              <ShLabel for="repayment-principal">대출원금</ShLabel>
              <ShInput
                id="repayment-principal"
                :model-value="state.principal.toLocaleString('ko-KR')"
                inputmode="numeric"
                @update:model-value="state.principal = parseNumericInput($event)"
              >
                <template #suffix>원</template>
              </ShInput>
            </ShField>
            <ShField>
              <ShLabel for="repayment-rate">금리</ShLabel>
              <ShInput
                id="repayment-rate"
                :model-value="state.annualRate"
                min="0"
                max="30"
                step="0.1"
                type="number"
                @update:model-value="state.annualRate = Number($event)"
              >
                <template #suffix>%</template>
              </ShInput>
            </ShField>
            <ShField class="sm:col-span-3">
              <ShLabel for="repayment-term">만기</ShLabel>
              <ShSelect id="repayment-term" :model-value="state.termMonths" @update:model-value="state.termMonths = Number($event)">
                <option v-for="term in TERM_OPTIONS" :key="term" :value="term">{{ term }}개월</option>
              </ShSelect>
            </ShField>
          </div>

          <div class="flex flex-wrap gap-2">
            <ShButton type="button" variant="secondary" @click="reset">
              기본값으로 초기화
            </ShButton>
          </div>
        </section>
      </template>

      <template #result>
        <LoanResultHero
          label="총이자 차이"
          :value="formatWon(result.interestGap)"
          sub="원리금균등 − 원금균등"
        />
        <LoanMetricGrid :items="metrics" />
      </template>
    </ShCalculatorSplit>

    <!-- 데이터 블록 2열: 차트(340)와 표(191)를 짝짓는다(비율 0.56) -->
    <ShPairRow>
      <template #start>
        <MetricComparisonBars
          title="상환 방식 부담 비교"
          note="초기 현금흐름과 전체 이자 부담은 별개이므로 두 축으로 나눠 표시합니다."
          :metrics="comparisonMetrics"
          :format-value="formatWon"
        />
      </template>
      <template #end>
        <!-- ShTable 기본 min-width 32rem(512px)은 반폭 칸(1024px≈480px)보다 넓어 가로 스크롤을
             부르지만, 4열뿐이라 실제 내용 폭은 그보다 좁다 — lg부터 하한을 풀어 칸 폭에 맞춘다
             (.repayment-table-loosen, inner-scroll 실측: 가려짐 0). -->
        <section class="retro-panel p-4 space-y-3">
          <p class="text-caption leading-relaxed text-muted-foreground">{{ LOAN_ASSUMPTION_NOTE }}</p>
          <div class="repayment-table-loosen">
            <ShTable aria-label="상환 방식별 납입액 비교" density="compact" min-width="32rem" scroll-hint="표를 좌우로 스크롤해 상환액을 확인하세요.">
              <ShTableHeader>
                <ShTableRow>
                  <ShTableHead>방식</ShTableHead>
                  <ShTableHead numeric>첫 달</ShTableHead>
                  <ShTableHead numeric>마지막 달</ShTableHead>
                  <ShTableHead numeric>총상환액</ShTableHead>
                </ShTableRow>
              </ShTableHeader>
              <ShTableBody>
                <ShTableRow>
                  <ShTableCell emphasis>원리금균등</ShTableCell>
                  <ShTableCell numeric>{{ formatWon(result.annuity.firstPayment) }}</ShTableCell>
                  <ShTableCell numeric>{{ formatWon(result.annuity.lastPayment) }}</ShTableCell>
                  <ShTableCell numeric>{{ formatWon(result.annuity.totalRepayment) }}</ShTableCell>
                </ShTableRow>
                <ShTableRow>
                  <ShTableCell emphasis>원금균등</ShTableCell>
                  <ShTableCell numeric>{{ formatWon(result.equalPrincipal.firstPayment) }}</ShTableCell>
                  <ShTableCell numeric>{{ formatWon(result.equalPrincipal.lastPayment) }}</ShTableCell>
                  <ShTableCell numeric>{{ formatWon(result.equalPrincipal.totalRepayment) }}</ShTableCell>
                </ShTableRow>
              </ShTableBody>
            </ShTable>
          </div>
        </section>
      </template>
    </ShPairRow>
  </div>
</template>

<style scoped>
/* ShTable의 --sh-table-min-width는 인라인 스타일이라 클래스 min-w-0로는 못 이긴다 —
   :deep()로 .sh-table의 min-width를 직접 더 높은 특이성으로 다시 선언해야 lg부터 풀린다. */
@media (min-width: 64rem) {
  .repayment-table-loosen :deep(.sh-table) {
    min-width: 0;
  }
}
</style>
