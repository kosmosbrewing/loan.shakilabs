<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { LOAN_ASSUMPTION_NOTE, LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
import { LOAN_ABOUT_GUIDE, LOAN_HOME_GUIDE } from "@/data/seoGuides";
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
        <div class="retro-panel-muted space-y-2 p-4">
          <p class="text-caption font-bold text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>
          <p class="text-caption leading-relaxed text-muted-foreground">
            모든 계산식과 기준값은 금융감독원 금융상품통합비교공시·주택도시기금 등 공공기관의 공시 자료와
            대조해 검증하며, 법령이나 금리 기준이 바뀌면 확인일을 명시해 갱신합니다. 오류 제보를 보내주시면
            확인 후 신속히 반영합니다.
          </p>
        </div>
      </div>
    </div>

    <SeoRichGuide
      :title="LOAN_ABOUT_GUIDE.title"
      :intro="LOAN_ABOUT_GUIDE.intro"
      :sections="LOAN_ABOUT_GUIDE.sections"
      :disclaimer="LOAN_ABOUT_GUIDE.disclaimer"
    />
    <SeoRichGuide
      :title="LOAN_HOME_GUIDE.title"
      :intro="LOAN_HOME_GUIDE.intro"
      :sections="LOAN_HOME_GUIDE.sections"
      :faqs="LOAN_HOME_GUIDE.faqs"
    />
  </div>
</template>
