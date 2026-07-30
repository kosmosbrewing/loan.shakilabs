<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { LOAN_HOME_GUIDE } from "@/data/seoGuides";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SteppingStoneLoanCalculator from "@/components/loan/SteppingStoneLoanCalculator.vue";
import CalculatorPageHeader from "@/components/loan/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import { STEPPING_STONE_FAQS, STEPPING_STONE_UPDATED } from "@/data/steppingStoneLoan";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialPropertyPrice?: number }>();

const amountLabel = computed(() => {
  if (!props.initialPropertyPrice) return null;
  return formatManWon(props.initialPropertyPrice / 10000);
});

const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 디딤돌대출 계산기 | 금리·한도 시뮬레이션`
    : "디딤돌대출 계산기 — 자격·금리·한도 한눈에 확인",
);

const seoDescription = computed(() =>
  amountLabel.value
    ? `주택가격 ${amountLabel.value}원 기준 디딤돌대출 적용 금리, LTV/DTI 한도, 월 상환액을 계산합니다.`
    : "소득과 주택가격을 입력하면 디딤돌대출 자격, 적용 금리, 대출 한도, 상환 계획을 한눈에 확인합니다.",
);

// 화면 아코디언과 구조화 데이터가 같은 병합 결과를 쓰도록 한 번만 계산한다
const mergedFaqs = mergeFaqs(STEPPING_STONE_FAQS, LOAN_HOME_GUIDE.faqs);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />
  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="디딤돌대출 계산기" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">자격·한도 조건 입력</h2>
        <FreshBadge :message="`${STEPPING_STONE_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          소득·주택가격·유형을 입력하면 디딤돌대출 자격, 적용 금리, 대출 한도, 상환 계획을 확인합니다.
        </p>
        <CalculatorInteractionTracker calculator-id="stepping_stone_loan" page-path="/loan/stepping-stone-loan">
          <SteppingStoneLoanCalculator :initial-property-price="initialPropertyPrice" />
        </CalculatorInteractionTracker>
      </div>
    </div>

    <FaqAccordionPanel :items="mergedFaqs" />

    <SeoRichGuide
      :title="LOAN_HOME_GUIDE.title"
      :intro="LOAN_HOME_GUIDE.intro"
      :sections="LOAN_HOME_GUIDE.sections"
      :disclaimer="LOAN_HOME_GUIDE.disclaimer"
    />
  </div>
</template>
