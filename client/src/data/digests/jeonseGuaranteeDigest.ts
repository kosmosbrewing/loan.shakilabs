// /jeonse-guarantee-fee 파생 다이제스트 — 보증료는 "보증금 × 연요율 × 개월/12"이고 요율은 기간·주택유형·
// 부채비율 3축 표에서 온다. 요율 한 칸을 인용하는 대신 엔진(calcJeonseGuaranteeFee)을 기간 1~72개월,
// 보증금 1~7억 전 구간 돌려 구간 경계에서 생기는 역전(1년 두 번 vs 2년 한 번)과 축별 상대 크기를 적는다.

import { calcJeonseGuaranteeFee, type JeonseGuaranteeInput } from "@/utils/jeonseGuaranteeCalculator";
import { GUARANTEE_LIMIT_METRO, GUARANTEE_LIMIT_OTHER } from "@/data/jeonseGuarantee";
import { type Finding, eul, eun, ga, manwon, pct, pp, rate, ro, times, wa, won } from "./format";

// 계산기 화면 기본값과 같은 조건
export const GUARANTEE_BASE: JeonseGuaranteeInput = {
  deposit: 300_000_000,
  months: 24,
  housingType: "apartment",
  debtTier: "le70",
  discountRate: 0,
  isMetropolitan: true,
};
const run = (patch: Partial<JeonseGuaranteeInput>) => calcJeonseGuaranteeFee({ ...GUARANTEE_BASE, ...patch });

function defaultCase(): Finding {
  const r = run({});
  return {
    h2: `보증금 ${manwon(GUARANTEE_BASE.deposit)} 2년 보증료는 ${won(r.totalFee)}, 월 ${won(r.monthlyEquivalent)}꼴이다`,
    body:
      `아파트, 부채비율 70% 이하, ${GUARANTEE_BASE.months}개월(가정)이면 연요율 ${ga(rate(r.annualRate, 3))} 적용되어 보증료 ${won(r.totalFee)}, 월로 나누면 ${won(r.monthlyEquivalent)}입니다. ` +
      `보증금 대비로는 2년 전체가 ${pct(r.totalFee / GUARANTEE_BASE.deposit, 3)}, 한 달에 ${pct(r.monthlyEquivalent / GUARANTEE_BASE.deposit, 4)}입니다. ` +
      `같은 보증금에 연 ${rate(3.5)}(가정) 전세대출 이자가 붙는다면 한 달 이자 ${won(GUARANTEE_BASE.deposit * 0.035 / 12)}의 ${ga(pct(r.monthlyEquivalent / (GUARANTEE_BASE.deposit * 0.035 / 12)))} 보증료인 셈입니다. ` +
      `보증료는 보증금에 정비례하므로 ${manwon(100_000_000)}당 2년에 ${ro(won(run({ deposit: 100_000_000 }).totalFee))} 외워 두면 어떤 보증금이든 바로 환산됩니다.`,
  };
}

function oneYearTwiceVsTwoYears(): Finding {
  const twoYears = run({ months: 24 });
  const oneYear = run({ months: 12 });
  const twiceOneYear = oneYear.totalFee * 2;
  const threeYears = run({ months: 36 });
  const thriceOneYear = oneYear.totalFee * 3;
  return {
    h2: `1년 보증 두 번이 2년 보증 한 번보다 ${won(twoYears.totalFee - twiceOneYear)} 싸다`,
    body:
      `보증금 ${manwon(GUARANTEE_BASE.deposit)}, 아파트, 부채비율 70% 이하(가정)에서 12개월 보증료는 ${won(oneYear.totalFee)}(연 ${rate(oneYear.annualRate, 3)})이고 24개월은 ${won(twoYears.totalFee)}(연 ${rate(twoYears.annualRate, 3)})입니다. ` +
      `1년짜리를 두 번 가입하면 ${ro(won(twiceOneYear))} 2년 한 번보다 ${won(twoYears.totalFee - twiceOneYear)}, ${pct(1 - twiceOneYear / twoYears.totalFee)} 적습니다. ` +
      `36개월이면 연요율이 ${ro(rate(threeYears.annualRate, 3))} 한 단계 더 올라 ${won(threeYears.totalFee)}이고, 1년 세 번 ${won(thriceOneYear)}과의 차이는 ${ro(won(threeYears.totalFee - thriceOneYear))} 벌어집니다. ` +
      `기간이 길수록 요율 구간이 올라가는 구조라 "길게 한 번"이 단가에서는 항상 불리하며, 다만 갱신 때마다 심사와 가입 기한(계약 기간 절반 이전)을 다시 맞춰야 하는 수고와 맞바꾸는 문제입니다.`,
  };
}

function tierBoundary(): Finding {
  const m24 = run({ months: 24 });
  const m25 = run({ months: 25 });
  const m12 = run({ months: 12 });
  const m13 = run({ months: 13 });
  return {
    h2: `24개월과 25개월의 보증료 차이는 ${won(m25.totalFee - m24.totalFee)} — 한 달치 ${won(m24.monthlyEquivalent)}의 ${times(m25.totalFee - m24.totalFee, m24.monthlyEquivalent)}`,
    body:
      `보증기간 구간이 바뀌는 경계에서는 한 달을 늘리는 값이 한 달치가 아닙니다(가정 조건). 24개월 보증료 ${won(m24.totalFee)}에서 25개월은 ${won(m25.totalFee)}로, 요율이 연 ${rate(m24.annualRate, 3)}에서 ${ro(rate(m25.annualRate, 3))} 오르면서 ${ga(won(m25.totalFee - m24.totalFee))} 늘어납니다. ` +
      `구간 안에서 한 달의 값어치가 ${won(m24.monthlyEquivalent)}이니 경계의 한 달은 그 ${times(m25.totalFee - m24.totalFee, m24.monthlyEquivalent)}입니다. ` +
      `12→13개월 경계도 마찬가지로 ${won(m12.totalFee)}에서 ${ro(won(m13.totalFee))} ${won(m13.totalFee - m12.totalFee)} 뜁니다. ` +
      `계약 기간이 2년 1개월처럼 구간을 살짝 넘긴다면 보증기간을 24개월로 맞추고 잔여는 갱신으로 처리하는 편이 이 계산기 기준으로는 ${won(m25.totalFee - m24.totalFee - m24.monthlyEquivalent)} 유리합니다.`,
  };
}

function debtTierSpread(): Finding {
  const le70 = run({ debtTier: "le70" });
  const le80 = run({ debtTier: "le80" });
  const gt80 = run({ debtTier: "gt80" });
  const other = run({ housingType: "other" });
  return {
    h2: `부채비율 한 구간은 보증료 ${pct(le80.totalFee / le70.totalFee - 1, 0)}, 주택유형은 ${pct(other.totalFee / le70.totalFee - 1, 0)}이다`,
    body:
      `보증금 ${manwon(GUARANTEE_BASE.deposit)}, ${GUARANTEE_BASE.months}개월(가정) 아파트 보증료는 부채비율 70% 이하 ${won(le70.totalFee)}, 80% 이하 ${won(le80.totalFee)}, 80% 초과 ${won(gt80.totalFee)}입니다. ` +
      `한 구간 올라갈 때마다 ${won(le80.totalFee - le70.totalFee)}·${won(gt80.totalFee - le80.totalFee)}씩 늘어 최저와 최고의 차이가 ${won(gt80.totalFee - le70.totalFee)}, ${pct(gt80.totalFee / le70.totalFee - 1)}입니다. ` +
      `같은 조건에서 주택유형만 아파트가 아닌 것으로 바꾸면 ${ro(won(other.totalFee))} ${pct(other.totalFee / le70.totalFee - 1)} 오르고, 부채비율 80% 초과인 비아파트는 ${ro(won(run({ housingType: "other", debtTier: "gt80" }).totalFee))} 기본 조건의 ${times(run({ housingType: "other", debtTier: "gt80" }).totalFee, le70.totalFee)}입니다. ` +
      `세 축 중 세입자가 계약 전에 움직일 수 있는 것은 부채비율(보증금을 낮추거나 근저당 있는 집을 피하는 것)뿐이며, 한 구간 내리는 값이 2년에 ${won(le80.totalFee - le70.totalFee)}입니다.`,
  };
}

function discountValue(): Finding {
  const rows = [0.1, 0.4, 0.6].map((discountRate) => ({ discountRate, r: run({ discountRate }) }));
  return {
    h2: `전자계약 할인 ${eun(pct(rows[0].discountRate, 0))} ${won(rows[0].r.discountAmount)}, 사회배려 최대 ${eun(pct(rows[2].discountRate, 0))} ${won(rows[2].r.discountAmount)}`,
    body:
      `기본 보증료 ${won(run({}).totalFee)}(가정 조건)에서 할인 ${eul(pct(rows[0].discountRate, 0))} 받으면 ${won(rows[0].r.discountedFee)}, ${pct(rows[1].discountRate, 0)}면 ${won(rows[1].r.discountedFee)}, ${pct(rows[2].discountRate, 0)}면 ${won(rows[2].r.discountedFee)}입니다. ` +
      `월 환산으로는 ${won(rows[0].r.monthlyEquivalent)}·${won(rows[1].r.monthlyEquivalent)}·${won(rows[2].r.monthlyEquivalent)}입니다. ` +
      `${pct(rows[0].discountRate, 0)} 할인액 ${eun(won(rows[0].r.discountAmount))} 부채비율을 한 구간 내릴 때의 절감 ${wa(won(run({ debtTier: "le80" }).totalFee - run({}).totalFee))} 비슷한 크기라, 서류 방식 하나가 담보 조건 한 단계와 맞먹습니다. ` +
      `${pct(rows[2].discountRate, 0)} 할인을 받으면 비아파트·부채비율 80% 초과의 최고 요율 조건이라도 보증료가 ${ro(won(run({ housingType: "other", debtTier: "gt80", discountRate: 0.6 }).discountedFee))} 아파트 기본 조건 ${won(run({}).totalFee)}보다 ${won(run({}).totalFee - run({ housingType: "other", debtTier: "gt80", discountRate: 0.6 }).discountedFee)} 적습니다.`,
  };
}

function depositLadder(): Finding {
  const rows = [100_000_000, 300_000_000, 500_000_000, 700_000_000].map((deposit) => ({ deposit, r: run({ deposit }) }));
  const over = run({ deposit: GUARANTEE_LIMIT_METRO + 1 });
  const overOther = run({ deposit: GUARANTEE_LIMIT_OTHER + 1, isMetropolitan: false });
  return {
    h2: `보증금 ${manwon(rows[0].deposit)}당 2년 ${won(rows[0].r.totalFee)} — 수도권 ${manwon(GUARANTEE_LIMIT_METRO)}·그 외 ${eul(manwon(GUARANTEE_LIMIT_OTHER))} 1원이라도 넘으면 가입 자체가 막힌다`,
    body:
      `아파트·부채비율 70% 이하·${GUARANTEE_BASE.months}개월(가정) 보증료는 보증금 ${manwon(rows[0].deposit)} ${won(rows[0].r.totalFee)}, ${manwon(rows[1].deposit)} ${won(rows[1].r.totalFee)}, ${manwon(rows[2].deposit)} ${won(rows[2].r.totalFee)}, ${manwon(rows[3].deposit)} ${ro(won(rows[3].r.totalFee))} 정확히 정비례합니다. ` +
      `보증금이 ${manwon(GUARANTEE_LIMIT_METRO)}이면 수도권 한도 안이지만 ${won(over.limit + 1)}부터는 한도 초과로 표시되고, 비수도권은 ${won(overOther.limit + 1)}부터 초과입니다. ` +
      `보증료는 보증금 크기에 따라 매끄럽게 오르는 반면 가입 가능 여부는 한도에서 절벽처럼 끊기므로, 보증금 ${manwon(GUARANTEE_LIMIT_METRO)} 근처 계약은 ${won(rows[3].r.totalFee)}의 보증료보다 "가입이 되느냐"가 먼저입니다. ` +
      `한도를 넘는 계약은 보증금을 ${manwon(GUARANTEE_LIMIT_METRO)} 이하로 조정하거나 다른 보증기관의 상한을 확인해야 합니다.`,
  };
}

function longTermCeiling(): Finding {
  const m60 = run({ months: 60 });
  const m61 = run({ months: 61 });
  const m72 = run({ months: 72 });
  const yearly12 = run({ months: 12 }).totalFee * 6;
  return {
    h2: `72개월 보증료 ${eun(won(m72.totalFee))} 12개월 여섯 번 ${won(yearly12)}보다 ${pct(m72.totalFee / yearly12 - 1)} 비싸다`,
    body:
      `보증기간이 60개월을 넘으면 최고 요율 구간(연 ${rate(m61.annualRate, 3)})에 들어갑니다(가정 조건). 60개월 보증료 ${won(m60.totalFee)}에서 61개월은 ${ro(won(m61.totalFee))} 한 달에 ${ga(won(m61.totalFee - m60.totalFee))} 늘고, 72개월이면 ${won(m72.totalFee)}입니다. ` +
      `같은 6년을 12개월 단위로 여섯 번 가입하면 ${won(yearly12)}이라 장기 한 번이 ${won(m72.totalFee - yearly12)} 더 듭니다. ` +
      `월 환산 보증료는 12개월 ${won(run({ months: 12 }).monthlyEquivalent)}, 24개월 ${won(run({}).monthlyEquivalent)}, 60개월 ${won(m60.monthlyEquivalent)}, 72개월 ${ro(won(m72.monthlyEquivalent))} 기간이 길수록 단가가 오르는 유일한 방향입니다. ` +
      `장기 계약의 편의와 요율 상승 사이의 차이가 이 계산기에서 정량으로 드러나는 지점이며, 2년 갱신 계약이 표준인 이유 하나가 여기 있습니다.`,
  };
}

function feeVsInterestShare(): Finding {
  const r = run({});
  const ASSUMED_RATE = 3.5;
  const monthlyInterest = GUARANTEE_BASE.deposit * (ASSUMED_RATE / 100 / 12);
  const totalInterest = monthlyInterest * GUARANTEE_BASE.months;
  const parityRate = (r.monthlyEquivalent * 12) / GUARANTEE_BASE.deposit * 100;
  return {
    h2: `보증료는 연 ${rate(parityRate, 3)} 금리와 같다 — 대출 이자 ${rate(ASSUMED_RATE)}(가정)의 ${pct(parityRate / ASSUMED_RATE)}`,
    body:
      `보증료 ${eul(won(r.totalFee))} 보증금 ${manwon(GUARANTEE_BASE.deposit)}에 대한 연이율로 환산하면 ${rate(parityRate, 3)}입니다(가정 조건). ` +
      `보증금 전액을 연 ${rate(ASSUMED_RATE)}(가정)로 빌렸다면 ${GUARANTEE_BASE.months}개월 이자가 ${won(totalInterest)}이고 보증료는 그 ${pct(r.totalFee / totalInterest)}입니다. ` +
      `부채비율 80% 초과·비아파트의 최고 요율로 가도 ${ro(rate(run({ housingType: "other", debtTier: "gt80" }).annualRate, 3))} 이자의 ${pct(run({ housingType: "other", debtTier: "gt80" }).totalFee / totalInterest)}에 그칩니다. ` +
      `즉 보증 가입은 대출 금리 ${pp(parityRate)} 안팎을 더 내는 결정이고, 그 대가로 보증금 ${manwon(GUARANTEE_BASE.deposit)} 전액의 반환을 담보받습니다. 금리 ${pp(0.1)} 우대를 찾아다니는 수고와 비교하면 규모가 비슷한 결정입니다.`,
  };
}

export const JEONSE_GUARANTEE_DIGEST: Finding[] = [
  defaultCase(),
  oneYearTwiceVsTwoYears(),
  tierBoundary(),
  debtTierSpread(),
  discountValue(),
  depositLadder(),
  longTermCeiling(),
  feeVsInterestShare(),
];
