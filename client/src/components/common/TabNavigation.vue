<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

const tabs = [
  { key: "home", label: "홈", to: "/" },
  { key: "refinance", label: "갈아타기", to: "/refinance" },
  { key: "dsr", label: "DSR", to: "/dsr" },
  { key: "repayment", label: "상환방식", to: "/repayment" },
  { key: "prepayment", label: "중도상환", to: "/prepayment-fee" },
  { key: "student", label: "학자금", to: "/student-loan" },
] as const;

const activePath = computed(() => route.path);

function isActiveTab(key: (typeof tabs)[number]["key"]): boolean {
  if (key === "home") return activePath.value === "/";
  if (key === "refinance") return activePath.value === "/refinance";
  if (key === "dsr") return activePath.value === "/dsr";
  if (key === "repayment") return activePath.value === "/repayment";
  if (key === "prepayment") return activePath.value === "/prepayment-fee";
  if (key === "student") return activePath.value === "/student-loan";
  return false;
}
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container">
      <div class="flex h-12 items-center gap-1 overflow-x-auto sm:gap-2" style="scrollbar-width: none">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :aria-current="isActiveTab(tab.key) ? 'page' : undefined"
          :class="[
            'touch-target relative inline-flex h-12 shrink-0 items-center whitespace-nowrap px-2.5 text-caption font-semibold transition-all duration-200 sm:px-3 sm:text-body',
            isActiveTab(tab.key)
              ? 'text-white hover:text-white'
              : 'text-white/70 hover:text-white/90',
          ]"
        >
          {{ tab.label }}
          <span
            v-if="isActiveTab(tab.key)"
            class="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-white"
          />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
