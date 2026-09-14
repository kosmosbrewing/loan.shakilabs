<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { ShPrimaryNavigation } from "@shakilabs/ui";
import { LOAN_TABS } from "@/data/loanNavigation";

const route = useRoute();
const tabs = LOAN_TABS;

const activeItem = computed(() =>
  tabs.find((item) => route.path === item.to),
);
</script>

<template>
  <!-- v3 §3.3 — 2차 내비. 풀폭 브랜드 컬러 바(#A02222)를 걷어내고 canvas 배경 +
       accent underline으로 중성화한다. 배경/글자/밑줄 규칙은 loan-secondary-nav
       스코프로 main.css에 있다(패키지 기본값이 아직 --sh-color-primary 풀폭이라
       앱에서 덮는다).
       모바일(<48rem)은 헤더의 좌측 드로어가 대신한다(v3 §3.3-1) — 링크는 AppHeader의
       nav-items(LOAN_TABS, 같은 출처)로 드로어에 그대로 렌더되어 크롤 경로는 유지된다. -->
  <ShPrimaryNavigation
    class="loan-secondary-nav"
    aria-label="대출 계산기 메뉴"
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>

<style scoped>
@media (max-width: 47.99rem) {
  .loan-secondary-nav {
    display: none;
  }
}
</style>
