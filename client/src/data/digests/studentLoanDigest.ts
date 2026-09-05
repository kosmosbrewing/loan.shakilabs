// /student-loan 파생 다이제스트 — 취업후상환의 의무상환은 "(소득 − 기준소득) × 상환율"이라 소득에
// 문턱과 기울기가 있고, 이자와 의무상환이 같아지는 소득 아래에서는 잔액이 오히려 는다.
// 엔진(calcStudentLoanRepayment)을 소득 10만원 단위로 훑고 해마다 다시 돌려 그 경계를 적는다.

import { DEFAULT_STUDENT_LOAN_INPUT } from "@/lib/validators";
import { calcStudentLoanRepayment } from "@/utils/loanExtraCalculator";
import { type Finding, eul, eun, ga, manwon, pct, pp, rate, ro, times, wa, won } from "./format";

const D = DEFAULT_STUDENT_LOAN_INPUT; // 잔액 2,800만, 소득 4,200만, 기준 3,037만, 20%, 자발 0, 1.7%
const run = (patch: Partial<typeof D>) => calcStudentLoanRepayment({ ...D, ...patch });

/** 소득이 고정일 때 해마다 엔진을 다시 돌려 잔액이 0이 되는 햇수 (상한 60년) */
export function yearsToClear(patch: Partial<typeof D>): number {
  let balance = patch.loanBalance ?? D.loanBalance;
  for (let year = 1; year <= 60; year += 1) {
    const r = run({ ...patch, loanBalance: balance });
    if (r.balanceAfterYear <= 0) return year;
    if (r.balanceAfterYear >= balance) return Number.POSITIVE_INFINITY;
    balance = r.balanceAfterYear;
  }
  return Number.POSITIVE_INFINITY;
}

/** 조건을 만족하는 최소 연소득 — 10만원 해상도 */
function incomeWhere(pred: (income: number) => boolean): number {
  let income = 0;
  while (income < 1_000_000_000 && !pred(income)) income += 100_000;
  return income;
}

function defaultYear(): Finding {
  const r = run({});
  return {
    h2: `연소득 ${manwon(D.annualIncome)}의 의무상환은 연 ${won(r.creditedMandatoryRepayment)}, 그중 이자가 ${pct(r.estimatedInterest / r.creditedMandatoryRepayment, 0)}다`,
    body:
      `잔액 ${manwon(D.loanBalance)}, 연소득 ${manwon(D.annualIncome)}, 상환기준소득 ${manwon(D.thresholdIncome)}, 상환율 ${pct(D.repaymentRate / 100, 0)}, 이자 연 ${rate(D.interestRate)}(가정)에서 기준 초과 소득은 ${won(r.baseExcessIncome)}이고 의무상환액은 그 ${pct(D.repaymentRate / 100, 0)}인 ${won(r.creditedMandatoryRepayment)}, 월 원천공제로는 ${won(r.monthlyWithholding)}입니다. ` +
      `그 해 이자는 ${won(r.estimatedInterest)}이라 의무상환의 ${ga(pct(r.estimatedInterest / r.creditedMandatoryRepayment))} 이자로 빠지고 원금은 ${won(r.creditedMandatoryRepayment - r.estimatedInterest)}만 줄어, 연말 잔액은 ${won(r.balanceAfterYear)}입니다. ` +
      `이 소득이 그대로라면 완납까지 ${yearsToClear({})}년이 걸립니다. ` +
      `월 ${ga(won(r.monthlyWithholding))} 크게 느껴지지 않는 이유는 상환율이 소득 전체가 아니라 기준 초과분에만 걸리기 때문이고, 같은 이유로 잔액이 줄어드는 속도도 느립니다.`,
  };
}

function interestParityIncome(): Finding {
  const parity = incomeWhere((income) => run({ annualIncome: income }).creditedMandatoryRepayment >= run({}).estimatedInterest);
  const below = run({ annualIncome: parity - 1_000_000 });
  return {
    h2: `연소득 ${manwon(parity)} 아래에서는 갚아도 잔액이 늘어난다`,
    body:
      `의무상환액이 그 해 이자 ${wa(won(run({}).estimatedInterest))} 같아지는 연소득은 ${manwon(parity)}입니다(가정 조건). 상환기준소득 ${manwon(D.thresholdIncome)}보다 ${manwon(parity - D.thresholdIncome)} 높은 지점이고, 이자를 상환율 ${ro(pct(D.repaymentRate / 100, 0))} 나눈 ${eul(manwon(run({}).estimatedInterest / (D.repaymentRate / 100)))} 기준소득에 더한 값입니다. ` +
      `그보다 ${manwon(1_000_000)} 낮은 연소득 ${manwon(parity - 1_000_000)}이면 의무상환 ${ro(won(below.creditedMandatoryRepayment))} 이자 ${won(below.estimatedInterest)}에 못 미쳐 연말 잔액이 ${ro(won(below.balanceAfterYear))} 출발 잔액보다 ${won(below.balanceAfterYear - D.loanBalance)} 늘어납니다. ` +
      `기준소득 이하라 의무상환이 0이면 잔액은 해마다 이자 ${won(run({}).estimatedInterest)}씩 그대로 불어납니다. ` +
      `이 구간에 있다면 소액이라도 자발 상환으로 이자만큼은 막는 것이 잔액 증가를 멈추는 유일한 방법입니다.`,
  };
}

function incomeLadder(): Finding {
  const rows = [42_000_000, 50_000_000, 60_000_000, 80_000_000].map((annualIncome) => ({ annualIncome, r: run({ annualIncome }), years: yearsToClear({ annualIncome }) }));
  return {
    h2: `연소득 ${manwon(rows[0].annualIncome)}이면 완납 ${rows[0].years}년, ${manwon(rows[3].annualIncome)}이면 ${rows[3].years}년`,
    body:
      `잔액 ${manwon(D.loanBalance)}(가정 조건)을 소득이 변하지 않는다고 놓고 해마다 다시 계산하면, 연소득 ${eun(manwon(rows[0].annualIncome))} 월 ${won(rows[0].r.monthlyWithholding)} 공제로 ${rows[0].years}년, ${eun(manwon(rows[1].annualIncome))} 월 ${ro(won(rows[1].r.monthlyWithholding))} ${rows[1].years}년, ${eun(manwon(rows[2].annualIncome))} 월 ${ro(won(rows[2].r.monthlyWithholding))} ${rows[2].years}년, ${eun(manwon(rows[3].annualIncome))} 월 ${ro(won(rows[3].r.monthlyWithholding))} ${rows[3].years}년입니다. ` +
      `소득이 ${pct(rows[3].annualIncome / rows[0].annualIncome - 1, 0)} 오를 때 의무상환은 ${ga(times(rows[3].r.creditedMandatoryRepayment, rows[0].r.creditedMandatoryRepayment))} 됩니다 — 기준소득을 뺀 초과분에 상환율이 걸려서 소득 증가율보다 상환액 증가율이 훨씬 가파릅니다. ` +
      `그래서 완납 기간은 소득이 조금만 올라도 크게 줄어들고, ${manwon(rows[0].annualIncome)}에서 ${ro(manwon(rows[1].annualIncome))} ${manwon(rows[1].annualIncome - rows[0].annualIncome)} 오르는 것만으로 ${rows[0].years - rows[1].years}년이 당겨집니다.`,
  };
}

function voluntaryOffset(): Finding {
  const base = run({});
  const v = run({ voluntaryRepayment: 1_000_000 });
  const full = run({ voluntaryRepayment: base.rawMandatoryRepayment });
  return {
    h2: `자발 상환 ${eun(manwon(1_000_000))} 의무상환을 ${won(base.creditedMandatoryRepayment - v.creditedMandatoryRepayment)} 줄일 뿐 총상환은 같다`,
    body:
      `연초에 ${eul(manwon(1_000_000))} 자발 상환하면(가정 조건) 의무상환은 ${won(base.creditedMandatoryRepayment)}에서 ${ro(won(v.creditedMandatoryRepayment))}, 월 공제는 ${won(base.monthlyWithholding)}에서 ${ro(won(v.monthlyWithholding))} 줄어듭니다. ` +
      `그러나 총상환은 ${won(base.totalRepayment)}에서 ${ro(won(v.totalRepayment))} 그대로이고 연말 잔액도 ${ro(won(v.balanceAfterYear))} 같습니다 — 자발 상환은 의무상환에 1:1로 상계되어 "먼저 내느냐 원천공제로 내느냐"만 바꿉니다. ` +
      `의무상환액 ${eul(won(base.rawMandatoryRepayment))} 자발로 전부 내면 원천공제는 ${ga(won(full.monthlyWithholding))} 됩니다. ` +
      `잔액을 실제로 더 빨리 줄이려면 자발 상환이 의무상환액을 넘어서야 하고, 그 초과분부터가 순수한 추가 상환입니다. 예를 들어 ${eul(manwon(5_000_000))} 내면 초과분 ${won(5_000_000 - base.rawMandatoryRepayment)}만큼 연말 잔액이 ${ro(won(run({ voluntaryRepayment: 5_000_000 }).balanceAfterYear))} 줄어듭니다.`,
  };
}

function rateSensitivity(): Finding {
  const rows = [1.7, 3, 5].map((interestRate) => ({ interestRate, r: run({ interestRate }), years: yearsToClear({ interestRate }) }));
  return {
    h2: `이자 연 ${wa(rate(rows[0].interestRate))} ${rate(rows[2].interestRate)}의 차이는 완납 ${rows[2].years - rows[0].years}년이다`,
    body:
      `연소득 ${manwon(D.annualIncome)}, 잔액 ${manwon(D.loanBalance)}(가정 조건)에서 이자율만 바꾸면 그 해 이자는 연 ${rate(rows[0].interestRate)} ${won(rows[0].r.estimatedInterest)}, ${rate(rows[1].interestRate)} ${won(rows[1].r.estimatedInterest)}, ${rate(rows[2].interestRate)} ${won(rows[2].r.estimatedInterest)}입니다. ` +
      `의무상환 ${eun(won(rows[0].r.creditedMandatoryRepayment))} 소득만으로 정해져 이자율과 무관하므로, 원금이 줄어드는 몫은 ${won(rows[0].r.creditedMandatoryRepayment - rows[0].r.estimatedInterest)}·${won(rows[1].r.creditedMandatoryRepayment - rows[1].r.estimatedInterest)}·${ro(won(rows[2].r.creditedMandatoryRepayment - rows[2].r.estimatedInterest))} 급격히 줄고 완납 기간은 ${rows[0].years}년·${rows[1].years}년·${rows[2].years}년으로 늘어납니다. ` +
      `이자율 ${pp(rows[2].interestRate - rows[0].interestRate)} 차이가 완납 ${rows[2].years - rows[0].years}년 차이가 되는 것은 상환액이 고정된 구조의 특징입니다. ` +
      `일반 대출이라면 금리 인상이 월 납입액을 올리지만, 취업후상환은 월 공제는 그대로 두고 기간을 늘리는 방식으로 부담이 옮겨갑니다.`,
  };
}

function thresholdSensitivity(): Finding {
  const base = run({});
  const up = run({ thresholdIncome: D.thresholdIncome + 1_000_000 });
  const perMillion = base.creditedMandatoryRepayment - up.creditedMandatoryRepayment;
  const zeroAt = incomeWhere((income) => run({ annualIncome: income }).creditedMandatoryRepayment > 0);
  return {
    h2: `상환기준소득 ${eun(manwon(1_000_000))} 의무상환 ${wa(won(perMillion))} 같다`,
    body:
      `상환기준소득이 ${manwon(D.thresholdIncome)}에서 ${ro(manwon(D.thresholdIncome + 1_000_000))} ${manwon(1_000_000)} 오르면(가정 조건) 기준 초과 소득이 ${won(base.baseExcessIncome)}에서 ${ro(won(up.baseExcessIncome))} 줄고 의무상환은 ${won(base.creditedMandatoryRepayment)}에서 ${ro(won(up.creditedMandatoryRepayment))} ${won(perMillion)} 내려갑니다. ` +
      `기준소득 ${manwon(1_000_000)}의 값어치가 상환액 ${won(perMillion)}인 것은 상환율 ${ga(pct(D.repaymentRate / 100, 0))} 곱해지기 때문이고, 소득 ${ga(manwon(1_000_000))} 오를 때 상환액이 ${won(perMillion)} 느는 것과 정확히 대칭입니다. ` +
      `의무상환이 처음 발생하는 연소득은 ${ro(manwon(zeroAt))} 기준소득 바로 위이며, 그 아래에서는 소득이 얼마든 원천공제가 0입니다. ` +
      `기준소득은 해마다 고시로 바뀌는 값이라 이 계산기에서는 입력값으로 두었고, 고시가 ${manwon(1_000_000)} 오르면 같은 소득에서 월 공제가 ${won(perMillion / 12)} 줄어든다고 읽으면 됩니다.`,
  };
}

function balanceScaling(): Finding {
  const rows = [14_000_000, 28_000_000, 56_000_000].map((loanBalance) => ({ loanBalance, r: run({ loanBalance }), years: yearsToClear({ loanBalance }) }));
  return {
    h2: `잔액이 두 배면 완납 기간은 두 배보다 길다 — ${manwon(rows[0].loanBalance)} ${rows[0].years}년, ${manwon(rows[2].loanBalance)} ${rows[2].years}년`,
    body:
      `연소득 ${manwon(D.annualIncome)}(가정 조건)의 의무상환 ${eun(won(rows[1].r.creditedMandatoryRepayment))} 잔액과 무관하게 같습니다. 그래서 잔액 ${eun(manwon(rows[0].loanBalance))} 첫해 이자 ${eul(won(rows[0].r.estimatedInterest))} 빼고 ${ga(won(rows[0].r.creditedMandatoryRepayment - rows[0].r.estimatedInterest))} 원금에서 줄지만, ${eun(manwon(rows[2].loanBalance))} 이자 ${eul(won(rows[2].r.estimatedInterest))} 빼면 ${won(rows[2].r.creditedMandatoryRepayment - rows[2].r.estimatedInterest)}만 줄어듭니다. ` +
      `완납까지는 ${manwon(rows[0].loanBalance)} ${rows[0].years}년, ${manwon(rows[1].loanBalance)} ${rows[1].years}년, ${manwon(rows[2].loanBalance)} ${rows[2].years}년으로, 잔액 4배에 기간은 ${times(rows[2].years, rows[0].years)}입니다. ` +
      `잔액이 클수록 상환액 중 이자 몫이 커져 원금 감소가 더디기 때문입니다. ` +
      `이자 연 ${ga(rate(D.interestRate))} 낮아 보여도 잔액이 ${manwon(rows[2].loanBalance)} 수준이면 첫해 상환액의 ${ga(pct(rows[2].r.estimatedInterest / rows[2].r.creditedMandatoryRepayment, 0))} 이자입니다.`,
  };
}

function fullPayoffIncome(): Finding {
  const base = run({});
  const cap = D.loanBalance + base.estimatedInterest;
  const payoff = incomeWhere((income) => run({ annualIncome: income }).totalRepayment >= cap);
  const r = run({ annualIncome: payoff });
  return {
    h2: `한 해에 전액 상환되는 연소득은 ${manwon(payoff)}이며, 그 위로는 소득이 올라도 상환액이 늘지 않는다`,
    body:
      `의무상환은 소득에 비례해 커지지만 잔액 ${wa(manwon(D.loanBalance))} 그 해 이자 ${eul(won(base.estimatedInterest))} 합한 ${eul(won(cap))} 넘을 수는 없습니다(가정 조건). ` +
      `이 상한에 처음 닿는 연소득은 ${manwon(payoff)}이고, 이때 계산상 의무상환 ${won(r.rawMandatoryRepayment)} 중 ${won(r.totalRepayment)}만 실제로 빠져나가 연말 잔액이 ${ga(won(r.balanceAfterYear))} 됩니다. ` +
      `이 지점은 상한 ${eul(won(cap))} 상환율 ${ro(pct(D.repaymentRate / 100, 0))} 나눈 ${manwon(cap / (D.repaymentRate / 100))}에 기준소득 ${eul(manwon(D.thresholdIncome))} 더한 값과 같습니다. ` +
      `기본 소득 ${manwon(D.annualIncome)}의 ${times(payoff, D.annualIncome)}에 해당하므로 대부분의 상환자에게 이 상한은 멀지만, 잔액이 ${manwon(5_000_000)} 정도로 작아지면 상한 소득도 ${manwon((5_000_000 * (1 + D.interestRate / 100)) / (D.repaymentRate / 100) + D.thresholdIncome)} 안팎으로 내려와 마지막 해에는 원천공제가 소득 계산치보다 적게 나옵니다.`,
  };
}

export const STUDENT_LOAN_DIGEST: Finding[] = [
  defaultYear(),
  interestParityIncome(),
  incomeLadder(),
  voluntaryOffset(),
  rateSensitivity(),
  thresholdSensitivity(),
  balanceScaling(),
  fullPayoffIncome(),
];
