import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";

const DRAFT_TTL_MS = 8 * 60 * 60 * 1000;
const draftSchema = z.object({
  path: z.string().min(1).max(2_000).startsWith("/"),
  savedAt: z.number().int().nonnegative(),
});

export type RouteSessionDraft = z.infer<typeof draftSchema>;

export function parseRouteSessionDraft(
  raw: string | null,
  expectedPath: string,
  now = Date.now(),
): RouteSessionDraft | null {
  if (!raw) return null;

  try {
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    if (parsed.data.savedAt < now - DRAFT_TTL_MS) return null;
    if (parsed.data.savedAt > now + 60_000) return null;
    if (parsed.data.path.split(/[?#]/, 1)[0] !== expectedPath) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function ageBucket(savedAt: number): string {
  const age = Date.now() - savedAt;
  if (age < 15 * 60 * 1000) return "under_15m";
  if (age < 60 * 60 * 1000) return "under_1h";
  return "under_8h";
}

export function useRouteSessionDraft(options: {
  storageKey: string;
  routePath: string;
  appId: string;
  toolId: string;
}) {
  const route = useRoute();
  const router = useRouter();
  const initialHadQuery = Object.keys(route.query).length > 0;
  const draft = ref<RouteSessionDraft | null>(null);
  const loaded = ref(false);
  const tracking = ref(false);

  function removeStoredDraft(): void {
    try {
      sessionStorage.removeItem(options.storageKey);
    } catch {
      // 브라우저 저장소 사용 불가 시 메모리 상태만 갱신
    }
  }

  function save(path: string): void {
    const next = { path: path.split("#", 1)[0], savedAt: Date.now() };
    const parsed = draftSchema.safeParse(next);
    if (!parsed.success || parsed.data.path.split("?", 1)[0] !== options.routePath) return;
    draft.value = parsed.data;
    try {
      sessionStorage.setItem(options.storageKey, JSON.stringify(parsed.data));
    } catch {
      tracking.value = false;
    }
  }

  onMounted(() => {
    try {
      draft.value = parseRouteSessionDraft(
        sessionStorage.getItem(options.storageKey),
        options.routePath,
      );
    } catch {
      draft.value = null;
    }
    tracking.value = Boolean(draft.value && initialHadQuery);
    if (!draft.value) removeStoredDraft();
    loaded.value = true;
  });

  watch(
    () => route.fullPath,
    (path) => {
      if (loaded.value && tracking.value) save(path);
    },
    { flush: "post" },
  );

  function enable(): void {
    tracking.value = true;
    save(route.fullPath);
  }

  async function restore(): Promise<void> {
    if (!draft.value) return;
    const savedAt = draft.value.savedAt;
    tracking.value = true;
    trackEvent("recent_result_open", {
      app_id: options.appId,
      tool_id: options.toolId,
      age_bucket: ageBucket(savedAt),
    });
    await router.replace(draft.value.path);
  }

  function clear(): void {
    tracking.value = false;
    draft.value = null;
    removeStoredDraft();
  }

  return {
    loaded,
    tracking,
    hasRestorableDraft: computed(() => Boolean(draft.value && !tracking.value)),
    enable,
    restore,
    clear,
  };
}
