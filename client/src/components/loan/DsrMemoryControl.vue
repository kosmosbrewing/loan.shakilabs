<script setup lang="ts">
// BL-021 — 고아 텍스트 링크(`이 탭에 입력 기억하기` <button> + underline)를
// 패키지 ShMemoryControl(role=switch + aria-checked)로 교체한다.
// 저장소·TTL·키 규약은 패키지가 소유한다: sessionStorage, 8시간, shaki:draft:loan:dsr:v1.
// 앱은 "무엇을 저장/복원할지"(= DSR 입력이 실린 쿼리 경로)만 정한다.
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import { ShMemoryControl } from "@shakilabs/ui";
import { trackEvent } from "@/lib/analytics";

// 0.3.15 이전 키. 규약(shaki:draft:<category>:<tool>:v1) 밖이라 새 컨트롤은 읽지 않는다.
const LEGACY_STORAGE_KEY = "loan:dsr-session-draft:v1";
const ROUTE_PATH = "/dsr";

const payloadSchema = z.object({
  path: z.string().min(1).max(2_000).startsWith("/"),
  savedAt: z.number().int().nonnegative(),
});

type MemoryControlExposed = {
  save: (payload: unknown) => void;
  clear: () => void;
};

const control = ref<MemoryControlExposed | null>(null);
const route = useRoute();
const router = useRouter();
const tracking = ref(false);

function currentPath(): string {
  return route.fullPath.split("#", 1)[0];
}

function saveCurrent(): void {
  control.value?.save({ path: currentPath(), savedAt: Date.now() });
}

function ageBucket(savedAt: number): string {
  const age = Date.now() - savedAt;
  if (age < 15 * 60 * 1000) return "under_15m";
  if (age < 60 * 60 * 1000) return "under_1h";
  return "under_8h";
}

function handleEnable(): void {
  tracking.value = true;
  saveCurrent();
}

function handleDisable(): void {
  tracking.value = false;
}

async function handleRestore(payload: unknown): Promise<void> {
  tracking.value = true;
  const parsed = payloadSchema.safeParse(payload);
  // 스키마 밖이거나 다른 도구의 경로면 복원하지 않고 버린다
  if (!parsed.success || parsed.data.path.split("?", 1)[0] !== ROUTE_PATH) {
    control.value?.clear();
    tracking.value = false;
    return;
  }
  // 사용자가 방금 링크·변종 URL로 들어온 입력을 저장본이 덮어쓰지 않게 한다
  if (Object.keys(route.query).length > 0) return;
  trackEvent("recent_result_open", {
    app_id: "loan",
    tool_id: "dsr",
    age_bucket: ageBucket(parsed.data.savedAt),
  });
  await router.replace(parsed.data.path);
}

onMounted(() => {
  try {
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // 저장소 차단 브라우저 — 지울 것도 없다
  }
});

// 켜져 있는 동안 입력(=쿼리)이 바뀔 때마다 최신 경로로 갱신한다
watch(
  () => route.fullPath,
  () => {
    if (tracking.value) saveCurrent();
  },
  { flush: "post" },
);
</script>

<template>
  <ShMemoryControl
    ref="control"
    category="loan"
    tool="dsr"
    @enable="handleEnable"
    @disable="handleDisable"
    @restore="handleRestore"
  />
</template>
