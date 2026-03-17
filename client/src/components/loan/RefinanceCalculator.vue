<script setup lang="ts">
import { computed } from "vue";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import { LOAN_ASSUMPTION_NOTE, TERM_OPTIONS, refinancePresets } from "@/data/loanPresets";
import { useRefinanceCalculator } from "@/composables/useRefinanceCalculator";
import { formatWon, parseNumericInput } from "@/lib/utils";

const { state, result, applyPreset, reset } = useRefinanceCalculator();

const metrics = computed(() => [
  {
    label: "현재 월 납입액",
    value: formatWon(result.value.currentPlan.monthlyPayment),
    helper: `총이자 ${formatWon(result.value.currentPlan.totalInterest)}`,
  },
  {
    label: "갈아탄 뒤 월 납입액",
    value: formatWon(result.value.newPlan.monthlyPayment),
    helper: `총이자 ${formatWon(result.value.newPlan.totalInterest)}`,
  },
  {
    label: "월 현금흐름 개선",
    value: formatWon(result.value.monthlySavings),
    helper: "현재 납입액 대비 차이",
  },
  {
    label: "순절감 예상",
    value: formatWon(result.value.netSavings),
    helper:
      result.value.breakEvenMonths == null
        ? "초기비용 회수 어려움"
        : `${result.value.breakEvenMonths}개월 내 비용 회수`,
  },
]);

function selectPreset(key: string): void {
  const preset = refinancePresets.find((item) => item.key === key);
  if (preset) applyPreset(preset.input);
}
</script>

<template>
  <div class="space-y-4">
    <LoanScenarioChips :items="refinancePresets" @select="selectPreset" />

    <div class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section class="retro-panel-muted p-4 space-y-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">남은 대출원금</span>
            <input type="text" inputmode="numeric" class="retro-input" :value="state.balance.toLocaleString('ko-KR')" @input="state.balance = parseNumericInput(($event.target as HTMLInputElement).value)" />
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">현재 금리</span>
            <input v-model.number="state.currentRate" class="retro-input" min="0" max="30" step="0.1" type="number" />
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">갈아탈 금리</span>
            <input v-model.number="state.newRate" class="retro-input" min="0" max="30" step="0.1" type="number" />
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">갈아타기 비용</span>
            <input type="text" inputmode="numeric" class="retro-input" :value="state.refinanceFee.toLocaleString('ko-KR')" @input="state.refinanceFee = parseNumericInput(($event.target as HTMLInputElement).value)" />
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">남은 개월 수</span>
            <select v-model.number="state.remainingMonths" class="retro-input">
              <option v-for="term in TERM_OPTIONS" :key="`remain-${term}`" :value="term">{{ term }}개월</option>
            </select>
          </label>
          <label class="space-y-1.5">
            <span class="text-caption font-semibold text-foreground">새 만기</span>
            <select v-model.number="state.newTermMonths" class="retro-input">
              <option v-for="term in TERM_OPTIONS" :key="`new-${term}`" :value="term">{{ term }}개월</option>
            </select>
          </label>
        </div>

        <div class="flex flex-wrap gap-2">
          <button type="button" class="retro-panel px-3 py-2 text-caption font-semibold text-foreground" @click="reset">
            기본값으로 초기화
          </button>
          <p class="text-tiny text-muted-foreground">
            중도상환수수료, 인지세, 보증료는 한 번에 비용으로 합산해 입력하세요.
          </p>
        </div>
      </section>

      <section class="retro-panel p-4 space-y-3">
        <div
          class="rounded-2xl border px-4 py-3"
          :class="result.isSwitchWorthIt ? 'border-profit/30 bg-profit/10' : 'border-fee/20 bg-fee/10'"
        >
          <p class="text-caption font-semibold" :class="result.isSwitchWorthIt ? 'text-profit' : 'text-fee'">
            {{ result.isSwitchWorthIt ? "갈아타기 유리" : "추가 검토 필요" }}
          </p>
          <p class="mt-1 text-body text-foreground">
            {{
              result.isSwitchWorthIt
                ? `초기비용을 반영해도 약 ${formatWon(result.netSavings)} 절감됩니다.`
                : "금리 차이보다 비용 부담이 커서 실제 갈아타기 효과가 작을 수 있습니다."
            }}
          </p>
        </div>
        <p class="text-caption leading-relaxed text-muted-foreground">{{ LOAN_ASSUMPTION_NOTE }}</p>
      </section>
    </div>

    <LoanMetricGrid :items="metrics" />
  </div>
</template>
