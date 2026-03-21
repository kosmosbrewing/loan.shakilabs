<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import { LOAN_ASSUMPTION_NOTE, LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
</script>

<template>
  <SEOHead
    title="대출 계산기 소개 | shakilabs.com/loan"
    description="shakilabs.com/loan의 계산 기준과 사용 범위를 안내합니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">서비스 안내</h1>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-body leading-relaxed text-muted-foreground">
          shakilabs.com/loan은 금융상품 비교가 아니라, 대출 구조를 빠르게 이해하기 위한 참고용 계산기입니다.
        </p>
        <div class="grid gap-3 md:grid-cols-3">
          <div class="retro-panel-muted p-4">
            <p class="text-heading font-bold text-foreground">갈아타기 계산</p>
            <p class="mt-2 text-caption text-muted-foreground">남은 원금 기준으로 현재 금리와 새 금리의 차이를 비교합니다.</p>
          </div>
          <div class="retro-panel-muted p-4">
            <p class="text-heading font-bold text-foreground">DSR 계산</p>
            <p class="mt-2 text-caption text-muted-foreground">연소득과 기존 원리금 상환액으로 추가 한도를 역산합니다.</p>
          </div>
          <div class="retro-panel-muted p-4">
            <p class="text-heading font-bold text-foreground">상환방식 비교</p>
            <p class="mt-2 text-caption text-muted-foreground">총이자와 초기 현금흐름 차이를 바로 보여줍니다.</p>
          </div>
        </div>
        <p class="text-caption leading-relaxed text-muted-foreground">{{ LOAN_ASSUMPTION_NOTE }}</p>
      </div>
    </div>
  </div>
</template>
