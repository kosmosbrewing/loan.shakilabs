import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { LtvDtiInput } from "@/lib/validators";
import { DEFAULT_LTV_DTI_INPUT, sanitizeLtvDtiInput } from "@/lib/validators";
import { calcLtvDti } from "@/utils/ltvDtiCalc";
import { buildQuery, isSameQuery, parseQueryFloat, parseQueryInt } from "@/lib/routeState";

export function useLtvDti(initialOverride?: Partial<LtvDtiInput>) {
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
    result: computed(() => calcLtvDti(state)),
    reset: () => Object.assign(state, DEFAULT_LTV_DTI_INPUT),
    applyPreset: (input: LtvDtiInput) => Object.assign(state, sanitizeLtvDtiInput(input)),
  };
}

function fromQuery(query: Record<string, unknown>, override?: Partial<LtvDtiInput>): LtvDtiInput {
  return sanitizeLtvDtiInput({
    propertyPrice: parseQueryInt(query.p) ?? override?.propertyPrice ?? undefined,
    annualIncome: parseQueryInt(query.i) ?? override?.annualIncome ?? undefined,
    existingDebtPayment: parseQueryInt(query.e) ?? override?.existingDebtPayment ?? undefined,
    loanRate: parseQueryFloat(query.r) ?? override?.loanRate ?? undefined,
    termMonths: parseQueryInt(query.t) ?? override?.termMonths ?? undefined,
    region: (query.rg as LtvDtiInput["region"]) ?? override?.region ?? undefined,
    borrowerCategory: (query.bc as LtvDtiInput["borrowerCategory"]) ?? override?.borrowerCategory ?? undefined,
  });
}

function toQuery(input: LtvDtiInput): Record<string, string> {
  return buildQuery({
    p: input.propertyPrice,
    i: input.annualIncome,
    e: input.existingDebtPayment,
    r: input.loanRate,
    t: input.termMonths,
    rg: input.region,
    bc: input.borrowerCategory,
  });
}
