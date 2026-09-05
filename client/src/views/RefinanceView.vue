<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { LOAN_REFINANCE_GUIDE } from "@/data/seoGuides";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RefinanceCalculator from "@/components/loan/RefinanceCalculator.vue";
import CalculatorPageHeader from "@/components/loan/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import RelatedCalculators from "@/components/loan/RelatedCalculators.vue";
import { LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialBalance?: number }>();

// 잔액 변종(/refinance/{잔액})은 형제 간 최악 쌍 유사도 0.98로 고유 본문이 없어
// 대표 URL로 canonical을 통합한다. 라우트·프리렌더는 유지한다.
const canonicalPath = computed(() =>
  props.initialBalance != null ? "/refinance" : undefined,
);

const balanceLabel = computed(() => {
  if (!props.initialBalance) return null;
  return formatManWon(props.initialBalance / 10000);
});

const seoTitle = computed(() =>
  balanceLabel.value
    ? `${balanceLabel.value} 대환대출 갈아타기 계산기 | shakilabs.com/loan`
    : "대환대출 갈아타기 계산기 | shakilabs.com/loan",
);

const seoDescription = computed(() =>
  balanceLabel.value
    ? `${balanceLabel.value}원 대출 갈아타기 시 월 납입액 절감 효과와 초기비용 회수 시점을 계산하세요.`
    : "현재 금리와 새 금리, 남은 기간, 갈아타기 비용을 입력해 절감 효과를 계산하세요.",
);

const faqItems = [
  {
    q: "대환대출(갈아타기)은 언제 유리한가요?",
    a: "현재 금리보다 새 금리가 낮고, 중도상환수수료·대출 실행비 등 갈아타기 비용을 감안해도 남은 기간 동안 절감되는 이자가 더 클 때 유리합니다. 남은 만기가 길수록 효과가 큽니다.",
  },
  {
    q: "중도상환수수료는 어떻게 계산되나요?",
    a: "일반적으로 잔액 × 중도상환수수료율 × (남은 약정기간/전체 약정기간)으로 계산됩니다. 대출 후 3년이 지나면 면제되는 경우가 많으며, 은행마다 다르므로 정확한 조건을 확인해야 합니다.",
  },
  {
    q: "대환대출 시 신용점수에 영향이 있나요?",
    a: "기존 대출을 상환하고 새 대출을 받는 과정에서 일시적으로 대출 건수가 변동되지만, 장기적으로 금리가 낮아지면 상환 부담이 줄어 신용 관리에 유리합니다.",
  },
] as const;

// 화면 아코디언과 구조화 데이터가 같은 병합 결과를 쓰도록 한 번만 계산한다
const mergedFaqs = mergeFaqs(faqItems, LOAN_REFINANCE_GUIDE.faqs);

const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: mergedFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}));
</script>

<template>
  <SEOHead
    :title="seoTitle"
    :description="seoDescription"
    :json-ld="faqJsonLd"
    :canonical-path="canonicalPath"
  />
  <div class="text-resize-layout container space-y-5 py-5">
    <CalculatorPageHeader title="대환대출 갈아타기 계산기" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">갈아타기 조건 입력</h2>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">월 납입액, 총이자, 초기비용 회수 시점을 함께 봐야 실제 효과를 판단할 수 있습니다.</p>
        <CalculatorInteractionTracker calculator-id="refinance" page-path="/loan/refinance">
          <RefinanceCalculator :initial-balance="initialBalance" />
        </CalculatorInteractionTracker>
      </div>
    </div>

    <RelatedCalculators />


    <FaqAccordionPanel :items="mergedFaqs" />

    <SeoRichGuide
      :title="LOAN_REFINANCE_GUIDE.title"
      :intro="LOAN_REFINANCE_GUIDE.intro"
      :sections="LOAN_REFINANCE_GUIDE.sections"
      :disclaimer="LOAN_REFINANCE_GUIDE.disclaimer"
    />
  </div>
</template>
