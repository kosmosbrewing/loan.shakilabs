// /dsr 파생 다이제스트 — DSR 한도는 "연소득 × 비율 − 기존 원리금"을 월로 나눈 뒤 원리금균등 역산한
// 값이라, 소득·기존부채·금리·기간·비율 다섯 축 어느 하나만 움직여도 한도가 얼마나 꺾이는지는
// 엔진(calcDsrLimit)을 전 구간 돌려야 보인다. 여기 수치는 전부 그 실행값이고 금리는 가정 파라미터다.

import { DEFAULT_DSR_INPUT } from "@/lib/validators";
import { calcDsrLimit } from "@/utils/calculator";
import { type Finding, eul, eun, ga, manwon, pct, pp, rate, ro, term, times, wa, won } from "./format";

const D = DEFAULT_DSR_INPUT; // 연소득 7,200만, 기존 원리금 840만, DSR 40%, 연 4.5%, 30년
const run = (patch: Partial<typeof D>) => calcDsrLimit({ ...D, ...patch });

function incomeSlope(): Finding {
  const base = run({});
  const plus = run({ annualIncome: D.annualIncome + 10_000_000 });
  const slope = plus.maxLoanAmount - base.maxLoanAmount;
  const zeroIncome = D.existingAnnualDebtService / D.dsrLimit;
  return {
    h2: `연소득 1,000만원은 한도 ${manwon(slope)}이고, 연소득 ${manwon(zeroIncome)} 아래에서는 한도가 0이다`,
    body:
      `연소득 ${manwon(D.annualIncome)}, 기존 연 원리금 ${manwon(D.existingAnnualDebtService)}, DSR ${pct(D.dsrLimit, 0)}, 연 ${rate(D.newLoanRate)}·${term(D.termMonths)}(가정)에서 신규 대출 한도는 ${won(base.maxLoanAmount)}입니다. ` +
      `연소득을 1,000만원 올리면 한도는 ${ro(won(plus.maxLoanAmount))} ${won(slope)} 늘고, 이 기울기는 소득이 얼마든 같습니다 — 한도가 소득의 1차식이기 때문입니다. ` +
      `거꾸로 소득이 ${manwon(zeroIncome)}까지 내려오면 허용 원리금(${pct(D.dsrLimit, 0)} × 소득)이 기존 원리금 ${wa(manwon(D.existingAnnualDebtService))} 같아져 한도가 정확히 0이 됩니다. ` +
      `현재 DSR ${pct(base.currentDsr)}에서 한도 ${pct(D.dsrLimit, 0)}까지 남은 ${ga(pp((D.dsrLimit - base.currentDsr) * 100))} 곧 연 ${won(base.allowedAnnualDebtService)}, 월 ${won(base.availableMonthlyBudget)}의 상환 여력입니다.`,
  };
}

function existingDebtCost(): Finding {
  const base = run({});
  const clean = run({ existingAnnualDebtService: 0 });
  const perMillion = (clean.maxLoanAmount - base.maxLoanAmount) / (D.existingAnnualDebtService / 1_000_000);
  return {
    h2: `기존 대출 연 원리금 100만원이 신규 한도 ${eul(manwon(perMillion))} 지운다`,
    body:
      `기존 연 원리금 ${ga(manwon(D.existingAnnualDebtService))} 없다면 같은 조건의 한도는 ${won(clean.maxLoanAmount)}인데, 있을 때는 ${ro(won(base.maxLoanAmount))} ${manwon(clean.maxLoanAmount - base.maxLoanAmount)} 줄어듭니다. ` +
      `연 원리금 100만원당 ${won(perMillion)}, 월 원리금으로 환산하면 매달 약 ${won(1_000_000 / 12)}씩 갚는 기존 대출 하나가 신규 한도 ${manwon(perMillion)}에 해당합니다. ` +
      `이 환산율은 신규 대출 금리·기간(연 ${rate(D.newLoanRate)}·${term(D.termMonths)} 가정)이 정하는 값이라, 기존 대출이 어떤 상품이든 "연 원리금 얼마"만 알면 됩니다. ` +
      `카드론이나 자동차 할부처럼 기간이 짧아 연 원리금이 큰 대출은 잔액 대비 한도 잠식이 크고, 상환해 없애면 그 ${manwon(perMillion)}/100만원 비율로 한도가 돌아옵니다.`,
  };
}

function termEffect(): Finding {
  const rows = [120, 240, 360, 480].map((termMonths) => ({ termMonths, r: run({ termMonths }) }));
  const [t10, t20, t30, t40] = rows;
  return {
    h2: `같은 월 상환 여력으로 ${term(t10.termMonths)}이면 ${manwon(t10.r.maxLoanAmount)}, ${term(t40.termMonths)}이면 ${manwon(t40.r.maxLoanAmount)}`,
    body:
      `월 상환 여력 ${won(t30.r.availableMonthlyBudget)}(가정 조건)은 기간에 따라 다른 원금으로 역산됩니다. 연 ${rate(D.newLoanRate)}에서 ${term(t10.termMonths)} ${won(t10.r.maxLoanAmount)}, ${term(t20.termMonths)} ${won(t20.r.maxLoanAmount)}, ${term(t30.termMonths)} ${won(t30.r.maxLoanAmount)}, ${term(t40.termMonths)} ${won(t40.r.maxLoanAmount)}입니다. ` +
      `${term(t10.termMonths)}에서 ${ro(term(t20.termMonths))} 늘릴 때 한도는 ${pct(t20.r.maxLoanAmount / t10.r.maxLoanAmount - 1)} 늘지만, ${term(t30.termMonths)}에서 ${ro(term(t40.termMonths))} 늘릴 때는 ${pct(t40.r.maxLoanAmount / t30.r.maxLoanAmount - 1)}만 늡니다. ` +
      `기간을 늘려 한도를 키우는 효과는 체감하고, 대신 ${term(t40.termMonths)}의 예상 총이자 ${eun(won(t40.r.estimatedTotalInterest))} ${term(t10.termMonths)}의 ${times(t40.r.estimatedTotalInterest, t10.r.estimatedTotalInterest)}입니다. ` +
      `한도가 ${manwon(t30.r.maxLoanAmount)}에서 모자라 ${eul(term(t40.termMonths))} 고민한다면, 늘어나는 한도 ${wa(manwon(t40.r.maxLoanAmount - t30.r.maxLoanAmount))} 늘어나는 이자 ${eul(manwon(t40.r.estimatedTotalInterest - t30.r.estimatedTotalInterest))} 나란히 놓고 봐야 합니다.`,
  };
}

function rateEffect(): Finding {
  const base = run({});
  const rows = [3.5, 5.5, 6.5, 7.5].map((newLoanRate) => ({ newLoanRate, r: run({ newLoanRate }) }));
  const per1p = (rows[0].r.maxLoanAmount - rows[1].r.maxLoanAmount) / 2;
  return {
    h2: `금리 1%p는 DSR 한도 약 ${manwon(per1p)}이다 — 스트레스 가산 3%p면 ${manwon(base.maxLoanAmount - rows[3].r.maxLoanAmount)}`,
    body:
      `월 상환 여력이 고정된 상태에서 금리만 바꾸면 한도가 움직입니다. 연 ${rate(rows[0].newLoanRate)}(가정)에서 ${won(rows[0].r.maxLoanAmount)}, 기준 ${rate(D.newLoanRate)}에서 ${won(base.maxLoanAmount)}, ${rate(rows[1].newLoanRate)}에서 ${won(rows[1].r.maxLoanAmount)}입니다. ` +
      `금리 1%p당 대략 ${manwon(per1p)}, 비율로는 ${pct(1 - rows[1].r.maxLoanAmount / base.maxLoanAmount)} 안팎씩 한도가 깎입니다. ` +
      `심사 금리에 가산금리를 얹는 방식을 흉내내 금리 입력을 1.5%p 올린 ${ro(rate(D.newLoanRate + 1.5))} 넣으면 ${won(run({ newLoanRate: D.newLoanRate + 1.5 }).maxLoanAmount)}, 3.0%p 올린 ${ro(rate(rows[3].newLoanRate))} 넣으면 ${won(rows[3].r.maxLoanAmount)}로, ` +
      `실제 이자는 ${ro(rate(D.newLoanRate))} 내더라도 한도는 ${manwon(base.maxLoanAmount - rows[3].r.maxLoanAmount)}(${pct(1 - rows[3].r.maxLoanAmount / base.maxLoanAmount)}) 줄어든 값으로 심사받는 셈입니다. 가산이 얼마인지는 이 계산기의 금리 입력에 직접 더해서 확인하세요.`,
  };
}

function dsrLimitOptions(): Finding {
  const rows = [0.4, 0.5, 0.6].map((dsrLimit) => ({ dsrLimit, r: run({ dsrLimit }) }));
  const [l40, l50, l60] = rows;
  return {
    h2: `DSR ${pct(l40.dsrLimit, 0)}→${eun(pct(l50.dsrLimit, 0))} 한도를 ${pct(l50.r.maxLoanAmount / l40.r.maxLoanAmount - 1)} 키운다 — 기존 부채가 있으면 비율 10%p의 값어치가 더 크다`,
    body:
      `같은 소득·기존부채(가정 조건)에서 DSR 비율만 ${pct(l40.dsrLimit, 0)}·${pct(l50.dsrLimit, 0)}·${ro(pct(l60.dsrLimit, 0))} 바꾸면 한도는 ${won(l40.r.maxLoanAmount)}, ${won(l50.r.maxLoanAmount)}, ${won(l60.r.maxLoanAmount)}입니다. ` +
      `비율 10%p당 연 허용 원리금이 ${manwon(D.annualIncome * 0.1)}씩 늘어 한도가 매번 ${manwon(l50.r.maxLoanAmount - l40.r.maxLoanAmount)}씩 같은 폭으로 커지지만, 비율로 보면 ${pct(l40.dsrLimit, 0)}→${eun(pct(l50.dsrLimit, 0))} ${pct(l50.r.maxLoanAmount / l40.r.maxLoanAmount - 1)}, ${pct(l50.dsrLimit, 0)}→${eun(pct(l60.dsrLimit, 0))} ${pct(l60.r.maxLoanAmount / l50.r.maxLoanAmount - 1)}입니다. ` +
      `기존 원리금 ${ga(manwon(D.existingAnnualDebtService))} ${pct(l40.dsrLimit, 0)} 허용액 ${manwon(D.annualIncome * l40.dsrLimit)}의 ${eul(pct(D.existingAnnualDebtService / (D.annualIncome * l40.dsrLimit)))} 이미 차지하고 있어서, 비율이 낮을수록 남는 여력의 상대 증가폭이 큽니다. ` +
      `기존 대출이 전혀 없다면 ${pct(l40.dsrLimit, 0)}→${pct(l50.dsrLimit, 0)}의 증가율은 정확히 ${ro(pct(0.25, 0))} 내려옵니다.`,
  };
}

function interestOfMaxLoan(): Finding {
  const base = run({});
  const r10 = run({ termMonths: 120 });
  return {
    h2: `한도를 꽉 채우면 ${term(D.termMonths)} 예상 총이자가 원금의 ${pct(base.estimatedTotalInterest / base.maxLoanAmount, 0)}다`,
    body:
      `한도 ${won(base.maxLoanAmount)}(가정 조건)을 전부 빌려 매달 ${won(base.availableMonthlyBudget)}씩 ${term(D.termMonths)} 갚으면 총상환액 ${won(base.estimatedTotalRepayment)}, 총이자 ${won(base.estimatedTotalInterest)}입니다. ` +
      `이자가 원금의 ${pct(base.estimatedTotalInterest / base.maxLoanAmount)}로, 빌린 돈의 ${eul(pct(base.estimatedTotalInterest / base.maxLoanAmount, 0))} 더 갚는 구조입니다. ` +
      `같은 월 상환액으로 ${eul(term(120))} 택하면 한도는 ${ro(won(r10.maxLoanAmount))} 줄지만 총이자는 ${won(r10.estimatedTotalInterest)}, 원금 대비 ${ro(pct(r10.estimatedTotalInterest / r10.maxLoanAmount))} 내려옵니다. ` +
      `DSR 계산기가 알려주는 "최대 한도"는 감당 가능한 상한이지 권장 금액이 아니며, 한도와 총이자 ${eun(manwon(base.estimatedTotalInterest))} 한 몸입니다.`,
  };
}

function incomeForTarget(): Finding {
  const targets = [200_000_000, 300_000_000, 500_000_000];
  const incomeFor = (target: number) => {
    let income = 0;
    while (run({ annualIncome: income }).maxLoanAmount < target && income < 1_000_000_000) income += 100_000;
    return income;
  };
  const rows = targets.map((t) => ({ t, income: incomeFor(t) }));
  const noDebt = (() => {
    let income = 0;
    while (run({ annualIncome: income, existingAnnualDebtService: 0 }).maxLoanAmount < targets[1] && income < 1_000_000_000) income += 100_000;
    return income;
  })();
  return {
    h2: `${eul(manwon(targets[1]))} 빌리려면 연소득 ${manwon(rows[1].income)}, 기존 부채가 없으면 ${manwon(noDebt)}`,
    body:
      `기존 연 원리금 ${manwon(D.existingAnnualDebtService)}, DSR ${pct(D.dsrLimit, 0)}, 연 ${rate(D.newLoanRate)}·${term(D.termMonths)}(가정)을 고정하고 소득을 10만원 단위로 올려 가며 한도를 다시 계산하면, ` +
      `${manwon(targets[0])}에는 연소득 ${manwon(rows[0].income)}, ${manwon(targets[1])}에는 ${manwon(rows[1].income)}, ${manwon(targets[2])}에는 ${ga(manwon(rows[2].income))} 처음으로 닿습니다. ` +
      `같은 ${manwon(targets[1])}이라도 기존 원리금이 0이면 필요한 소득이 ${ro(manwon(noDebt))} ${manwon(rows[1].income - noDebt)} 내려갑니다 — 기존 부채 ${ga(manwon(D.existingAnnualDebtService))} 연소득 ${wa(manwon(rows[1].income - noDebt))} 맞먹는 셈입니다. ` +
      `목표 금액이 정해져 있다면 소득을 올리는 것보다 기존 대출을 정리하는 쪽이 같은 효과를 내는 경우가 많습니다.`,
  };
}

function budgetPerLoan(): Finding {
  const base = run({});
  const perHundredMillion = base.availableMonthlyBudget / (base.maxLoanAmount / 100_000_000);
  const annualPer = perHundredMillion * 12;
  return {
    h2: `1억원을 새로 빌리면 DSR이 ${pp((annualPer / D.annualIncome) * 100)} 오른다`,
    body:
      `연 ${rate(D.newLoanRate)}·${term(D.termMonths)}(가정) 원리금균등이면 1억원당 월 원리금이 ${won(perHundredMillion)}, 연 ${won(annualPer)}입니다. ` +
      `연소득 ${manwon(D.annualIncome)}에서는 이 연 원리금이 소득의 ${pct(annualPer / D.annualIncome)}이므로, 1억원을 빌릴 때마다 DSR이 ${pp((annualPer / D.annualIncome) * 100)}씩 오릅니다. ` +
      `현재 DSR ${pct(base.currentDsr)}에서 출발해 ${pct(D.dsrLimit, 0)}에 닿기까지 남은 ${eul(pp((D.dsrLimit - base.currentDsr) * 100))} ${ro(pp((annualPer / D.annualIncome) * 100))} 나누면 ${times(base.maxLoanAmount, 100_000_000)}, 즉 한도 ${wa(manwon(base.maxLoanAmount))} 같은 답이 나옵니다. ` +
      `이 "1억원당 DSR"은 소득에 반비례해서 연소득 ${manwon(D.annualIncome * 2)}이면 ${ro(pp((annualPer / (D.annualIncome * 2)) * 100))} 절반이 됩니다.`,
  };
}

export const DSR_DIGEST: Finding[] = [
  incomeSlope(),
  existingDebtCost(),
  termEffect(),
  rateEffect(),
  dsrLimitOptions(),
  interestOfMaxLoan(),
  incomeForTarget(),
  budgetPerLoan(),
];
