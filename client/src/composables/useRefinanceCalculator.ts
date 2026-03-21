import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { RefinanceInput } from "@/lib/validators";
import { DEFAULT_REFINANCE_INPUT, sanitizeRefinanceInput } from "@/lib/validators";
import { calcRefinance } from "@/utils/calculator";
import { buildQuery, isSameQuery, parseQueryFloat, parseQueryInt } from "@/lib/routeState";

export function useRefinanceCalculator(initialOverride?: Partial<RefinanceInput>) {
  const route = useRoute();
  const router = useRouter();
  const state = reactive(fromQuery(route.query, initialOverride));
  let syncingFromRoute = false;

  watch(
    () => route.query,
    (query) => {
      const next = fromQuery(query);
      if (isSameQuery(toQuery(state), toQuery(next))) return;
      syncingFromRoute = true;
      Object.assign(state, next);
      syncingFromRoute = false;
    },
  );

  watch(
    state,
    () => {
      if (typeof window === "undefined" || syncingFromRoute) return;
      const nextQuery = toQuery(state);
      if (isSameQuery(route.query, nextQuery)) return;
      void router.replace({ query: nextQuery });
    },
    { deep: true },
  );

  return {
    state,
    result: computed(() => calcRefinance(state)),
    reset: () => Object.assign(state, DEFAULT_REFINANCE_INPUT),
    applyPreset: (input: RefinanceInput) => Object.assign(state, sanitizeRefinanceInput(input)),
  };
}

function fromQuery(query: Record<string, unknown>, override?: Partial<RefinanceInput>): RefinanceInput {
  return sanitizeRefinanceInput({
    balance: parseQueryInt(query.b) ?? override?.balance ?? undefined,
    currentRate: parseQueryFloat(query.cr) ?? override?.currentRate ?? undefined,
    newRate: parseQueryFloat(query.nr) ?? override?.newRate ?? undefined,
    remainingMonths: parseQueryInt(query.rm) ?? override?.remainingMonths ?? undefined,
    newTermMonths: parseQueryInt(query.nt) ?? override?.newTermMonths ?? undefined,
    refinanceFee: parseQueryInt(query.f) ?? override?.refinanceFee ?? undefined,
  });
}

function toQuery(input: RefinanceInput): Record<string, string> {
  return buildQuery({
    b: input.balance,
    cr: input.currentRate,
    nr: input.newRate,
    rm: input.remainingMonths,
    nt: input.newTermMonths,
    f: input.refinanceFee,
  });
}
