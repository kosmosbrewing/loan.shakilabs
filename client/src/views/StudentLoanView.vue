<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import StudentLoanCalculator from "@/components/loan/StudentLoanCalculator.vue";
import { STUDENT_LOAN_FAQS, STUDENT_LOAN_UPDATED } from "@/data/loanExtraTools";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialBalance?: number }>();

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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: STUDENT_LOAN_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};
</script>

<template>
  <SEOHead :title="seoTitle" :description="seoDescription" :json-ld="faqJsonLd" />
  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ balanceLabel ? `${balanceLabel}원` : '' }} 학자금 대출 상환 계산기</h1>
        <FreshBadge :message="`${STUDENT_LOAN_UPDATED} 확인`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          취업 후 상환 학자금대출의 연간 의무상환액을 빠르게 확인하는 참고용 계산기입니다.
        </p>
        <StudentLoanCalculator :initial-balance="initialBalance" />
      </div>
    </div>

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">자주 묻는 질문</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <details v-for="faq in STUDENT_LOAN_FAQS" :key="faq.q" class="retro-panel-muted p-4">
          <summary class="cursor-pointer list-none text-body font-semibold text-foreground">{{ faq.q }}</summary>
          <p class="mt-2 text-caption leading-relaxed text-muted-foreground">{{ faq.a }}</p>
        </details>
      </div>
    </div>
  </div>
</template>
