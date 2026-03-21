import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { SteppingStoneLoanInput } from "@/lib/validators";
import { DEFAULT_STEPPING_STONE_INPUT, sanitizeSteppingStoneLoanInput } from "@/lib/validators";
import { calcSteppingStoneLoan } from "@/utils/steppingStoneLoanCalc";
import { buildQuery, isSameQuery, parseQueryBoolean, parseQueryInt } from "@/lib/routeState";

export function useSteppingStoneLoan(initialOverride?: Partial<SteppingStoneLoanInput>) {
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
    result: computed(() => calcSteppingStoneLoan(state)),
    reset: () => Object.assign(state, DEFAULT_STEPPING_STONE_INPUT),
    applyPreset: (input: SteppingStoneLoanInput) => Object.assign(state, sanitizeSteppingStoneLoanInput(input)),
  };
}

function fromQuery(query: Record<string, unknown>, override?: Partial<SteppingStoneLoanInput>): SteppingStoneLoanInput {
  return sanitizeSteppingStoneLoanInput({
    householdIncome: parseQueryInt(query.i) ?? override?.householdIncome ?? undefined,
    propertyPrice: parseQueryInt(query.p) ?? override?.propertyPrice ?? undefined,
    borrowerType: (query.bt as SteppingStoneLoanInput["borrowerType"]) ?? override?.borrowerType ?? undefined,
    termYears: parseQueryInt(query.t) ?? override?.termYears ?? undefined,
    isMetro: parseQueryBoolean(query.m, override?.isMetro ?? DEFAULT_STEPPING_STONE_INPUT.isMetro),
  });
}

function toQuery(input: SteppingStoneLoanInput): Record<string, string> {
  return buildQuery({
    i: input.householdIncome,
    p: input.propertyPrice,
    bt: input.borrowerType,
    t: input.termYears,
    m: input.isMetro,
  });
}
