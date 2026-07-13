<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { LOAN_MORTGAGE_GUIDE } from "@/data/seoGuides";
import FreshBadge from "@/components/common/FreshBadge.vue";
import MortgageCompareCalculator from "@/components/loan/MortgageCompareCalculator.vue";
import CalculatorPageHeader from "@/components/loan/CalculatorPageHeader.vue";
import { MORTGAGE_COMPARE_FAQS, MORTGAGE_DATA_UPDATED } from "@/data/mortgageRates";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialLoanAmount?: number }>();

const amountLabel = computed(() => {
  if (!props.initialLoanAmount) return null;
  return formatManWon(props.initialLoanAmount / 10000);
});

const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 주택담보대출 금리비교 | 은행별 최저금리`
    : "주택담보대출 금리비교 — 은행별 최저금리·월상환액 비교",
);

const seoDescription = computed(() =>
  amountLabel.value
    ? `${amountLabel.value}원 주택담보대출 시 8개 은행 금리와 월 상환액을 한눈에 비교합니다.`
    : "대출금액과 기간을 입력하면 주요 시중은행 주택담보대출 금리와 월 상환액을 비교합니다.",
);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: MORTGAGE_COMPARE_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />
  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="주택담보대출 금리 비교" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">대출 조건 입력</h2>
        <FreshBadge :message="`${MORTGAGE_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          대출금액과 기간을 설정하면 주요 시중은행의 주담대 금리·월 상환액을 비교합니다.
        </p>
        <MortgageCompareCalculator :initial-loan-amount="initialLoanAmount" />
      </div>
    </div>

    <FaqAccordionPanel :items="MORTGAGE_COMPARE_FAQS" />

    <SeoRichGuide
      :title="LOAN_MORTGAGE_GUIDE.title"
      :intro="LOAN_MORTGAGE_GUIDE.intro"
      :sections="LOAN_MORTGAGE_GUIDE.sections"
      :faqs="LOAN_MORTGAGE_GUIDE.faqs"
      :disclaimer="LOAN_MORTGAGE_GUIDE.disclaimer"
    />
  </div>
</template>
