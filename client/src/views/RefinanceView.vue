<script setup lang="ts">
import { computed } from "vue";
import SEOHead from "@/components/common/SEOHead.vue";
import FreshBadge from "@/components/common/FreshBadge.vue";
import RefinanceCalculator from "@/components/loan/RefinanceCalculator.vue";
import { LOAN_BADGE_MESSAGE } from "@/data/loanPresets";
import { formatManWon } from "@/lib/utils";

const props = defineProps<{ initialBalance?: number }>();

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
        <h1 class="retro-title">{{ balanceLabel ? `${balanceLabel}` : '' }} 대환대출 갈아타기 계산기</h1>
        <FreshBadge :message="LOAN_BADGE_MESSAGE" />
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-caption leading-relaxed text-muted-foreground">월 납입액, 총이자, 초기비용 회수 시점을 함께 봐야 실제 효과를 판단할 수 있습니다.</p>
        <RefinanceCalculator :initial-balance="initialBalance" />
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
