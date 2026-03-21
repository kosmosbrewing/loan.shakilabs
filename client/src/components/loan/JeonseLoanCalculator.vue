<script setup lang="ts">
import { computed } from "vue";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import { LOAN_ASSUMPTION_NOTE, TERM_OPTIONS } from "@/data/loanPresets";
import {
  JEONSE_DEPOSIT_PRESETS,
  JEONSE_LOAN_SOURCES,
  JEONSE_LOAN_UPDATED,
  jeonseLoanPresets,
} from "@/data/jeonseLoan";
import { useJeonseLoan } from "@/composables/useJeonseLoan";
import { formatWon, formatPercent, parseNumericInput } from "@/lib/utils";

const props = defineProps<{ initialDeposit?: number }>();
const override = props.initialDeposit ? { depositAmount: props.initialDeposit } : undefined;
const { state, result, applyPreset, reset } = useJeonseLoan(override);

const metrics = computed(() => [
  {
    label: "월 납입액",
    value: formatWon(result.value.monthlyPayment),
    helper: result.value.isInterestOnly ? "이자만 납부 (거치식)" : "원리금균등 상환",
  },
  {
    label: "총 이자",
    value: formatWon(result.value.totalInterest),
    helper: `${result.value.termMonths}개월 기준`,
  },
  {
    label: "총 상환액",
    value: formatWon(result.value.totalRepayment),
    helper: "원금 + 이자 합계",
  },
  {
    label: "적용 금리",
    value: formatPercent(result.value.annualRate, 1),
    helper: "연이율 기준",
  },
]);

function selectPreset(key: string): void {
  const preset = jeonseLoanPresets.find((item) => item.key === key);
  if (preset) applyPreset(preset.input);
}

function setDepositPreset(amount: number): void {
  state.depositAmount = amount;
}
</script>

<template>
  <div class="space-y-4">
    <LoanScenarioChips :items="jeonseLoanPresets" @select="selectPreset" />

    <section class="retro-panel-muted space-y-4 p-4">
      <div class="space-y-1.5">
        <label class="text-caption font-semibold text-foreground">전세보증금 (대출금액)</label>
        <input
          type="text"
          inputmode="numeric"
          class="retro-input"
          :value="state.depositAmount.toLocaleString('ko-KR')"
          @input="state.depositAmount = parseNumericInput(($event.target as HTMLInputElement).value)"
        />
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in JEONSE_DEPOSIT_PRESETS"
            :key="preset"
            :aria-pressed="state.depositAmount === preset"
            class="rounded-lg border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            :class="{ '!bg-primary/15 !text-primary !border-primary/30': state.depositAmount === preset }"
            @click="setDepositPreset(preset)"
          >
            {{ formatWon(preset) }}
          </button>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">금리 (연%)</span>
          <input v-model.number="state.annualRate" class="retro-input" min="0" max="30" step="0.1" type="number" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">대출기간</span>
          <select v-model.number="state.termMonths" class="retro-input">
            <option v-for="term in TERM_OPTIONS" :key="term" :value="term">{{ term }}개월 ({{ Math.round(term / 12) }}년)</option>
          </select>
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">상환방식</span>
          <select v-model="state.isInterestOnly" class="retro-input">
            <option :value="true">이자만 납부 (거치식)</option>
            <option :value="false">원리금균등 상환</option>
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

    <!-- 상품별 비교 테이블 -->
    <section class="retro-panel overflow-hidden">
      <div class="p-4">
        <p class="text-caption font-semibold text-foreground mb-1">전세대출 상품별 이자 비교</p>
        <p class="text-[10px] text-muted-foreground">{{ LOAN_ASSUMPTION_NOTE }}</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-caption">
          <thead class="bg-muted/40 text-muted-foreground">
            <tr>
              <th class="px-3 py-2 whitespace-nowrap">상품</th>
              <th class="px-3 py-2 whitespace-nowrap text-right">최저금리</th>
              <th class="px-3 py-2 whitespace-nowrap text-right">월 이자</th>
              <th class="px-3 py-2 whitespace-nowrap text-right">총 이자</th>
              <th class="px-3 py-2 whitespace-nowrap text-center">자격</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in result.productComparison"
              :key="row.product.id"
              class="border-t border-border/60"
            >
              <td class="px-3 py-2.5">
                <span class="font-semibold text-foreground">{{ row.product.name }}</span>
                <span class="block text-[10px] text-muted-foreground mt-0.5">{{ row.product.description }}</span>
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">
                {{ formatPercent(row.product.minRate, 1) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">
                {{ formatWon(row.monthlyInterest) }}
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-fee">
                {{ formatWon(row.totalInterest) }}
              </td>
              <td class="px-3 py-2.5 text-center">
                <span
                  class="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold"
                  :class="row.eligible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'"
                >
                  {{ row.eligible ? '가능' : '초과' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <CompareSourceFooter :sources="[...JEONSE_LOAN_SOURCES]" :updated-at="JEONSE_LOAN_UPDATED" />
  </div>
</template>
