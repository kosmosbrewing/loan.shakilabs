<script setup lang="ts">
// 계산이 끝난 지점에서 다음 계산으로 잇는다. 네이버 유입은 답만 보고 이탈하는 성향이 강해
// "다음에 할 계산"을 결과 직후에 제시하는 것이 세션을 이어붙이는 유일한 지점이다.
// house PopularCalculators와 같은 맵 방식 — DSR 전용이던 DsrNextActions를 전 계산기로 일반화했다.
// 카드 모양은 패키지 ShNextActions(0.3.40)가 정한다 — 앱마다 달랐던 설명 2줄·"이어서 계산" 줄을
// 제목 + 한 줄 요약으로 줄였다(사용자 피드백 "글이 너무 많다"). 자세한 설명은 도착한 계산기가 한다.
// 폭은 ShNextActions가 스스로 본다(좁으면 목록, 44rem+면 3열) — 여기서 격자 클래스를 달지 않는다.
import { computed, onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ShNextActions, type NextActionItem } from "@shakilabs/ui";
import { trackEvent } from "@/lib/analytics";

const route = useRoute();

// note는 예전 설명 문장의 한 줄 요약이다. 미리 계산한 값이 없는 블록이라 value는 두지 않는다.
const items: readonly NextActionItem[] = [
  { key: "dsr", title: "DSR 한도", note: "연소득 대비 월 상환액·최대 대출액", to: "/dsr" },
  { key: "ltv-dti", title: "LTV·DTI·DSR", note: "세 규제를 함께 적용한 실제 한도", to: "/ltv-dti" },
  { key: "repayment", title: "상환방식 비교", note: "원리금균등·원금균등 월 부담·총이자", to: "/repayment" },
  { key: "refinance", title: "대환대출 갈아타기", note: "금리 차이·중도상환비용 반영한 실익", to: "/refinance" },
  { key: "prepayment-fee", title: "중도상환수수료", note: "남은 약정기간 기준 수수료 추정", to: "/prepayment-fee" },
  { key: "mortgage-compare", title: "주담대 금리 비교", note: "같은 대출액의 고정·변동 총이자", to: "/mortgage-compare" },
  { key: "jeonse-loan", title: "전세대출 이자", note: "보증금·금리로 본 월 이자 부담", to: "/jeonse-loan" },
  { key: "jeonse-guarantee-fee", title: "전세보증보험 보증료", note: "HUG 요율 기준 연간 보증료", to: "/jeonse-guarantee-fee" },
  { key: "stepping-stone-loan", title: "디딤돌대출", note: "소득·주택가격 요건과 예상 금리", to: "/stepping-stone-loan" },
  { key: "student-loan", title: "학자금 대출 상환", note: "잔액·상환 방식별 완납 시점", to: "/student-loan" },
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
    .filter((item): item is NextActionItem => Boolean(item));
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
  <ShNextActions
    :items="relatedItems"
    :link-component="RouterLink"
    @select="(item) => trackRelatedClick(item.key)"
  />
</template>
