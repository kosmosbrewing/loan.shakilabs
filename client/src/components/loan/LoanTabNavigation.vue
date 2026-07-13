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
  <ShPrimaryNavigation
    :items="tabs"
    :active-key="activeItem?.key"
    :link-component="RouterLink"
  />
</template>
