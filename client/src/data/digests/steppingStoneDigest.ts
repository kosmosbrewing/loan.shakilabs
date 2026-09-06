// /stepping-stone-loan 파생 다이제스트 — 디딤돌 한도는 상품 한도·LTV·DTI 셋 중 최소이고 금리는 소득구간표에서
// 오므로, 소득을 10만원 단위로 훑어야 "어디서 한도가 꺾이는지"와 "구간 경계 1만원이 총이자로 얼마인지"가
// 보인다. 엔진(calcSteppingStoneLoan)을 소득 1천만~8,500만·주택가 2~6억·기간 10~30년 전 구간 돌린 값이다.
// 금리표·한도표는 계산식 기준일(loanPresets.LOAN_DATA_VERIFIED)의 값이며 산문에서 개별 인용하지 않는다.

import { DEFAULT_STEPPING_STONE_INPUT } from "@/lib/validators";
import { calcSteppingStoneLoan } from "@/utils/steppingStoneLoanCalc";
import { type Finding, eul, eun, ga, manwon, pct, pp, rate, ro, term, times, wa, won } from "./format";

const D = DEFAULT_STEPPING_STONE_INPUT; // 소득 5천만, 주택 4억, 생애최초, 30년, 수도권
const run = (patch: Partial<typeof D>) => calcSteppingStoneLoan({ ...D, ...patch });
const STEP = 100_000;

/** 술어가 처음 참이 되는 최소 소득 — 10만원 해상도 */
function incomeWhere(pred: (income: number) => boolean, from = 0): number {
  let income = from;
  while (income < 200_000_000 && !pred(income)) income += STEP;
  return income;
}

function limitingFactorSweep(): Finding {
  const base = run({});
  const dtiBindsUntil = incomeWhere((i) => run({ householdIncome: i }).maxLoanByDti >= base.maxLoanByLimit) - STEP;
  const low = run({ householdIncome: 15_000_000 });
  return {
    h2: `연소득 ${manwon(dtiBindsUntil)}까지는 DTI가, 그 위로는 상품 한도 ${ga(manwon(base.maxLoanByLimit))} 실제 한도를 정한다`,
    body:
      `주택가 ${manwon(D.propertyPrice)}, 생애최초, ${term(D.termYears * 12)}, 수도권(가정)에서 한도 후보는 상품 한도 ${won(base.maxLoanByLimit)}, LTV ${won(base.maxLoanByLtv)}, DTI ${won(base.maxLoanByDti)}이고 최종 한도는 그중 최소인 ${won(base.effectiveLoanAmount)}입니다. ` +
      `소득을 10만원 단위로 올리며 다시 계산하면 DTI 역산액이 상품 한도를 처음 넘어서는 소득이 ${manwon(dtiBindsUntil + STEP)}이라, 그 아래에서는 소득이 한도를 정하고 그 위에서는 소득이 아무리 올라도 ${manwon(base.maxLoanByLimit)}에 고정됩니다. ` +
      `연소득 ${manwon(15_000_000)}이면 DTI 한도가 ${ro(won(low.maxLoanByDti))} 상품 한도의 ${pct(low.maxLoanByDti / low.maxLoanByLimit)}에 그쳐 월 납입액도 ${ro(won(low.monthlyPayment))} 내려옵니다. ` +
      `연소득 ${manwon(D.householdIncome)}에서 DTI 역산액 ${eun(won(base.maxLoanByDti))} 상품 한도의 ${times(base.maxLoanByDti, base.maxLoanByLimit)}라, "디딤돌은 최대 ${manwon(base.maxLoanByLimit)}"이라는 말은 소득 ${manwon(dtiBindsUntil + STEP)} 이상에서만 성립하고 그 위의 소득은 한도를 한 푼도 늘리지 못합니다.`,
  };
}

function bracketCliff(): Finding {
  const under = run({ householdIncome: 40_000_000 });
  const over = run({ householdIncome: 40_000_000 + 10_000 });
  return {
    h2: `연소득 ${wa(manwon(40_000_000))} ${won(40_010_000)}의 차이는 금리 ${pp(over.applicableRate - under.applicableRate)}, 총이자 ${manwon(over.totalInterest - under.totalInterest)}이다`,
    body:
      `소득구간 경계에서는 소득 1만원이 금리 한 단계를 바꿉니다(가정 조건). 부부합산 ${manwon(40_000_000)}이면 적용금리 연 ${rate(under.applicableRate)}, 한도 ${won(under.effectiveLoanAmount)}, 월 ${won(under.monthlyPayment)}, ${term(D.termYears * 12)} 총이자 ${won(under.totalInterest)}인데, ` +
      `1만원 많은 ${won(40_010_000)}이면 금리가 ${ro(rate(over.applicableRate))} ${pp(over.applicableRate - under.applicableRate)} 올라 월 ${won(over.monthlyPayment)}, 총이자 ${ga(won(over.totalInterest))} 됩니다. ` +
      `두 경우 모두 상품 한도 ${won(under.effectiveLoanAmount)}에 걸려 빌리는 금액은 같으므로, 경계 바로 위 소득은 같은 돈에 월 ${won(over.monthlyPayment - under.monthlyPayment)}, ${term(D.termYears * 12)} 합계 ${eul(manwon(over.totalInterest - under.totalInterest))} 더 냅니다. ` +
      `소득 증빙 시점이 구간 경계 근처라면 인정 소득 산정 방식(전년도·최근 3개월 환산 등)에 따라 이 ${ga(pp(over.applicableRate - under.applicableRate))} 갈릴 수 있습니다.`,
  };
}

function termTradeoff(): Finding {
  const rows = [10, 15, 20, 30].map((termYears) => ({ termYears, r: run({ termYears }) }));
  const lowIncome = 15_000_000;
  const low = [10, 30].map((termYears) => ({ termYears, r: run({ termYears, householdIncome: lowIncome }) }));
  return {
    h2: `${eun(term(rows[0].termYears * 12))} ${term(rows[3].termYears * 12)}보다 금리가 ${pp(rows[3].r.applicableRate - rows[0].r.applicableRate)} 낮고 총이자가 ${manwon(rows[3].r.totalInterest - rows[0].r.totalInterest)} 적지만 월 납입은 ${times(rows[0].r.monthlyPayment, rows[3].r.monthlyPayment)}다`,
    body:
      `연소득 ${manwon(D.householdIncome)}, 주택가 ${manwon(D.propertyPrice)}, 생애최초, 수도권(가정)에서 기간별 적용금리는 ${term(rows[0].termYears * 12)} ${rate(rows[0].r.applicableRate)}, ${term(rows[1].termYears * 12)} ${rate(rows[1].r.applicableRate)}, ${term(rows[2].termYears * 12)} ${rate(rows[2].r.applicableRate)}, ${term(rows[3].termYears * 12)} ${rate(rows[3].r.applicableRate)}입니다. ` +
      `이 소득에서는 상품 한도 ${ga(won(rows[0].r.effectiveLoanAmount))} 걸려 기간과 무관하게 같은 금액을 빌리고, 월 납입액은 ${won(rows[0].r.monthlyPayment)}·${won(rows[1].r.monthlyPayment)}·${won(rows[2].r.monthlyPayment)}·${won(rows[3].r.monthlyPayment)}, 총이자는 ${won(rows[0].r.totalInterest)}·${won(rows[1].r.totalInterest)}·${won(rows[2].r.totalInterest)}·${won(rows[3].r.totalInterest)}입니다. ` +
      `짧은 기간은 금리 우대와 이자 절감이 겹쳐 ${term(rows[0].termYears * 12)}의 총이자가 ${term(rows[3].termYears * 12)}의 ${pct(rows[0].r.totalInterest / rows[3].r.totalInterest, 0)}에 그칩니다. ` +
      `반면 DTI가 걸리는 연소득 ${manwon(lowIncome)}에서는 기간이 곧 한도라 ${term(low[0].termYears * 12)} ${won(low[0].r.effectiveLoanAmount)}, ${term(low[1].termYears * 12)} ${ro(won(low[1].r.effectiveLoanAmount))} ${times(low[1].r.effectiveLoanAmount, low[0].r.effectiveLoanAmount)} 차이가 나며, 이 구간에서는 기간 단축이 이자 절감이 아니라 대출 금액 축소로 돌아옵니다.`,
  };
}

function borrowerTypeGap(): Finding {
  const general = run({ borrowerType: "general" });
  const first = run({ borrowerType: "firstTime" });
  const newlywed = run({ borrowerType: "newlywed", householdIncome: 70_000_000, propertyPrice: 500_000_000 });
  const newlywedSame = run({ borrowerType: "newlywed" });
  const ratio = (r: typeof general) => r.totalInterest / r.effectiveLoanAmount;
  return {
    h2: `생애최초는 일반보다 한도 ${manwon(first.effectiveLoanAmount - general.effectiveLoanAmount)}·원금 대비 이자 ${pp((ratio(general) - ratio(first)) * 100)} 유리하고, 신혼은 한도 상한이 ${manwon(newlywedSame.maxLoanByLimit - first.maxLoanByLimit)} 더 크다`,
    body:
      `연소득 ${manwon(D.householdIncome)}, 주택가 ${manwon(D.propertyPrice)}, ${term(D.termYears * 12)}(가정)에서 일반은 금리 ${rate(general.applicableRate)}·한도 ${won(general.effectiveLoanAmount)}·총이자 ${won(general.totalInterest)}, 생애최초는 ${rate(first.applicableRate)}·${won(first.effectiveLoanAmount)}·${won(first.totalInterest)}입니다. ` +
      `빌리는 금액이 달라 총이자 절대값은 생애최초가 크지만, 원금 대비 총이자는 일반 ${pct(ratio(general))}, 생애최초 ${pct(ratio(first))}로 금리 ${pp(general.applicableRate - first.applicableRate)} 우대가 ${pp((ratio(general) - ratio(first)) * 100)}만큼 낮춥니다. ` +
      `생애최초 신혼가구는 상품 한도가 ${ro(won(newlywedSame.maxLoanByLimit))} 커지지만 이 집값에서는 LTV ${ga(won(newlywedSame.maxLoanByLtv))} 먼저 걸려 실제 한도는 ${won(newlywedSame.effectiveLoanAmount)}이고, 주택가 ${ro(manwon(500_000_000))} 올려야 ${won(newlywed.effectiveLoanAmount)}까지 열립니다. ` +
      `유형별 우대는 금리와 한도 상한을 바꾸지만, 실제로 얼마를 빌리느냐는 집값(LTV)과 소득(DTI) 중 먼저 걸리는 쪽이 정합니다.`,
  };
}

function ltvBindingPrice(): Finding {
  const base = run({});
  let price = 100_000_000;
  while (price < 600_000_000 && run({ propertyPrice: price }).maxLoanByLtv < Math.min(base.maxLoanByLimit, base.maxLoanByDti)) price += 1_000_000;
  const low = run({ propertyPrice: 250_000_000 });
  const nonMetro = run({ propertyPrice: 250_000_000, isMetro: false });
  return {
    h2: `주택가 ${manwon(price)} 아래에서는 LTV가 한도를 정하고, 비수도권 생애최초는 그 선이 ${manwon(Math.round(price * 0.7 / 0.8 / 1_000_000) * 1_000_000)} 근처로 내려온다`,
    body:
      `연소득 ${manwon(D.householdIncome)}, 생애최초, ${term(D.termYears * 12)}(가정)에서 소득·상품 한도가 허용하는 금액은 ${won(Math.min(base.maxLoanByLimit, base.maxLoanByDti))}입니다. 주택가를 100만원 단위로 올리면 LTV 한도가 이 금액에 처음 닿는 가격이 ${manwon(price)}이고, 그 아래에서는 집값의 ${ga(pct(base.maxLoanByLtv / D.propertyPrice, 0))} 곧 한도입니다. ` +
      `주택가 ${manwon(250_000_000)}이면 수도권 LTV 한도 ${won(low.maxLoanByLtv)}, 비수도권 생애최초는 LTV가 높아 ${ro(won(nonMetro.maxLoanByLtv))} ${won(nonMetro.maxLoanByLtv - low.maxLoanByLtv)} 더 빌릴 수 있습니다. ` +
      `그 차이는 총이자로 ${won(nonMetro.totalInterest - low.totalInterest)}, 월 납입액으로 ${ga(won(nonMetro.monthlyPayment - low.monthlyPayment))} 됩니다. ` +
      `집값이 낮을수록 한도를 정하는 것은 소득이 아니라 집값이고, 이 구간에서는 자기자본 비율이 ${pct(1 - base.maxLoanByLtv / D.propertyPrice, 0)}(비수도권 생애최초 ${pct(1 - nonMetro.maxLoanByLtv / 250_000_000, 0)}) 이상 필요합니다.`,
  };
}

function methodChoice(): Finding {
  const r = run({});
  const gap = r.annuityPlan.totalInterest - r.equalPrincipalPlan.totalInterest;
  return {
    h2: `한도 ${eul(manwon(r.effectiveLoanAmount))} 원금균등으로 갚으면 총이자 ${eul(manwon(gap))} 아끼지만 첫 달은 ${won(r.equalPrincipalPlan.firstPayment - r.annuityPlan.monthlyPayment)} 더 낸다`,
    body:
      `기본 조건(가정)의 한도 ${won(r.effectiveLoanAmount)}, 금리 ${rate(r.applicableRate)}, ${term(D.termYears * 12)}에서 원리금균등은 매달 ${won(r.annuityPlan.monthlyPayment)}, 총이자 ${won(r.annuityPlan.totalInterest)}이고, 원금균등은 첫 달 ${won(r.equalPrincipalPlan.firstPayment)}에서 시작해 평균 ${won(r.equalPrincipalPlan.monthlyPayment)}, 총이자 ${won(r.equalPrincipalPlan.totalInterest)}입니다. ` +
      `절감액 ${eun(won(gap))} 원리금균등 총이자의 ${pct(gap / r.annuityPlan.totalInterest)}이고 첫 달 추가 부담의 ${times(gap, r.equalPrincipalPlan.firstPayment - r.annuityPlan.monthlyPayment, 0)}입니다. ` +
      `한도는 원리금균등 납입액 기준으로 역산되므로, 원금균등의 첫 달 ${eun(won(r.equalPrincipalPlan.firstPayment))} 월 소득 ${won(Math.round(D.householdIncome / 12))}의 ${pct(r.equalPrincipalPlan.firstPayment / (D.householdIncome / 12), 0)}로 원리금균등의 ${pct(r.annuityPlan.monthlyPayment / (D.householdIncome / 12), 0)}보다 ${pp(((r.equalPrincipalPlan.firstPayment - r.annuityPlan.monthlyPayment) / (D.householdIncome / 12)) * 100, 0)} 높습니다. ` +
      `총이자 ${manwon(gap)}의 절감은 초반의 추가 부담을 감당할 때만 성립하고, 대출 실행 후 상환 방식은 바꿀 수 없으므로 첫 달 납입액 기준으로 판단해야 합니다.`,
  };
}

function incomeCeilingCliff(): Finding {
  const limit = run({ householdIncome: 70_000_000 });
  const over = run({ householdIncome: 70_000_000 + 10_000 });
  const generalLimit = run({ borrowerType: "general", householdIncome: 60_000_000 });
  const generalOver = run({ borrowerType: "general", householdIncome: 60_010_000 });
  return {
    h2: `생애최초 소득 상한 ${eul(manwon(70_000_000))} 1만원 넘기면 자격만 잃는 게 아니라 금리도 ${pp(over.applicableRate - limit.applicableRate)} 오른다`,
    body:
      `연소득 ${manwon(70_000_000)}(가정 조건)이면 자격이 유지되어 금리 ${rate(limit.applicableRate)}, 한도 ${won(limit.effectiveLoanAmount)}, 월 ${won(limit.monthlyPayment)}, ${term(D.termYears * 12)} 총이자 ${won(limit.totalInterest)}입니다. ` +
      `${won(70_010_000)}이면 계산기가 "${over.ineligibleReasons[0] ?? "자격 미달"}"로 판정하는데, 이때 그대로 남는 값은 상품 한도 ${won(over.effectiveLoanAmount)} 하나뿐입니다. 소득이 다음 금리 구간(${over.incomeBracketLabel})으로 올라가 금리가 ${ro(rate(over.applicableRate))} 바뀌고 월 납입액 ${won(over.monthlyPayment)}, 총이자 ${won(over.totalInterest)}으로 함께 움직이기 때문입니다. ` +
      `자격을 잃고도 같은 금액을 빌린다고 놓고 비교하면 1만원의 대가는 월 ${won(over.monthlyPayment - limit.monthlyPayment)}, ${term(D.termYears * 12)} 합계 ${eul(won(over.totalInterest - limit.totalInterest))} 더 내는 조건입니다. ` +
      `일반 유형의 상한 ${manwon(60_000_000)}은 성격이 다릅니다. ${won(60_010_000)}으로 넘겨도 금리 구간이 그대로라 금리 ${rate(generalOver.applicableRate)}, 한도 ${won(generalOver.effectiveLoanAmount)}, 월 ${won(generalOver.monthlyPayment)}이 ${manwon(60_000_000)}일 때의 ${won(generalLimit.monthlyPayment)}과 1원도 다르지 않고, 결과에는 "${generalOver.ineligibleReasons[0] ?? "자격 미달"}" 판정만 새로 붙습니다. ` +
      `자격 절벽이 숫자를 얼마나 흔드는지는 상한이 금리표 구간 경계와 겹치는지에 달렸다는 뜻이고, 이 계산기는 자격 밖이어도 수치를 계속 보여 주므로 결과 상단의 자격 판정을 먼저 읽는 순서가 맞습니다.`,
  };
}

function newlywedRateVsFirst(): Finding {
  const first = run({ borrowerType: "firstTime", householdIncome: 30_000_000 });
  const newlywed = run({ borrowerType: "newlywed", householdIncome: 30_000_000 });
  const first80 = run({ borrowerType: "firstTime", householdIncome: 80_000_000 });
  const newlywed80 = run({ borrowerType: "newlywed", householdIncome: 80_000_000 });
  return {
    h2: `신혼 우대금리는 생애최초 우대보다 ${pp(first.applicableRate - newlywed.applicableRate)} 더 낮고, 소득 ${manwon(80_000_000)}에서는 자격 차이가 된다`,
    body:
      `연소득 ${manwon(30_000_000)}, 주택가 ${manwon(D.propertyPrice)}, ${term(D.termYears * 12)}(가정)에서 생애최초 금리는 ${rate(first.applicableRate)}, 생애최초 신혼가구는 ${ro(rate(newlywed.applicableRate))} ${pp(first.applicableRate - newlywed.applicableRate)} 차이입니다. 한도는 생애최초가 상품 한도 ${won(first.effectiveLoanAmount)}, 신혼가구가 LTV ${won(newlywed.effectiveLoanAmount)}에 걸려 다르고, 원금 대비 총이자는 ${pct(first.totalInterest / first.effectiveLoanAmount)} 대 ${pct(newlywed.totalInterest / newlywed.effectiveLoanAmount)}로 신혼이 ${pp((first.totalInterest / first.effectiveLoanAmount - newlywed.totalInterest / newlywed.effectiveLoanAmount) * 100)} 낮습니다. ` +
      `연소득 ${ro(manwon(80_000_000))} 올리면 생애최초는 소득 상한 밖이라 "${first80.ineligibleReasons[0] ?? "자격 미달"}"이지만 신혼가구는 자격이 유지되어 금리 ${rate(newlywed80.applicableRate)}, 한도 ${won(newlywed80.effectiveLoanAmount)}입니다. ` +
      `저소득 구간에서 신혼 우대는 같은 ${manwon(first.effectiveLoanAmount)}을 빌릴 때 이자 ${manwon(first.effectiveLoanAmount * (first.totalInterest / first.effectiveLoanAmount - newlywed.totalInterest / newlywed.effectiveLoanAmount))}의 문제이고, 고소득 구간에서는 대출 가능 여부 자체의 문제입니다. ` +
      `혼인신고 시점이 신청 전후로 갈린다면 이 두 값 중 어느 쪽이 걸려 있는지를 소득 기준으로 먼저 확인해야 합니다.`,
  };
}

export const STEPPING_STONE_DIGEST: Finding[] = [
  limitingFactorSweep(),
  bracketCliff(),
  termTradeoff(),
  borrowerTypeGap(),
  ltvBindingPrice(),
  methodChoice(),
  incomeCeilingCliff(),
  newlywedRateVsFirst(),
];
