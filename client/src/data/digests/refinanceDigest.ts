// /refinance 파생 다이제스트 — 대환 손익은 "금리 차 × 잔액 × 남은 기간 − 비용"이라, 어느 하나가
// 작아지면 순절감이 0을 지나는 경계가 생긴다. 엔진(calcRefinance)을 금리 차 0.1%p 단위·잔여기간
// 12개월 단위로 돌려 그 경계(손익분기 개월, 허용 최대 비용, 기간 연장의 함정)를 적는다.

import { DEFAULT_REFINANCE_INPUT } from "@/lib/validators";
import { calcRefinance } from "@/utils/calculator";
import { type Finding, eul, eun, ga, manwon, pct, pp, rate, ro, term, times, won } from "./format";

const D = DEFAULT_REFINANCE_INPUT; // 잔액 1.2억, 5.8%→4.2%, 잔여 240·신규 240, 비용 90만
const run = (patch: Partial<typeof D>) => calcRefinance({ ...D, ...patch });
const fmt2 = (v: number) => Number(v.toFixed(2));

function defaultCase(): Finding {
  const r = run({});
  return {
    h2: `금리 ${pp(D.currentRate - D.newRate)} 낮추면 비용 ${eun(manwon(D.refinanceFee))} ${r.breakEvenMonths}개월 만에 회수된다`,
    body:
      `잔액 ${manwon(D.balance)}, 잔여 ${term(D.remainingMonths)}, 연 ${rate(D.currentRate)}에서 ${ro(rate(D.newRate))} 갈아타고 비용 ${eul(manwon(D.refinanceFee))} 낼 때(가정) 월 납입액은 ${won(r.currentPlan.monthlyPayment)}에서 ${ro(won(r.newPlan.monthlyPayment))} ${won(r.monthlySavings)} 줄어듭니다. ` +
      `비용을 월 절감액으로 나누면 ${r.breakEvenMonths}개월째에 본전이고, 그 뒤 ${D.remainingMonths - r.breakEvenMonths!}개월 동안의 절감이 이익입니다. ` +
      `${term(D.remainingMonths)} 전체로는 총이자가 ${won(r.currentPlan.totalInterest)}에서 ${ro(won(r.newPlan.totalInterest))} ${won(r.currentPlan.totalInterest - r.newPlan.totalInterest)} 줄고, 비용을 뺀 순절감은 ${ro(won(r.netSavings))} 비용의 ${times(r.netSavings, D.refinanceFee, 0)}입니다. ` +
      `손익분기가 ${r.breakEvenMonths}개월이라는 것은, 갈아탄 뒤 ${r.breakEvenMonths}개월 안에 또 갈아타거나 전액 상환하면 손해라는 뜻이기도 합니다.`,
  };
}

function breakEvenByGap(): Finding {
  const gaps = [0.2, 0.5, 1, 1.6];
  const rows = gaps.map((gap) => ({ gap, r: run({ newRate: fmt2(D.currentRate - gap) }) }));
  return {
    h2: `손익분기 개월은 금리 차 ${pp(rows[0].gap)}이면 ${rows[0].r.breakEvenMonths}개월, ${pp(rows[3].gap)}이면 ${rows[3].r.breakEvenMonths}개월`,
    body:
      `비용 ${manwon(D.refinanceFee)}, 잔액 ${manwon(D.balance)}, ${term(D.remainingMonths)}(가정)을 고정하고 금리 차만 바꾸면 손익분기는 ${pp(rows[0].gap)} ${rows[0].r.breakEvenMonths}개월, ${pp(rows[1].gap)} ${rows[1].r.breakEvenMonths}개월, ${pp(rows[2].gap)} ${rows[2].r.breakEvenMonths}개월, ${pp(rows[3].gap)} ${rows[3].r.breakEvenMonths}개월입니다. ` +
      `월 절감액이 각각 ${won(rows[0].r.monthlySavings)}, ${won(rows[1].r.monthlySavings)}, ${won(rows[2].r.monthlySavings)}, ${won(rows[3].r.monthlySavings)}이라 금리 차와 거의 정비례하고, 손익분기는 그 역수로 줄어듭니다. ` +
      `${pp(rows[0].gap)} 차이에서도 순절감은 ${ro(won(rows[0].r.netSavings))} 플러스지만 회수에 ${ga(term(rows[0].r.breakEvenMonths!))} 걸려, 그 사이 금리가 다시 움직이거나 이사·상환 계획이 생기면 계산이 무너집니다. ` +
      `"몇 %p면 갈아탈 만한가"의 답은 금리 차가 아니라 회수 기간을 남은 기간과 비교하는 데 있습니다.`,
  };
}

function maxFee(): Finding {
  const base = run({ refinanceFee: 0 });
  const ceiling = base.currentPlan.totalInterest - base.newPlan.totalInterest;
  const half = run({ newRate: fmt2(D.currentRate - 0.5), refinanceFee: 0 });
  const halfCeiling = half.currentPlan.totalInterest - half.newPlan.totalInterest;
  return {
    h2: `이 조건에서 대환 비용은 ${manwon(ceiling)}까지만 의미가 있다`,
    body:
      `금리 차 ${pp(D.currentRate - D.newRate)}, 잔액 ${manwon(D.balance)}, ${term(D.remainingMonths)}(가정)에서 대환으로 줄어드는 총이자는 ${won(ceiling)}입니다. 중도상환수수료·인지세·감정료 등을 합친 비용이 이 금액을 넘으면 월 납입은 줄어도 총액으로는 손해입니다. ` +
      `금리 차가 ${ro(pp(0.5))} 좁혀지면 허용 비용의 상한도 ${ro(won(halfCeiling))} ${pct(1 - halfCeiling / ceiling)} 줄어듭니다. ` +
      `기본값 비용 ${eun(manwon(D.refinanceFee))} 상한의 ${pct(D.refinanceFee / ceiling)}라 여유가 크지만, 잔액이 ${manwon(D.balance / 2)}이면 상한도 절반인 ${ro(manwon(ceiling / 2))} 내려와 같은 비용의 비중이 ${ga(pct(D.refinanceFee / (ceiling / 2)))} 됩니다. ` +
      `대환 견적을 받으면 "월 얼마 줄어드나"보다 "비용이 총이자 절감액의 몇 %인가"를 먼저 계산하세요.`,
  };
}

function remainingTermEffect(): Finding {
  const rows = [36, 60, 120, 240].map((m) => ({ m, r: run({ remainingMonths: m, newTermMonths: m }) }));
  let cutoff = 1;
  while (cutoff < 480 && run({ remainingMonths: cutoff, newTermMonths: cutoff }).netSavings <= 0) cutoff += 1;
  return {
    h2: `잔여 ${term(cutoff)} 미만이면 같은 금리 차로도 순절감이 마이너스다`,
    body:
      `금리 ${pp(D.currentRate - D.newRate)} 차이, 비용 ${manwon(D.refinanceFee)}(가정)을 고정하고 잔여 기간을 바꾸면 순절감은 ${term(rows[0].m)} ${won(rows[0].r.netSavings)}, ${term(rows[1].m)} ${won(rows[1].r.netSavings)}, ${term(rows[2].m)} ${won(rows[2].r.netSavings)}, ${term(rows[3].m)} ${won(rows[3].r.netSavings)}입니다. ` +
      `1개월 단위로 내려가 보면 잔여 ${term(cutoff - 1)}에서는 순절감이 0 이하이고 ${term(cutoff)}부터 플러스로 돌아섭니다. ` +
      `${term(rows[3].m)} 남았을 때와 ${term(rows[1].m)} 남았을 때의 순절감 차이가 ${times(rows[3].r.netSavings, rows[1].r.netSavings)}인 이유는, 남은 기간이 짧을수록 앞으로 낼 이자 자체가 적어 금리 차가 먹힐 자리가 줄기 때문입니다. ` +
      `대출 말기의 대환은 월 납입액이 줄어 보여도 비용을 넘기 어렵고, 같은 이유로 대환은 빠를수록 절감이 큽니다.`,
  };
}

function termResetTrap(): Finding {
  const same = run({});
  const extended = run({ newTermMonths: 360 });
  const shortened = run({ newTermMonths: 180 });
  return {
    h2: `기간을 ${ro(term(360))} 늘려 갈아타면 월 ${won(extended.monthlySavings)} 줄지만 총이자는 ${manwon(-extended.netSavings)} 손해다`,
    body:
      `잔여 ${eul(term(D.remainingMonths))} 그대로 두고 ${ro(rate(D.newRate))} 갈아타면 월 ${won(same.monthlySavings)} 절감, 순절감 ${won(same.netSavings)}입니다(가정). ` +
      `같은 금리로 신규 기간을 ${ro(term(360))} 늘리면 월 절감은 ${ro(won(extended.monthlySavings))} 커 보이지만 총이자가 ${ro(won(extended.newPlan.totalInterest))} 현재 ${won(extended.currentPlan.totalInterest)}보다 많아져 순절감이 ${won(extended.netSavings)}, 즉 손해로 바뀝니다. ` +
      `반대로 ${ro(term(180))} 줄이면 월 납입액이 ${ro(won(shortened.newPlan.monthlyPayment))} 지금보다 ${won(-shortened.monthlySavings)} 늘지만 순절감은 ${ro(won(shortened.netSavings))} 기간 유지 때의 ${times(shortened.netSavings, same.netSavings)}입니다. ` +
      `계산기의 "손익분기"가 기간 연장 조합에서 표시되지 않는 것은 월 절감액이 플러스라도 순절감이 마이너스면 회수 시점이 없기 때문입니다. 대환 상담에서 제시되는 "월 부담 감소"는 기간을 같이 봐야 합니다.`,
  };
}

function balanceScaling(): Finding {
  const rows = [60_000_000, 120_000_000, 240_000_000].map((balance) => ({ balance, r: run({ balance }) }));
  return {
    h2: `비용이 같으면 잔액 ${eun(manwon(rows[0].balance))} 회수에 ${rows[0].r.breakEvenMonths}개월, ${eun(manwon(rows[2].balance))} ${rows[2].r.breakEvenMonths}개월`,
    body:
      `대환 비용 ${manwon(D.refinanceFee)}(가정)이 잔액과 무관하게 고정이라고 보면, 잔액 ${manwon(rows[0].balance)}·${manwon(rows[1].balance)}·${manwon(rows[2].balance)}의 월 절감액은 ${won(rows[0].r.monthlySavings)}·${won(rows[1].r.monthlySavings)}·${ro(won(rows[2].r.monthlySavings))} 정비례하고, 손익분기는 ${rows[0].r.breakEvenMonths}·${rows[1].r.breakEvenMonths}·${rows[2].r.breakEvenMonths}개월로 반비례합니다. ` +
      `순절감은 ${won(rows[0].r.netSavings)}·${won(rows[1].r.netSavings)}·${won(rows[2].r.netSavings)}인데, 잔액이 두 배가 될 때 순절감은 두 배보다 커집니다 — 비용은 그대로인데 절감만 두 배가 되기 때문입니다. ` +
      `잔액 ${manwon(rows[0].balance)}의 순절감은 ${manwon(rows[2].balance)}의 ${pct(rows[0].r.netSavings / rows[2].r.netSavings)}에 그칩니다. ` +
      `소액 대출 여러 건보다 잔액이 큰 한 건을 먼저 대환하는 편이 비용 대비 효율이 높다는 결론이 여기서 나옵니다.`,
  };
}

function minimumGap(): Finding {
  let gap = 0;
  while (gap < 5) {
    const r = run({ newRate: fmt2(D.currentRate - gap) });
    if (r.netSavings > 0 && r.breakEvenMonths !== null && r.breakEvenMonths <= 12) break;
    gap = fmt2(gap + 0.01);
  }
  let worthGap = 0;
  while (worthGap < 5 && !run({ newRate: fmt2(D.currentRate - worthGap) }).isSwitchWorthIt) worthGap = fmt2(worthGap + 0.01);
  const r = run({ newRate: fmt2(D.currentRate - gap) });
  return {
    h2: `1년 안에 본전을 보려면 금리 차 ${ga(pp(gap))} 필요하다`,
    body:
      `잔액 ${manwon(D.balance)}, 잔여 ${term(D.remainingMonths)}, 비용 ${manwon(D.refinanceFee)}(가정)에서 금리 차를 0.01%p 단위로 올리며 계산기의 판정을 읽으면, 순절감이 플러스가 되어 "갈아탈 만함"으로 바뀌는 최소 금리 차는 ${pp(worthGap)}입니다. ` +
      `그런데 이때 손익분기는 ${run({ newRate: fmt2(D.currentRate - worthGap) }).breakEvenMonths}개월로 잔여 기간의 대부분을 회수에 씁니다. ` +
      `회수 기간을 12개월 안으로 두려면 금리 차가 ${pp(gap)} 이상이어야 하고, 그때 월 절감 ${won(r.monthlySavings)}, 손익분기 ${r.breakEvenMonths}개월, 순절감 ${won(r.netSavings)}입니다. ` +
      `"이론상 이득"과 "실행할 만한 이득" 사이의 폭이 ${pp(gap - worthGap)}인 셈이고, 이 폭은 비용이 클수록, 잔액이 작을수록 벌어집니다.`,
  };
}

function tenthPointValue(): Finding {
  const a = run({ newRate: D.currentRate, refinanceFee: 0 });
  const b = run({ newRate: fmt2(D.currentRate - 0.1), refinanceFee: 0 });
  const monthly = b.monthlySavings;
  const total = a.currentPlan.totalInterest - b.newPlan.totalInterest;
  const perHundred = total / (D.balance / 100_000_000);
  const lossGap = Math.ceil((D.refinanceFee / total) * 0.1 * 100) / 100;
  return {
    h2: `금리 0.1%p는 잔액 ${manwon(D.balance)}·${term(D.remainingMonths)}에서 월 ${won(monthly)}, 총 ${manwon(total)}이다`,
    body:
      `연 ${rate(D.currentRate)}에서 ${ro(rate(fmt2(D.currentRate - 0.1)))} 딱 0.1%p만 낮추면(가정) 월 납입액은 ${won(monthly)} 줄고 ${term(D.remainingMonths)} 총이자는 ${won(total)} 줄어듭니다. ` +
      `잔액 1억원당으로는 ${won(perHundred)}입니다. 대환 비용이 ${manwon(D.refinanceFee)}이면 절감액의 ${ga(pct(D.refinanceFee / total))} 비용으로 빠져 순절감은 ${won(total - D.refinanceFee)}에 그치고, 비용이 절감액을 넘어 손해가 되는 금리 차는 ${pp(lossGap)} 미만입니다. ` +
      `반면 비용이 0인 금리 인하 요구권 같은 경로라면 0.1%p도 온전히 ${manwon(total)}의 이득입니다. ` +
      `같은 0.1%p라도 비용이 붙는 대환과 비용 없는 조정은 ${manwon(D.refinanceFee)}만큼 출발선이 다릅니다.`,
  };
}

export const REFINANCE_DIGEST: Finding[] = [
  defaultCase(),
  breakEvenByGap(),
  maxFee(),
  remainingTermEffect(),
  termResetTrap(),
  balanceScaling(),
  minimumGap(),
  tenthPointValue(),
];
