<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RepaymentCalculator from "@/components/loan/RepaymentCalculator.vue";
import { LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
</script>

<template>
  <SEOHead
    title="원리금균등 vs 원금균등 비교 | loan.shakilabs.com"
    description="대출원금, 금리, 만기를 입력해 두 상환방식의 총이자와 초기 부담 차이를 비교하세요."
  />
  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">원리금균등 vs 원금균등</h1>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">총이자를 줄이고 싶다면 원금균등, 월 현금흐름 안정이 우선이면 원리금균등이 일반적으로 유리합니다.</p>
        <RepaymentCalculator />
      </div>
    </div>
  </div>
</template>
