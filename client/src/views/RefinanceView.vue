<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RefinanceCalculator from "@/components/loan/RefinanceCalculator.vue";
import { LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
</script>

<template>
  <SEOHead
    title="대환대출 갈아타기 계산기 | loan.shakilabs.com"
    description="현재 금리와 새 금리, 남은 기간, 갈아타기 비용을 입력해 절감 효과를 계산하세요."
  />
  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">대환대출 갈아타기 계산기</h1>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">월 납입액, 총이자, 초기비용 회수 시점을 함께 봐야 실제 효과를 판단할 수 있습니다.</p>
        <RefinanceCalculator />
      </div>
    </div>
  </div>
</template>
