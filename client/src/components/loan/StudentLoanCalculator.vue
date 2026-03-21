<script setup lang="ts">
import { computed, reactive } from "vue";
import { TrendingUp, AlertTriangle, CalendarClock, Wallet } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import {
  DEFAULT_STUDENT_LOAN_INPUT,
  sanitizeStudentLoanInput,
} from "@/lib/validators";
import { STUDENT_LOAN_SOURCES } from "@/data/loanExtraTools";
import { calcStudentLoanRepayment } from "@/utils/loanExtraCalculator";
import { formatWon, parseNumericInput } from "@/lib/utils";

const props = defineProps<{ initialBalance?: number }>();
const form = reactive({
  ...DEFAULT_STUDENT_LOAN_INPUT,
  ...(props.initialBalance ? { loanBalance: props.initialBalance } : {}),
});
const sanitized = computed(() => sanitizeStudentLoanInput(form));
const result = computed(() => calcStudentLoanRepayment(sanitized.value));

function setRepaymentRate(rate: number): void {
  form.repaymentRate = rate;
}

const statIcons = [TrendingUp, AlertTriangle, CalendarClock, Wallet] as const;
const statIconClasses = [
  "bg-muted text-muted-foreground",
  "bg-fee/10 text-fee",
  "bg-muted text-muted-foreground",
  "bg-primary/10 text-primary",
] as const;
</script>

<template>
  <div class="space-y-4">
    <section class="retro-panel-muted space-y-4 p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">대출 잔액</span>
          <input type="text" inputmode="numeric" class="retro-input" :value="form.loanBalance.toLocaleString('ko-KR')" @input="form.loanBalance = parseNumericInput(($event.target as HTMLInputElement).value)" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">연간 총급여</span>
          <input type="text" inputmode="numeric" class="retro-input" :value="form.annualIncome.toLocaleString('ko-KR')" @input="form.annualIncome = parseNumericInput(($event.target as HTMLInputElement).value)" />
        </label>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">상환기준소득</span>
          <input type="text" inputmode="numeric" class="retro-input" :value="form.thresholdIncome.toLocaleString('ko-KR')" @input="form.thresholdIncome = parseNumericInput(($event.target as HTMLInputElement).value)" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">자발적 상환액</span>
          <input type="text" inputmode="numeric" class="retro-input" :value="form.voluntaryRepayment.toLocaleString('ko-KR')" @input="form.voluntaryRepayment = parseNumericInput(($event.target as HTMLInputElement).value)" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">대출금리(%)</span>
          <input v-model.number="form.interestRate" class="retro-input" min="0" max="10" step="0.1" type="number" />
        </label>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="retro-panel px-3 py-2 text-caption font-semibold"
          :class="form.repaymentRate === 20 ? 'border-primary text-primary' : 'text-foreground'"
          @click="setRepaymentRate(20)"
        >
          학부 20%
        </button>
        <button
          type="button"
          class="retro-panel px-3 py-2 text-caption font-semibold"
          :class="form.repaymentRate === 25 ? 'border-primary text-primary' : 'text-foreground'"
          @click="setRepaymentRate(25)"
        >
          대학원 25%
        </button>
      </div>
    </section>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Card
        v-for="(stat, index) in [
          { label: '기준소득 초과분', value: formatWon(result.baseExcessIncome), cls: '' },
          { label: '의무상환액', value: formatWon(result.creditedMandatoryRepayment), cls: 'text-fee' },
          { label: '월 원천공제 환산', value: formatWon(result.monthlyWithholding), cls: '' },
          { label: '연말 잔액 추정', value: formatWon(result.balanceAfterYear), cls: 'text-primary' },
        ]"
        :key="stat.label"
        class="border-border/50 bg-muted/30"
      >
        <CardContent class="p-3.5">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" :class="statIconClasses[index]">
              <component :is="statIcons[index]" class="h-3.5 w-3.5" />
            </span>
            <p class="truncate text-caption uppercase tracking-wide text-muted-foreground">{{ stat.label }}</p>
          </div>
          <p class="mt-2 text-heading font-bold tabular-nums" :class="stat.cls">{{ stat.value }}</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardContent class="p-4 text-caption leading-relaxed text-muted-foreground">
        자발적 상환액은 고지 의무상환액에서 차감되는 것으로 간주했습니다. 상속·증여에 따른 의무상환과 체납 가산금은
        반영하지 않은 단순 계산입니다.
      </CardContent>
    </Card>

    <CompareSourceFooter :sources="[...STUDENT_LOAN_SOURCES]" updated-at="2026-03-17" />
  </div>
</template>
