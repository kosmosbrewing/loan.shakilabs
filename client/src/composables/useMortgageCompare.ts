import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { MortgageCompareInput } from "@/lib/validators";
import { DEFAULT_MORTGAGE_COMPARE_INPUT, sanitizeMortgageCompareInput } from "@/lib/validators";
import { compareMortgageRates } from "@/utils/calculator";
import { buildQuery, isSameQuery, parseQueryInt } from "@/lib/routeState";
import type { RepaymentMethod } from "@/lib/validators";

export function useMortgageCompare(initialOverride?: Partial<MortgageCompareInput>) {
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
    result: computed(() => compareMortgageRates(state)),
    reset: () => Object.assign(state, DEFAULT_MORTGAGE_COMPARE_INPUT),
    applyPreset: (input: MortgageCompareInput) => Object.assign(state, sanitizeMortgageCompareInput(input)),
  };
}

function fromQuery(query: Record<string, unknown>, override?: Partial<MortgageCompareInput>): MortgageCompareInput {
  return sanitizeMortgageCompareInput({
    loanAmount: parseQueryInt(query.a) ?? override?.loanAmount ?? undefined,
    termMonths: parseQueryInt(query.t) ?? override?.termMonths ?? undefined,
    repaymentMethod: (query.m as RepaymentMethod | undefined) ?? override?.repaymentMethod ?? undefined,
  });
}

function toQuery(input: MortgageCompareInput): Record<string, string> {
  return buildQuery({
    a: input.loanAmount,
    t: input.termMonths,
    m: input.repaymentMethod,
  });
}
