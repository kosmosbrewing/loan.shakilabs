<script setup lang="ts">
import { computed } from "vue";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import { DSR_LIMIT_OPTIONS, LOAN_ASSUMPTION_NOTE, TERM_OPTIONS, dsrPresets } from "@/data/loanPresets";
import { useDsrCalculator } from "@/composables/useDsrCalculator";
import { formatPercent, formatWon, parseNumericInput } from "@/lib/utils";

const props = defineProps<{ initialIncome?: number }>();
const override = props.initialIncome ? { annualIncome: props.initialIncome } : undefined;
const { state, result, applyPreset, reset } = useDsrCalculator(override);

const metrics = computed(() => [
  {
    label: "추가 가능 연 원리금",
    value: formatWon(result.value.allowedAnnualDebtService),
    helper: "연소득 × DSR 한도 - 기존 원리금",
  },
  {
    label: "월 상환 가능액",
    value: formatWon(result.value.availableMonthlyBudget),
    helper: "새 대출이 감당해야 할 월 한도",
  },
  {
    label: "추정 최대 대출액",
    value: formatWon(result.value.maxLoanAmount),
    helper: `총상환액 ${formatWon(result.value.estimatedTotalRepayment)}`,
  },
  {
    label: "현재 DSR",
    value: formatPercent(result.value.currentDsr, 1),
    helper: "기존 원리금 기준",
  },
]);

function selectPreset(key: string): void {
  const preset = dsrPresets.find((item) => item.key === key);
  if (preset) applyPreset(preset.input);
}
</script>

<template>
  <div class="space-y-4">
    <LoanScenarioChips :items="dsrPresets" @select="selectPreset" />

    <div class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section class="retro-panel-muted p-4 space-y-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">연소득</span>
            <input type="text" inputmode="numeric" class="retro-input" :value="state.annualIncome.toLocaleString('ko-KR')" @input="state.annualIncome = parseNumericInput(($event.target as HTMLInputElement).value)" />
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">기존 연 원리금</span>
            <input
              type="text"
              inputmode="numeric"
              class="retro-input"
              :value="state.existingAnnualDebtService.toLocaleString('ko-KR')"
              @input="state.existingAnnualDebtService = parseNumericInput(($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">DSR 한도</span>
            <select v-model.number="state.dsrLimit" class="retro-input">
              <option v-for="limit in DSR_LIMIT_OPTIONS" :key="limit" :value="limit">{{ Math.round(limit * 100) }}%</option>
            </select>
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">예상 금리</span>
            <input v-model.number="state.newLoanRate" class="retro-input" min="0" max="30" step="0.1" type="number" />
          </label>
          <label class="space-y-1.5 sm:col-span-2">
            <span class="text-caption font-semibold text-foreground">만기</span>
            <select v-model.number="state.termMonths" class="retro-input">
              <option v-for="term in TERM_OPTIONS" :key="term" :value="term">{{ term }}개월</option>
            </select>
          </label>
        </div>

        <div class="flex flex-wrap gap-2">
          <button type="button" class="retro-panel px-3 py-2 text-caption font-semibold text-foreground" @click="reset">
            기본값으로 초기화
          </button>
          <p class="text-tiny text-muted-foreground">
            카드론·마이너스통장·자동차 할부 등 DSR에 반영되는 기존 채무는 연 원리금으로 합산하세요.
          </p>
        </div>
      </section>

      <section class="retro-panel p-4 space-y-3">
        <div class="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
          <p class="text-caption font-semibold text-primary">한도 해석</p>
          <p class="mt-1 text-body text-foreground">
            현재 가정으로는 월 {{ formatWon(result.availableMonthlyBudget) }}까지 새 대출 상환을 감당하는 구조입니다.
          </p>
        </div>
        <p class="text-caption leading-relaxed text-muted-foreground">{{ LOAN_ASSUMPTION_NOTE }}</p>
      </section>
    </div>

    <LoanMetricGrid :items="metrics" />
  </div>
</template>
