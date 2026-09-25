<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";

defineProps<{
  items: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
}>();
</script>

<template>
  <!-- 1×2 결과 칸(lg 이상은 반폭)에 얹히므로 lg부터는 1열로 되돌린다 — 3개 카드가 xl:4열이면
       나머지 1개가 홀로 남고, 반폭(~540px)에서는 좁아 보인다 -->
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
    <Card
      v-for="item in items"
      :key="item.label"
      class="border-border/50 bg-muted/30"
    >
      <CardContent class="loan-metric-card p-4">
        <p class="text-tiny font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {{ item.label }}
        </p>
        <p class="mt-2 text-heading font-bold text-foreground tabular-nums">{{ item.value }}</p>
        <p v-if="item.helper" class="mt-1 [text-wrap-style:balance] text-caption text-muted-foreground">{{ item.helper }}</p>
      </CardContent>
    </Card>
  </div>
</template>
