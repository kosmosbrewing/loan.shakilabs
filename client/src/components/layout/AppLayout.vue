<script setup lang="ts">
import { ShSurface } from "@shakilabs/ui";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import LoanTabNavigation from "@/components/loan/LoanTabNavigation.vue";
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
      <slot />
    </main>
    <AppFooter />
  </ShSurface>
</template>
