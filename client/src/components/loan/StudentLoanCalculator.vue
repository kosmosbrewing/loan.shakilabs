<script setup lang="ts">
import { computed, reactive } from "vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import {
  DEFAULT_STUDENT_LOAN_INPUT,
  sanitizeStudentLoanInput,
} from "@/lib/validators";
import { STUDENT_LOAN_SOURCES } from "@/data/loanExtraTools";
import { calcStudentLoanRepayment } from "@/utils/loanExtraCalculator";
import { formatWon } from "@/lib/utils";

const form = reactive({ ...DEFAULT_STUDENT_LOAN_INPUT });
const sanitized = computed(() => sanitizeStudentLoanInput(form));
const result = computed(() => calcStudentLoanRepayment(sanitized.value));

function setRepaymentRate(rate: number): void {
  form.repaymentRate = rate;
}
</script>

<template>
  <div class="space-y-4">
    <section class="retro-panel-muted space-y-4 p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">대출 잔액</span>
          <input v-model.number="form.loanBalance" class="retro-input" min="0" step="1000000" type="number" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">연간 총급여</span>
          <input v-model.number="form.annualIncome" class="retro-input" min="0" step="1000000" type="number" />
        </label>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">상환기준소득</span>
          <input v-model.number="form.thresholdIncome" class="retro-input" min="0" step="1000000" type="number" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">자발적 상환액</span>
          <input v-model.number="form.voluntaryRepayment" class="retro-input" min="0" step="100000" type="number" />
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

    <div class="retro-stat-grid">
      <div class="retro-stat">
        <p class="retro-stat-label">기준소득 초과분</p>
        <p class="retro-stat-value">{{ formatWon(result.baseExcessIncome) }}</p>
      </div>
      <div class="retro-stat">
        <p class="retro-stat-label">의무상환액</p>
        <p class="retro-stat-value text-status-danger">{{ formatWon(result.creditedMandatoryRepayment) }}</p>
      </div>
      <div class="retro-stat">
        <p class="retro-stat-label">월 원천공제 환산</p>
        <p class="retro-stat-value">{{ formatWon(result.monthlyWithholding) }}</p>
      </div>
      <div class="retro-stat">
        <p class="retro-stat-label">연말 잔액 추정</p>
        <p class="retro-stat-value text-primary">{{ formatWon(result.balanceAfterYear) }}</p>
      </div>
    </div>

    <section class="retro-panel p-4">
      <p class="text-caption leading-relaxed text-muted-foreground">
        자발적 상환액은 고지 의무상환액에서 차감되는 것으로 간주했습니다. 상속·증여에 따른 의무상환과 체납 가산금은
        반영하지 않은 단순 계산입니다.
      </p>
    </section>

    <CompareSourceFooter :sources="[...STUDENT_LOAN_SOURCES]" updated-at="2026-03-17" />
  </div>
</template>
