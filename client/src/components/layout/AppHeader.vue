<script setup lang="ts">
// v3 §3.2 — 전역 검정 헤더는 패키지(ShGlobalHeader)가 소유한다.
// 앱은 링크와 유틸 슬롯(테마 토글)만 채우고 자체 헤더 마크업을 갖지 않는다.
// 카테고리 색(구 bg-primary/[8%] 틴트)은 헤더에 들어가지 않는다(§4.3).
// 0.3.38 "순수 내비게이션"(2026-09-25): 헤더는 위치(로고 / 앱 이름)와 이동(블로그·소개·☰)만 싣는다 — 팁 티커는 뺐다.
import { computed, onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { RouterLink, useRoute } from "vue-router";
import { ShGlobalHeader, type GlobalHeaderLink } from "@shakilabs/ui";
import { LOAN_TABS } from "@/data/loanNavigation";

const THEME_STORAGE_KEY = "loan-tools:theme:v1";
type ThemeMode = "light" | "dark";

// 사이트 링크 — 블로그는 포털 소유라 href, 소개는 이 앱 라우트라 RouterLink(to). 모바일에서는 ☰ 안으로 들어간다.
const links: GlobalHeaderLink[] = [
  { href: "/blog", label: "블로그" },
  { to: "/about", label: "소개" },
];

// 모바일 전체 메뉴(☰)에 실을 도구 목록 — 2차 내비(LoanTabNavigation)와 같은
// 출처(LOAN_TABS)를 쓴다. 목록을 복제하지 않는다.
const route = useRoute();
const navItems = LOAN_TABS;
const navActiveKey = computed(
  () => navItems.find((item) => route.path === item.to)?.key ?? "",
);

const theme = ref<ThemeMode>("light");

function applyTheme(next: ThemeMode): void {
  theme.value = next;
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, next);
}

function toggleTheme(): void {
  applyTheme(theme.value === "dark" ? "light" : "dark");
}

onMounted(() => {
  theme.value = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
});
</script>

<template>
  <ShGlobalHeader
    app="loan"
    home-href="/"
    brand="ShakiLabs"
    logo-src="/loan/logo.png"
    :links="links"
    :nav-items="navItems"
    :nav-active-key="navActiveKey"
    :link-component="RouterLink"
  >
    <template #utility>
      <button
        type="button"
        class="loan-header-toggle"
        :aria-label="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'"
        @click="toggleTheme"
      >
        <Moon v-if="theme === 'dark'" class="h-4 w-4" aria-hidden="true" />
        <Sun v-else class="h-4 w-4" aria-hidden="true" />
      </button>
    </template>
  </ShGlobalHeader>
</template>
