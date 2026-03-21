<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import SteppingStoneLoanCalculator from "@/components/loan/SteppingStoneLoanCalculator.vue";
import { STEPPING_STONE_FAQS, STEPPING_STONE_UPDATED } from "@/data/steppingStoneLoan";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialPropertyPrice?: number }>();

const amountLabel = computed(() => {
  if (!props.initialPropertyPrice) return null;
  return formatManWon(props.initialPropertyPrice / 10000);
});

const seoTitle = computed(() =>
  amountLabel.value
    ? `${amountLabel.value} 디딤돌대출 계산기 | 금리·한도 시뮬레이션`
    : "디딤돌대출 계산기 — 자격·금리·한도 한눈에 확인",
);

const seoDescription = computed(() =>
  amountLabel.value
    ? `주택가격 ${amountLabel.value}원 기준 디딤돌대출 적용 금리, LTV/DTI 한도, 월 상환액을 계산합니다.`
    : "소득과 주택가격을 입력하면 디딤돌대출 자격, 적용 금리, 대출 한도, 상환 계획을 한눈에 확인합니다.",
);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: STEPPING_STONE_FAQS.map((faq) => ({
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
        <h1 class="retro-title">{{ amountLabel ? `${amountLabel}` : '' }} 디딤돌대출 계산기</h1>
        <FreshBadge :message="`${STEPPING_STONE_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          소득·주택가격·유형을 입력하면 디딤돌대출 자격, 적용 금리, 대출 한도, 상환 계획을 확인합니다.
        </p>
        <SteppingStoneLoanCalculator :initial-property-price="initialPropertyPrice" />
      </div>
    </div>

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">자주 묻는 질문</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <details
          v-for="faq in STEPPING_STONE_FAQS"
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
