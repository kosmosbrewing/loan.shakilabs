<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import DsrCalculator from "@/components/loan/DsrCalculator.vue";
import { LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialIncome?: number }>();

const incomeLabel = computed(() => {
  if (!props.initialIncome) return null;
  return formatManWon(props.initialIncome / 10000);
});

const seoTitle = computed(() =>
  incomeLabel.value
    ? `연봉 ${incomeLabel.value}원 DSR 대출한도 계산기 | shakilabs.com/loan`
    : "DSR 계산기 | shakilabs.com/loan",
);

const seoDescription = computed(() =>
  incomeLabel.value
    ? `연봉 ${incomeLabel.value}원 기준 DSR 한도 내 추가 대출 가능 금액과 월 상환액을 계산합니다.`
    : "연소득과 기존 원리금 상환액을 바탕으로 추가 대출 가능 한도를 역산하세요.",
);

const faqItems = [
  {
    q: "DSR이란 무엇인가요?",
    a: "DSR(총부채원리금상환비율)은 연간 소득 대비 모든 대출의 연간 원리금 상환액 비율입니다. 주담대뿐 아니라 신용대출·학자금·카드론 등 모든 금융부채가 포함됩니다.",
  },
  {
    q: "DSR 규제 기준은 어떻게 되나요?",
    a: "은행권 주담대는 DSR 40%, 비은행(보험·저축은행 등)은 DSR 50%가 기본 기준입니다. 2026년 현재 총 대출액 1억 원 이상이면 DSR 규제가 적용됩니다.",
  },
  {
    q: "DSR을 낮추려면 어떻게 해야 하나요?",
    a: "기존 대출을 일부 상환하거나, 대출 만기를 늘려 연간 원리금 상환액을 줄이면 DSR이 낮아집니다. 또한 소득 증빙을 추가하면 DSR 분모가 커져 비율이 개선됩니다.",
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
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ incomeLabel ? `연봉 ${incomeLabel}` : '' }} DSR 계산기</h1>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">가정한 금리와 만기 기준으로 DSR 한도 안에서 감당 가능한 월 상환액과 추정 최대 대출액을 계산합니다.</p>
        <DsrCalculator :initial-income="initialIncome" />
      </div>
    </div>

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">자주 묻는 질문</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <details v-for="faq in faqItems" :key="faq.q" class="retro-panel-muted p-4">
          <summary class="cursor-pointer list-none text-body font-semibold text-foreground">{{ faq.q }}</summary>
          <p class="mt-2 text-caption leading-relaxed text-muted-foreground">{{ faq.a }}</p>
        </details>
      </div>
    </div>
  </div>
</template>
