// /ltv-dti 파생 다이제스트 — 최종 한도는 LTV·절대한도·DTI·DSR 넷 중 최소라, 어느 축이 실제로 걸리는지는
// 소득·집값·금리를 훑어야 보인다. 엔진(calcLtvDti)을 소득 10만원 단위·집값 100만원 단위로 돌려 축이
// 바뀌는 경계, 스트레스 가산이 지우는 금액, 15억 경계의 절벽을 적는다. 비율·한도표는 계산식 기준일의 값이다.

import { DEFAULT_LTV_DTI_INPUT } from "@/lib/validators";
import { calcLtvDti } from "@/utils/ltvDtiCalc";
import { type Finding, eul, eun, ga, manwon, pct, pp, rate, ro, term, times, wa, won } from "./format";

const D = DEFAULT_LTV_DTI_INPUT; // 7억, 소득 8천만, 기존 600만, 4.5%, 30년, 규제지역, 일반
const run = (patch: Partial<typeof D>) => calcLtvDti({ ...D, ...patch });
const STEP = 100_000;

function incomeWhere(pred: (income: number) => boolean): number {
  let income = 0;
  while (income < 1_000_000_000 && !pred(income)) income += STEP;
  return income;
}

function defaultFactors(): Finding {
  const r = run({});
  return {
    h2: `집값 ${manwon(D.propertyPrice)}·연소득 ${manwon(D.annualIncome)}의 한도는 ${manwon(r.finalMaxLoan)} — 걸리는 축은 ${r.limitingFactor}`,
    body:
      `규제지역, 일반 무주택자, 기존 대출 연 ${manwon(D.existingDebtPayment)}, 연 ${rate(D.loanRate)}·${term(D.termMonths)}(가정)에서 네 축의 한도는 LTV ${won(r.maxByLtv)}(집값의 ${pct(r.ltvRate, 0)}), 절대한도 ${won(r.maxByAbsolute)}, DTI ${won(r.maxByDti)}, DSR ${won(r.maxByDsr)}입니다. ` +
      `최종 한도는 그중 최소인 ${won(r.finalMaxLoan)}이고 이때 ${r.limitingFactor}가 걸립니다. 두 번째로 낮은 축과의 여유는 ${won(Math.min(...[r.maxByLtv, r.maxByAbsolute, r.maxByDti, r.maxByDsr].filter((v) => v > r.finalMaxLoan)) - r.finalMaxLoan)}입니다. ` +
      `이 한도를 다 쓰면 월 ${won(r.monthlyPayment)}, ${term(D.termMonths)} 총이자 ${won(r.totalInterest)}입니다. ` +
      `집값 ${manwon(D.propertyPrice)}의 ${pct(r.finalMaxLoan / D.propertyPrice, 0)}만 대출이 되므로 자기자본이 ${manwon(D.propertyPrice - r.finalMaxLoan)} 이상 필요하다는 것이 이 조합의 결론입니다.`,
  };
}

function stressCost(): Finding {
  const r = run({});
  const noStress = calcLtvDti({ ...D, region: "nonRegulated" });
  const dsrWithoutStress = (() => {
    // 스트레스 가산이 없을 때의 DSR 역산액 — 금리 입력을 가산만큼 낮춘 값으로 재현
    return run({ loanRate: D.loanRate - r.stressRate }).maxByDsr;
  })();
  return {
    h2: `스트레스 가산 ${eun(pp(r.stressRate))} DSR 한도 ${eul(manwon(dsrWithoutStress - r.maxByDsr))} 지운다`,
    body:
      `규제지역(가정)에서는 DSR 산정에 실제 금리 ${ga(rate(D.loanRate))} 아니라 ${eul(pp(r.stressRate))} 얹은 ${ga(rate(D.loanRate + r.stressRate))} 쓰입니다. 가산이 없다면 DSR 한도가 ${won(dsrWithoutStress)}인데 가산 후에는 ${ro(won(r.maxByDsr))} ${won(dsrWithoutStress - r.maxByDsr)}, ${pct(1 - r.maxByDsr / dsrWithoutStress)} 줄어듭니다. ` +
      `비규제지역은 가산이 ${pp(noStress.stressRate)}라 같은 소득의 DSR 한도가 ${ro(won(noStress.maxByDsr))} ${won(noStress.maxByDsr - r.maxByDsr)} 더 나옵니다. ` +
      `실제 이자는 ${ro(rate(D.loanRate))} 내므로 가산은 한 푼도 내지 않는 금리이지만, 빌릴 수 있는 돈은 ${manwon(dsrWithoutStress - r.maxByDsr)} 줄어드는 셈입니다. ` +
      `이 조합에서는 LTV가 먼저 걸려 스트레스가 최종 한도를 바꾸지 않지만, 소득이 ${manwon(incomeWhere((i) => run({ annualIncome: i }).maxByDsr >= r.maxByLtv))} 아래로 내려가면 DSR이 LTV를 대신해 실제 한도가 됩니다.`,
  };
}

function firstTimeNeedsIncome(): Finding {
  const first = run({ borrowerCategory: "firstTime" });
  const general = run({});
  const needed = incomeWhere((i) => run({ borrowerCategory: "firstTime", annualIncome: i }).maxByDsr >= first.maxByLtv);
  return {
    h2: `생애최초 LTV ${eul(pct(first.ltvRate, 0))} 다 쓰려면 연소득 ${ga(manwon(needed))} 필요하다`,
    body:
      `같은 집값 ${manwon(D.propertyPrice)}(가정 조건)에서 생애최초 구입자의 LTV 한도는 ${ro(won(first.maxByLtv))} 일반 ${won(general.maxByLtv)}보다 ${won(first.maxByLtv - general.maxByLtv)} 큽니다. ` +
      `그러나 연소득 ${manwon(D.annualIncome)}의 DSR 한도는 ${won(first.maxByDsr)}이라 최종 한도는 ${won(first.finalMaxLoan)}, 걸리는 축이 ${first.limitingFactor}로 바뀝니다. 늘어난 LTV 여유 ${won(first.maxByLtv - general.maxByLtv)} 중 실제로 쓰는 것은 ${won(first.finalMaxLoan - general.finalMaxLoan)}뿐입니다. ` +
      `LTV ${eul(pct(first.ltvRate, 0))} 전부 쓰려면 DSR 역산액이 ${won(first.maxByLtv)}에 닿아야 하고, 소득을 10만원 단위로 올려 보면 그 문턱이 연소득 ${manwon(needed)}입니다. ` +
      `"생애최초는 ${pct(first.ltvRate, 0)}"라는 문장은 집값 대비 비율일 뿐이고, 그 비율을 채우는 것은 소득이라 ${manwon(D.propertyPrice)} 집에서는 ${manwon(needed)} 이상 벌어야 성립합니다.`,
  };
}

function absoluteCliff(): Finding {
  const HIGH_INCOME = 300_000_000; // DSR·DTI가 걸리지 않도록 높게 둔 가정 소득
  const at15 = run({ propertyPrice: 1_500_000_000, annualIncome: HIGH_INCOME });
  const over15 = run({ propertyPrice: 1_500_000_000 + 1_000_000, annualIncome: HIGH_INCOME });
  const at12 = run({ propertyPrice: 1_200_000_000, annualIncome: HIGH_INCOME });
  return {
    h2: `집값 ${manwon(1_500_000_000)}에서 ${manwon(1_501_000_000)}으로 100만원 오르면 한도가 ${manwon(at15.finalMaxLoan - over15.finalMaxLoan)} 떨어진다`,
    body:
      `규제지역 절대한도는 집값 구간별 고정 금액이라 경계에서 절벽이 생깁니다. 소득 ${manwon(HIGH_INCOME)}(DSR·DTI가 걸리지 않도록 높게 가정)일 때 집값 ${manwon(1_500_000_000)}의 한도는 ${won(at15.finalMaxLoan)}(${at15.limitingFactor})인데, ${manwon(1_501_000_000)}이면 ${won(over15.finalMaxLoan)}(${over15.limitingFactor})로 ${won(at15.finalMaxLoan - over15.finalMaxLoan)} 줄어듭니다. ` +
      `LTV ${pct(at15.ltvRate, 0)}로 계산한 ${wa(won(at15.maxByLtv))} ${eun(won(over15.maxByLtv))} 거의 같지만 절대한도가 이를 덮어씁니다. ` +
      `집값 ${manwon(1_200_000_000)}의 LTV 한도 ${eun(won(at12.maxByLtv))} 절대한도 ${won(at12.maxByAbsolute)} 안이라 그대로 한도가 되고, 이 구간(${manwon(1_500_000_000)} 이하)에서는 절대한도가 LTV와 같은 ${manwon(1_500_000_000)}에서만 딱 만납니다. ` +
      `경계 바로 위 집을 살 때 필요한 자기자본은 ${manwon(1_501_000_000 - over15.finalMaxLoan)}으로, 경계 아래 ${manwon(1_500_000_000 - at15.finalMaxLoan)}보다 ${manwon((1_501_000_000 - over15.finalMaxLoan) - (1_500_000_000 - at15.finalMaxLoan))} 많습니다.`,
  };
}

function regionGap(): Finding {
  const reg = run({});
  const non = run({ region: "nonRegulated" });
  return {
    h2: `같은 집·같은 소득이 비규제지역이면 한도가 ${manwon(non.finalMaxLoan - reg.finalMaxLoan)} 커진다`,
    body:
      `집값 ${manwon(D.propertyPrice)}, 연소득 ${manwon(D.annualIncome)}(가정)을 비규제지역으로 바꾸면 LTV가 ${pct(reg.ltvRate, 0)}에서 ${pct(non.ltvRate, 0)}로, DTI가 ${pct(reg.dtiRate, 0)}에서 ${pct(non.dtiRate, 0)}로, 스트레스 가산이 ${pp(reg.stressRate)}에서 ${ro(pp(non.stressRate))} 바뀝니다. ` +
      `네 축은 LTV ${won(non.maxByLtv)}, DTI ${won(non.maxByDti)}, DSR ${won(non.maxByDsr)}(절대한도 없음)이 되고 최종 한도는 ${won(non.finalMaxLoan)}, 걸리는 축은 ${non.limitingFactor}입니다. ` +
      `규제지역 ${won(reg.finalMaxLoan)}보다 ${won(non.finalMaxLoan - reg.finalMaxLoan)}, ${times(non.finalMaxLoan, reg.finalMaxLoan)} 큽니다. ` +
      `비규제지역에서는 LTV가 넉넉해 소득이 한도를 정하는 쪽으로 바뀌므로, 같은 집을 두고도 "얼마짜리 집인가"에서 "얼마를 버는가"로 질문이 옮겨갑니다.`,
  };
}

function termAndRate(): Finding {
  const base = run({});
  const t40 = run({ termMonths: 480 });
  const r35 = run({ loanRate: 3.5 });
  const low = run({ annualIncome: 50_000_000 });
  const low40 = run({ annualIncome: 50_000_000, termMonths: 480 });
  const low35 = run({ annualIncome: 50_000_000, loanRate: 3.5 });
  return {
    h2: `소득 ${manwon(50_000_000)}이면 ${ro(term(480))} ${manwon(low40.finalMaxLoan - low.finalMaxLoan)}, 금리 ${pp(1)} 인하로 ${manwon(low35.finalMaxLoan - low.finalMaxLoan)} 늘어난다`,
    body:
      `기본 조건(가정)에서는 LTV가 걸려 있어 기간을 ${ro(term(480))} 늘려도(${won(t40.finalMaxLoan)}) 금리를 ${ro(rate(3.5))} 낮춰도(${won(r35.finalMaxLoan)}) 한도는 ${won(base.finalMaxLoan)} 그대로입니다 — 소득 축이 아니라 집값 축이 걸려 있으면 소득 쪽 조건은 한도를 못 움직입니다. ` +
      `연소득을 ${ro(manwon(50_000_000))} 낮추면 DSR ${ga(won(low.maxByDsr))} 걸려 한도가 ${ga(won(low.finalMaxLoan))} 되고, 이때는 ${ga(term(480))} ${won(low40.finalMaxLoan)}, 연 ${ga(rate(3.5))} ${ro(won(low35.finalMaxLoan))} 각각 ${pct(low40.finalMaxLoan / low.finalMaxLoan - 1)}, ${pct(low35.finalMaxLoan / low.finalMaxLoan - 1)} 늘어납니다. ` +
      `금리 ${ga(pp(1))} 기간 10년 연장과 비슷한 크기로 한도를 움직이는데, 총이자는 ${ga(term(480))} ${ro(won(low40.totalInterest))} ${term(D.termMonths)} ${won(low.totalInterest)}보다 ${won(low40.totalInterest - low.totalInterest)} 많습니다. ` +
      `어느 축이 걸려 있는지를 먼저 보고, 그 축을 움직이는 조건만 손대는 것이 이 계산기를 읽는 순서입니다.`,
  };
}

function existingDebtCost(): Finding {
  const low = run({ annualIncome: 50_000_000 });
  const clean = run({ annualIncome: 50_000_000, existingDebtPayment: 0 });
  const perMillion = (clean.maxByDsr - low.maxByDsr) / (D.existingDebtPayment / 1_000_000);
  return {
    h2: `DSR이 걸리는 소득에서는 기존 대출 연 100만원이 한도 ${manwon(perMillion)}이다`,
    body:
      `연소득 ${manwon(50_000_000)}(가정, DSR이 걸리는 구간)에서 기존 대출 연 원리금 ${ga(manwon(D.existingDebtPayment))} 있을 때 DSR 한도는 ${won(low.maxByDsr)}, 없을 때는 ${ro(won(clean.maxByDsr))} ${won(clean.maxByDsr - low.maxByDsr)} 차이입니다. ` +
      `연 100만원당 ${won(perMillion)}이고, 이 환산율은 스트레스 가산 후 금리 ${rate(D.loanRate + low.stressRate)}·${ga(term(D.termMonths))} 정합니다. ` +
      `DTI 축도 같은 기존 부채를 빼지만 가산 없는 ${ro(rate(D.loanRate))} 역산해 ${won(low.maxByDti)}이라 DSR보다 ${won(low.maxByDti - low.maxByDsr)} 여유가 있고, 그래서 규제지역에서는 거의 항상 DSR이 DTI보다 먼저 걸립니다. ` +
      `기존 대출을 갚아 한도를 키우는 효과는 이 ${manwon(perMillion)}/100만원 비율로 곧장 계산되며, LTV가 걸린 소득 구간(이 집값에서는 연소득 ${manwon(incomeWhere((i) => run({ annualIncome: i }).maxByDsr >= run({}).maxByLtv))} 이상)에서는 0입니다.`,
  };
}

function pricePerIncome(): Finding {
  const income = 50_000_000;
  const dsr = run({ annualIncome: income }).maxByDsr;
  let price = 100_000_000;
  while (price < 3_000_000_000 && run({ annualIncome: income, propertyPrice: price }).maxByLtv < dsr) price += 1_000_000;
  const firstPrice = (() => {
    let p = 100_000_000;
    while (p < 3_000_000_000 && run({ annualIncome: income, propertyPrice: p, borrowerCategory: "firstTime" }).maxByLtv < run({ annualIncome: income, borrowerCategory: "firstTime" }).maxByDsr) p += 1_000_000;
    return p;
  })();
  return {
    h2: `연소득 ${eun(manwon(income))} 집값 ${manwon(price)}부터 LTV 대신 소득이 한도를 정한다`,
    body:
      `규제지역, 일반 무주택자, 기존 대출 연 ${manwon(D.existingDebtPayment)}(가정)에서 연소득 ${manwon(income)}의 DSR 한도는 집값과 무관하게 ${won(dsr)}입니다. 집값을 100만원 단위로 올리면 LTV ${pct(run({}).ltvRate, 0)} 한도가 이 값을 처음 넘는 가격이 ${manwon(price)}입니다. ` +
      `그보다 싼 집은 집값이 한도를 정하고, 그보다 비싼 집은 소득이 정합니다 — 집값이 ${ga(manwon(price * 2))} 되어도 한도는 ${ro(won(run({ annualIncome: income, propertyPrice: price * 2 }).finalMaxLoan))} 같습니다. ` +
      `생애최초는 LTV가 높아 전환점이 ${ro(manwon(firstPrice))} 내려오고, 그 위로는 우대 LTV가 한도에 아무 영향을 주지 않습니다. ` +
      `"내 소득으로 살 수 있는 집값"의 답은 이 전환 가격에 자기자본을 더한 값이며, 그 위의 집은 우대 비율이 아니라 소득 증빙이나 기존 대출 정리로만 한도가 늘어납니다.`,
  };
}

export const LTV_DTI_DIGEST: Finding[] = [
  defaultFactors(),
  stressCost(),
  firstTimeNeedsIncome(),
  absoluteCliff(),
  regionGap(),
  termAndRate(),
  existingDebtCost(),
  pricePerIncome(),
];
