<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
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
  if (key === "prepayment") return activePath.value === "/prepayment-fee";
  if (key === "student") return activePath.value === "/student-loan";
  return activePath.value === `/${key}`;
}

const scrollEl = ref<HTMLElement | null>(null);
const showFade = ref(true);

function checkScroll() {
  const el = scrollEl.value;
  if (!el) return;
  showFade.value = el.scrollWidth - el.scrollLeft - el.clientWidth > 8;
}

onMounted(() => {
  const el = scrollEl.value;
  if (el) {
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
  }
});

onBeforeUnmount(() => {
  scrollEl.value?.removeEventListener("scroll", checkScroll);
});
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container relative">
      <div ref="scrollEl" class="flex h-12 items-center gap-2 overflow-x-auto" style="scrollbar-width: none">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :aria-current="isActiveTab(tab.key) ? 'page' : undefined"
          :class="[
            'touch-target relative inline-flex h-12 shrink-0 items-center justify-center px-3 text-center text-[0.82rem] font-semibold leading-tight transition-all duration-200 sm:text-body',
            isActiveTab(tab.key)
              ? 'text-primary-foreground'
              : 'text-primary-foreground/70 hover:text-primary-foreground/90',
          ]"
        >
          <span class="break-keep">{{ tab.label }}</span>
          <span
            v-if="isActiveTab(tab.key)"
            class="absolute inset-x-1 bottom-0 h-[3px] rounded-full bg-white"
          />
        </RouterLink>
      </div>
      <!-- 스크롤 힌트: 우측 그라디언트 fade -->
      <div
        v-show="showFade"
        class="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-primary to-transparent"
        aria-hidden="true"
      />
    </div>
  </nav>
</template>
