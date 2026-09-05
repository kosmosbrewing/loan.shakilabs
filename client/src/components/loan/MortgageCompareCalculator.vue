<script setup lang="ts">
import { computed } from "vue";
import { ShPresetGroup } from "@shakilabs/ui";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanResultHero from "@/components/loan/LoanResultHero.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import MetricComparisonBars from "@/components/result-visualization/MetricComparisonBars.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import { LOAN_ASSUMPTION_NOTE, TERM_OPTIONS } from "@/data/loanPresets";
import { MORTGAGE_AMOUNT_PRESETS, MORTGAGE_COMPARE_SOURCES, MORTGAGE_DATA_UPDATED, mortgageComparePresets } from "@/data/mortgageRates";
import { useMortgageCompare } from "@/composables/useMortgageCompare";
import { formatWon, formatPercentValue, parseNumericInput } from "@/lib/utils";
import InputRangeNotice from "@/components/loan/InputRangeNotice.vue";
import { clampNotices } from "@/lib/validators";

const props = defineProps<{ initialLoanAmount?: number }>();
const override = props.initialLoanAmount ? { loanAmount: props.initialLoanAmount } : undefined;
const { state, result, applyPreset, reset } = useMortgageCompare(override);
// 범위 밖 입력은 기본값으로 되돌리지 않고 경계로 자른 뒤 그 사실을 화면에 알린다
const rangeNotices = computed(() => clampNotices("mortgageCompare", state));
const amountPresetOptions = MORTGAGE_AMOUNT_PRESETS.map((value) => ({
  label: formatWon(value),
  value,
}));

const metrics = computed(() => {
  const r = result.value;
  return [
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
const bankMetrics = computed(() => [
  {
    key: "monthly",
    label: "최저금리 기준 월 상환액",
    values: result.value.banks.map((row, index) => ({
      key: row.id,
      label: row.bank,
      value: row.bestMonthlyPayment,
      highlight: index === 0,
      detail: `최저금리 ${formatPercentValue(row.bestRate, 2)}`,
    })),
  },
  {
    key: "interest",
    label: "최저금리 기준 총이자",
    values: result.value.banks.map((row, index) => ({
      key: row.id,
      label: row.bank,
      value: row.bestTotalInterest,
      highlight: index === 0,
    })),
  },
]);

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
        <label for="mortgage-loan-amount" class="text-caption font-semibold text-foreground">대출금액</label>
        <input
          id="mortgage-loan-amount"
          type="text"
          inputmode="numeric"
          class="retro-input"
          :value="state.loanAmount.toLocaleString('ko-KR')"
          @input="state.loanAmount = parseNumericInput(($event.target as HTMLInputElement).value)"
        />
        <ShPresetGroup
          :model-value="state.loanAmount"
          :options="amountPresetOptions"
          label="대출 금액 빠른 선택"
          @update:model-value="setAmountPreset"
        />
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
          입력 초기화
        </button>
      </div>
    </section>

    <InputRangeNotice :notices="rangeNotices" />

    <LoanResultHero
      label="최저금리 은행"
      :value="result.bestBank ? `${result.bestBank.bank} ${formatPercentValue(result.bestBank.bestRate, 2)}` : '-'"
      :sub="result.bestBank ? `월 ${formatWon(result.bestBank.bestMonthlyPayment)}` : undefined"
    />
    <LoanMetricGrid :items="metrics" />

    <MetricComparisonBars
      title="은행별 상환 부담"
      note="공시 금리 범위 중 최저금리를 동일 대출금과 기간에 적용한 비교입니다."
      :metrics="bankMetrics"
      :format-value="formatWon"
    />

    <!-- 은행별 비교 테이블 -->
    <section class="retro-panel overflow-hidden">
      <div class="p-4">
        <p class="text-caption font-semibold text-foreground mb-1">은행별 주담대 금리 비교</p>
        <p class="text-[10px] text-muted-foreground">{{ LOAN_ASSUMPTION_NOTE }}</p>
      </div>
      <div class="overflow-x-auto">
        <table aria-label="은행별 주택담보대출 금리 비교" class="w-max min-w-full text-left text-caption">
          <thead class="bg-muted/40 text-muted-foreground">
            <tr>
              <th scope="col" class="px-3 py-2 whitespace-nowrap">은행</th>
              <th scope="col" class="px-3 py-2 whitespace-nowrap text-right">최저금리</th>
              <th scope="col" class="px-3 py-2 whitespace-nowrap text-right">월 상환액</th>
              <th scope="col" class="px-3 py-2 whitespace-nowrap text-right">총이자</th>
              <th scope="col" class="px-3 py-2 whitespace-nowrap text-right">고정금리</th>
              <th scope="col" class="px-3 py-2 whitespace-nowrap text-right">변동금리</th>
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
                <!-- 이 뱃지는 bg-primary/5 행 위에 bg-primary/15를 한 번 더 얹고 그 위에 text-primary를
                     올려서, 같은 토큰의 알파 틴트가 2겹 쌓인 자리였다. 다크에서 실측 4.06:1(기준 미달).
                     알파를 걷고 --primary / --primary-foreground 짝(Badge default 변형과 같은 규약)을
                     쓰면 배경 합성과 무관하게 대비가 고정된다 — 다크 6.64:1 / 라이트 7.65:1. -->
                <span v-if="idx === 0" class="mr-1 inline-block rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">최저</span>
                {{ row.bank }}
              </td>
              <td class="px-3 py-2.5 text-right font-medium tabular-nums" :class="idx === 0 ? 'text-primary' : 'text-foreground'">
                {{ formatPercentValue(row.bestRate, 2) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">
                {{ formatWon(row.bestMonthlyPayment) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-fee">
                {{ formatWon(row.bestTotalInterest) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                {{ formatPercentValue(row.fixedMinRate, 2) }}~{{ formatPercentValue(row.fixedMaxRate, 2) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                {{ formatPercentValue(row.variableMinRate, 2) }}~{{ formatPercentValue(row.variableMaxRate, 2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <CompareSourceFooter :sources="[...MORTGAGE_COMPARE_SOURCES]" :updated-at="MORTGAGE_DATA_UPDATED" />
  </div>
</template>
