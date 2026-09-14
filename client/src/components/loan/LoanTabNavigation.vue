<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  ShPrimaryNavigation,
  type PrimaryNavigationItem,
} from "@shakilabs/ui";

const route = useRoute();
const tabs: readonly PrimaryNavigationItem[] = [
  { key: "home", label: "대출 도구", to: "/", href: "/loan" },
  { key: "refinance", label: "갈아타기", to: "/refinance" },
  { key: "dsr", label: "DSR", to: "/dsr" },
  { key: "repayment", label: "상환방식", to: "/repayment" },
  { key: "prepayment", label: "중도상환", to: "/prepayment-fee" },
  { key: "student", label: "학자금", to: "/student-loan" },
];

const activeItem = computed(() =>
  tabs.find((item) => route.path === item.to),
);
</script>

<template>
  <!-- v3 §3.3 — 2차 내비. 풀폭 브랜드 컬러 바(#A02222)를 걷어내고 canvas 배경 +
       accent underline으로 중성화한다. 배경/글자/밑줄 규칙은 loan-secondary-nav
       스코프로 main.css에 있다(패키지 기본값이 아직 --sh-color-primary 풀폭이라
       앱에서 덮는다). -->
  <ShPrimaryNavigation
    class="loan-secondary-nav"
    aria-label="대출 계산기 메뉴"
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>
