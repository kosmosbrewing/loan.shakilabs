<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { LOAN_LTV_GUIDE } from "@/data/seoGuides";
import FreshBadge from "@/components/common/FreshBadge.vue";
import LtvDtiCalculator from "@/components/loan/LtvDtiCalculator.vue";
import CalculatorPageHeader from "@/components/loan/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import RelatedCalculators from "@/components/loan/RelatedCalculators.vue";
import { LTV_DTI_FAQS, LTV_DTI_UPDATED } from "@/data/ltvDti";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialPropertyPrice?: number }>();

// 주택가격 변종(/ltv-dti/{가격})은 /70000 이 부모와 100% 동일하고 5개 자식 자수가
// 3,059~3,062자로 사실상 같아 대표 URL로 canonical을 통합한다. 라우트·프리렌더는 유지한다.
const canonicalPath = computed(() =>
  props.initialPropertyPrice != null ? "/ltv-dti" : undefined,
);

const amountLabel = computed(() => {
  if (!props.initialPropertyPrice) return null;
  return formatManWon(props.initialPropertyPrice / 10000);
});

const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} LTV·DTI·DSR 대출한도 계산기`
    : "LTV DTI DSR 계산기 — 대출 가능 금액 한눈에 확인",
);

const seoDescription = computed(() =>
  amountLabel.value
    ? `주택가격 ${amountLabel.value}원 기준 LTV·DTI·DSR 규제별 최대 대출 한도를 비교 계산합니다.`
    : "주택가격과 소득을 입력하면 LTV, DTI, DSR 규제별 대출 가능 금액을 비교하고 제한 요인을 확인합니다.",
);

// 화면 아코디언과 구조화 데이터가 같은 병합 결과를 쓰도록 한 번만 계산한다
const mergedFaqs = mergeFaqs(LTV_DTI_FAQS, LOAN_LTV_GUIDE.faqs);

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
  <SEOHead
    :title="seoTitle"
    :description="seoDescription"
    :json-ld="faqJsonLd"
    :canonical-path="canonicalPath"
  />
  <div class="container space-y-5 py-5">
    <CalculatorPageHeader title="LTV·DTI·DSR 계산기" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">한도 조건 입력</h2>
        <FreshBadge :message="`${LTV_DTI_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          주택가격·소득·기존 대출을 입력하면 LTV, DTI, DSR 규제별 대출 한도를 비교하고 최종 가능 금액을 확인합니다.
        </p>
        <CalculatorInteractionTracker calculator-id="ltv_dti" page-path="/loan/ltv-dti">
          <LtvDtiCalculator :initial-property-price="initialPropertyPrice" />
        </CalculatorInteractionTracker>
      </div>
    </div>

    <RelatedCalculators />


    <FaqAccordionPanel :items="mergedFaqs" />

    <SeoRichGuide
      :title="LOAN_LTV_GUIDE.title"
      :intro="LOAN_LTV_GUIDE.intro"
      :sections="LOAN_LTV_GUIDE.sections"
      :sources="LOAN_LTV_GUIDE.sources"
      :disclaimer="LOAN_LTV_GUIDE.disclaimer"
    />
  </div>
</template>
