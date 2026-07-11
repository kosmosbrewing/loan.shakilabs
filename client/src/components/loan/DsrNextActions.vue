<script setup lang="ts">
import { onMounted } from "vue";
import { ArrowRight } from "lucide-vue-next";
import { ShSurface, ShText } from "@shakilabs/ui";
import { trackEvent } from "@/lib/analytics";

const actions = [
  { key: "repayment", title: "DSR 한도로 월 상환 방식 비교", description: "가능한 월 상환액을 원리금균등·원금균등 방식으로 비교합니다.", href: "/loan/repayment" },
  { key: "refinance", title: "기존 대출 갈아타기 손익 계산", description: "금리 차이와 중도상환비용을 반영해 대환 실익을 확인합니다.", href: "/loan/refinance" },
  { key: "mortgage_compare", title: "주담대 고정·변동금리 비교", description: "같은 대출액에서 금리 방식별 총이자와 월 부담을 비교합니다.", href: "/loan/mortgage-compare" },
] as const;

onMounted(() => {
  actions.forEach((action) => trackEvent("related_tool_impression", {
    app_id: "loan", from_tool: "dsr", to_tool: action.key, placement: "after_result",
  }));
});

function trackRelatedClick(toTool: string): void {
  trackEvent("related_tool_click", {
    app_id: "loan", from_tool: "dsr", to_tool: toTool, placement: "after_result",
  });
}
</script>

<template>
  <section aria-labelledby="dsr-next-actions-title">
    <ShText id="dsr-next-actions-title" as="h2" variant="heading" class="mb-3">
      DSR 결과로 다음 대출 조건을 확인하세요
    </ShText>
    <div class="grid gap-3 md:grid-cols-3">
      <ShSurface
        v-for="action in actions"
        :key="action.key"
        as="a"
        :href="action.href"
        variant="outlined"
        padding="md"
        class="group flex flex-col no-underline hover:border-primary"
        @click="trackRelatedClick(action.key)"
      >
        <ShText as="h3" variant="heading">{{ action.title }}</ShText>
        <ShText variant="caption" tone="muted" class="mt-2 flex-1">{{ action.description }}</ShText>
        <span class="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-primary">
          이어서 계산 <ArrowRight class="h-4 w-4" aria-hidden="true" />
        </span>
      </ShSurface>
    </div>
  </section>
</template>
