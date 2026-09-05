// /jeonse-loan 파생 다이제스트 — 전세대출은 거치식(이자만) 아니면 원리금균등이라, 두 방식의 총이자 비율은
// 기간의 함수로 딱 떨어지고 갱신 횟수에 따라 누적 이자가 어떻게 벌어지는지도 순수 계산이다.
// 엔진(calcJeonseLoan)을 보증금 1~5억, 기간 12~120개월, 금리 2~6% 전 구간 돌린 값만 적는다.
// 상품별 비교 행(정책 금리)은 근거로 쓰지 않는다.

import { DEFAULT_JEONSE_LOAN_INPUT } from "@/lib/validators";
import { calcJeonseLoan } from "@/utils/loanExtraCalculator";
import { type Finding, eul, eun, ga, manwon, pct, pp, rate, ro, term, times, wa, won } from "./format";

const D = DEFAULT_JEONSE_LOAN_INPUT; // 2억, 3.5%, 24개월, 거치식
const run = (patch: Partial<typeof D>) => calcJeonseLoan({ ...D, ...patch });
const fmt2 = (v: number) => Number(v.toFixed(2));

function defaultCase(): Finding {
  const io = run({});
  const an = run({ isInterestOnly: false });
  return {
    h2: `거치식 월 ${won(io.monthlyInterest)} 대 원리금균등 월 ${won(an.monthlyPayment)} — 총이자 차이는 ${manwon(io.totalInterest - an.totalInterest)}`,
    body:
      `보증금 ${manwon(D.depositAmount)}, 연 ${rate(D.annualRate)}, ${term(D.termMonths)}(가정)에서 이자만 내는 거치식은 매달 ${won(io.monthlyInterest)}, 총이자 ${won(io.totalInterest)}이고, 원리금균등은 매달 ${won(an.monthlyPayment)}, 총이자 ${won(an.totalInterest)}입니다. ` +
      `원리금균등이 이자를 ${won(io.totalInterest - an.totalInterest)} 덜 내지만 매달 ${won(an.monthlyPayment - io.monthlyInterest)}씩 원금을 함께 갚아야 하므로, 월 부담은 거치식의 ${times(an.monthlyPayment, io.monthlyInterest)}입니다. ` +
      `만기에 보증금을 돌려받아 원금을 갚는 전세의 구조에서는 거치식이 표준이고, 원리금균등은 ${term(D.termMonths)} 안에 ${eul(manwon(D.depositAmount))} 소득으로 갚을 수 있을 때만 선택지가 됩니다. ` +
      `거치식 총이자 ${eun(won(io.totalInterest))} 보증금의 ${pct(io.totalInterest / D.depositAmount)}로, 2년 동안 보증금의 ${eul(pct(io.totalInterest / D.depositAmount, 0))} 집주인이 아닌 은행에 내는 셈입니다.`,
  };
}

function annuityRatioByTerm(): Finding {
  const rows = [12, 24, 60, 120].map((termMonths) => {
    const io = run({ termMonths });
    const an = run({ termMonths, isInterestOnly: false });
    return { termMonths, ratio: an.totalInterest / io.totalInterest };
  });
  const lo = rows.reduce((a, b) => (b.ratio < a.ratio ? b : a));
  const hi = rows.reduce((a, b) => (b.ratio > a.ratio ? b : a));
  return {
    h2: `원리금균등 총이자는 기간이 ${term(rows[0].termMonths)}이든 ${term(rows[3].termMonths)}이든 거치식의 ${pct(lo.ratio, 0)}~${pct(hi.ratio, 0)}에 머문다`,
    body:
      `같은 보증금·금리(가정)에서 원리금균등 총이자를 거치식 총이자로 나눈 비율은 ${term(rows[0].termMonths)} ${pct(rows[0].ratio)}, ${term(rows[1].termMonths)} ${pct(rows[1].ratio)}, ${term(rows[2].termMonths)} ${pct(rows[2].ratio)}, ${term(rows[3].termMonths)} ${pct(rows[3].ratio)}입니다. ` +
      `원금이 매달 균등하게 줄면 평균 잔액이 절반 근처가 되기 때문에 비율이 어느 기간이든 절반을 조금 넘는 데서 멈춥니다. ` +
      `이 비율은 보증금 크기와 무관하고 금리에도 둔감해서, 연 ${rate(2)}로 낮춰도 ${term(rows[1].termMonths)} 비율은 ${pct(calcRatio(2, rows[1].termMonths))}, 연 ${rate(6)}로 올려도 ${pct(calcRatio(6, rows[1].termMonths))}입니다. ` +
      `"원리금균등으로 바꾸면 이자를 절반 아낀다"는 말은 이 계산에서 ${pct(1 - rows[1].ratio, 0)} 안팎으로 맞지만, 그 대가로 매달 원금을 갚아야 하므로 절감의 크기가 아니라 월 부담을 감당할 수 있느냐가 선택 기준입니다.`,
  };
}

function calcRatio(annualRate: number, termMonths: number): number {
  return run({ annualRate, termMonths, isInterestOnly: false }).totalInterest / run({ annualRate, termMonths }).totalInterest;
}

function tenthPointPerDeposit(): Finding {
  const base = run({});
  const up = run({ annualRate: fmt2(D.annualRate + 0.1) });
  const perHundred = (up.monthlyInterest - base.monthlyInterest) / (D.depositAmount / 100_000_000);
  return {
    h2: `금리 0.1%p는 보증금 1억원당 월 ${won(perHundred)}, 2년 ${won(perHundred * 24)}이다`,
    body:
      `거치식(가정 조건)에서 금리를 ${rate(D.annualRate)}에서 ${ro(rate(fmt2(D.annualRate + 0.1)))} 0.1%p 올리면 월 이자는 ${won(base.monthlyInterest)}에서 ${ro(won(up.monthlyInterest))} ${won(up.monthlyInterest - base.monthlyInterest)} 늘고, ${term(D.termMonths)} 합계로 ${won(up.totalInterest - base.totalInterest)} 늘어납니다. ` +
      `보증금 1억원당으로 환산하면 월 ${won(perHundred)}, 2년 ${won(perHundred * 24)}이라 보증금에 정비례합니다. ` +
      `연 ${wa(rate(D.annualRate))} ${rate(fmt2(D.annualRate + 1))}처럼 ${pp(1)} 차이면 ${manwon(D.depositAmount)}에서 2년 ${ga(won(run({ annualRate: fmt2(D.annualRate + 1) }).totalInterest - base.totalInterest))} 갈립니다. ` +
      `주담대와 달리 전세대출은 원금이 그대로라 금리 차가 기간 내내 100% 반영되고, 그래서 우대 조건 ${pp(0.1)}의 값어치가 같은 금액의 원리금균등 대출보다 큽니다.`,
  };
}

function renewalAccumulation(): Finding {
  const twoYears = run({ termMonths: 24 });
  const rows = [1, 2, 3, 4].map((n) => ({ n, total: twoYears.totalInterest * n }));
  const eightAnnuity = run({ termMonths: 96, isInterestOnly: false });
  return {
    h2: `2년 계약을 네 번 갱신하면 누적 이자 ${manwon(rows[3].total)}, 보증금의 ${pct(rows[3].total / D.depositAmount, 0)}`,
    body:
      `보증금 ${manwon(D.depositAmount)}, 연 ${rate(D.annualRate)}(가정) 거치식의 2년 이자 ${ga(won(twoYears.totalInterest))} 갱신마다 그대로 반복되면 누적 이자는 1회 ${won(rows[0].total)}, 2회 ${won(rows[1].total)}, 3회 ${won(rows[2].total)}, 4회 ${won(rows[3].total)}입니다. ` +
      `8년이면 보증금의 ${eul(pct(rows[3].total / D.depositAmount))} 이자로 낸 셈이고, 같은 8년을 원리금균등으로 갚았다면 총이자가 ${ro(won(eightAnnuity.totalInterest))} ${won(rows[3].total - eightAnnuity.totalInterest)} 적었을 것입니다. ` +
      `다만 원리금균등 8년은 매달 ${eul(won(eightAnnuity.monthlyPayment))} 내야 하고 거치식은 ${won(twoYears.monthlyInterest)}이라, 차액 ${eul(won(eightAnnuity.monthlyPayment - twoYears.monthlyInterest))} 저축한다고 가정해야 공정한 비교입니다. ` +
      `거치식 이자는 만기가 아무리 길어져도 원금을 줄이지 않으므로, 갱신 횟수가 늘수록 "돌려받을 보증금"과 "이미 낸 이자"의 비율이 이렇게 올라갑니다.`,
  };
}

function rentEquivalence(): Finding {
  const base = run({});
  const rents = [500_000, 700_000, 1_000_000];
  const rows = rents.map((rent) => ({ rent, rateAt: fmt2((rent * 12) / D.depositAmount * 100) }));
  return {
    h2: `보증금 ${manwon(D.depositAmount)} 거치식 이자 ${eun(won(base.monthlyInterest))} 월세 ${won(rows[0].rent)}~${won(rows[1].rent)} 사이에 있다`,
    body:
      `연 ${rate(D.annualRate)}(가정)에서 ${manwon(D.depositAmount)}의 월 이자는 ${won(base.monthlyInterest)}입니다. 같은 집의 월세가 ${won(rows[0].rent)}이면 이자가 ${won(base.monthlyInterest - rows[0].rent)} 더 들고, ${won(rows[1].rent)}이면 월세가 ${won(rows[1].rent - base.monthlyInterest)} 더 듭니다. ` +
      `월세와 이자가 같아지는 금리는 월세 ${won(rows[0].rent)} 기준 연 ${rate(rows[0].rateAt)}, ${won(rows[1].rent)} 기준 ${rate(rows[1].rateAt)}, ${won(rows[2].rent)} 기준 ${rate(rows[2].rateAt)}입니다 — 월세 × 12 ÷ 보증금이라는 단순한 식입니다. ` +
      `이 계산은 보증금 전액을 대출로 조달했다고 놓은 것이라, 자기 자금이 절반이면 이자는 절반이 되고 대신 그 돈의 기회비용이 들어옵니다. ` +
      `전세 대 월세 판단에서 대출 금리와 월세 전환 금리를 같은 단위(연 %)로 나란히 놓는 것이 이 페이지 계산기의 실제 용도입니다.`,
  };
}

function depositLadder(): Finding {
  const rows = [100_000_000, 200_000_000, 300_000_000, 500_000_000].map((depositAmount) => ({ depositAmount, r: run({ depositAmount }) }));
  return {
    h2: `보증금 ${manwon(rows[0].depositAmount)}당 월 이자 ${won(rows[0].r.monthlyInterest)} — ${manwon(rows[3].depositAmount)}이면 ${won(rows[3].r.monthlyInterest)}`,
    body:
      `연 ${rate(D.annualRate)} 거치식(가정)의 월 이자는 보증금 ${manwon(rows[0].depositAmount)} ${won(rows[0].r.monthlyInterest)}, ${manwon(rows[1].depositAmount)} ${won(rows[1].r.monthlyInterest)}, ${manwon(rows[2].depositAmount)} ${won(rows[2].r.monthlyInterest)}, ${manwon(rows[3].depositAmount)} ${ro(won(rows[3].r.monthlyInterest))} 정확히 정비례합니다. ` +
      `2년 총이자도 ${won(rows[0].r.totalInterest)}·${won(rows[1].r.totalInterest)}·${won(rows[2].r.totalInterest)}·${won(rows[3].r.totalInterest)}입니다. ` +
      `보증금 ${eul(manwon(100_000_000))} 더 올리는 것은 월 ${won(rows[0].r.monthlyInterest)}, 2년 ${eul(won(rows[0].r.totalInterest))} 더 내는 결정이고, 같은 ${eul(manwon(100_000_000))} 월세로 돌리면(월세 전환 연 ${rate(5)} 가정) 월 ${won(100_000_000 * 0.05 / 12)}입니다. ` +
      `이 두 수의 차이 ${ga(won(100_000_000 * 0.05 / 12 - rows[0].r.monthlyInterest))} "보증금을 올리고 월세를 낮추는" 반전세 협상의 손익이며, 대출 금리가 전환 금리보다 낮은 동안은 보증금을 올리는 쪽이 유리합니다.`,
  };
}

function shortTermAnnuityBurden(): Finding {
  const an12 = run({ termMonths: 12, isInterestOnly: false });
  const an24 = run({ termMonths: 24, isInterestOnly: false });
  const io24 = run({ termMonths: 24 });
  return {
    h2: `${term(12)} 원리금균등은 월 ${won(an12.monthlyPayment)} — 거치식 이자의 ${times(an12.monthlyPayment, io24.monthlyInterest, 0)}`,
    body:
      `보증금 ${manwon(D.depositAmount)}, 연 ${rate(D.annualRate)}(가정)을 ${term(12)} 원리금균등으로 갚으면 월 ${won(an12.monthlyPayment)}, ${term(24)}이면 월 ${won(an24.monthlyPayment)}입니다. 거치식 월 이자 ${won(io24.monthlyInterest)}의 각각 ${times(an12.monthlyPayment, io24.monthlyInterest)}, ${times(an24.monthlyPayment, io24.monthlyInterest)}입니다. ` +
      `그 대가로 줄어드는 이자는 ${term(12)} ${won(run({ termMonths: 12 }).totalInterest - an12.totalInterest)}, ${term(24)} ${won(io24.totalInterest - an24.totalInterest)}뿐입니다. ` +
      `월 ${eul(won(an24.monthlyPayment - io24.monthlyInterest))} 더 내서 2년에 ${eul(won(io24.totalInterest - an24.totalInterest))} 아끼는 교환이므로, 추가 납입액 대비 절감 비율은 ${pct((io24.totalInterest - an24.totalInterest) / ((an24.monthlyPayment - io24.monthlyInterest) * 24))}입니다. ` +
      `나머지 ${eun(pct(1 - (io24.totalInterest - an24.totalInterest) / ((an24.monthlyPayment - io24.monthlyInterest) * 24)))} 이자 절감이 아니라 원금 상환이고, 그 원금은 만기에 보증금으로 돌려받을 돈입니다.`,
  };
}

function rateLadder(): Finding {
  const rows = [2, 3.5, 5, 6].map((annualRate) => ({ annualRate, r: run({ annualRate }) }));
  return {
    h2: `연 ${wa(rate(rows[0].annualRate))} ${rate(rows[3].annualRate)}의 2년 이자 차이는 ${manwon(rows[3].r.totalInterest - rows[0].r.totalInterest)}, 보증금의 ${pct((rows[3].r.totalInterest - rows[0].r.totalInterest) / D.depositAmount, 0)}`,
    body:
      `보증금 ${manwon(D.depositAmount)}, ${term(D.termMonths)} 거치식(가정)의 총이자는 연 ${rate(rows[0].annualRate)} ${won(rows[0].r.totalInterest)}, ${rate(rows[1].annualRate)} ${won(rows[1].r.totalInterest)}, ${rate(rows[2].annualRate)} ${won(rows[2].r.totalInterest)}, ${rate(rows[3].annualRate)} ${won(rows[3].r.totalInterest)}입니다. ` +
      `금리에 정비례하므로 연 ${eun(rate(rows[3].annualRate))} ${rate(rows[0].annualRate)}의 정확히 ${times(rows[3].r.totalInterest, rows[0].r.totalInterest)}이고, 월로는 ${wa(won(rows[0].r.monthlyInterest))} ${won(rows[3].r.monthlyInterest)}입니다. ` +
      `이 격차 ${eun(won(rows[3].r.totalInterest - rows[0].r.totalInterest))} 보증금의 ${pct((rows[3].r.totalInterest - rows[0].r.totalInterest) / D.depositAmount)}로, 2년마다 보증금의 그만큼이 금리 조건 하나에 걸려 있습니다. ` +
      `주담대는 원금이 줄어 금리 차의 효과가 후반에 옅어지지만, 거치식 전세대출은 첫 달과 마지막 달의 이자가 같아서 금리 차가 끝까지 온전히 남습니다.`,
  };
}

export const JEONSE_LOAN_DIGEST: Finding[] = [
  defaultCase(),
  annuityRatioByTerm(),
  tenthPointPerDeposit(),
  renewalAccumulation(),
  rentEquivalence(),
  depositLadder(),
  shortTermAnnuityBurden(),
  rateLadder(),
];
