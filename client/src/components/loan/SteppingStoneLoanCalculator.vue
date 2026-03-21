<script setup lang="ts">
import { computed } from "vue";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import {
  STEPPING_STONE_PRESETS,
  STEPPING_STONE_SOURCES,
  STEPPING_STONE_UPDATED,
  BORROWER_TYPE_LABELS,
  TERM_YEAR_OPTIONS,
  type BorrowerType,
} from "@/data/steppingStoneLoan";
import { useSteppingStoneLoan } from "@/composables/useSteppingStoneLoan";
import { formatWon, formatPercent, parseNumericInput } from "@/lib/utils";

const props = defineProps<{ initialPropertyPrice?: number }>();
const override = props.initialPropertyPrice ? { propertyPrice: props.initialPropertyPrice } : undefined;
const { state, result, reset } = useSteppingStoneLoan(override);

const metrics = computed(() => [
  {
    label: "적용 금리",
    value: formatPercent(result.value.applicableRate, 2),
    helper: result.value.incomeBracketLabel,
  },
  {
    label: "대출 가능액",
    value: formatWon(result.value.effectiveLoanAmount),
    helper: `한도·LTV·DTI 중 최소`,
  },
  {
    label: "월 납입액",
    value: formatWon(result.value.monthlyPayment),
    helper: "원리금균등 기준",
  },
  {
    label: "총 이자",
    value: formatWon(result.value.totalInterest),
    helper: `${state.termYears}년 상환 기준`,
  },
]);

function selectPreset(key: string) {
  if (key === "newlywed-4") {
    Object.assign(state, { householdIncome: 60_000_000, propertyPrice: 400_000_000, borrowerType: "newlywed", termYears: 30, isMetro: true });
  } else if (key === "first-3") {
    Object.assign(state, { householdIncome: 50_000_000, propertyPrice: 300_000_000, borrowerType: "firstTime", termYears: 20, isMetro: true });
  } else if (key === "general-2") {
    Object.assign(state, { householdIncome: 40_000_000, propertyPrice: 200_000_000, borrowerType: "general", termYears: 30, isMetro: false });
  }
}

const borrowerTypes: { value: BorrowerType; label: string }[] = [
  { value: "general", label: "일반" },
  { value: "firstTime", label: "생애최초" },
  { value: "newlywed", label: "신혼가구" },
];
</script>

<template>
  <div class="space-y-4">
    <LoanScenarioChips :items="STEPPING_STONE_PRESETS" @select="selectPreset" />

    <section class="retro-panel-muted space-y-4 p-4">
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">부부합산 연소득</span>
          <input
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="state.householdIncome.toLocaleString('ko-KR')"
            @input="state.householdIncome = parseNumericInput(($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">주택 가격</span>
          <input
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="state.propertyPrice.toLocaleString('ko-KR')"
            @input="state.propertyPrice = parseNumericInput(($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">유형</span>
          <select v-model="state.borrowerType" class="retro-input">
            <option v-for="bt in borrowerTypes" :key="bt.value" :value="bt.value">{{ bt.label }}</option>
          </select>
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">대출 기간</span>
          <select v-model.number="state.termYears" class="retro-input">
            <option v-for="y in TERM_YEAR_OPTIONS" :key="y" :value="y">{{ y }}년</option>
          </select>
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">지역</span>
          <select v-model="state.isMetro" class="retro-input">
            <option :value="true">수도권</option>
            <option :value="false">비수도권</option>
          </select>
        </label>
      </div>

      <div class="flex flex-wrap gap-2">
        <button type="button" class="retro-panel px-3 py-2 text-caption font-semibold text-foreground" @click="reset">
          기본값으로 초기화
        </button>
      </div>
    </section>

    <!-- 자격 알림 -->
    <div
      v-if="!result.eligible"
      class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-caption text-destructive"
    >
      <p class="font-semibold">자격 미충족</p>
      <ul class="mt-1 list-disc pl-4 space-y-0.5">
        <li v-for="reason in result.ineligibleReasons" :key="reason">{{ reason }}</li>
      </ul>
    </div>

    <LoanMetricGrid :items="metrics" />

    <!-- 한도 상세 -->
    <section class="retro-panel overflow-hidden">
      <div class="p-4">
        <p class="text-caption font-semibold text-foreground mb-1">대출 한도 상세</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-caption">
          <thead class="bg-muted/40 text-muted-foreground">
            <tr>
              <th class="px-3 py-2">기준</th>
              <th class="px-3 py-2 text-right">한도</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-border/60">
              <td class="px-3 py-2.5 text-foreground">상품 한도 ({{ BORROWER_TYPE_LABELS[state.borrowerType] }})</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">{{ formatWon(result.maxLoanByLimit) }}</td>
            </tr>
            <tr class="border-t border-border/60">
              <td class="px-3 py-2.5 text-foreground">LTV 한도 ({{ state.isMetro ? '수도권' : '비수도권' }})</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">{{ formatWon(result.maxLoanByLtv) }}</td>
            </tr>
            <tr class="border-t border-border/60">
              <td class="px-3 py-2.5 text-foreground">DTI 한도 (60%)</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">{{ formatWon(result.maxLoanByDti) }}</td>
            </tr>
            <tr class="border-t border-border/60 bg-primary/5">
              <td class="px-3 py-2.5 font-semibold text-primary">최종 대출 가능액</td>
              <td class="px-3 py-2.5 text-right tabular-nums font-bold text-primary">{{ formatWon(result.effectiveLoanAmount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 상환 방식 비교 -->
    <section class="retro-panel overflow-hidden">
      <div class="p-4">
        <p class="text-caption font-semibold text-foreground mb-1">상환 방식 비교</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-caption">
          <thead class="bg-muted/40 text-muted-foreground">
            <tr>
              <th class="px-3 py-2">방식</th>
              <th class="px-3 py-2 text-right">월 납입액</th>
              <th class="px-3 py-2 text-right">총 이자</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-border/60">
              <td class="px-3 py-2.5 text-foreground">원리금균등</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">{{ formatWon(result.annuityPlan.monthlyPayment) }}</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-fee">{{ formatWon(result.annuityPlan.totalInterest) }}</td>
            </tr>
            <tr class="border-t border-border/60">
              <td class="px-3 py-2.5 text-foreground">
                <span>원금균등</span>
                <span class="block text-[10px] text-muted-foreground">첫 달 {{ formatWon(result.equalPrincipalPlan.firstPayment) }}</span>
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-foreground">{{ formatWon(result.equalPrincipalPlan.monthlyPayment) }}</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-fee">{{ formatWon(result.equalPrincipalPlan.totalInterest) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <CompareSourceFooter :sources="[...STEPPING_STONE_SOURCES]" :updated-at="STEPPING_STONE_UPDATED" />
  </div>
</template>
