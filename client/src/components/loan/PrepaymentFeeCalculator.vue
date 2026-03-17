<script setup lang="ts">
import { computed, reactive } from "vue";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import {
  DEFAULT_PREPAYMENT_FEE_INPUT,
  sanitizePrepaymentFeeInput,
} from "@/lib/validators";
import { calcPrepaymentFee } from "@/utils/loanExtraCalculator";
import { PREPAYMENT_FEE_SOURCES } from "@/data/loanExtraTools";
import { formatPercent, formatWon } from "@/lib/utils";

const form = reactive({ ...DEFAULT_PREPAYMENT_FEE_INPUT });
const sanitized = computed(() => sanitizePrepaymentFeeInput(form));
const result = computed(() => calcPrepaymentFee(sanitized.value));
</script>

<template>
  <div class="space-y-4">
    <section class="retro-panel-muted space-y-4 p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">원대출 금액</span>
          <input v-model.number="form.originalLoanAmount" class="retro-input" min="1000000" step="1000000" type="number" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">이번 상환액</span>
          <input v-model.number="form.repaymentAmount" class="retro-input" min="0" step="1000000" type="number" />
        </label>
      </div>
      <div class="grid gap-3 md:grid-cols-4">
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">수수료율(%)</span>
          <input v-model.number="form.feeRate" class="retro-input" min="0" max="5" step="0.1" type="number" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">부과기간(개월)</span>
          <input v-model.number="form.chargePeriodMonths" class="retro-input" min="1" max="120" step="1" type="number" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">경과 개월</span>
          <input v-model.number="form.elapsedMonths" class="retro-input" min="0" max="120" step="1" type="number" />
        </label>
        <label class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">연간 면제비율(%)</span>
          <input v-model.number="form.annualFreeRate" class="retro-input" min="0" max="100" step="1" type="number" />
        </label>
      </div>
    </section>

    <div class="retro-stat-grid">
      <div class="retro-stat">
        <p class="retro-stat-label">예상 수수료</p>
        <p class="retro-stat-value text-status-danger">{{ formatWon(result.feeAmount) }}</p>
      </div>
      <div class="retro-stat">
        <p class="retro-stat-label">면제 처리 금액</p>
        <p class="retro-stat-value">{{ formatWon(result.waivedAmount) }}</p>
      </div>
      <div class="retro-stat">
        <p class="retro-stat-label">과금 대상 원금</p>
        <p class="retro-stat-value">{{ formatWon(result.feeTargetAmount) }}</p>
      </div>
      <div class="retro-stat">
        <p class="retro-stat-label">실효 부담률</p>
        <p class="retro-stat-value">{{ formatPercent(result.effectiveRate, 2) }}</p>
      </div>
    </div>

    <section class="retro-panel p-4">
      <p class="text-caption leading-relaxed text-muted-foreground">
        연간 면제한도 {{ formatWon(result.freeQuota) }}와 잔여 부과기간 {{ result.remainingMonths }}개월을 반영한 참고 계산입니다.
        은행별 최소 면제금액, 상품별 예외조항은 별도로 확인해야 합니다.
      </p>
    </section>

    <CompareSourceFooter :sources="[...PREPAYMENT_FEE_SOURCES]" updated-at="2026-03-17" />
  </div>
</template>
