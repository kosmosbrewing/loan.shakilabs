import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { DsrInput } from "@/lib/validators";
import { DEFAULT_DSR_INPUT, sanitizeDsrInput } from "@/lib/validators";
import { calcDsrLimit } from "@/utils/calculator";
import { buildQuery, isSameQuery, parseQueryFloat, parseQueryInt } from "@/lib/routeState";

export function useDsrCalculator() {
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
    result: computed(() => calcDsrLimit(state)),
    reset: () => Object.assign(state, DEFAULT_DSR_INPUT),
    applyPreset: (input: DsrInput) => Object.assign(state, sanitizeDsrInput(input)),
  };
}

function fromQuery(query: Record<string, unknown>): DsrInput {
  return sanitizeDsrInput({
    annualIncome: parseQueryInt(query.i) ?? undefined,
    existingAnnualDebtService: parseQueryInt(query.e) ?? undefined,
    dsrLimit: parseQueryFloat(query.l) ?? undefined,
    newLoanRate: parseQueryFloat(query.r) ?? undefined,
    termMonths: parseQueryInt(query.t) ?? undefined,
  });
}

function toQuery(input: DsrInput): Record<string, string> {
  return buildQuery({
    i: input.annualIncome,
    e: input.existingAnnualDebtService,
    l: input.dsrLimit,
    r: input.newLoanRate,
    t: input.termMonths,
  });
}
