<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import LtvDtiCalculator from "@/components/loan/LtvDtiCalculator.vue";
import { LTV_DTI_FAQS, LTV_DTI_UPDATED } from "@/data/ltvDti";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialPropertyPrice?: number }>();

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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: LTV_DTI_FAQS.map((faq) => ({
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
        <h1 class="retro-title">{{ amountLabel ? `${amountLabel}` : '' }} LTV·DTI·DSR 계산기</h1>
        <FreshBadge :message="`${LTV_DTI_UPDATED} 기준`" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">
          주택가격·소득·기존 대출을 입력하면 LTV, DTI, DSR 규제별 대출 한도를 비교하고 최종 가능 금액을 확인합니다.
        </p>
        <LtvDtiCalculator :initial-property-price="initialPropertyPrice" />
      </div>
    </div>

    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">자주 묻는 질문</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <details
          v-for="faq in LTV_DTI_FAQS"
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
