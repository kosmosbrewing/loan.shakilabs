import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { JeonseLoanInput } from "@/lib/validators";
import { DEFAULT_JEONSE_LOAN_INPUT, sanitizeJeonseLoanInput } from "@/lib/validators";
import { calcJeonseLoan } from "@/utils/loanExtraCalculator";
import { buildQuery, isSameQuery, parseQueryBoolean, parseQueryFloat, parseQueryInt } from "@/lib/routeState";

export function useJeonseLoan(initialOverride?: Partial<JeonseLoanInput>) {
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
    result: computed(() => calcJeonseLoan(state)),
    reset: () => Object.assign(state, DEFAULT_JEONSE_LOAN_INPUT),
    applyPreset: (input: JeonseLoanInput) => Object.assign(state, sanitizeJeonseLoanInput(input)),
  };
}

function fromQuery(query: Record<string, unknown>, override?: Partial<JeonseLoanInput>): JeonseLoanInput {
  return sanitizeJeonseLoanInput({
    depositAmount: parseQueryInt(query.d) ?? override?.depositAmount ?? undefined,
    annualRate: parseQueryFloat(query.r) ?? override?.annualRate ?? undefined,
    termMonths: parseQueryInt(query.t) ?? override?.termMonths ?? undefined,
    isInterestOnly: parseQueryBoolean(query.io, override?.isInterestOnly ?? DEFAULT_JEONSE_LOAN_INPUT.isInterestOnly),
  });
}

function toQuery(input: JeonseLoanInput): Record<string, string> {
  return buildQuery({
    d: input.depositAmount,
    r: input.annualRate,
    t: input.termMonths,
    io: input.isInterestOnly,
  });
}
