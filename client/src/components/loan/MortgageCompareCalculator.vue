<script setup lang="ts">
import { computed } from "vue";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import { LOAN_ASSUMPTION_NOTE, TERM_OPTIONS } from "@/data/loanPresets";
import { MORTGAGE_AMOUNT_PRESETS, MORTGAGE_COMPARE_SOURCES, MORTGAGE_DATA_UPDATED, mortgageComparePresets } from "@/data/mortgageRates";
import { useMortgageCompare } from "@/composables/useMortgageCompare";
import { formatWon, formatPercent, parseNumericInput } from "@/lib/utils";

const props = defineProps<{ initialLoanAmount?: number }>();
const override = props.initialLoanAmount ? { loanAmount: props.initialLoanAmount } : undefined;
const { state, result, applyPreset, reset } = useMortgageCompare(override);

const metrics = computed(() => {
  const r = result.value;
  return [
    {
      label: "최저금리 은행",
      value: r.bestBank ? `${r.bestBank.bank} ${formatPercent(r.bestBank.bestRate, 2)}` : "-",
      helper: r.bestBank ? `월 ${formatWon(r.bestBank.bestMonthlyPayment)}` : undefined,
    },
    {
      label: "월 상환액 차이",
      value: formatWon(r.monthlyPaymentRange),
      helper: "최저 vs 최고 은행 (최저금리 기준)",
    },
    {
      label: "총이자 차이",
      value: formatWon(r.totalInterestRange),
      helper: "은행 선택으로 줄일 수 있는 이자",
    },
    {
      label: "비교 은행 수",
      value: `${r.banks.length}개`,
      helper: "시중 주요 은행 기준",
    },
  ];
});

function selectPreset(key: string): void {
  const preset = mortgageComparePresets.find((item) => item.key === key);
  if (preset) applyPreset(preset.input);
}

function setAmountPreset(amount: number): void {
  state.loanAmount = amount;
}
</script>

<template>
  <div class="space-y-4">
    <LoanScenarioChips :items="mortgageComparePresets" @select="selectPreset" />

    <section class="retro-panel-muted space-y-4 p-4">
      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-foreground">대출금액</label>
        <input
          type="text"
          inputmode="numeric"
          class="retro-input"
          :value="state.loanAmount.toLocaleString('ko-KR')"
          @input="state.loanAmount = parseNumericInput(($event.target as HTMLInputElement).value)"
        />
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in MORTGAGE_AMOUNT_PRESETS"
            :key="preset"
            :aria-pressed="state.loanAmount === preset"
            class="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            :class="{ '!bg-primary/15 !text-primary !border-primary/30': state.loanAmount === preset }"
            @click="setAmountPreset(preset)"
          >
            {{ formatWon(preset) }}
          </button>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">대출기간</span>
          <select v-model.number="state.termMonths" class="retro-input">
            <option v-for="term in TERM_OPTIONS" :key="term" :value="term">{{ term }}개월 ({{ Math.round(term / 12) }}년)</option>
          </select>
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">상환방식</span>
          <select v-model="state.repaymentMethod" class="retro-input">
            <option value="annuity">원리금균등</option>
            <option value="equalPrincipal">원금균등</option>
          </select>
        </label>
      </div>

      <div class="flex flex-wrap gap-2">
        <button type="button" class="retro-panel px-3 py-2 text-caption font-semibold text-foreground" @click="reset">
          기본값으로 초기화
        </button>
      </div>
    </section>

    <LoanMetricGrid :items="metrics" />

    <!-- 은행별 비교 테이블 -->
    <section class="retro-panel overflow-hidden">
      <div class="p-4">
        <p class="text-caption font-semibold text-foreground mb-1">은행별 주담대 금리 비교</p>
        <p class="text-[10px] text-muted-foreground">{{ LOAN_ASSUMPTION_NOTE }}</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-caption">
          <thead class="bg-muted/40 text-muted-foreground">
            <tr>
              <th class="px-3 py-2 whitespace-nowrap">은행</th>
              <th class="px-3 py-2 whitespace-nowrap text-right">최저금리</th>
              <th class="px-3 py-2 whitespace-nowrap text-right">월 상환액</th>
              <th class="px-3 py-2 whitespace-nowrap text-right">총이자</th>
              <th class="px-3 py-2 whitespace-nowrap text-right">고정금리</th>
              <th class="px-3 py-2 whitespace-nowrap text-right">변동금리</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in result.banks"
              :key="row.id"
              class="border-t border-border/60"
              :class="{ 'bg-primary/5': idx === 0 }"
            >
              <td class="px-3 py-2.5 font-semibold text-foreground whitespace-nowrap">
                <span v-if="idx === 0" class="mr-1 inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">최저</span>
                {{ row.bank }}
              </td>
              <td class="px-3 py-2.5 text-right font-medium tabular-nums" :class="idx === 0 ? 'text-primary' : 'text-foreground'">
                {{ formatPercent(row.bestRate, 2) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">
                {{ formatWon(row.bestMonthlyPayment) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-fee">
                {{ formatWon(row.bestTotalInterest) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                {{ formatPercent(row.fixedMinRate, 2) }}~{{ formatPercent(row.fixedMaxRate, 2) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                {{ formatPercent(row.variableMinRate, 2) }}~{{ formatPercent(row.variableMaxRate, 2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <CompareSourceFooter :sources="[...MORTGAGE_COMPARE_SOURCES]" :updated-at="MORTGAGE_DATA_UPDATED" />
  </div>
</template>
