<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import DsrCalculator from "@/components/loan/DsrCalculator.vue";
import { LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialIncome?: number }>();

const incomeLabel = computed(() => {
  if (!props.initialIncome) return null;
  return formatManWon(props.initialIncome / 10000);
});

const seoTitle = computed(() =>
  incomeLabel.value
    ? `연봉 ${incomeLabel.value}원 DSR 대출한도 계산기 | shakilabs.com/loan`
    : "DSR 계산기 | shakilabs.com/loan",
);

const seoDescription = computed(() =>
  incomeLabel.value
    ? `연봉 ${incomeLabel.value}원 기준 DSR 한도 내 추가 대출 가능 금액과 월 상환액을 계산합니다.`
    : "연소득과 기존 원리금 상환액을 바탕으로 추가 대출 가능 한도를 역산하세요.",
);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />
  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ incomeLabel ? `연봉 ${incomeLabel}` : '' }} DSR 계산기</h1>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">가정한 금리와 만기 기준으로 DSR 한도 안에서 감당 가능한 월 상환액과 추정 최대 대출액을 계산합니다.</p>
        <DsrCalculator :initial-income="initialIncome" />
      </div>
    </div>
  </div>
</template>
