<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ArrowRightLeft, Gauge, Scale, ReceiptText, GraduationCap, ArrowRight } from "lucide-vue-next";
import { ShSurface, ShText } from "@shakilabs/ui";
import { ActionCard } from "@/components/ui/action-card";
import RelatedServices from "@/components/common/RelatedServices.vue";
import SEOHead from "@/components/common/SEOHead.vue";
import { APP_NAME } from "@/composables/useSEO";

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
  {
    title: "중도상환수수료",
    desc: "연간 면제한도와 남은 부과기간을 반영해 실제 수수료를 추정합니다.",
    to: "/prepayment-fee",
    icon: ReceiptText,
  },
  {
    title: "학자금 대출 상환",
    desc: "취업후상환 기준소득을 넘겼을 때 예상 의무상환액을 계산합니다.",
    to: "/student-loan",
    icon: GraduationCap,
  },
] as const;
</script>

<template>
  <!-- 함대 제목 레시피(2026-10-03 개정): 홈은 `<앱 이름> | ShakiLabs` (useSEO.buildPageTitle 참고) -->
  <SEOHead
    :title="APP_NAME"
    description="대환대출 손익, DSR 한도 역산, 원리금균등 vs 원금균등 비교를 한 곳에서 계산하세요."
  />

  <div class="sh-container sh-container--page space-y-5 py-5">
    <!-- v8c: 허브 제목은 display 토큰(28px) — 도구 화면 머리(CalculatorPageHeader, 20px)와 구분 -->
    <ShText as="h1" variant="display" class="break-keep">대출 계산기</ShText>

    <ShSurface padding="none" class="overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <ShText as="h2" variant="heading">대출 의사결정에 필요한 계산</ShText>
      </div>
      <div class="retro-panel-content space-y-4">
        <!-- 허브 도입은 한 문장. 허브 FAQ 8문항·"종합 가이드" 5절은 2026-11 UI 감사에서 뺐다(GA4 28일 허브 조회 4). -->
        <p class="text-body leading-relaxed text-muted-foreground">
          대환 손익·DSR 한도·상환방식 비교·중도상환수수료·학자금 상환 계산기 5개.
        </p>
        <div class="grid gap-3 md:grid-cols-5">
          <ActionCard
            v-for="tool in tools"
            :key="tool.to"
            as-child
          >
            <RouterLink :to="tool.to">
              <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/[12%] text-primary">
                <component :is="tool.icon" class="h-5 w-5" />
              </span>
              <p class="mt-3 text-heading font-bold text-foreground">{{ tool.title }}</p>
              <p class="mt-2 text-caption leading-relaxed text-muted-foreground">{{ tool.desc }}</p>
              <p class="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-primary">
                계산하기
                <ArrowRight class="h-3.5 w-3.5" />
              </p>
            </RouterLink>
          </ActionCard>
        </div>
      </div>
    </ShSurface>

    <RelatedServices />
  </div>
</template>
