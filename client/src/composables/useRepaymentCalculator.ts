import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { RepaymentInput } from "@/lib/validators";
import { DEFAULT_REPAYMENT_INPUT, sanitizeRepaymentInput } from "@/lib/validators";
import { compareRepaymentPlans } from "@/utils/calculator";
import { buildQuery, isSameQuery, parseQueryFloat, parseQueryInt } from "@/lib/routeState";

export function useRepaymentCalculator() {
  const route = useRoute();
  const router = useRouter();
  const state = reactive(fromQuery(route.query));
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
    result: computed(() => compareRepaymentPlans(state)),
    reset: () => Object.assign(state, DEFAULT_REPAYMENT_INPUT),
    applyPreset: (input: RepaymentInput) => Object.assign(state, sanitizeRepaymentInput(input)),
  };
}

function fromQuery(query: Record<string, unknown>): RepaymentInput {
  return sanitizeRepaymentInput({
    principal: parseQueryInt(query.p) ?? undefined,
    annualRate: parseQueryFloat(query.r) ?? undefined,
    termMonths: parseQueryInt(query.t) ?? undefined,
  });
}

function toQuery(input: RepaymentInput): Record<string, string> {
  return buildQuery({
    p: input.principal,
    r: input.annualRate,
    t: input.termMonths,
  });
}
