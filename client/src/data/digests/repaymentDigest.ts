// /repayment 파생 다이제스트 — 계산기가 "입력 한 조합"의 두 상환방식을 보여준다면, 여기는 같은
// 엔진(calcAnnuityPlan·calcEqualPrincipalPlan)을 금리 3~6% × 기간 10~30년 전 구간 돌려서만 보이는
// 것을 적는다: 두 방식의 월 납입액이 역전되는 달, 금리 0.1%p의 값어치, 기간과 금리의 등가 교환.
// 금리·기간·원금은 전부 가정 파라미터이고 은행 금리표는 쓰지 않는다.

import { DEFAULT_REPAYMENT_INPUT } from "@/lib/validators";
import { calcAnnuityPlan, calcEqualPrincipalPlan, calcMonthlyPayment } from "@/utils/calculator";
import { type Finding, eul, eun, ga, manwon, num, pct, pp, rate, ro, term, times, wa, won } from "./format";

const P = DEFAULT_REPAYMENT_INPUT.principal; // 3억원
const R = DEFAULT_REPAYMENT_INPUT.annualRate; // 연 4.2%
const N = DEFAULT_REPAYMENT_INPUT.termMonths; // 360개월

/** 원금균등 k번째 달 납입액 — 엔진과 같은 반올림 규칙 */
function equalPrincipalPaymentAt(principal: number, annualRate: number, months: number, k: number): number {
  const r = annualRate / 12 / 100;
  const remaining = principal - (principal / months) * (k - 1);
  return Math.round(principal / months + remaining * r);
}

/** 원금균등 월 납입액이 원리금균등 고정액 아래로 내려가는 첫 달 */
export function crossoverMonth(principal: number, annualRate: number, months: number): number {
  const annuity = calcMonthlyPayment(principal, annualRate, months);
  for (let k = 1; k <= months; k += 1) {
    if (equalPrincipalPaymentAt(principal, annualRate, months, k) < annuity) return k;
  }
  return months;
}

/** 원리금균등 k개월 납입 후 남은 원금 */
export function annuityBalanceAfter(principal: number, annualRate: number, months: number, k: number): number {
  const r = annualRate / 12 / 100;
  const m = calcMonthlyPayment(principal, annualRate, months);
  if (r === 0) return Math.round(principal - m * k);
  const f = (1 + r) ** k;
  return Math.round(principal * f - (m * (f - 1)) / r);
}

/** 원리금균등에서 원금 상환분이 이자를 처음 넘어서는 달 */
export function principalOvertakesInterestMonth(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  for (let k = 1; k <= months; k += 1) {
    const balance = annuityBalanceAfter(principal, annualRate, months, k - 1);
    const interest = balance * r;
    const m = calcMonthlyPayment(principal, annualRate, months);
    if (m - interest > interest) return k;
  }
  return months;
}

function defaultGap(): Finding {
  const a = calcAnnuityPlan(P, R, N);
  const e = calcEqualPrincipalPlan(P, R, N);
  const gap = a.totalInterest - e.totalInterest;
  return {
    h2: "원금균등이 아끼는 총이자는 원리금균등 총이자의 약 " + pct(gap / a.totalInterest, 0) + "다",
    body:
      `원금 ${manwon(P)}, 연 ${rate(R)}, ${term(N)}(가정)에서 원리금균등 총이자는 ${won(a.totalInterest)}, 원금균등 총이자는 ${ro(won(e.totalInterest))} 차이가 ${won(gap)}입니다. ` +
      `이 차이는 원리금균등 총이자의 ${pct(gap / a.totalInterest)}이고, 첫 달 납입액 차이 ${won(e.firstPayment - a.monthlyPayment)}(원금균등 ${won(e.firstPayment)} 대 원리금균등 ${won(a.monthlyPayment)})의 ${times(gap, e.firstPayment - a.monthlyPayment, 0)}에 해당합니다. ` +
      `즉 "첫 달에 ${eul(won(e.firstPayment - a.monthlyPayment))} 더 낼 수 있느냐"가 ${term(N)} 뒤 ${manwon(gap)}의 이자를 가르는 질문입니다. 총이자 절감액은 원금에 정비례하므로 원금이 절반이면 절감액도 정확히 절반입니다.`,
  };
}

function crossover(): Finding {
  const k = crossoverMonth(P, R, N);
  const a = calcMonthlyPayment(P, R, N);
  const before = equalPrincipalPaymentAt(P, R, N, k - 1);
  const at = equalPrincipalPaymentAt(P, R, N, k);
  const last = equalPrincipalPaymentAt(P, R, N, N);
  const k20 = crossoverMonth(P, R, 240);
  const k10 = crossoverMonth(P, R, 120);
  return {
    h2: `원금균등 납입액이 원리금균등 아래로 내려가는 때는 ${term(k)}째다`,
    body:
      `연 ${rate(R)}, ${term(N)}(가정) 조건에서 원금균등 납입액은 첫 달 ${won(equalPrincipalPaymentAt(P, R, N, 1))}에서 매달 ${won(equalPrincipalPaymentAt(P, R, N, 1) - equalPrincipalPaymentAt(P, R, N, 2))}씩 줄어들어, ` +
      `${k - 1}개월째 ${won(before)}까지는 원리금균등 고정액 ${won(a)}보다 많다가 ${k}개월째 ${won(at)}에서 처음 아래로 내려갑니다. ` +
      `그 뒤로는 계속 원리금균등보다 적어져 마지막 달에는 ${won(last)}, 고정액의 ${pct(last / a, 0)} 수준입니다. ` +
      `역전 시점은 원금이 아니라 기간이 정합니다 — 같은 금리로 ${term(240)}이면 ${k20}개월째, ${term(120)}이면 ${k10}개월째로, 기간의 대략 절반 직전에서 뒤집힙니다. ` +
      `이 달 전까지가 원금균등의 "부담 구간"이고, 이 구간을 버틸 수 있는지가 방식 선택의 실질 조건입니다.`,
  };
}

function tenthPointWorth(): Finding {
  const at = (r: number) => calcAnnuityPlan(P, r, N).totalInterest;
  const steps = [3, 4, 5, 6].map((r) => ({ r, delta: at(r + 0.1) - at(r) }));
  const min = steps.reduce((a, b) => (b.delta < a.delta ? b : a));
  const max = steps.reduce((a, b) => (b.delta > a.delta ? b : a));
  const monthlyDelta = calcMonthlyPayment(P, R + 0.1, N) - calcMonthlyPayment(P, R, N);
  return {
    h2: `금리 0.1%p는 ${term(N)} 총이자로 약 ${manwon(steps[1].delta)}이다`,
    body:
      `원금 ${manwon(P)}, ${term(N)}(가정)에서 금리를 0.1%p 올릴 때 늘어나는 총이자는 연 ${rate(min.r)}→${rate(min.r + 0.1)} 구간에서 ${won(min.delta)}, 연 ${rate(max.r)}→${rate(max.r + 0.1)} 구간에서 ${won(max.delta)}입니다. ` +
      `금리가 높을수록 같은 0.1%p의 값어치가 조금씩 커지지만 폭은 ${pct(max.delta / min.delta - 1)} 차이에 그쳐, 어느 구간이든 "0.1%p ≒ ${manwon(steps[1].delta)}"로 기억해도 됩니다. ` +
      `월 납입액으로는 연 ${rate(R)}에서 ${ro(rate(R + 0.1))} 오를 때 ${won(monthlyDelta)} 늘어나므로, 월 ${ga(won(monthlyDelta))} 작아 보여도 ${N}개월을 곱하면 ${won(monthlyDelta * N)}입니다. ` +
      `우대금리 조항 하나가 0.1~0.3%p 단위인 이유가 여기 있고, 그 값어치는 원금에 정비례해 원금 ${manwon(P * 2)}이면 두 배가 됩니다.`,
  };
}

function termMultiplier(): Finding {
  const t = [120, 240, 360].map((n) => ({ n, plan: calcAnnuityPlan(P, R, n) }));
  const [t10, t20, t30] = t;
  return {
    h2: `기간을 ${term(t10.n)}에서 ${ro(term(t30.n))} 늘리면 월 납입은 ${pct(1 - t30.plan.monthlyPayment / t10.plan.monthlyPayment, 0)} 줄고 총이자는 ${ga(times(t30.plan.totalInterest, t10.plan.totalInterest))} 된다`,
    body:
      `원금 ${manwon(P)}, 연 ${rate(R)}(가정) 원리금균등에서 월 납입액은 ${term(t10.n)} ${won(t10.plan.monthlyPayment)}, ${term(t20.n)} ${won(t20.plan.monthlyPayment)}, ${term(t30.n)} ${won(t30.plan.monthlyPayment)}입니다. ` +
      `총이자는 각각 ${won(t10.plan.totalInterest)}, ${won(t20.plan.totalInterest)}, ${won(t30.plan.totalInterest)}로, 기간이 3배가 되는 동안 월 부담은 ${pct(1 - t30.plan.monthlyPayment / t10.plan.monthlyPayment)} 줄지만 이자는 ${ro(times(t30.plan.totalInterest, t10.plan.totalInterest))} 불어납니다. ` +
      `${term(t20.n)}에서 ${ro(term(t30.n))} 늘리는 마지막 10년만 떼어 보면 월 ${eul(won(t20.plan.monthlyPayment - t30.plan.monthlyPayment))} 덜 내는 대가로 총이자 ${eul(won(t30.plan.totalInterest - t20.plan.totalInterest))} 더 냅니다. ` +
      `${term(t30.n)} 총이자 ${eun(won(t30.plan.totalInterest))} 원금의 ${pct(t30.plan.totalInterest / P)}이므로, 이 조건에서는 빌린 돈의 ${pct(t30.plan.totalInterest / P, 0)}만큼을 이자로 더 갚는 셈입니다.`,
  };
}

/** 20년 상환이 30년·기준금리와 같은 총이자를 내게 되는 금리 — 0.01%p 해상도 */
export function equivalentRateForTerm(principal: number, baseRate: number, baseMonths: number, targetMonths: number): number {
  const target = calcAnnuityPlan(principal, baseRate, baseMonths).totalInterest;
  let r = baseRate;
  while (calcAnnuityPlan(principal, r + 0.01, targetMonths).totalInterest <= target && r < 30) r = Number((r + 0.01).toFixed(2));
  return r;
}

function rateTermTrade(): Finding {
  const r20 = equivalentRateForTerm(P, R, N, 240);
  const r15 = equivalentRateForTerm(P, R, N, 180);
  const base = calcAnnuityPlan(P, R, N);
  const p20 = calcAnnuityPlan(P, r20, 240);
  return {
    h2: `${term(240)} 상환은 금리가 ${pp(r20 - R)} 높아도 ${term(N)}·연 ${rate(R)}보다 총이자가 적다`,
    body:
      `원금 ${manwon(P)}, ${term(N)}, 연 ${rate(R)}(가정)의 총이자 ${eul(won(base.totalInterest))} 기준으로, 기간을 ${ro(term(240))} 줄이면 금리가 연 ${rate(r20)}까지 올라가도 총이자가 ${ro(won(p20.totalInterest))} 기준보다 적습니다. ` +
      `${term(180)}이면 연 ${rate(r15)}까지 버팁니다. 즉 기간 10년 단축은 금리 ${pp(r20 - R)} 인하와 같은 값어치이고, 15년 단축은 ${pp(r15 - R)}에 해당합니다. ` +
      `반대로 읽으면 "금리 ${pp(0.5)} 우대"를 받으려고 기간을 10년 늘리는 선택은 총이자 기준으로 손해입니다. 다만 ${term(240)}의 월 납입액은 ${ro(won(p20.monthlyPayment))} 기준 ${won(base.monthlyPayment)}보다 ${won(p20.monthlyPayment - base.monthlyPayment)} 많아, ` +
      `이 교환은 그 차액을 매달 감당할 수 있을 때만 성립합니다.`,
  };
}

function gapRatioByTerm(): Finding {
  const ratio = (r: number, n: number) => {
    const a = calcAnnuityPlan(P, r, n);
    const e = calcEqualPrincipalPlan(P, r, n);
    return (a.totalInterest - e.totalInterest) / a.totalInterest;
  };
  const byTerm = [120, 240, 360].map((n) => ({ n, v: ratio(R, n) }));
  const byRate = [3, 6].map((r) => ({ r, v: ratio(r, N) }));
  return {
    h2: "두 방식의 총이자 격차 비율은 금리보다 기간이 정한다",
    body:
      `원금균등이 원리금균등 대비 아끼는 총이자의 비율은 연 ${rate(R)}(가정)에서 ${term(byTerm[0].n)} ${pct(byTerm[0].v)}, ${term(byTerm[1].n)} ${pct(byTerm[1].v)}, ${term(byTerm[2].n)} ${ro(pct(byTerm[2].v))} 기간이 길수록 벌어집니다. ` +
      `반면 ${ro(term(N))} 고정하고 금리를 연 ${rate(byRate[0].r)}에서 ${rate(byRate[1].r)}까지 두 배로 올려도 비율은 ${pct(byRate[0].v)}에서 ${ro(pct(byRate[1].v))} ${pp((byRate[1].v - byRate[0].v) * 100)}만 움직입니다. ` +
      `비율이 원금과 무관한 것은 두 방식 모두 총이자가 원금에 정비례하기 때문입니다. ` +
      `그래서 "원금균등이 유리한가"는 금리 수준이 아니라 기간의 문제이고, 단기 대출에서는 두 방식의 차이가 ${pct(byTerm[0].v, 0)} 안팎이라 현금흐름이 편한 쪽을 골라도 손해가 작습니다.`,
  };
}

function interestShare(): Finding {
  const r = R / 12 / 100;
  const m = calcMonthlyPayment(P, R, N);
  const firstInterest = Math.round(P * r);
  const k = principalOvertakesInterestMonth(P, R, N);
  const k20 = principalOvertakesInterestMonth(P, R, 240);
  const half = annuityBalanceAfter(P, R, N, N / 2);
  return {
    h2: `첫 달 납입액의 ${ga(pct(firstInterest / m, 0))} 이자이고, 원금 상환이 이자를 앞서는 때는 ${term(k)}째다`,
    body:
      `원금 ${manwon(P)}, 연 ${rate(R)}, ${term(N)}(가정) 원리금균등의 월 납입액 ${won(m)} 가운데 첫 달 이자는 ${won(firstInterest)}, 원금 상환은 ${won(m - firstInterest)}뿐입니다. ` +
      `원금 상환분이 이자를 처음 넘어서는 달은 ${k}개월째(${term(k)})이고, ${term(240)} 상환이면 ${k20}개월째로 당겨집니다. ` +
      `그 결과 ${term(N)}의 정확히 절반인 ${eul(term(N / 2))} 갚은 시점에도 남은 원금은 ${won(half)}, 처음의 ${pct(half / P)}입니다. 원금균등이라면 같은 시점 잔액이 정확히 ${pct(0.5, 0)}입니다. ` +
      `중도상환이나 대환을 앞당길수록 효과가 큰 이유는 이 구조 때문입니다 — 초반일수록 남은 원금이 크고 매달 내는 돈의 대부분이 이자입니다.`,
  };
}

function perHundredMillion(): Finding {
  const unit = 100_000_000;
  const rows = [120, 180, 240, 360].map((n) => ({ n, m: calcMonthlyPayment(unit, R, n) }));
  const r5 = calcMonthlyPayment(unit, 5, N);
  const r3 = calcMonthlyPayment(unit, 3, N);
  return {
    h2: `1억원당 월 납입액 — 연 ${rate(R)} ${term(N)}이면 ${won(rows[3].m)}`,
    body:
      `원리금균등 월 납입액은 원금에 정비례하므로 1억원 기준값만 알면 어떤 금액이든 곱해서 구할 수 있습니다. 연 ${rate(R)}(가정)에서 1억원당 월 납입액은 ${term(rows[0].n)} ${won(rows[0].m)}, ${term(rows[1].n)} ${won(rows[1].m)}, ${term(rows[2].n)} ${won(rows[2].m)}, ${term(rows[3].n)} ${won(rows[3].m)}입니다. ` +
      `${term(N)} 기준으로 금리를 연 ${ro(rate(3))} 낮추면 ${won(r3)}, 연 ${ro(rate(5))} 올리면 ${ga(won(r5))} 되어 금리 ${pp(2)} 차이가 1억원당 월 ${won(r5 - r3)}입니다. ` +
      `${eul(manwon(P))} 빌린다면 ${term(N)} 월 납입액은 ${won(rows[3].m)}의 ${num(P / unit)}배인 ${won(rows[3].m * (P / unit))} 안팎으로, 계산기가 내는 ${wa(won(calcMonthlyPayment(P, R, N)))} 반올림 차이 이내로 맞습니다. ` +
      `월 소득에서 감당 가능한 상환액을 먼저 정한 뒤 이 단가로 나누면 빌릴 수 있는 원금이 바로 나옵니다.`,
  };
}

function shortTermIndifference(): Finding {
  const n = 36;
  const a = calcAnnuityPlan(P, R, n);
  const e = calcEqualPrincipalPlan(P, R, n);
  const gap = a.totalInterest - e.totalInterest;
  const n60 = 60;
  const a60 = calcAnnuityPlan(P, R, n60);
  const e60 = calcEqualPrincipalPlan(P, R, n60);
  return {
    h2: `${term(n)} 이하 대출에서 두 방식의 총이자 차이는 첫 달 납입액 차이의 ${times(gap, e.firstPayment - a.monthlyPayment)} 수준이다`,
    body:
      `같은 원금 ${manwon(P)}, 연 ${rate(R)}(가정)을 ${term(n)}에 갚으면 원리금균등 총이자 ${won(a.totalInterest)}, 원금균등 ${ro(won(e.totalInterest))} 차이가 ${won(gap)}에 그칩니다. ` +
      `그런데 첫 달 납입액은 원금균등 ${won(e.firstPayment)} 대 원리금균등 ${ro(won(a.monthlyPayment))} ${won(e.firstPayment - a.monthlyPayment)} 차이가 나서, 절감액이 첫 달 추가 부담의 ${times(gap, e.firstPayment - a.monthlyPayment)}에 불과합니다. ` +
      `${ro(term(n60))} 늘려도 절감액 ${won(a60.totalInterest - e60.totalInterest)} 대 첫 달 차이 ${ro(won(e60.firstPayment - a60.monthlyPayment))} 비율은 ${times(a60.totalInterest - e60.totalInterest, e60.firstPayment - a60.monthlyPayment)}입니다. ` +
      `${term(N)}에서 이 비율이 ${times(calcAnnuityPlan(P, R, N).totalInterest - calcEqualPrincipalPlan(P, R, N).totalInterest, calcEqualPrincipalPlan(P, R, N).firstPayment - calcMonthlyPayment(P, R, N), 0)}였던 것과 비교하면, 단기 대출에서 원금균등을 고집할 실익은 거의 없습니다.`,
  };
}

export const REPAYMENT_DIGEST: Finding[] = [
  defaultGap(),
  crossover(),
  tenthPointWorth(),
  termMultiplier(),
  rateTermTrade(),
  gapRatioByTerm(),
  interestShare(),
  perHundredMillion(),
  shortTermIndifference(),
];
