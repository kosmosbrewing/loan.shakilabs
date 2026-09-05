<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FaqAccordionPanel from "@/components/common/FaqAccordionPanel.vue";
import SeoRichGuide from "@/components/common/SeoRichGuide.vue";
import { mergeFaqs } from "@/lib/faqMerge";
import { LOAN_STUDENT_LOAN_GUIDE } from "@/data/seoGuides";
import FreshBadge from "@/components/common/FreshBadge.vue";
import StudentLoanCalculator from "@/components/loan/StudentLoanCalculator.vue";
import CalculatorPageHeader from "@/components/loan/CalculatorPageHeader.vue";
import CalculatorInteractionTracker from "@/components/analytics/CalculatorInteractionTracker.vue";
import RelatedCalculators from "@/components/loan/RelatedCalculators.vue";
import { STUDENT_LOAN_FAQS, STUDENT_LOAN_UPDATED } from "@/data/loanExtraTools";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialBalance?: number }>();

// 잔액 변종(/student-loan/{잔액})은 형제 간 최악 쌍 유사도 0.996으로 고유 본문이 없어
// 대표 URL로 canonical을 통합한다. 라우트·프리렌더는 유지한다.
const canonicalPath = computed(() =>
  props.initialBalance != null ? "/student-loan" : undefined,
);

const balanceLabel = computed(() => {
  if (!props.initialBalance) return null;
  return formatManWon(props.initialBalance / 10000);
});

const seoTitle = computed(() =>
  balanceLabel.value
    ? `${balanceLabel.value}원 학자금 대출 상환 계산기 | shakilabs.com/loan`
    : "학자금 대출 상환 계산기 | shakilabs.com/loan",
);

const seoDescription = computed(() =>
  balanceLabel.value
    ? `학자금 대출 잔액 ${balanceLabel.value}원 기준 취업 후 예상 의무상환액과 월 원천공제액을 계산합니다.`
    : "취업 후 상환 학자금대출의 기준소득, 상환율, 금리를 기준으로 예상 의무상환액을 계산합니다.",
);

// 화면 아코디언과 구조화 데이터가 같은 병합 결과를 쓰도록 한 번만 계산한다
const mergedFaqs = mergeFaqs(STUDENT_LOAN_FAQS, LOAN_STUDENT_LOAN_GUIDE.faqs);

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
    <CalculatorPageHeader title="학자금 대출 상환 계산기" />

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">상환 조건 입력</h2>
        <FreshBadge :message="`${STUDENT_LOAN_UPDATED} 확인`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          취업 후 상환 학자금대출의 연간 의무상환액을 빠르게 확인하는 참고용 계산기입니다.
        </p>
        <CalculatorInteractionTracker calculator-id="student_loan" page-path="/loan/student-loan">
          <StudentLoanCalculator :initial-balance="initialBalance" />
        </CalculatorInteractionTracker>
      </div>
    </div>

    <RelatedCalculators />


    <FaqAccordionPanel :items="mergedFaqs" />

    <SeoRichGuide
      :title="LOAN_STUDENT_LOAN_GUIDE.title"
      :intro="LOAN_STUDENT_LOAN_GUIDE.intro"
      :sections="LOAN_STUDENT_LOAN_GUIDE.sections"
      :disclaimer="LOAN_STUDENT_LOAN_GUIDE.disclaimer"
    />
  </div>
</template>
