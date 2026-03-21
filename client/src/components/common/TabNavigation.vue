<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
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
const showLeftFade = ref(false);
const showRightFade = ref(false);

function checkScroll() {
  const el = scrollEl.value;
  if (!el) return;
  showLeftFade.value = el.scrollLeft > 8;
  showRightFade.value = el.scrollWidth - el.scrollLeft - el.clientWidth > 8;
}

onMounted(() => {
  const el = scrollEl.value;
  if (el) {
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
  }
  window.addEventListener("resize", checkScroll);
});

onBeforeUnmount(() => {
  scrollEl.value?.removeEventListener("scroll", checkScroll);
  window.removeEventListener("resize", checkScroll);
});

watch(
  () => route.path,
  async () => {
    await nextTick();
    checkScroll();
  },
  { immediate: true }
);
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-primary/20 bg-primary shadow-sm" aria-label="주요 메뉴">
    <div class="container relative py-2 sm:py-0">
      <div
        ref="scrollEl"
        class="tab-scroll grid grid-cols-3 gap-2 sm:flex sm:h-12 sm:items-center sm:gap-2 sm:overflow-x-auto sm:py-0"
      >
        <RouterLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="tab.to"
          :aria-current="isActiveTab(tab.key) ? 'page' : undefined"
          :class="[
            'touch-target relative inline-flex min-w-0 items-center justify-center rounded-xl border px-2 py-2 text-center text-[0.78rem] font-semibold leading-tight transition-all duration-200 sm:h-12 sm:shrink-0 sm:rounded-none sm:border-transparent sm:px-3 sm:py-0 sm:text-body',
            isActiveTab(tab.key)
              ? 'border-white/60 bg-white text-primary shadow-sm sm:bg-transparent sm:text-primary-foreground sm:shadow-none'
              : 'border-white/15 bg-white/5 text-primary-foreground/88 hover:bg-white/10 hover:text-primary-foreground sm:bg-transparent sm:text-primary-foreground/70',
          ]"
        >
          <span class="break-keep">{{ tab.label }}</span>
          <span
            v-if="isActiveTab(tab.key)"
            class="absolute inset-x-1 bottom-0 hidden h-[3px] rounded-full bg-white sm:block"
          />
        </RouterLink>
      </div>
      <div
        v-show="showLeftFade"
        class="pointer-events-none absolute left-0 top-0 hidden h-full w-10 bg-gradient-to-r from-primary to-transparent sm:block"
        aria-hidden="true"
      />
      <div
        v-show="showRightFade"
        class="pointer-events-none absolute right-0 top-0 hidden h-full w-10 bg-gradient-to-l from-primary to-transparent sm:block"
        aria-hidden="true"
      />
    </div>
  </nav>
</template>

<style scoped>
.tab-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-scroll::-webkit-scrollbar {
  display: none;
}
</style>
