<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { LOAN_HOME_GUIDE } from "@/data/seoGuides";
import FreshBadge from "@/components/common/FreshBadge.vue";
import PrepaymentFeeCalculator from "@/components/loan/PrepaymentFeeCalculator.vue";
import CalculatorPageHeader from "@/components/loan/CalculatorPageHeader.vue";
import { PREPAYMENT_FEE_FAQS, PREPAYMENT_FEE_UPDATED } from "@/data/loanExtraTools";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialAmount?: number }>();

const amountLabel = computed(() => {
  if (!props.initialAmount) return null;
  return formatManWon(props.initialAmount / 10000);
});

const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 중도상환수수료 계산기 | shakilabs.com/loan`
    : "중도상환수수료 계산기 | shakilabs.com/loan",
);

const seoDescription = computed(() =>
  amountLabel.value
    ? `${amountLabel.value}원 중도상환 시 예상 수수료와 면제 금액, 실효 부담률을 계산합니다.`
    : "상환원금, 수수료율, 잔여 부과기간, 연간 면제한도를 기준으로 예상 중도상환수수료를 계산합니다.",
);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: PREPAYMENT_FEE_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />
  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="중도상환수수료 계산기" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">상환 조건 입력</h2>
        <FreshBadge :message="`${PREPAYMENT_FEE_UPDATED} 확인`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          은행 설명서에서 자주 쓰는 비례 차감 방식을 기준으로 참고 계산합니다.
        </p>
        <PrepaymentFeeCalculator :initial-amount="initialAmount" />
      </div>
    </div>

    <FaqAccordionPanel :items="PREPAYMENT_FEE_FAQS" />

    <SeoRichGuide
      :title="LOAN_HOME_GUIDE.title"
      :intro="LOAN_HOME_GUIDE.intro"
      :sections="LOAN_HOME_GUIDE.sections"
      :faqs="LOAN_HOME_GUIDE.faqs"
      :disclaimer="LOAN_HOME_GUIDE.disclaimer"
    />
  </div>
</template>
