<script setup lang="ts">
import { ShSurface } from "@shakilabs/ui";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import LoanTabNavigation from "@/components/loan/LoanTabNavigation.vue";
import TickerBar from "@/components/common/TickerBar.vue";
import { tickerMessages } from "@/data/tickerMessages";
</script>

<template>
  <!-- v3 §3.1 골격: [SkipLink][GlobalHeader][SecondaryNav][Main][Footer].
       SkipLink는 ShGlobalHeader가 함께 렌더하므로 앱이 따로 두지 않는다. -->
  <ShSurface
    as="div"
    variant="plain"
    padding="none"
    class="design-system-shell min-h-screen flex flex-col bg-background"
  >
    <AppHeader />
    <LoanTabNavigation />
    <main id="main-content" tabindex="-1" class="flex-1 relative">
      <!-- BL-005 — 헤더 중앙에 있던 팁 티커. 헤더 내용은 로고+링크+테마 토글뿐이어야 하므로
           본문 최상단 eyebrow 밴드로 내렸다. sticky가 아니라 chrome 높이에 더해지지 않는다. -->
      <div class="loan-ticker-band">
        <div class="container">
          <TickerBar :messages="tickerMessages" />
        </div>
      </div>
      <slot />
    </main>
    <AppFooter />
  </ShSurface>
</template>
