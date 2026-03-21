<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import JeonseLoanCalculator from "@/components/loan/JeonseLoanCalculator.vue";
import { JEONSE_LOAN_FAQS, JEONSE_LOAN_UPDATED } from "@/data/jeonseLoan";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialDeposit?: number }>();

const amountLabel = computed(() => {
  if (!props.initialDeposit) return null;
  return formatManWon(props.initialDeposit / 10000);
});

const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 전세대출 이자 계산기 | 청년·버팀목 비교`
    : "전세대출 이자 계산기 — 청년전용·버팀목·시중은행 비교",
);

const seoDescription = computed(() =>
  amountLabel.value
    ? `전세보증금 ${amountLabel.value}원 기준 전세대출 월 이자와 상품별 금리를 비교합니다.`
    : "전세보증금과 금리를 입력하면 월 이자, 총이자를 계산하고 청년·버팀목·시중은행 상품을 비교합니다.",
);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: JEONSE_LOAN_FAQS.map((faq) => ({
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
        <h1 class="retro-title">{{ amountLabel ? `${amountLabel}` : '' }} 전세대출 이자 계산기</h1>
        <FreshBadge :message="`${JEONSE_LOAN_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          전세보증금과 금리를 입력하면 월 이자를 계산하고, 청년전용·버팀목·시중은행 상품별 이자를 비교합니다.
        </p>
        <JeonseLoanCalculator :initial-deposit="initialDeposit" />
      </div>
    </div>

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">자주 묻는 질문</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <details
          v-for="faq in JEONSE_LOAN_FAQS"
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
