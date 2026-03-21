<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import MortgageCompareCalculator from "@/components/loan/MortgageCompareCalculator.vue";
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
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">{{ amountLabel ? `${amountLabel}` : '' }} 주택담보대출 금리비교</h1>
        <FreshBadge :message="`${MORTGAGE_DATA_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          대출금액과 기간을 설정하면 주요 시중은행의 주담대 금리·월 상환액을 비교합니다.
        </p>
        <MortgageCompareCalculator :initial-loan-amount="initialLoanAmount" />
      </div>
    </div>

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">자주 묻는 질문</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <details
          v-for="faq in MORTGAGE_COMPARE_FAQS"
          :key="faq.q"
          class="retro-panel-muted p-4"
        >
          <summary class="cursor-pointer list-none text-body font-semibold text-foreground">
            {{ faq.q }}
          </summary>
          <p class="mt-2 text-caption leading-relaxed text-muted-foreground">
            {{ faq.a }}
          </p>
        </details>
      </div>
    </div>
  </div>
</template>
