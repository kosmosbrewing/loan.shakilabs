<script setup lang="ts">
import { computed, reactive } from "vue";
import { AlertTriangle, ShieldCheck, Banknote, TrendingDown } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
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

const statIcons = [AlertTriangle, ShieldCheck, Banknote, TrendingDown] as const;
const statIconClasses = [
  "bg-fee/10 text-fee",
  "bg-muted text-muted-foreground",
  "bg-muted text-muted-foreground",
  "bg-muted text-muted-foreground",
] as const;
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

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Card
        v-for="(stat, index) in [
          { label: '예상 수수료', value: formatWon(result.feeAmount), cls: 'text-fee' },
          { label: '면제 처리 금액', value: formatWon(result.waivedAmount), cls: '' },
          { label: '과금 대상 원금', value: formatWon(result.feeTargetAmount), cls: '' },
          { label: '실효 부담률', value: formatPercent(result.effectiveRate, 2), cls: '' },
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
        연간 면제한도 {{ formatWon(result.freeQuota) }}와 잔여 부과기간 {{ result.remainingMonths }}개월을 반영한 참고 계산입니다.
        은행별 최소 면제금액, 상품별 예외조항은 별도로 확인해야 합니다.
      </CardContent>
    </Card>

    <CompareSourceFooter :sources="[...PREPAYMENT_FEE_SOURCES]" updated-at="2026-03-17" />
  </div>
</template>
