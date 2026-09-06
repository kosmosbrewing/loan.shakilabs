import { describe, expect, it } from "vitest";

import { BANK_MORTGAGE_RATES } from "../mortgageRates";
import { LOAN_DATA_VERIFIED } from "../loanPresets";
import { LOAN_JEONSE_GUARANTEE_GUIDE } from "../jeonseGuarantee";
import {
  LOAN_DSR_GUIDE,
  LOAN_HOME_GUIDE,
  LOAN_JEONSE_GUARANTEE_PAGE_GUIDE,
  LOAN_JEONSE_GUIDE,
  LOAN_LTV_GUIDE,
  LOAN_MORTGAGE_GUIDE,
  LOAN_PREPAYMENT_GUIDE,
  LOAN_REFINANCE_GUIDE,
  LOAN_REPAYMENT_GUIDE,
  LOAN_STEPPING_STONE_GUIDE,
  LOAN_STUDENT_LOAN_GUIDE,
  type GuideData,
} from "../seoGuides";
import {
  DEFAULT_DSR_INPUT,
  DEFAULT_JEONSE_LOAN_INPUT,
  DEFAULT_LTV_DTI_INPUT,
  DEFAULT_MORTGAGE_COMPARE_INPUT,
  DEFAULT_PREPAYMENT_FEE_INPUT,
  DEFAULT_REFINANCE_INPUT,
  DEFAULT_REPAYMENT_INPUT,
  DEFAULT_STEPPING_STONE_INPUT,
  DEFAULT_STUDENT_LOAN_INPUT,
} from "@/lib/validators";
import {
  calcAnnuityPlan,
  calcDsrLimit,
  calcEqualPrincipalPlan,
  calcMonthlyPayment,
  calcRefinance,
  compareMortgageRates,
} from "@/utils/calculator";
import { calcJeonseLoan, calcPrepaymentFee, calcStudentLoanRepayment } from "@/utils/loanExtraCalculator";
import { calcJeonseGuaranteeFee } from "@/utils/jeonseGuaranteeCalculator";
import { calcLtvDti } from "@/utils/ltvDtiCalc";
import { calcSteppingStoneLoan } from "@/utils/steppingStoneLoanCalc";
import { type Finding, manwon, pct, pp, rate, won } from "./format";
import {
  DSR_DIGEST,
  JEONSE_GUARANTEE_DIGEST,
  JEONSE_LOAN_DIGEST,
  LTV_DTI_DIGEST,
  MORTGAGE_COMPARE_DIGEST,
  PREPAYMENT_DIGEST,
  REFINANCE_DIGEST,
  REPAYMENT_DIGEST,
  STEPPING_STONE_DIGEST,
  STUDENT_LOAN_DIGEST,
} from "./index";
import { GUARANTEE_BASE } from "./jeonseGuaranteeDigest";
import { ASSUMED_OFFERS } from "./mortgageCompareDigest";
import { annuityBalanceAfter, crossoverMonth, equivalentRateForTerm } from "./repaymentDigest";
import { yearsToClear } from "./studentLoanDigest";

// 규율: 페이지당 엔진 파생 발견 8개 이상. 법령·공시 수치를 한 줄 인용한 문장은 발견이 아니므로,
// 발견마다 합산·경계·차액 같은 파생 수치가 여럿 들어 있어야 한다(숫자 토큰 4개 이상).
const MIN_FINDINGS = 8;
const MIN_NUMBER_TOKENS = 4;
// scaled content abuse 방지: 새 산문 전 쌍 유사도 0.5 미만, 기존 본문과는 0.85 미만
const MAX_PAIR_SIMILARITY = 0.5;
const MAX_LEGACY_SIMILARITY = 0.85;

const DIGESTS: Record<string, Finding[]> = {
  repayment: REPAYMENT_DIGEST,
  dsr: DSR_DIGEST,
  refinance: REFINANCE_DIGEST,
  "prepayment-fee": PREPAYMENT_DIGEST,
  "jeonse-guarantee-fee": JEONSE_GUARANTEE_DIGEST,
  "student-loan": STUDENT_LOAN_DIGEST,
  "mortgage-compare": MORTGAGE_COMPARE_DIGEST,
  "jeonse-loan": JEONSE_LOAN_DIGEST,
  "stepping-stone-loan": STEPPING_STONE_DIGEST,
  "ltv-dti": LTV_DTI_DIGEST,
};
const ALL = Object.entries(DIGESTS).flatMap(([page, items]) => items.map((f, i) => ({ id: `${page}#${i + 1}`, ...f })));

const compact = (text: string) => text.replace(/\s+/g, "");

function bigrams(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const t = compact(text);
  for (let i = 0; i < t.length - 1; i += 1) {
    const g = t.slice(i, i + 2);
    map.set(g, (map.get(g) ?? 0) + 1);
  }
  return map;
}

/** 문자 바이그램 Dice 계수 — 0(무관)~1(동일). 순서를 무시하므로 문장 재배열 복제도 잡는다. */
function similarity(a: string, b: string): number {
  const ga = bigrams(a);
  const gb = bigrams(b);
  let shared = 0;
  for (const [g, n] of ga) shared += Math.min(n, gb.get(g) ?? 0);
  const total = [...ga.values()].reduce((s, n) => s + n, 0) + [...gb.values()].reduce((s, n) => s + n, 0);
  return total === 0 ? 0 : (2 * shared) / total;
}

describe("파생 다이제스트 — 발견 밀도", () => {
  it("사이트맵의 계산기 10페이지를 전부 덮는다", () => {
    expect(Object.keys(DIGESTS)).toHaveLength(10);
  });

  it.each(Object.entries(DIGESTS))(`%s 페이지는 발견 ${MIN_FINDINGS}개 이상`, (_page, items) => {
    expect(items.length).toBeGreaterThanOrEqual(MIN_FINDINGS);
  });

  it("발견마다 파생 수치가 여럿 들어 있고 h2가 겹치지 않는다", () => {
    const seen = new Set<string>();
    for (const f of ALL) {
      const numbers = f.body.match(/\d[\d,.]*/g) ?? [];
      expect(numbers.length, f.id).toBeGreaterThanOrEqual(MIN_NUMBER_TOKENS);
      expect(f.body.length, f.id).toBeGreaterThan(200);
      expect(seen.has(f.h2), f.h2).toBe(false);
      seen.add(f.h2);
    }
  });

  // YMYL: 금리·기간 같은 파라미터는 사실이 아니라 가정이다. 문장 안에 "가정"이 드러나야 한다.
  it("발견마다 가정값임을 명시한다", () => {
    for (const f of ALL) expect(f.body, f.id).toContain("가정");
  });

  it("조사 오류가 없다", () => {
    for (const f of ALL) {
      expect(`${f.h2} ${f.body}`, f.id).not.toMatch(/원로 |원를 |원는 |원가 |원와 |원라 |%을 |%이 |%은 |%과 |%으로 |%p이 |%p을 |%p은 /);
      expect(f.body, f.id).not.toMatch(/NaN|Infinity|undefined/);
    }
  });
});

describe("파생 다이제스트 — 은행 금리표·갱신 약속 배제", () => {
  // mortgageRates.ts의 은행 금리표는 확인일이 계산식 기준일과 다르고 오래됐다. 특정 은행이 유리하다는 서술 금지.
  it("은행 이름을 한 번도 쓰지 않는다", () => {
    // "하나"·"우리"처럼 일반 명사와 겹치는 짧은 이름은 "○○은행" 꼴로만 잡는다
    const banks = BANK_MORTGAGE_RATES.flatMap((b) => (b.bank.length >= 3 ? [b.bank, `${b.bank}은행`] : [`${b.bank}은행`]));
    for (const f of ALL) for (const bank of banks) expect(`${f.h2} ${f.body}`, `${f.id} ${bank}`).not.toContain(bank);
  });

  it("갱신 주기를 약속하는 말이 없다", () => {
    const banned = /매월\s*\S*\s*(반영|갱신|업데이트)|주\s*1회|매주|정기적으로\s*(갱신|업데이트)|실시간/;
    for (const f of ALL) expect(f.body, f.id).not.toMatch(banned);
  });

  it("계산 기준 문단은 계산식 기준일만 적고 금리표 확인일은 적지 않는다", () => {
    const guides = [LOAN_DSR_GUIDE, LOAN_LTV_GUIDE, LOAN_REPAYMENT_GUIDE, LOAN_JEONSE_GUIDE, LOAN_MORTGAGE_GUIDE,
      LOAN_REFINANCE_GUIDE, LOAN_PREPAYMENT_GUIDE, LOAN_STUDENT_LOAN_GUIDE, LOAN_STEPPING_STONE_GUIDE, LOAN_JEONSE_GUARANTEE_PAGE_GUIDE];
    const bodies = new Set<string>();
    for (const g of guides) {
      const basis = g.sections!.find((s) => s.h2 === "위 발견의 계산 기준")!;
      expect(basis.body).toContain(LOAN_DATA_VERIFIED);
      expect(basis.body).not.toMatch(/2026-03/);
      bodies.add(basis.body);
    }
    // 페이지별 가정이 들어가 문단이 10개 모두 다르다
    expect(bodies.size).toBe(10);
  });
});

describe("파생 다이제스트 — 복제 방지", () => {
  it(`새 산문 전 쌍 유사도 ${MAX_PAIR_SIMILARITY} 미만`, () => {
    let max = 0;
    for (let i = 0; i < ALL.length; i += 1) {
      for (let j = i + 1; j < ALL.length; j += 1) {
        const s = similarity(ALL[i].body, ALL[j].body);
        max = Math.max(max, s);
        expect(s, `${ALL[i].id} vs ${ALL[j].id}`).toBeLessThan(MAX_PAIR_SIMILARITY);
      }
    }
    expect(max).toBeGreaterThan(0);
  });

  it(`기존 가이드 본문·FAQ와 유사도 ${MAX_LEGACY_SIMILARITY} 미만`, () => {
    const digestBodies = new Set(ALL.map((f) => f.body));
    const legacy = [LOAN_HOME_GUIDE, LOAN_DSR_GUIDE, LOAN_LTV_GUIDE, LOAN_REPAYMENT_GUIDE, LOAN_JEONSE_GUIDE, LOAN_MORTGAGE_GUIDE, LOAN_JEONSE_GUARANTEE_GUIDE]
      .flatMap((g) => [g.intro, ...(g.sections ?? []).map((s) => s.body), ...(g.faqs ?? []).map((q) => q.a)])
      .filter((body) => !digestBodies.has(body));
    for (const f of ALL) for (const body of legacy) expect(similarity(f.body, body), f.id).toBeLessThan(MAX_LEGACY_SIMILARITY);
  });
});

describe("파생 다이제스트 — 가이드 배선", () => {
  it("계산기 10페이지 가이드가 각자의 다이제스트를 일반 섹션보다 앞에 싣는다", () => {
    const pairs: [GuideData, Finding[]][] = [
      [LOAN_REPAYMENT_GUIDE, REPAYMENT_DIGEST],
      [LOAN_DSR_GUIDE, DSR_DIGEST],
      [LOAN_REFINANCE_GUIDE, REFINANCE_DIGEST],
      [LOAN_PREPAYMENT_GUIDE, PREPAYMENT_DIGEST],
      [LOAN_JEONSE_GUARANTEE_PAGE_GUIDE, JEONSE_GUARANTEE_DIGEST],
      [LOAN_STUDENT_LOAN_GUIDE, STUDENT_LOAN_DIGEST],
      [LOAN_MORTGAGE_GUIDE, MORTGAGE_COMPARE_DIGEST],
      [LOAN_JEONSE_GUIDE, JEONSE_LOAN_DIGEST],
      [LOAN_STEPPING_STONE_GUIDE, STEPPING_STONE_DIGEST],
      [LOAN_LTV_GUIDE, LTV_DTI_DIGEST],
    ];
    for (const [guide, digest] of pairs) {
      expect(guide.sections!.slice(0, digest.length)).toEqual(digest);
      expect(guide.sections!.length).toBeGreaterThan(digest.length + 1);
    }
  });

  it("홈(/) 종합 가이드에는 다이제스트가 섞이지 않는다", () => {
    expect(LOAN_HOME_GUIDE.sections!.some((s) => s.h2 === "위 발견의 계산 기준")).toBe(false);
  });
});

// card #56 방식: 산문에 인용된 수치가 엔진을 독립적으로 다시 돌린 값과 일치해야 한다.
// 다이제스트는 포매터만 거치므로 여기서 어긋나면 엔진이 바뀌었는데 문장이 낡은 것이다.
const bodyOf = (items: Finding[], i: number) => items[i].body;
const all = (items: Finding[]) => items.map((f) => `${f.h2} ${f.body}`).join("\n");

describe("파생 다이제스트 — 인용 수치 엔진 재계산 일치", () => {
  it("/repayment: 두 방식 총이자·역전 달·잔액·등가 금리", () => {
    const { principal: P, annualRate: R, termMonths: N } = DEFAULT_REPAYMENT_INPUT;
    const a = calcAnnuityPlan(P, R, N);
    const e = calcEqualPrincipalPlan(P, R, N);
    expect(bodyOf(REPAYMENT_DIGEST, 0)).toContain(won(a.totalInterest));
    expect(bodyOf(REPAYMENT_DIGEST, 0)).toContain(won(e.totalInterest));
    expect(bodyOf(REPAYMENT_DIGEST, 0)).toContain(won(a.totalInterest - e.totalInterest));
    // 역전 달: 스케줄을 직접 돌려 검증
    const k = crossoverMonth(P, R, N);
    const r = R / 12 / 100;
    const payAt = (m: number) => Math.round(P / N + (P - (P / N) * (m - 1)) * r);
    expect(payAt(k - 1)).toBeGreaterThanOrEqual(a.monthlyPayment);
    expect(payAt(k)).toBeLessThan(a.monthlyPayment);
    expect(bodyOf(REPAYMENT_DIGEST, 1)).toContain(`${k}개월째`);
    // 절반 시점 잔액: 마지막 달 잔액은 0에 수렴
    expect(Math.abs(annuityBalanceAfter(P, R, N, N))).toBeLessThan(N);
    expect(bodyOf(REPAYMENT_DIGEST, 6)).toContain(won(annuityBalanceAfter(P, R, N, N / 2)));
    // 등가 금리: 그 금리에서는 총이자가 기준 이하, 0.01%p 위에서는 초과
    const r20 = equivalentRateForTerm(P, R, N, 240);
    expect(calcAnnuityPlan(P, r20, 240).totalInterest).toBeLessThanOrEqual(a.totalInterest);
    expect(calcAnnuityPlan(P, Number((r20 + 0.01).toFixed(2)), 240).totalInterest).toBeGreaterThan(a.totalInterest);
    expect(bodyOf(REPAYMENT_DIGEST, 4)).toContain(rate(r20));
    expect(bodyOf(REPAYMENT_DIGEST, 7)).toContain(won(calcMonthlyPayment(100_000_000, R, N)));
  });

  it("/dsr: 기본 한도·소득 기울기·비율 옵션·목표 소득", () => {
    const base = calcDsrLimit(DEFAULT_DSR_INPUT);
    const plus = calcDsrLimit({ ...DEFAULT_DSR_INPUT, annualIncome: DEFAULT_DSR_INPUT.annualIncome + 10_000_000 });
    expect(bodyOf(DSR_DIGEST, 0)).toContain(won(base.maxLoanAmount));
    expect(bodyOf(DSR_DIGEST, 0)).toContain(won(plus.maxLoanAmount - base.maxLoanAmount));
    expect(bodyOf(DSR_DIGEST, 4)).toContain(won(calcDsrLimit({ ...DEFAULT_DSR_INPUT, dsrLimit: 0.5 }).maxLoanAmount));
    expect(bodyOf(DSR_DIGEST, 5)).toContain(won(base.estimatedTotalInterest));
    // 3억 목표 소득: 그 소득에서 한도 ≥ 3억, 10만원 아래에서는 미달
    const m = bodyOf(DSR_DIGEST, 6).match(/3억원에는 ([\d,]+)만원/)!;
    const income = Number(m[1].replace(/,/g, "")) * 10_000;
    expect(calcDsrLimit({ ...DEFAULT_DSR_INPUT, annualIncome: income }).maxLoanAmount).toBeGreaterThanOrEqual(300_000_000);
    expect(calcDsrLimit({ ...DEFAULT_DSR_INPUT, annualIncome: income - 100_000 }).maxLoanAmount).toBeLessThan(300_000_000);
  });

  it("/refinance: 월 절감·손익분기·순절감·기간 연장 손해", () => {
    const r = calcRefinance(DEFAULT_REFINANCE_INPUT);
    expect(bodyOf(REFINANCE_DIGEST, 0)).toContain(won(r.monthlySavings));
    expect(bodyOf(REFINANCE_DIGEST, 0)).toContain(`${r.breakEvenMonths}개월째`);
    expect(bodyOf(REFINANCE_DIGEST, 0)).toContain(won(r.netSavings));
    const ext = calcRefinance({ ...DEFAULT_REFINANCE_INPUT, newTermMonths: 360 });
    expect(ext.netSavings).toBeLessThan(0);
    expect(bodyOf(REFINANCE_DIGEST, 4)).toContain(won(ext.netSavings));
    const half = calcRefinance({ ...DEFAULT_REFINANCE_INPUT, balance: 60_000_000 });
    expect(bodyOf(REFINANCE_DIGEST, 5)).toContain(`${half.breakEvenMonths}·`);
  });

  it("/prepayment-fee: 기본 수수료·실효율·경과별·요율별", () => {
    const r = calcPrepaymentFee(DEFAULT_PREPAYMENT_FEE_INPUT);
    expect(bodyOf(PREPAYMENT_DIGEST, 0)).toContain(won(r.feeAmount));
    expect(bodyOf(PREPAYMENT_DIGEST, 0)).toContain(pct(r.effectiveRate));
    expect(bodyOf(PREPAYMENT_DIGEST, 1)).toContain(won(calcPrepaymentFee({ ...DEFAULT_PREPAYMENT_FEE_INPUT, elapsedMonths: 0 }).feeAmount));
    expect(calcPrepaymentFee({ ...DEFAULT_PREPAYMENT_FEE_INPUT, elapsedMonths: 36 }).feeAmount).toBe(0);
    expect(bodyOf(PREPAYMENT_DIGEST, 5)).toContain(won(calcPrepaymentFee({ ...DEFAULT_PREPAYMENT_FEE_INPUT, feeRate: 0.5 }).feeAmount));
    expect(bodyOf(PREPAYMENT_DIGEST, 3)).toContain(won(calcPrepaymentFee({ ...DEFAULT_PREPAYMENT_FEE_INPUT, repaymentAmount: 200_000_000 }).feeAmount));
  });

  it("/jeonse-guarantee-fee: 기본 보증료·구간 경계·할인·한도", () => {
    const r = calcJeonseGuaranteeFee(GUARANTEE_BASE);
    expect(bodyOf(JEONSE_GUARANTEE_DIGEST, 0)).toContain(won(r.totalFee));
    expect(bodyOf(JEONSE_GUARANTEE_DIGEST, 0)).toContain(won(r.monthlyEquivalent));
    const m25 = calcJeonseGuaranteeFee({ ...GUARANTEE_BASE, months: 25 });
    expect(bodyOf(JEONSE_GUARANTEE_DIGEST, 2)).toContain(won(m25.totalFee - r.totalFee));
    expect(bodyOf(JEONSE_GUARANTEE_DIGEST, 4)).toContain(won(calcJeonseGuaranteeFee({ ...GUARANTEE_BASE, discountRate: 0.6 }).discountedFee));
    expect(calcJeonseGuaranteeFee({ ...GUARANTEE_BASE, deposit: 700_000_001 }).isOverLimit).toBe(true);
    expect(calcJeonseGuaranteeFee({ ...GUARANTEE_BASE, deposit: 700_000_000 }).isOverLimit).toBe(false);
  });

  it("/student-loan: 의무상환·월 공제·완납 햇수·이자 동률 소득", () => {
    const r = calcStudentLoanRepayment(DEFAULT_STUDENT_LOAN_INPUT);
    expect(bodyOf(STUDENT_LOAN_DIGEST, 0)).toContain(won(r.creditedMandatoryRepayment));
    expect(bodyOf(STUDENT_LOAN_DIGEST, 0)).toContain(won(r.monthlyWithholding));
    expect(bodyOf(STUDENT_LOAN_DIGEST, 0)).toContain(`${yearsToClear({})}년`);
    // 완납 햇수를 직접 재현
    let balance = DEFAULT_STUDENT_LOAN_INPUT.loanBalance;
    let years = 0;
    while (balance > 0 && years < 60) {
      balance = calcStudentLoanRepayment({ ...DEFAULT_STUDENT_LOAN_INPUT, loanBalance: balance }).balanceAfterYear;
      years += 1;
    }
    expect(yearsToClear({})).toBe(years);
    const m = bodyOf(STUDENT_LOAN_DIGEST, 1).match(/같아지는 연소득은 ([\d,]+)만원/)!;
    const parity = Number(m[1].replace(/,/g, "")) * 10_000;
    expect(calcStudentLoanRepayment({ ...DEFAULT_STUDENT_LOAN_INPUT, annualIncome: parity }).creditedMandatoryRepayment).toBeGreaterThanOrEqual(r.estimatedInterest);
    expect(calcStudentLoanRepayment({ ...DEFAULT_STUDENT_LOAN_INPUT, annualIncome: parity - 100_000 }).creditedMandatoryRepayment).toBeLessThan(r.estimatedInterest);
  });

  it("/mortgage-compare: 가정 상품 비교 범위·방식 등가 금리 — 실제 은행표는 쓰지 않는다", () => {
    const r = compareMortgageRates(DEFAULT_MORTGAGE_COMPARE_INPUT, ASSUMED_OFFERS);
    expect(bodyOf(MORTGAGE_COMPARE_DIGEST, 0)).toContain(won(r.totalInterestRange));
    expect(bodyOf(MORTGAGE_COMPARE_DIGEST, 0)).toContain(won(r.monthlyPaymentRange));
    expect(ASSUMED_OFFERS.every((o) => o.bank.startsWith("가정 상품"))).toBe(true);
    const m = bodyOf(MORTGAGE_COMPARE_DIGEST, 2).match(/연 ([\d.]+)%까지 올라가도/)!;
    const eqRate = Number(m[1]);
    const P = DEFAULT_MORTGAGE_COMPARE_INPUT.loanAmount;
    expect(calcEqualPrincipalPlan(P, eqRate, 360).totalInterest).toBeLessThanOrEqual(calcAnnuityPlan(P, 4.2, 360).totalInterest);
    expect(calcEqualPrincipalPlan(P, eqRate + 0.01, 360).totalInterest).toBeGreaterThan(calcAnnuityPlan(P, 4.2, 360).totalInterest);
  });

  it("/jeonse-loan: 거치식·원리금균등 월액과 총이자", () => {
    const io = calcJeonseLoan(DEFAULT_JEONSE_LOAN_INPUT);
    const an = calcJeonseLoan({ ...DEFAULT_JEONSE_LOAN_INPUT, isInterestOnly: false });
    expect(bodyOf(JEONSE_LOAN_DIGEST, 0)).toContain(won(io.monthlyInterest));
    expect(bodyOf(JEONSE_LOAN_DIGEST, 0)).toContain(won(an.monthlyPayment));
    expect(bodyOf(JEONSE_LOAN_DIGEST, 0)).toContain(won(io.totalInterest - an.totalInterest));
    expect(bodyOf(JEONSE_LOAN_DIGEST, 3)).toContain(won(io.totalInterest * 4));
    expect(bodyOf(JEONSE_LOAN_DIGEST, 3)).toContain(won(calcJeonseLoan({ ...DEFAULT_JEONSE_LOAN_INPUT, termMonths: 96, isInterestOnly: false }).totalInterest));
  });

  it("/stepping-stone-loan: 한도 후보·구간 경계 금리·자격 절벽", () => {
    const r = calcSteppingStoneLoan(DEFAULT_STEPPING_STONE_INPUT);
    expect(bodyOf(STEPPING_STONE_DIGEST, 0)).toContain(won(r.maxLoanByDti));
    expect(bodyOf(STEPPING_STONE_DIGEST, 0)).toContain(won(r.effectiveLoanAmount));
    const under = calcSteppingStoneLoan({ ...DEFAULT_STEPPING_STONE_INPUT, householdIncome: 40_000_000 });
    const over = calcSteppingStoneLoan({ ...DEFAULT_STEPPING_STONE_INPUT, householdIncome: 40_010_000 });
    expect(bodyOf(STEPPING_STONE_DIGEST, 1)).toContain(pp(over.applicableRate - under.applicableRate));
    expect(bodyOf(STEPPING_STONE_DIGEST, 1)).toContain(won(over.totalInterest));
    const atCeiling = calcSteppingStoneLoan({ ...DEFAULT_STEPPING_STONE_INPUT, householdIncome: 70_000_000 });
    const overCeiling = calcSteppingStoneLoan({ ...DEFAULT_STEPPING_STONE_INPUT, householdIncome: 70_010_000 });
    expect(overCeiling.eligible).toBe(false);
    expect(atCeiling.eligible).toBe(true);
    // 소득 상한을 넘으면 자격만 사라지는 게 아니라 금리 구간이 바뀌어 월납·총이자도 함께 움직인다.
    // 산문이 "숫자가 그대로 남는다"고 쓰면 여기서 깨진다 — 그대로인 값은 상품 한도 하나뿐이다.
    expect(overCeiling.effectiveLoanAmount).toBe(atCeiling.effectiveLoanAmount);
    expect(overCeiling.applicableRate).toBeGreaterThan(atCeiling.applicableRate);
    expect(overCeiling.monthlyPayment).toBeGreaterThan(atCeiling.monthlyPayment);
    expect(bodyOf(STEPPING_STONE_DIGEST, 6)).toContain(won(overCeiling.monthlyPayment));
    expect(bodyOf(STEPPING_STONE_DIGEST, 6)).toContain(rate(overCeiling.applicableRate));
    // 일반 유형의 상한은 금리표 구간 안쪽이라 실제로 숫자가 그대로다 — 두 절벽의 성격이 다르다.
    const generalAt = calcSteppingStoneLoan({ ...DEFAULT_STEPPING_STONE_INPUT, borrowerType: "general", householdIncome: 60_000_000 });
    const generalOver = calcSteppingStoneLoan({ ...DEFAULT_STEPPING_STONE_INPUT, borrowerType: "general", householdIncome: 60_010_000 });
    expect(generalOver.eligible).toBe(false);
    expect(generalOver.monthlyPayment).toBe(generalAt.monthlyPayment);
    expect(bodyOf(STEPPING_STONE_DIGEST, 6)).toContain(won(generalAt.monthlyPayment));
    expect(bodyOf(STEPPING_STONE_DIGEST, 5)).toContain(won(r.equalPrincipalPlan.firstPayment));
  });

  it("/ltv-dti: 네 축 한도·스트레스 차감·절대한도 절벽", () => {
    const r = calcLtvDti(DEFAULT_LTV_DTI_INPUT);
    for (const v of [r.maxByLtv, r.maxByAbsolute, r.maxByDti, r.maxByDsr, r.finalMaxLoan]) expect(bodyOf(LTV_DTI_DIGEST, 0)).toContain(won(v));
    expect(LTV_DTI_DIGEST[0].h2).toContain(`걸리는 축은 ${r.limitingFactor}`);
    const noStress = calcLtvDti({ ...DEFAULT_LTV_DTI_INPUT, loanRate: DEFAULT_LTV_DTI_INPUT.loanRate - r.stressRate });
    expect(bodyOf(LTV_DTI_DIGEST, 1)).toContain(won(noStress.maxByDsr - r.maxByDsr));
    const at15 = calcLtvDti({ ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 1_500_000_000, annualIncome: 300_000_000 });
    const over15 = calcLtvDti({ ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 1_501_000_000, annualIncome: 300_000_000 });
    expect(at15.finalMaxLoan - over15.finalMaxLoan).toBe(200_000_000);
    expect(LTV_DTI_DIGEST[3].h2).toContain(manwon(at15.finalMaxLoan - over15.finalMaxLoan));
    // 입력 상한 버그(#55) 수정으로 25억 구간이 재현 가능해졌다 — 4억→2억 절벽까지 적는다
    const at25 = calcLtvDti({ ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 2_500_000_000, annualIncome: 300_000_000 });
    const over25 = calcLtvDti({ ...DEFAULT_LTV_DTI_INPUT, propertyPrice: 2_501_000_000, annualIncome: 300_000_000 });
    expect(at25.finalMaxLoan - over25.finalMaxLoan).toBe(200_000_000);
    expect(bodyOf(LTV_DTI_DIGEST, 3)).toContain(won(at25.finalMaxLoan));
    expect(bodyOf(LTV_DTI_DIGEST, 3)).toContain(won(over25.finalMaxLoan));
    expect(all(LTV_DTI_DIGEST)).toContain("25억");
  });
});
