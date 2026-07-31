<script setup lang="ts">
// 계산이 끝난 지점에서 다음 계산으로 잇는다. 네이버 유입은 답만 보고 이탈하는 성향이 강해
// "다음에 할 계산"을 결과 직후에 제시하는 것이 세션을 이어붙이는 유일한 지점이다.
// house PopularCalculators와 같은 맵 방식 — DSR 전용이던 DsrNextActions를 전 계산기로 일반화했다.
import { computed, onMounted } from "vue";
import { ArrowRight } from "lucide-vue-next";
import { RouterLink, useRoute } from "vue-router";
import { trackEvent } from "@/lib/analytics";

interface CalculatorItem {
  key: string;
  title: string;
  description: string;
  to: string;
}

const route = useRoute();

const items: readonly CalculatorItem[] = [
  { key: "dsr", title: "DSR 한도", description: "연소득 대비 감당 가능한 월 상환액과 최대 대출액을 계산합니다.", to: "/dsr" },
  { key: "ltv-dti", title: "LTV·DTI·DSR", description: "세 규제를 함께 적용해 실제 한도를 좁힙니다.", to: "/ltv-dti" },
  { key: "repayment", title: "상환방식 비교", description: "원리금균등과 원금균등의 월 부담·총이자를 비교합니다.", to: "/repayment" },
  { key: "refinance", title: "대환대출 갈아타기", description: "금리 차이와 중도상환비용을 반영해 실익을 확인합니다.", to: "/refinance" },
  { key: "prepayment-fee", title: "중도상환수수료", description: "남은 약정기간 기준으로 수수료를 추정합니다.", to: "/prepayment-fee" },
  { key: "mortgage-compare", title: "주담대 금리 비교", description: "같은 대출액에서 고정·변동 총이자를 비교합니다.", to: "/mortgage-compare" },
  { key: "jeonse-loan", title: "전세대출 이자", description: "보증금과 금리로 월 이자 부담을 계산합니다.", to: "/jeonse-loan" },
  { key: "jeonse-guarantee-fee", title: "전세보증보험 보증료", description: "HUG 요율로 연간 보증료를 계산합니다.", to: "/jeonse-guarantee-fee" },
  { key: "stepping-stone-loan", title: "디딤돌대출", description: "소득·주택가격 요건과 예상 금리를 확인합니다.", to: "/stepping-stone-loan" },
  { key: "student-loan", title: "학자금 대출 상환", description: "잔액과 상환 방식으로 완납 시점을 봅니다.", to: "/student-loan" },
] as const;

// 자금 흐름의 다음 단계를 우선 배치한다 — 한도 확인 → 조건 비교 → 비용 점검 순
const RELATED_MAP: Record<string, readonly string[]> = {
  dsr: ["repayment", "refinance", "mortgage-compare"],
  "ltv-dti": ["dsr", "mortgage-compare", "stepping-stone-loan"],
  repayment: ["dsr", "refinance", "prepayment-fee"],
  refinance: ["prepayment-fee", "repayment", "mortgage-compare"],
  "prepayment-fee": ["refinance", "repayment", "dsr"],
  "mortgage-compare": ["dsr", "ltv-dti", "repayment"],
  "jeonse-loan": ["jeonse-guarantee-fee", "dsr", "repayment"],
  "jeonse-guarantee-fee": ["jeonse-loan", "dsr", "stepping-stone-loan"],
  "stepping-stone-loan": ["ltv-dti", "dsr", "mortgage-compare"],
  "student-loan": ["repayment", "dsr", "prepayment-fee"],
};

const FALLBACK_KEYS: readonly string[] = ["dsr", "refinance", "repayment"];

const itemByKey = new Map(items.map((item) => [item.key, item]));

/** /loan/dsr·/loan/dsr/8000 같은 파라미터 경로에서도 같은 그룹으로 묶는다 */
const currentKey = computed(() => {
  const segment = route.path.replace(/^\/+/, "").split("/")[0] ?? "";
  return itemByKey.has(segment) ? segment : "";
});

const relatedItems = computed(() => {
  const keys = RELATED_MAP[currentKey.value] ?? FALLBACK_KEYS;
  return keys
    .filter((key) => key !== currentKey.value)
    .map((key) => itemByKey.get(key))
    .filter((item): item is CalculatorItem => Boolean(item));
});

onMounted(() => {
  relatedItems.value.forEach((item) => trackEvent("related_tool_impression", {
    app_id: "loan",
    from_tool: currentKey.value || "unknown",
    to_tool: item.key,
    placement: "after_result",
  }));
});

function trackRelatedClick(toTool: string): void {
  trackEvent("related_tool_click", {
    app_id: "loan",
    from_tool: currentKey.value || "unknown",
    to_tool: toTool,
    placement: "after_result",
  });
}
</script>

<template>
  <section class="retro-panel overflow-hidden" aria-labelledby="related-calculators-title">
    <div class="retro-titlebar rounded-t-2xl">
      <h2 id="related-calculators-title" class="retro-title">이어서 확인하면 좋은 계산</h2>
    </div>
    <div class="retro-panel-content grid gap-3 sm:grid-cols-3">
      <RouterLink
        v-for="item in relatedItems"
        :key="item.key"
        :to="item.to"
        class="group flex flex-col rounded-xl border border-border/60 p-3 no-underline transition-colors hover:border-primary"
        @click="trackRelatedClick(item.key)"
      >
        <span class="text-caption font-semibold text-foreground">{{ item.title }}</span>
        <span class="mt-1 flex-1 text-tiny leading-relaxed text-muted-foreground">{{ item.description }}</span>
        <span class="mt-2 inline-flex items-center gap-1 text-tiny font-semibold text-primary">
          이어서 계산 <ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </RouterLink>
    </div>
  </section>
</template>
