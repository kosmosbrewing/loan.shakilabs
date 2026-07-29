<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import CalculatorPageHeader from "@/components/loan/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import JeonseGuaranteeCalculator from "@/components/loan/JeonseGuaranteeCalculator.vue";
import {
  JEONSE_GUARANTEE_FAQS,
  JEONSE_GUARANTEE_UPDATED,
  LOAN_JEONSE_GUARANTEE_GUIDE,
} from "@/data/jeonseGuarantee";

const seoTitle = "전세보증보험 보증료 계산기 | HUG 전세보증금반환보증";
const seoDescription =
  "보증금·기간·주택유형·부채비율로 HUG 전세보증금반환보증 보증료(연 0.097~0.211%)를 계산합니다. 한도·할인까지 확인하세요.";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: JEONSE_GUARANTEE_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />
  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="전세보증보험 보증료 계산기" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">보증 조건 입력</h2>
        <FreshBadge :message="`${JEONSE_GUARANTEE_UPDATED} 확인`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          HUG 공표 요율표(2025-03 개편) 기준으로 참고 계산합니다.
        </p>
        <CalculatorInteractionTracker calculator-id="jeonse_guarantee_fee" page-path="/loan/jeonse-guarantee-fee">
          <JeonseGuaranteeCalculator />
        </CalculatorInteractionTracker>
      </div>
    </div>

    <FaqAccordionPanel :items="[...JEONSE_GUARANTEE_FAQS]" :extra="LOAN_JEONSE_GUARANTEE_GUIDE.faqs" />

    <SeoRichGuide
      :title="LOAN_JEONSE_GUARANTEE_GUIDE.title"
      :intro="LOAN_JEONSE_GUARANTEE_GUIDE.intro"
      :sections="LOAN_JEONSE_GUARANTEE_GUIDE.sections"
      :disclaimer="LOAN_JEONSE_GUARANTEE_GUIDE.disclaimer"
    />
  </div>
</template>
