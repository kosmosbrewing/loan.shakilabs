<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { LOAN_REPAYMENT_GUIDE } from "@/data/seoGuides";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RepaymentCalculator from "@/components/loan/RepaymentCalculator.vue";
import CalculatorPageHeader from "@/components/loan/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
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

const faqItems = [
  {
    q: "원리금균등과 원금균등 상환의 차이는 무엇인가요?",
    a: "원리금균등은 매월 납입액(원금+이자)이 동일하고, 원금균등은 매월 원금 상환액이 동일합니다. 원금균등은 초기 납입액이 크지만 총이자가 적고, 원리금균등은 현금흐름이 일정해 가계 관리가 편합니다.",
  },
  {
    q: "총이자를 줄이려면 어떤 상환방식이 유리한가요?",
    a: "원금균등 상환이 총이자가 더 적습니다. 초기에 원금을 더 많이 갚기 때문에 이자가 빠르게 줄어듭니다. 다만 초기 월 납입액이 원리금균등보다 높아 소득 여유가 있을 때 유리합니다.",
  },
  {
    q: "거치 기간이 있으면 어떻게 달라지나요?",
    a: "거치 기간 동안은 이자만 납부하고 원금 상환이 없어 월 부담이 줄지만, 그만큼 원금 상환 기간이 짧아져 이후 월 납입액이 늘어나고 총이자도 증가합니다.",
  },
] as const;

const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />
  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="대출 상환방식 비교" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">상환 조건 입력</h2>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">총이자를 줄이고 싶다면 원금균등, 월 현금흐름 안정이 우선이면 원리금균등이 일반적으로 유리합니다.</p>
        <CalculatorInteractionTracker calculator-id="repayment" page-path="/loan/repayment">
          <RepaymentCalculator :initial-principal="initialPrincipal" />
        </CalculatorInteractionTracker>
      </div>
    </div>

    <FaqAccordionPanel :items="faqItems" :extra="LOAN_REPAYMENT_GUIDE.faqs" />

    <SeoRichGuide
      :title="LOAN_REPAYMENT_GUIDE.title"
      :intro="LOAN_REPAYMENT_GUIDE.intro"
      :sections="LOAN_REPAYMENT_GUIDE.sections"
      :disclaimer="LOAN_REPAYMENT_GUIDE.disclaimer"
    />
  </div>
</template>
