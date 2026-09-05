// /mortgage-compare 파생 다이제스트 — 비교표의 은행별 금리 데이터는 쓰지 않는다(확인일이 오래돼 근거로
// 부적합). 대신 같은 엔진(compareMortgageRates·calcAnnuityPlan·calcEqualPrincipalPlan)에 가정 금리 행을
// 넣어, "금리 차 X%p가 월·총이자로 얼마인가", "상환방식이 금리 몇 %p를 상쇄하는가" 같은 순수 수학만 적는다.

import { DEFAULT_MORTGAGE_COMPARE_INPUT } from "@/lib/validators";
import type { BankMortgageRate } from "@/data/mortgageRates";
import { calcAnnuityPlan, calcEqualPrincipalPlan, calcMonthlyPayment, compareMortgageRates } from "@/utils/calculator";
import { type Finding, eul, eun, ga, manwon, pct, pp, rate, ro, term, times, wa, won } from "./format";

const D = DEFAULT_MORTGAGE_COMPARE_INPUT; // 3억, 30년, 원리금균등
const P = D.loanAmount;
const N = D.termMonths;
const fmt2 = (v: number) => Number(v.toFixed(2));

/** 가정 금리 행 — 은행 이름이 아니라 금리 수준을 비교하기 위한 가상 상품 */
export const ASSUMED_OFFERS: readonly BankMortgageRate[] = [
  { id: "a", bank: "가정 상품 A", fixedMin: 3.8, fixedMax: 4.6, variableMin: 3.6, variableMax: 4.9 },
  { id: "b", bank: "가정 상품 B", fixedMin: 4.1, fixedMax: 4.9, variableMin: 3.9, variableMax: 5.2 },
  { id: "c", bank: "가정 상품 C", fixedMin: 4.4, fixedMax: 5.2, variableMin: 4.2, variableMax: 5.5 },
];
const compare = (patch: Partial<typeof D> = {}) => compareMortgageRates({ ...D, ...patch }, ASSUMED_OFFERS);

function bestWorstRange(): Finding {
  const r = compare();
  const best = r.banks[0];
  const worst = r.banks[r.banks.length - 1];
  const spread = worst.bestRate - best.bestRate;
  return {
    h2: `최저금리 ${pp(spread)} 차이는 ${term(N)} 총이자 ${manwon(r.totalInterestRange)}이다`,
    body:
      `${manwon(P)}, ${term(N)}, 원리금균등(가정)에 최저금리가 연 ${rate(best.bestRate)}·${rate(r.banks[1].bestRate)}·${rate(worst.bestRate)}인 가정 상품 세 개를 넣으면 월 납입액은 ${won(best.bestMonthlyPayment)}·${won(r.banks[1].bestMonthlyPayment)}·${won(worst.bestMonthlyPayment)}, 총이자는 ${won(best.bestTotalInterest)}·${won(r.banks[1].bestTotalInterest)}·${won(worst.bestTotalInterest)}입니다. ` +
      `양 끝의 금리 차 ${ga(pp(spread))} 월 ${won(r.monthlyPaymentRange)}, ${term(N)} 합계 ${ro(won(r.totalInterestRange))} 벌어집니다. ` +
      `월 차이 ${eun(won(r.monthlyPaymentRange))} 커 보이지 않지만 ${N}개월을 곱한 값이 ${manwon(r.totalInterestRange)}이고, 이는 대출 원금의 ${pct(r.totalInterestRange / P)}입니다. ` +
      `비교표에서 볼 것은 은행 이름이 아니라 "내가 실제로 받을 금리"이며, 같은 은행이라도 최저와 최고 사이 폭이 이 ${pp(spread)}보다 넓은 경우가 흔합니다.`,
  };
}

function withinOfferSpread(): Finding {
  const r = compare();
  const a = r.banks[0];
  return {
    h2: `한 상품 안의 최저·최고 금리 차 ${ga(pp(a.worstRate - a.bestRate))} 상품 간 차이 ${pp(r.banks[r.banks.length - 1].bestRate - a.bestRate)}보다 크다`,
    body:
      `가정 상품 A의 최저금리 ${wa(rate(a.bestRate))} 최고금리 ${ro(rate(a.worstRate))} ${manwon(P)}·${eul(term(N))} 계산하면 월 ${wa(won(a.bestMonthlyPayment))} ${won(a.worstMonthlyPayment)}, 총이자 ${wa(won(a.bestTotalInterest))} ${won(a.worstTotalInterest)}입니다. ` +
      `같은 상품 안에서 신용·우대 조건에 따라 ${ga(won(a.worstTotalInterest - a.bestTotalInterest))} 갈리는 셈이고, 이는 세 상품의 최저금리끼리 비교한 총이자 차이 ${won(r.totalInterestRange)}의 ${times(a.worstTotalInterest - a.bestTotalInterest, r.totalInterestRange)}입니다. ` +
      `즉 "어느 상품이 싸냐"보다 "내가 그 상품의 어느 금리 구간에 들어가느냐"가 이자를 더 크게 가릅니다. ` +
      `비교표의 최저금리는 우대 조건을 모두 채운 상한선이고, 표에서 상품 순위를 매길 때는 최저가 아니라 자신이 받을 수 있는 금리를 넣어 다시 정렬해야 합니다.`,
  };
}

function methodOffsetsRate(): Finding {
  const annuityBase = calcAnnuityPlan(P, 4.2, N).totalInterest;
  let r = 4.2;
  while (calcEqualPrincipalPlan(P, fmt2(r + 0.01), N).totalInterest <= annuityBase && r < 30) r = fmt2(r + 0.01);
  const ep = calcEqualPrincipalPlan(P, r, N);
  return {
    h2: `원금균등이면 금리가 ${pp(r - 4.2)} 높아도 연 ${rate(4.2)} 원리금균등과 총이자가 같다`,
    body:
      `${manwon(P)}·${term(N)}(가정)에서 연 ${rate(4.2)} 원리금균등의 총이자는 ${won(annuityBase)}입니다. 상환방식을 원금균등으로 바꾸면 금리가 연 ${rate(r)}까지 올라가도 총이자가 ${ro(won(ep.totalInterest))} 그 아래에 머뭅니다. ` +
      `이 계산기에서 상환방식 토글은 금리 ${wa(pp(r - 4.2))} 맞먹는 스위치인 셈입니다. ` +
      `대신 원금균등 첫 달 납입액은 ${ro(won(ep.firstPayment))} 원리금균등 ${won(calcMonthlyPayment(P, 4.2, N))}보다 ${won(ep.firstPayment - calcMonthlyPayment(P, 4.2, N))} 많고, 마지막 달에는 ${won(ep.lastPayment)}까지 내려옵니다. ` +
      `"금리 낮은 상품 + 원리금균등"과 "금리 높은 상품 + 원금균등"이 총이자에서는 같아질 수 있으므로, 비교표는 상환방식을 같은 것으로 맞춘 뒤 읽어야 공정합니다.`,
  };
}

function tenthPointLadder(): Finding {
  const rows = [0.1, 0.3, 0.5, 1].map((gap) => ({
    gap,
    monthly: calcMonthlyPayment(P, fmt2(4.2 + gap), N) - calcMonthlyPayment(P, 4.2, N),
    total: calcAnnuityPlan(P, fmt2(4.2 + gap), N).totalInterest - calcAnnuityPlan(P, 4.2, N).totalInterest,
  }));
  return {
    h2: `우대 ${eun(pp(rows[1].gap))} 월 ${won(rows[1].monthly)}, ${term(N)} ${manwon(rows[1].total)}이다`,
    body:
      `${manwon(P)}·${term(N)}·원리금균등(가정)에서 연 ${eul(rate(4.2))} 기준으로 금리를 ${pp(rows[0].gap)}·${pp(rows[1].gap)}·${pp(rows[2].gap)}·${pp(rows[3].gap)} 올리면 월 납입액은 ${won(rows[0].monthly)}·${won(rows[1].monthly)}·${won(rows[2].monthly)}·${won(rows[3].monthly)} 늘고, ` +
      `총이자는 ${won(rows[0].total)}·${won(rows[1].total)}·${won(rows[2].total)}·${won(rows[3].total)} 늘어납니다. ` +
      `${pp(rows[3].gap)}의 총이자 증가가 ${pp(rows[0].gap)}의 정확히 10배가 아니라 ${times(rows[3].total, rows[0].total)}인 것은 금리가 높을수록 같은 폭의 값어치가 조금 커지기 때문입니다. ` +
      `급여이체·카드 사용 같은 우대 조건 하나가 보통 ${pp(0.1)}~${pp(0.3)} 단위이므로, 조건 하나의 값이 ${manwon(rows[0].total)}에서 ${manwon(rows[1].total)} 사이라고 읽으면 됩니다.`,
  };
}

function fixedVsVariableBuffer(): Finding {
  const fixed = 4.6;
  const variable = 3.6;
  const gap = fixed - variable;
  const fixedPlan = calcAnnuityPlan(P, fixed, N);
  const variablePlan = calcAnnuityPlan(P, variable, N);
  let breakEvenRate = variable;
  while (calcAnnuityPlan(P, fmt2(breakEvenRate + 0.01), N).totalInterest <= fixedPlan.totalInterest && breakEvenRate < 30) breakEvenRate = fmt2(breakEvenRate + 0.01);
  return {
    h2: `고정 ${rate(fixed)} 대 변동 ${rate(variable)}(가정)이면 변동은 ${term(N)} 내내 평균 ${pp(gap)}까지 오를 여유가 있다`,
    body:
      `가정 상품 A의 고정 최저 ${wa(rate(fixed))} 변동 최저 ${ro(rate(variable))} ${manwon(P)}·${eul(term(N))} 비교하면 월 납입액 ${won(fixedPlan.monthlyPayment)} 대 ${won(variablePlan.monthlyPayment)}, 총이자 ${won(fixedPlan.totalInterest)} 대 ${ro(won(variablePlan.totalInterest))} 변동이 ${won(fixedPlan.totalInterest - variablePlan.totalInterest)} 적습니다. ` +
      `변동금리가 기간 전체 평균으로 연 ${rate(breakEvenRate)}까지 올라야 고정과 총이자가 같아지므로, 출발 시점의 ${pp(gap)} 차이가 곧 변동이 감당할 수 있는 상승 폭입니다. ` +
      `이 여유는 원금이 커도 비율로는 같고, 기간이 짧을수록 평균 금리에 초반이 크게 반영되어 변동에 유리합니다. ` +
      `이 계산기는 금리 경로를 예측하지 않으므로, 고정·변동 선택은 "${pp(gap)} 이상 오를 것으로 보느냐"라는 질문으로 바꿔 스스로 답해야 합니다.`,
  };
}

function termSwap(): Finding {
  const r30 = compare();
  const r20 = compare({ termMonths: 240 });
  const best30 = r30.banks[0];
  const best20 = r20.banks[0];
  const worst30 = r30.banks[r30.banks.length - 1];
  return {
    h2: `${term(240)}·최고금리 상품이 ${term(360)}·최저금리 상품보다 총이자가 ${manwon(worst30.bestTotalInterest - best20.bestTotalInterest)} 적다`,
    body:
      `가정 상품 셋을 ${manwon(P)}·원리금균등으로 돌리면 ${term(360)}에서 최저 ${rate(best30.bestRate)} 상품의 총이자가 ${won(best30.bestTotalInterest)}, 최고 ${rate(worst30.bestRate)} 상품은 ${won(worst30.bestTotalInterest)}입니다. ` +
      `기간을 ${ro(term(240))} 줄이면 최저금리 상품의 총이자는 ${won(best20.bestTotalInterest)}, 가장 비싼 상품조차 ${won(r20.banks[r20.banks.length - 1].bestTotalInterest)}로, ${term(360)}의 가장 싼 상품보다 ${won(best30.bestTotalInterest - r20.banks[r20.banks.length - 1].bestTotalInterest)} 적습니다. ` +
      `금리 ${pp(worst30.bestRate - best30.bestRate)} 차이보다 기간 10년 차이가 총이자를 더 크게 움직입니다. ` +
      `다만 월 납입액은 ${ga(term(240))} ${ro(won(best20.bestMonthlyPayment))} ${term(360)} ${won(best30.bestMonthlyPayment)}보다 ${won(best20.bestMonthlyPayment - best30.bestMonthlyPayment)} 많으므로, 비교표에서 상품을 고르기 전에 기간 슬라이더를 먼저 움직여 보는 순서가 맞습니다.`,
  };
}

function amountScaling(): Finding {
  const r3 = compare();
  const r6 = compare({ loanAmount: 600_000_000 });
  const r1 = compare({ loanAmount: 100_000_000 });
  return {
    h2: `같은 금리 차라도 ${manwon(r1.loanAmount)}에서는 총이자 ${manwon(r1.totalInterestRange)}, ${manwon(r6.loanAmount)}에서는 ${manwon(r6.totalInterestRange)} 차이가 난다`,
    body:
      `가정 상품 세 개의 최저금리 차이 ${ga(pp(r3.banks[r3.banks.length - 1].bestRate - r3.banks[0].bestRate))} 만드는 총이자 격차는 대출액에 정비례합니다. ${manwon(r1.loanAmount)}이면 ${won(r1.totalInterestRange)}, ${manwon(r3.loanAmount)}이면 ${won(r3.totalInterestRange)}, ${manwon(r6.loanAmount)}이면 ${won(r6.totalInterestRange)}입니다(${term(N)} 원리금균등 가정). ` +
      `월 납입액 격차도 ${won(r1.monthlyPaymentRange)}·${won(r3.monthlyPaymentRange)}·${ro(won(r6.monthlyPaymentRange))} 같은 비례를 따릅니다. ` +
      `대출액이 클수록 금리 비교에 들이는 시간의 값어치가 커지고, ${manwon(r6.loanAmount)}에서는 상품 간 차이만으로 ${ga(manwon(r6.totalInterestRange))} 걸려 있습니다. ` +
      `반대로 ${manwon(r1.loanAmount)} 이하 소액이라면 ${pp(0.1)} 단위 비교보다 중도상환 조건이나 부대비용이 총액을 더 좌우할 수 있습니다.`,
  };
}

function interestOverPrincipal(): Finding {
  const rates = [3, 4, 5, 6];
  const rows = rates.map((r) => ({ r, plan: calcAnnuityPlan(P, r, N) }));
  let parity = 3;
  while (calcAnnuityPlan(P, fmt2(parity + 0.01), N).totalInterest < P && parity < 30) parity = fmt2(parity + 0.01);
  return {
    h2: `${term(N)} 원리금균등은 연 ${rate(parity)}부터 총이자가 원금을 넘는다`,
    body:
      `${manwon(P)}·${term(N)}·원리금균등(가정)의 총이자는 연 ${rate(rows[0].r)} ${won(rows[0].plan.totalInterest)}(원금의 ${pct(rows[0].plan.totalInterest / P, 0)}), ${rate(rows[1].r)} ${won(rows[1].plan.totalInterest)}(${pct(rows[1].plan.totalInterest / P, 0)}), ${rate(rows[2].r)} ${won(rows[2].plan.totalInterest)}(${pct(rows[2].plan.totalInterest / P, 0)}), ${rate(rows[3].r)} ${won(rows[3].plan.totalInterest)}(${pct(rows[3].plan.totalInterest / P, 0)})입니다. ` +
      `0.01%p 단위로 올려 보면 연 ${rate(parity)}에서 처음으로 총이자가 원금 ${eul(manwon(P))} 넘어섭니다. ` +
      `${term(240)}이라면 그 경계가 연 ${ro(rate((() => { let x = 3; while (calcAnnuityPlan(P, fmt2(x + 0.01), 240).totalInterest < P && x < 30) x = fmt2(x + 0.01); return x; })()))} 올라가 웬만한 금리에서는 이자가 원금을 넘지 않습니다. ` +
      `비교표의 총이자 열이 원금과 비슷한 크기로 보인다면 착시가 아니라 ${term(N)} 만기의 수학이며, 그 크기를 줄이는 지렛대는 금리보다 기간 쪽이 큽니다.`,
  };
}

export const MORTGAGE_COMPARE_DIGEST: Finding[] = [
  bestWorstRange(),
  withinOfferSpread(),
  methodOffsetsRate(),
  tenthPointLadder(),
  fixedVsVariableBuffer(),
  termSwap(),
  amountScaling(),
  interestOverPrincipal(),
];
