<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useConstantsStore } from "@/stores/constants";

const year = new Date().getFullYear();
const constantsStore = useConstantsStore();
</script>

<template>
  <footer class="mt-8 border-t border-border/60 bg-muted/20">
    <div class="container py-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p class="text-caption font-bold text-foreground">shakilabs.com/loan</p>
        <nav aria-label="푸터 링크" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-tiny">
          <RouterLink to="/about" class="text-muted-foreground hover:text-foreground transition-colors">
            사이트 안내
          </RouterLink>
          <RouterLink to="/terms" class="text-muted-foreground hover:text-foreground transition-colors">
            이용약관
          </RouterLink>
          <RouterLink to="/privacy" class="text-muted-foreground hover:text-foreground transition-colors">
            개인정보 처리방침
          </RouterLink>
          <a
            :href="`mailto:${constantsStore.supportEmail}`"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            문의
          </a>
        </nav>
      </div>

      <div class="mt-3 border-t border-border/40 pt-3 space-y-1">
        <p class="text-tiny text-muted-foreground">
          계산식 기준일: {{ constantsStore.feeDataUpdated }} | 본 계산 결과는 참고용이며, 실제 금융사 심사·중도상환수수료 정책과 차이가 있을 수 있습니다.
        </p>
        <p class="text-tiny text-muted-foreground">
          Copyright &copy; {{ year }} shakilabs.com
        </p>
      </div>
    </div>
  </footer>
</template>
