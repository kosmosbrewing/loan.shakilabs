// /prepayment-fee 파생 다이제스트 — 수수료는 "(상환액 − 면제한도) × 요율 × 잔여/부과기간"이라
// 경과 개월·상환액·면제율 어느 축에서든 꺾이는 점이 있다. 엔진(calcPrepaymentFee)을 경과 0~36개월,
// 상환액 3천만~2억 전 구간 돌려 그 꺾임과, 수수료를 이자 절감으로 되찾는 손익분기를 적는다.

import { DEFAULT_PREPAYMENT_FEE_INPUT } from "@/lib/validators";
import { calcPrepaymentFee } from "@/utils/loanExtraCalculator";
import { type Finding, eul, eun, ga, manwon, num, pct, pp, rate, ro, term, times, wa, won } from "./format";

const D = DEFAULT_PREPAYMENT_FEE_INPUT; // 원금 3억, 상환 1억, 1.2%, 36개월, 경과 14, 면제 10%
const run = (patch: Partial<typeof D>) => calcPrepaymentFee({ ...D, ...patch });
// 이자 절감 비교용 가정 금리 — 이 페이지 계산기 입력에는 없어 산문에서 "가정"으로 명시한다
const ASSUMED_RATE = 4.2;
const monthlyInterestOn = (amount: number) => Math.round(amount * (ASSUMED_RATE / 100 / 12));

function defaultBreakdown(): Finding {
  const r = run({});
  return {
    h2: `${manwon(D.repaymentAmount)} 상환 수수료 ${eun(won(r.feeAmount))} 상환액의 ${pct(r.effectiveRate)}다 — 표면 요율 ${rate(D.feeRate)}의 ${pct(r.effectiveRate / (D.feeRate / 100), 0)}`,
    body:
      `원금 ${manwon(D.originalLoanAmount)}, 요율 ${rate(D.feeRate)}, 부과 기간 ${term(D.chargePeriodMonths)} 중 ${D.elapsedMonths}개월 경과, 연 면제 ${pct(D.annualFreeRate / 100, 0)}(가정)에서 ${eul(manwon(D.repaymentAmount))} 갚으면 수수료는 ${won(r.feeAmount)}입니다. ` +
      `면제 한도 ${won(r.freeQuota)}(원금의 ${pct(D.annualFreeRate / 100, 0)})만큼을 뺀 ${won(r.feeTargetAmount)}에만 요율이 붙고, 다시 잔여 ${r.remainingMonths}개월/${D.chargePeriodMonths}개월 = ${pct(r.remainingMonths / D.chargePeriodMonths)}만큼만 곱해집니다. ` +
      `그래서 실효 요율은 ${ro(pct(r.effectiveRate))} 표면 요율의 ${pct(r.effectiveRate / (D.feeRate / 100))}에 그칩니다. ` +
      `약정서의 "${rate(D.feeRate)}"만 보고 ${eul(manwon(D.repaymentAmount * D.feeRate / 100))} 예상했다면 실제는 그 ${pct(r.feeAmount / (D.repaymentAmount * D.feeRate / 100))}입니다.`,
  };
}

function elapsedSlope(): Finding {
  const rows = [0, 12, 24, 35].map((elapsedMonths) => ({ elapsedMonths, r: run({ elapsedMonths }) }));
  const perMonth = rows[0].r.feeAmount / D.chargePeriodMonths;
  return {
    h2: `수수료는 매달 ${won(perMonth)}씩 줄어 ${D.chargePeriodMonths}개월째 0이 된다`,
    body:
      `같은 ${manwon(D.repaymentAmount)} 상환(가정 조건)의 수수료는 실행 직후 ${won(rows[0].r.feeAmount)}, ${rows[1].elapsedMonths}개월 뒤 ${won(rows[1].r.feeAmount)}, ${rows[2].elapsedMonths}개월 뒤 ${won(rows[2].r.feeAmount)}, ${rows[3].elapsedMonths}개월 뒤 ${won(rows[3].r.feeAmount)}이고 ${D.chargePeriodMonths}개월째부터 0입니다. ` +
      `감소폭은 매달 정확히 ${ro(won(perMonth))} 일정합니다 — 잔여 기간에 정비례하는 직선이라 "초반에 급하게 줄고 나중에 완만해지는" 구조가 아닙니다. ` +
      `한 달을 기다리는 값어치가 ${won(perMonth)}이니, 그 한 달 동안 ${manwon(D.repaymentAmount)}에 붙는 이자(연 ${rate(ASSUMED_RATE)} 가정 시 ${won(monthlyInterestOn(D.repaymentAmount))})와 비교하면 기다림이 이기는 경우가 없습니다. ` +
      `수수료가 0이 되는 ${D.chargePeriodMonths}개월째까지 기다려서 얻는 ${won(rows[0].r.feeAmount - rows[3].r.feeAmount + perMonth)} 전액도 그 사이 이자 ${won(monthlyInterestOn(D.repaymentAmount) * D.chargePeriodMonths)}의 ${pct(rows[0].r.feeAmount / (monthlyInterestOn(D.repaymentAmount) * D.chargePeriodMonths))}에 불과합니다.`,
  };
}

function waitingBreakEvenRate(): Finding {
  const perMonth = run({ elapsedMonths: 0 }).feeAmount / D.chargePeriodMonths;
  const breakEvenRate = (perMonth * 12) / D.repaymentAmount * 100;
  const fee = run({}).feeAmount;
  const monthsToRecover = fee / monthlyInterestOn(D.repaymentAmount);
  return {
    h2: `지금 갚는 수수료 ${eun(won(fee))} 이자 ${num(monthsToRecover, 1)}개월치로 돌아온다`,
    body:
      `${eul(manwon(D.repaymentAmount))} ${D.elapsedMonths}개월째에 갚으면 수수료 ${ga(won(fee))} 붙지만(가정 조건), 갚지 않고 두면 그 ${manwon(D.repaymentAmount)}에 연 ${rate(ASSUMED_RATE)}(가정) 이자가 월 ${won(monthlyInterestOn(D.repaymentAmount))}씩 붙습니다. ` +
      `수수료는 이자 ${num(monthsToRecover, 1)}개월치이므로 상환 ${Math.ceil(monthsToRecover)}개월 뒤부터는 갚은 쪽이 이깁니다. ` +
      `한 달 기다려 아끼는 수수료 ${ga(won(perMonth))} 한 달 이자보다 커지려면 대출 금리가 연 ${rate(breakEvenRate)} 아래여야 하고, 그런 금리에서는 애초에 조기상환의 실익이 없습니다. ` +
      `즉 요율 ${rate(D.feeRate)}·부과 ${term(D.chargePeriodMonths)} 구조에서는 "수수료 면제 시점까지 기다린다"가 이기는 금리 구간이 사실상 존재하지 않습니다.`,
  };
}

function amountEffect(): Finding {
  const rows = [30_000_000, 50_000_000, 100_000_000, 200_000_000].map((repaymentAmount) => ({ repaymentAmount, r: run({ repaymentAmount }) }));
  const ceiling = (D.feeRate / 100) * (run({}).remainingMonths / D.chargePeriodMonths);
  return {
    h2: `${manwon(rows[0].repaymentAmount)}까지는 수수료 0, ${manwon(rows[3].repaymentAmount)}이면 실효 ${pct(rows[3].r.effectiveRate)}`,
    body:
      `연 면제 한도 ${manwon(run({}).freeQuota)}(가정 조건) 이내인 ${eun(manwon(rows[0].repaymentAmount))} 수수료가 ${won(rows[0].r.feeAmount)}입니다. ` +
      `${manwon(rows[1].repaymentAmount)}이면 ${won(rows[1].r.feeAmount)}(실효 ${pct(rows[1].r.effectiveRate)}), ${manwon(rows[2].repaymentAmount)}이면 ${won(rows[2].r.feeAmount)}(${pct(rows[2].r.effectiveRate)}), ${manwon(rows[3].repaymentAmount)}이면 ${won(rows[3].r.feeAmount)}(${pct(rows[3].r.effectiveRate)})입니다. ` +
      `상환액이 커질수록 면제 한도의 비중이 줄어 실효 요율은 ${pct(ceiling)}(요율 ${rate(D.feeRate)} × 잔여 ${pct(run({}).remainingMonths / D.chargePeriodMonths, 0)})를 향해 올라가지만 그 값을 넘지는 못합니다. ` +
      `${manwon(rows[1].repaymentAmount)}에서 ${ro(manwon(rows[2].repaymentAmount))} 두 배로 늘릴 때 수수료는 ${ga(times(rows[2].r.feeAmount, rows[1].r.feeAmount))} 됩니다 — 면제분이 앞 ${manwon(rows[0].repaymentAmount)}에 먼저 소진되기 때문입니다.`,
  };
}

function chargePeriodEffect(): Finding {
  const rows = [12, 24, 36, 60].map((chargePeriodMonths) => ({ chargePeriodMonths, r: run({ chargePeriodMonths }) }));
  return {
    h2: `같은 ${D.elapsedMonths}개월 경과라도 부과 기간이 ${term(rows[0].chargePeriodMonths)}이면 0원, ${term(rows[3].chargePeriodMonths)}이면 ${won(rows[3].r.feeAmount)}`,
    body:
      `요율 ${rate(D.feeRate)}, ${manwon(D.repaymentAmount)} 상환, ${D.elapsedMonths}개월 경과(가정)를 고정하고 부과 기간만 바꾸면 수수료는 ${term(rows[0].chargePeriodMonths)} ${won(rows[0].r.feeAmount)}, ${term(rows[1].chargePeriodMonths)} ${won(rows[1].r.feeAmount)}, ${term(rows[2].chargePeriodMonths)} ${won(rows[2].r.feeAmount)}, ${term(rows[3].chargePeriodMonths)} ${won(rows[3].r.feeAmount)}입니다. ` +
      `잔여 개월이 각각 ${rows[0].r.remainingMonths}·${rows[1].r.remainingMonths}·${rows[2].r.remainingMonths}·${rows[3].r.remainingMonths}개월이고 그 잔여를 부과 기간으로 나눈 비율이 ${pct(rows[1].r.remainingMonths / rows[1].chargePeriodMonths, 0)}·${pct(rows[2].r.remainingMonths / rows[2].chargePeriodMonths, 0)}·${ro(pct(rows[3].r.remainingMonths / rows[3].chargePeriodMonths, 0))} 올라가기 때문입니다. ` +
      `부과 기간 ${eun(term(rows[3].chargePeriodMonths))} ${term(rows[2].chargePeriodMonths)}보다 잔여 개월이 ${rows[3].r.remainingMonths - rows[2].r.remainingMonths}개월 길지만 수수료는 ${pct(rows[3].r.feeAmount / rows[2].r.feeAmount - 1)}만 많습니다. ` +
      `약정서에서 요율 숫자와 함께 반드시 봐야 할 것이 "부과 기간"이고, 같은 ${rate(D.feeRate)}라도 기간에 따라 실효 부담이 ${times(rows[3].r.effectiveRate, rows[1].r.effectiveRate)}까지 벌어집니다.`,
  };
}

function feeRateEffect(): Finding {
  const rows = [0.5, 1, 1.2, 1.5].map((feeRate) => ({ feeRate, r: run({ feeRate }) }));
  const perTenth = (rows[3].r.feeAmount - rows[0].r.feeAmount) / ((rows[3].feeRate - rows[0].feeRate) * 10);
  return {
    h2: `요율 0.1%p는 이 조건에서 수수료 ${won(perTenth)}이다`,
    body:
      `${manwon(D.repaymentAmount)} 상환, ${D.elapsedMonths}개월 경과, 면제 ${pct(D.annualFreeRate / 100, 0)}(가정)에서 요율 ${rate(rows[0].feeRate)}이면 ${won(rows[0].r.feeAmount)}, ${rate(rows[1].feeRate)}이면 ${won(rows[1].r.feeAmount)}, ${rate(rows[2].feeRate)}이면 ${won(rows[2].r.feeAmount)}, ${rate(rows[3].feeRate)}이면 ${won(rows[3].r.feeAmount)}입니다. ` +
      `요율에 정비례해 0.1%p당 ${won(perTenth)}이고, 이는 상환액의 ${pct(perTenth / D.repaymentAmount, 3)}입니다. ` +
      `요율 ${wa(rate(rows[3].feeRate))} ${rate(rows[0].feeRate)}의 차이 ${ga(pp(rows[3].feeRate - rows[0].feeRate))} 수수료로는 ${won(rows[3].r.feeAmount - rows[0].r.feeAmount)}, ${manwon(D.repaymentAmount)}에 연 ${rate(ASSUMED_RATE)}(가정) 이자 ${num((rows[3].r.feeAmount - rows[0].r.feeAmount) / monthlyInterestOn(D.repaymentAmount), 1)}개월치입니다. ` +
      `대출을 고를 때 금리 0.1%p는 30년 내내 붙지만 중도상환 요율 0.1%p는 부과 기간 안에 갚을 때만, 그것도 잔여 비율만큼만 붙습니다. 조기상환 계획이 없다면 요율보다 금리를 우선하는 근거입니다.`,
  };
}

function freeRateEffect(): Finding {
  const rows = [0, 10, 30].map((annualFreeRate) => ({ annualFreeRate, r: run({ annualFreeRate }) }));
  let zeroAt = 0;
  while (zeroAt <= 100 && run({ annualFreeRate: zeroAt }).feeAmount > 0) zeroAt += 1;
  return {
    h2: `면제율 ${eun(pct(rows[1].annualFreeRate / 100, 0))} 수수료를 ${pct(1 - rows[1].r.feeAmount / rows[0].r.feeAmount, 0)} 깎고, ${pct(zeroAt / 100, 0)}부터는 0이다`,
    body:
      `${manwon(D.repaymentAmount)} 상환(가정 조건)에 연 면제율이 없으면 수수료 ${won(rows[0].r.feeAmount)}, ${pct(rows[1].annualFreeRate / 100, 0)}이면 ${won(rows[1].r.feeAmount)}, ${pct(rows[2].annualFreeRate / 100, 0)}이면 ${won(rows[2].r.feeAmount)}입니다. ` +
      `면제분은 원금 ${manwon(D.originalLoanAmount)} 기준이라 상환액 ${manwon(D.repaymentAmount)}의 ${pct(rows[1].r.freeQuota / D.repaymentAmount, 0)}·${ga(pct(rows[2].r.freeQuota / D.repaymentAmount, 0))} 잘려 나가고, 원금의 ${pct(zeroAt / 100, 0)} 이상 면제되면 ${manwon(D.repaymentAmount)} 전액이 면제 안에 들어와 수수료가 0이 됩니다. ` +
      `면제 ${ga(pct(rows[1].annualFreeRate / 100, 0))} 깎는 ${eun(won(rows[0].r.feeAmount - rows[1].r.feeAmount))} 요율을 ${pp((rows[0].r.feeAmount - rows[1].r.feeAmount) / rows[0].r.feeAmount * D.feeRate)} 낮추는 것과 같습니다. ` +
      `면제 한도는 보통 매년 새로 생기므로, 한 번에 ${eul(manwon(D.repaymentAmount))} 갚는 대신 한도 ${manwon(rows[1].r.freeQuota)} 이내로 해마다 나눠 갚으면 이 계산기 기준으로는 매번 0원입니다 — 다만 그 사이 붙는 이자는 별도입니다.`,
  };
}

function lastMonthCliff(): Finding {
  const r35 = run({ elapsedMonths: 35 });
  const r36 = run({ elapsedMonths: 36 });
  const r0 = run({ elapsedMonths: 0 });
  return {
    h2: `${D.chargePeriodMonths - 1}개월째 ${won(r35.feeAmount)}, ${D.chargePeriodMonths}개월째 ${won(r36.feeAmount)} — 마지막 한 달의 값어치는 실행 직후 수수료의 ${pct(r35.feeAmount / r0.feeAmount)}`,
    body:
      `부과 기간 ${term(D.chargePeriodMonths)}(가정 조건)의 끝자락에서 ${D.chargePeriodMonths - 1}개월째 ${eul(manwon(D.repaymentAmount))} 갚으면 수수료는 ${won(r35.feeAmount)}, 딱 한 달 뒤인 ${D.chargePeriodMonths}개월째면 ${won(r36.feeAmount)}입니다. ` +
      `이 한 달을 기다리는 값어치 ${eun(won(r35.feeAmount))} 실행 직후 수수료 ${won(r0.feeAmount)}의 ${pct(r35.feeAmount / r0.feeAmount)}이고, ${manwon(D.repaymentAmount)}의 한 달 이자(연 ${rate(ASSUMED_RATE)} 가정) ${won(monthlyInterestOn(D.repaymentAmount))}의 ${pct(r35.feeAmount / monthlyInterestOn(D.repaymentAmount))}입니다. ` +
      `"만기 직전이니 한 달만 참자"는 이자 ${eul(won(monthlyInterestOn(D.repaymentAmount)))} 내고 수수료 ${eul(won(r35.feeAmount))} 아끼는 거래라 손해입니다. ` +
      `경과 개월이 부과 기간을 넘으면 잔여가 ${r36.remainingMonths}개월로 계산되어 어떤 상환액이든 0원이며, 그 시점 이후의 조기상환에는 이 계산기가 필요 없습니다.`,
  };
}

export const PREPAYMENT_DIGEST: Finding[] = [
  defaultBreakdown(),
  elapsedSlope(),
  waitingBreakEvenRate(),
  amountEffect(),
  chargePeriodEffect(),
  feeRateEffect(),
  freeRateEffect(),
  lastMonthCliff(),
];
