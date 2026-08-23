<script setup lang="ts">
import { computed, ref } from "vue";
import { ShPresetGroup } from "@shakilabs/ui";
import CompareSourceFooter from "@/components/common/CompareSourceFooter.vue";
import {
  DEBT_TIER_OPTIONS,
  DISCOUNT_OPTIONS,
  JEONSE_GUARANTEE_SOURCES,
  JEONSE_GUARANTEE_UPDATED,
  type GuaranteeDebtTier,
  type GuaranteeHousingType,
} from "@/data/jeonseGuarantee";
import { calcJeonseGuaranteeFee } from "@/utils/jeonseGuaranteeCalculator";
import { formatNumber, formatWon, parseNumericInput } from "@/lib/utils";

const deposit = ref(300_000_000);
const months = ref(24);
const housingType = ref<GuaranteeHousingType>("apartment");
const debtTier = ref<GuaranteeDebtTier>("le70");
const discountRate = ref(0);
const region = ref<"metro" | "other">("metro");

const depositPresets = [100_000_000, 200_000_000, 300_000_000, 500_000_000].map((value) => ({
  label: `${formatNumber(value / 100_000_000)}억`,
  value,
}));
const monthPresets = [12, 24, 36].map((value) => ({ label: `${value}개월`, value }));
const housingOptions = [
  { label: "아파트", value: "apartment" },
  { label: "그 외 (빌라·오피스텔 등)", value: "other" },
];
const regionOptions = [
  { label: "수도권 (한도 7억)", value: "metro" },
  { label: "그 외 지역 (한도 5억)", value: "other" },
];
const discountOptions = DISCOUNT_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }));

const result = computed(() =>
  calcJeonseGuaranteeFee({
    deposit: deposit.value,
    months: months.value,
    housingType: housingType.value,
    debtTier: debtTier.value,
    discountRate: discountRate.value,
    isMetropolitan: region.value === "metro",
  }),
);
</script>

<template>
  <div class="space-y-4">
    <section class="retro-panel-muted space-y-4 p-4">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <label for="guarantee-deposit" class="text-caption font-semibold text-foreground">전세 보증금</label>
          <span class="retro-kbd">현재 {{ formatNumber(deposit) }}원</span>
        </div>
        <input
          id="guarantee-deposit"
          type="text"
          inputmode="numeric"
          class="retro-input w-full"
          :value="deposit.toLocaleString('ko-KR')"
          @input="deposit = parseNumericInput(($event.target as HTMLInputElement).value)"
        />
        <ShPresetGroup v-model="deposit" :options="depositPresets" label="보증금 빠른 선택" />
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="space-y-1.5">
          <label for="guarantee-months" class="text-caption font-semibold text-foreground">보증기간 (개월)</label>
          <input
            id="guarantee-months"
            v-model.number="months"
            type="number"
            min="1"
            max="120"
            class="retro-input w-full"
          />
          <ShPresetGroup v-model="months" :options="monthPresets" label="보증기간 빠른 선택" />
        </div>
        <div class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">주택유형</span>
          <ShPresetGroup v-model="housingType" :options="housingOptions" label="주택유형 선택" />
        </div>
      </div>

      <div class="space-y-1.5">
        <span class="text-caption font-semibold text-foreground">부채비율 — (선순위 채권+보증금) ÷ 주택가격</span>
        <ShPresetGroup v-model="debtTier" :options="DEBT_TIER_OPTIONS" label="부채비율 구간 선택" />
        <p class="text-caption leading-relaxed text-muted-foreground">
          근저당이 없는 집이면 전세가율과 같습니다. 낮은 구간일수록 요율이 내려갑니다.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">보증료 할인</span>
          <ShPresetGroup v-model="discountRate" :options="discountOptions" label="할인 대상 선택" />
        </div>
        <div class="space-y-1.5">
          <span class="text-caption font-semibold text-foreground">지역</span>
          <ShPresetGroup v-model="region" :options="regionOptions" label="지역 선택" />
        </div>
      </div>
    </section>

    <p
      v-if="result.isOverLimit"
      role="alert"
      class="retro-panel-muted p-3 text-caption font-semibold text-status-danger"
    >
      보증금이 {{ formatWon(result.limit) }} 한도를 초과해 HUG 보증 가입이 불가능합니다. SGI 등 다른 기관을 검토하세요.
    </p>

    <section class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h2 class="retro-title">보증료 계산 결과</h2>
      </div>
      <div class="retro-panel-content space-y-3">
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="retro-panel-muted px-4 py-3">
            <p class="text-tiny text-muted-foreground">적용 연 요율 ({{ result.periodLabel }})</p>
            <p class="mt-1 text-heading font-bold text-foreground">{{ result.annualRate.toFixed(3) }}%</p>
          </div>
          <div class="retro-panel-muted px-4 py-3">
            <p class="text-tiny text-muted-foreground">총 보증료 (할인 전)</p>
            <p class="mt-1 text-heading font-bold text-foreground">{{ formatWon(result.totalFee) }}</p>
          </div>
          <div class="retro-panel-muted px-4 py-3">
            <p class="text-tiny text-muted-foreground">할인 적용 후</p>
            <p class="mt-1 text-heading font-bold text-primary">{{ formatWon(result.discountedFee) }}</p>
          </div>
          <div class="retro-panel-muted px-4 py-3">
            <p class="text-tiny text-muted-foreground">월 환산 부담</p>
            <p class="mt-1 text-heading font-bold text-foreground">{{ formatWon(result.monthlyEquivalent) }}</p>
          </div>
        </div>
        <p class="text-caption leading-relaxed text-muted-foreground">
          계산식: 보증금 × 연 요율 × (보증기간 ÷ 12개월). 공식 산식은 일수(÷365) 기준이라 소액 차이가 날 수 있습니다.
          가입 가능 여부는 담보인정비율(주택가격의 90%)과 대항요건 심사에 따라 달라집니다 —
          계약 전이라면 <a href="/house/jeonse-risk" class="font-semibold text-primary underline">깡통전세 위험 진단</a>으로
          가입 가능 보증금 상한부터 확인해 보세요.
        </p>
      </div>
    </section>

    <CompareSourceFooter :sources="[...JEONSE_GUARANTEE_SOURCES]" :updated-at="JEONSE_GUARANTEE_UPDATED" />
  </div>
</template>
