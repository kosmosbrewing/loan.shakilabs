import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { DsrInput } from "@/lib/validators";
import { DEFAULT_DSR_INPUT, sanitizeDsrInput } from "@/lib/validators";
import { calcDsrLimit } from "@/utils/calculator";
import { buildQuery, isSameQuery, parseQueryFloat, parseQueryInt } from "@/lib/routeState";

export function useDsrCalculator(initialOverride?: Partial<DsrInput>) {
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
    result: computed(() => calcDsrLimit(state)),
    reset: () => Object.assign(state, DEFAULT_DSR_INPUT),
    applyPreset: (input: DsrInput) => Object.assign(state, sanitizeDsrInput(input)),
  };
}

function fromQuery(query: Record<string, unknown>, override?: Partial<DsrInput>): DsrInput {
  return sanitizeDsrInput({
    annualIncome: parseQueryInt(query.i) ?? override?.annualIncome ?? undefined,
    existingAnnualDebtService: parseQueryInt(query.e) ?? override?.existingAnnualDebtService ?? undefined,
    dsrLimit: parseQueryFloat(query.l) ?? override?.dsrLimit ?? undefined,
    newLoanRate: parseQueryFloat(query.r) ?? override?.newLoanRate ?? undefined,
    termMonths: parseQueryInt(query.t) ?? override?.termMonths ?? undefined,
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
