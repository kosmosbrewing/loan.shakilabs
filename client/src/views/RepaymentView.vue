<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RepaymentCalculator from "@/components/loan/RepaymentCalculator.vue";
import { LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialPrincipal?: number }>();

const amountLabel = computed(() => {
  if (!props.initialPrincipal) return null;
  return formatManWon(props.initialPrincipal / 10000);
});

const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 대출 원리금균등 vs 원금균등 비교 | shakilabs.com/loan`
    : "원리금균등 vs 원금균등 비교 | shakilabs.com/loan",
);

const seoDescription = computed(() =>
  amountLabel.value
    ? `${amountLabel.value}원 대출 시 원리금균등과 원금균등 상환방식의 총이자와 월 납입액 차이를 비교하세요.`
    : "대출원금, 금리, 만기를 입력해 두 상환방식의 총이자와 초기 부담 차이를 비교하세요.",
);
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" />
  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ amountLabel ? `${amountLabel} 대출` : '' }} 원리금균등 vs 원금균등</h1>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">총이자를 줄이고 싶다면 원금균등, 월 현금흐름 안정이 우선이면 원리금균등이 일반적으로 유리합니다.</p>
        <RepaymentCalculator :initial-principal="initialPrincipal" />
      </div>
    </div>
  </div>
</template>
