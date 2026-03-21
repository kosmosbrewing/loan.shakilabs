<script setup lang="ts">
import { computed } from "vue";
import LoanMetricGrid from "@/components/loan/LoanMetricGrid.vue";
import LoanScenarioChips from "@/components/loan/LoanScenarioChips.vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import { TERM_OPTIONS } from "@/data/loanPresets";
import {
  LTV_DTI_PRESETS,
  LTV_DTI_SOURCES,
  LTV_DTI_UPDATED,
  type RegionType,
  type BorrowerCategory,
} from "@/data/ltvDti";
import { useLtvDti } from "@/composables/useLtvDti";
import { formatWon, formatPercent, parseNumericInput } from "@/lib/utils";

const props = defineProps<{ initialPropertyPrice?: number }>();
const override = props.initialPropertyPrice ? { propertyPrice: props.initialPropertyPrice } : undefined;
const { state, result, reset } = useLtvDti(override);

const metrics = computed(() => [
  {
    label: "최종 대출 한도",
    value: formatWon(result.value.finalMaxLoan),
    helper: `제한 요인: ${result.value.limitingFactor}`,
  },
  {
    label: "LTV 한도",
    value: formatWon(result.value.maxByLtv),
    helper: `LTV ${formatPercent(result.value.ltvRate * 100, 0)}`,
  },
  {
    label: "월 납입액",
    value: formatWon(result.value.monthlyPayment),
    helper: "원리금균등 기준",
  },
  {
    label: "총 이자",
    value: formatWon(result.value.totalInterest),
    helper: `금리 ${formatPercent(state.loanRate, 1)} 기준`,
  },
]);

function selectPreset(key: string) {
  if (key === "apt-10") {
    Object.assign(state, { propertyPrice: 1_000_000_000, annualIncome: 80_000_000, existingDebtPayment: 6_000_000, loanRate: 4.5, termMonths: 360, region: "speculative", borrowerCategory: "general" });
  } else if (key === "apt-5") {
    Object.assign(state, { propertyPrice: 500_000_000, annualIncome: 60_000_000, existingDebtPayment: 3_000_000, loanRate: 4.2, termMonths: 360, region: "speculative", borrowerCategory: "general" });
  } else if (key === "local-3") {
    Object.assign(state, { propertyPrice: 300_000_000, annualIncome: 50_000_000, existingDebtPayment: 0, loanRate: 4.0, termMonths: 240, region: "nonRegulated", borrowerCategory: "general" });
  }
}

const regions: { value: RegionType; label: string }[] = [
  { value: "speculative", label: "규제지역 (서울·경기)" },
  { value: "nonRegulated", label: "비규제지역" },
];

const borrowerCategories: { value: BorrowerCategory; label: string }[] = [
  { value: "general", label: "일반 무주택자" },
  { value: "firstTime", label: "생애최초 구입자" },
  { value: "lowIncome", label: "서민 실수요자" },
];
</script>

<template>
  <div class="space-y-4">
    <LoanScenarioChips :items="LTV_DTI_PRESETS" @select="selectPreset" />

    <section class="retro-panel-muted space-y-4 p-4">
      <div class="grid gap-3 sm:grid-cols-2">
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
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">연소득 (부부합산)</span>
          <input
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="state.annualIncome.toLocaleString('ko-KR')"
            @input="state.annualIncome = parseNumericInput(($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">기존 대출 연 상환액</span>
          <input
            type="text"
            inputmode="numeric"
            class="retro-input"
            :value="state.existingDebtPayment.toLocaleString('ko-KR')"
            @input="state.existingDebtPayment = parseNumericInput(($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">예상 금리 (연%)</span>
          <input v-model.number="state.loanRate" class="retro-input" min="0" max="30" step="0.1" type="number" />
        </label>
      </div>

      <div class="grid gap-3 sm:grid-cols-3">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">규제 지역</span>
          <select v-model="state.region" class="retro-input">
            <option v-for="r in regions" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">차주 유형</span>
          <select v-model="state.borrowerCategory" class="retro-input">
            <option v-for="bc in borrowerCategories" :key="bc.value" :value="bc.value">{{ bc.label }}</option>
          </select>
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">대출 기간</span>
          <select v-model.number="state.termMonths" class="retro-input">
            <option v-for="term in TERM_OPTIONS" :key="term" :value="term">{{ term }}개월 ({{ Math.round(term / 12) }}년)</option>
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

    <!-- 규제별 한도 상세 -->
    <section class="retro-panel overflow-hidden">
      <div class="p-4">
        <p class="text-caption font-semibold text-foreground mb-1">규제별 한도 분석</p>
        <p class="text-[10px] text-muted-foreground">세 가지 규제 중 가장 낮은 금액이 최종 한도</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-caption">
          <thead class="bg-muted/40 text-muted-foreground">
            <tr>
              <th class="px-3 py-2">규제</th>
              <th class="px-3 py-2 text-right">비율/조건</th>
              <th class="px-3 py-2 text-right">한도</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-border/60" :class="{ 'bg-primary/5': result.limitingFactor === 'LTV' }">
              <td class="px-3 py-2.5 text-foreground">LTV</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{{ formatPercent(result.ltvRate * 100, 0) }}</td>
              <td class="px-3 py-2.5 text-right tabular-nums font-medium" :class="result.limitingFactor === 'LTV' ? 'text-primary' : 'text-foreground'">{{ formatWon(result.maxByLtv) }}</td>
            </tr>
            <tr v-if="result.maxByAbsolute > 0" class="border-t border-border/60" :class="{ 'bg-primary/5': result.limitingFactor === '절대한도' }">
              <td class="px-3 py-2.5 text-foreground">절대한도</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-muted-foreground">규제지역</td>
              <td class="px-3 py-2.5 text-right tabular-nums font-medium" :class="result.limitingFactor === '절대한도' ? 'text-primary' : 'text-foreground'">{{ formatWon(result.maxByAbsolute) }}</td>
            </tr>
            <tr class="border-t border-border/60" :class="{ 'bg-primary/5': result.limitingFactor === 'DTI' }">
              <td class="px-3 py-2.5 text-foreground">DTI</td>
              <td class="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{{ formatPercent(result.dtiRate * 100, 0) }}</td>
              <td class="px-3 py-2.5 text-right tabular-nums font-medium" :class="result.limitingFactor === 'DTI' ? 'text-primary' : 'text-foreground'">{{ formatWon(result.maxByDti) }}</td>
            </tr>
            <tr class="border-t border-border/60" :class="{ 'bg-primary/5': result.limitingFactor === 'DSR' }">
              <td class="px-3 py-2.5 text-foreground">
                <span>DSR</span>
                <span class="block text-[10px] text-muted-foreground">스트레스 +{{ result.stressRate }}%p</span>
              </td>
              <td class="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{{ formatPercent(result.dsrRate * 100, 0) }}</td>
              <td class="px-3 py-2.5 text-right tabular-nums font-medium" :class="result.limitingFactor === 'DSR' ? 'text-primary' : 'text-foreground'">{{ formatWon(result.maxByDsr) }}</td>
            </tr>
            <tr class="border-t-2 border-primary/30 bg-primary/5">
              <td class="px-3 py-2.5 font-semibold text-primary" colspan="2">최종 대출 가능액</td>
              <td class="px-3 py-2.5 text-right tabular-nums font-bold text-primary">{{ formatWon(result.finalMaxLoan) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <CompareSourceFooter :sources="[...LTV_DTI_SOURCES]" :updated-at="LTV_DTI_UPDATED" />
  </div>
</template>
