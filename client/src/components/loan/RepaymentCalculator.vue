<script setup lang="ts">
import { computed } from "vue";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import { LOAN_ASSUMPTION_NOTE, TERM_OPTIONS, repaymentPresets } from "@/data/loanPresets";
import { useRepaymentCalculator } from "@/composables/useRepaymentCalculator";
import { formatWon } from "@/lib/utils";

const { state, result, applyPreset, reset } = useRepaymentCalculator();

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
    label: "총이자 차이",
    value: formatWon(result.value.interestGap),
    helper: "원리금균등 - 원금균등",
  },
  {
    label: "첫 달 납입 차이",
    value: formatWon(result.value.firstMonthGap),
    helper: "원금균등이 더 많이 납부",
  },
]);

function selectPreset(key: string): void {
  const preset = repaymentPresets.find((item) => item.key === key);
  if (preset) applyPreset(preset.input);
}
</script>

<template>
  <div class="space-y-4">
    <LoanScenarioChips :items="repaymentPresets" @select="selectPreset" />

    <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <section class="retro-panel-muted p-4 space-y-4">
        <div class="grid gap-3 sm:grid-cols-3">
          <label class="space-y-1.5 sm:col-span-2">
            <span class="text-caption font-semibold text-foreground">대출원금</span>
            <input v-model.number="state.principal" class="retro-input" min="100000" step="100000" type="number" />
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">금리</span>
            <input v-model.number="state.annualRate" class="retro-input" min="0" max="30" step="0.1" type="number" />
          </label>
          <label class="space-y-1.5 sm:col-span-3">
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
        </div>
      </section>

      <section class="retro-panel p-4 space-y-3">
        <p class="text-caption leading-relaxed text-muted-foreground">{{ LOAN_ASSUMPTION_NOTE }}</p>
        <div class="overflow-hidden rounded-2xl border border-border/70">
          <table class="w-full text-left text-caption">
            <thead class="bg-muted/40 text-muted-foreground">
              <tr>
                <th class="px-3 py-2">방식</th>
                <th class="px-3 py-2">첫 달</th>
                <th class="px-3 py-2">마지막 달</th>
                <th class="px-3 py-2">총상환액</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t border-border/60">
                <td class="px-3 py-2 font-semibold text-foreground">원리금균등</td>
                <td class="px-3 py-2">{{ formatWon(result.annuity.firstPayment) }}</td>
                <td class="px-3 py-2">{{ formatWon(result.annuity.lastPayment) }}</td>
                <td class="px-3 py-2">{{ formatWon(result.annuity.totalRepayment) }}</td>
              </tr>
              <tr class="border-t border-border/60">
                <td class="px-3 py-2 font-semibold text-foreground">원금균등</td>
                <td class="px-3 py-2">{{ formatWon(result.equalPrincipal.firstPayment) }}</td>
                <td class="px-3 py-2">{{ formatWon(result.equalPrincipal.lastPayment) }}</td>
                <td class="px-3 py-2">{{ formatWon(result.equalPrincipal.totalRepayment) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <LoanMetricGrid :items="metrics" />
  </div>
</template>
