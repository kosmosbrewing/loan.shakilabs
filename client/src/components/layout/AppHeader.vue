<script setup lang="ts">
// v3 §3.2 — 전역 검정 헤더는 패키지(ShGlobalHeader)가 소유한다.
// 앱은 링크와 유틸 슬롯(테마 토글)만 채우고 자체 헤더 마크업을 갖지 않는다.
// 카테고리 색(구 bg-primary/[8%] 틴트)은 헤더에 들어가지 않는다(§4.3).
// 헤더 중앙에 있던 팁 티커는 본문 eyebrow로 내려갔다(BL-005) — AppLayout 참조.
import { onMounted, ref } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { ShGlobalHeader, type GlobalHeaderLink } from "@shakilabs/ui";

const THEME_STORAGE_KEY = "loan-tools:theme:v1";
type ThemeMode = "light" | "dark";

// 블로그는 root 앱(shakilabs.com/blog) 소유라 앱 라우터 밖이다 → href로 준다.
const links: GlobalHeaderLink[] = [{ href: "/blog", label: "블로그" }];

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
    home-href="/"
    brand="ShakiLabs"
    logo-src="/loan/favicon.png"
    :links="links"
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
