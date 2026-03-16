<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ArrowRightLeft, Gauge, Scale } from "lucide-vue-next";
import SEOHead from "@/components/common/SEOHead.vue";

const tools = [
  {
    title: "대환대출 갈아타기",
    desc: "현재 대출과 새 대출의 월 납입액, 총이자, 비용 회수 시점을 비교합니다.",
    to: "/refinance",
    icon: ArrowRightLeft,
  },
  {
    title: "DSR 계산기",
    desc: "연소득과 기존 원리금을 넣으면 추가 대출 가능 한도를 역산합니다.",
    to: "/dsr",
    icon: Gauge,
  },
  {
    title: "상환방식 비교",
    desc: "원리금균등과 원금균등의 총이자와 첫 달 부담 차이를 확인합니다.",
    to: "/repayment",
    icon: Scale,
  },
] as const;
</script>

<template>
  <SEOHead
    title="대출 계산기 | 갈아타기·DSR·상환방식 비교"
    description="대환대출 손익, DSR 한도 역산, 원리금균등 vs 원금균등 비교를 한 곳에서 계산하세요."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">대출 의사결정에 필요한 계산을 한 번에</h1>
      </div>
      <div class="retro-panel-content space-y-4">
        <p class="text-body leading-relaxed text-muted-foreground">
          대출 갈아타기, DSR, 상환방식 비교처럼 실제로 자주 묻는 질문을 모바일에서도 바로 확인할 수 있게 구성했습니다.
        </p>
        <div class="grid gap-3 md:grid-cols-3">
          <RouterLink
            v-for="tool in tools"
            :key="tool.to"
            :to="tool.to"
            class="retro-panel-muted p-4 transition-colors hover:border-primary/50"
          >
            <component :is="tool.icon" class="h-5 w-5 text-primary" />
            <p class="mt-3 text-heading font-bold text-foreground">{{ tool.title }}</p>
            <p class="mt-2 text-caption leading-relaxed text-muted-foreground">{{ tool.desc }}</p>
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="retro-panel">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">바로 시작하기</h2>
      </div>
      <div class="retro-panel-content grid gap-3 sm:grid-cols-3">
        <RouterLink class="retro-panel-muted p-4 text-center font-semibold text-foreground hover:border-primary/50" to="/refinance">
          갈아타기 계산
        </RouterLink>
        <RouterLink class="retro-panel-muted p-4 text-center font-semibold text-foreground hover:border-primary/50" to="/dsr">
          DSR 계산
        </RouterLink>
        <RouterLink class="retro-panel-muted p-4 text-center font-semibold text-foreground hover:border-primary/50" to="/repayment">
          상환방식 비교
        </RouterLink>
      </div>
    </div>
  </div>
</template>
