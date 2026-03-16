export type ShippingSizeKey = "small" | "medium" | "large" | "xlarge";
export type ShippingCarrierCategory = "general" | "convenience";
export type ShippingPricingMode = "profile" | "band";
export type ShippingCarrierKey =
  | "cj"
  | "hanjin"
  | "logen"
  | "epost"
  | "kdexp"
  | "lotte"
  | "cu"
  | "gs25";

export interface ShippingSizeProfile {
  key: ShippingSizeKey;
  label: string;
  maxSumCm: number;
  includedWeightKg: number;
  baseFare: number;
}

export interface ShippingRateBand {
  sizeKey: ShippingSizeKey;
  label: string;
  maxWeightKg: number;
  maxSumCm: number;
  fare: number;
}

export interface ShippingCarrierMeta {
  key: ShippingCarrierKey;
  name: string;
  shortName: string;
  category: ShippingCarrierCategory;
  pricingMode: ShippingPricingMode;
  color: string;
  sourceUrl: string;
  maxWeightKg: number;
  maxSumCm: number;
  extraWeightFeePerKg?: number;
  restrictionNote: string;
  estimateNote: string;
  rateBasis: string;
  sizeProfiles?: Record<ShippingSizeKey, ShippingSizeProfile>;
  rateBands?: ShippingRateBand[];
}

export interface ShippingEstimateInput {
  weightKg: number;
  size: ShippingSizeKey;
  sumCm?: number | null;
}

export interface ShippingEstimateResult {
  carrier: ShippingCarrierMeta;
  baseFare: number;
  weightSurcharge: number;
  totalFare: number;
  effectiveSize: ShippingSizeKey;
  effectiveSizeLabel: string;
  sumCm: number | null;
  isAvailable: boolean;
  restrictionText: string;
  unavailableReason?: string;
}

export interface RemoteAreaPostalCodeSummaryCluster {
  zone: string;
  areas?: string;
  postalRanges: string[];
  note?: string;
}

export interface RemoteAreaPostalCodeSummaryGroup {
  group: string;
  clusters: RemoteAreaPostalCodeSummaryCluster[];
}

export const SHIPPING_DATA_UPDATED: string = "2026.03";
export const SHIPPING_DATA_VERIFIED: string = "2026.03";

export const SHIPPING_WEIGHT_PRESETS = [1, 2, 3, 5, 10, 20] as const;

export const SHIPPING_SIZE_ORDER: ShippingSizeKey[] = ["small", "medium", "large", "xlarge"];

export const SHIPPING_SIZE_LABELS: Record<ShippingSizeKey, string> = {
  small: "소형",
  medium: "중형",
  large: "대형",
  xlarge: "특대",
};

export const SIZE_SUM_THRESHOLDS: Record<ShippingSizeKey, number> = {
  small: 80,
  medium: 100,
  large: 120,
  xlarge: 160,
};

export const REMOTE_AREA_POSTAL_CODE_SUMMARY: RemoteAreaPostalCodeSummaryGroup[] = [
  {
    group: "제주",
    clusters: [
      { zone: "제주 본섬", areas: "제주시·서귀포시", postalRanges: ["63002-63644"] },
      { zone: "추자면", areas: "추자도 일대", postalRanges: ["63000-63001"], note: "제주 본섬과 별도로 도서산간 할증이 적용될 수 있습니다" },
      { zone: "우도면", postalRanges: ["63365"], note: "일부 택배사에서 별도 도서산간으로 분류합니다" },
    ],
  },
  {
    group: "경기",
    clusters: [
      { zone: "풍도", areas: "안산시 단원구", postalRanges: ["15654"], note: "경기도이나 도서산간 추가운임이 적용됩니다" },
    ],
  },
  {
    group: "인천",
    clusters: [
      { zone: "중구", postalRanges: ["22386-22388"] },
      { zone: "강화", postalRanges: ["23008-23010"], note: "택배사에 따라 23004부터 적용하는 경우도 있습니다" },
      { zone: "옹진", postalRanges: ["23100-23116", "23124-23136"] },
    ],
  },
  {
    group: "충남",
    clusters: [
      { zone: "서해안", areas: "당진·태안·보령", postalRanges: ["31708", "32133", "33411"] },
    ],
  },
  {
    group: "경북",
    clusters: [
      { zone: "울릉도", postalRanges: ["40200-40240"] },
    ],
  },
  {
    group: "부산",
    clusters: [
      { zone: "강서구", postalRanges: ["46768-46771"] },
    ],
  },
  {
    group: "경남",
    clusters: [
      { zone: "사천", postalRanges: ["52570-52571"] },
      { zone: "통영", postalRanges: ["53031-53033", "53088-53104"], note: "택배사에 따라 53089부터 적용하는 경우도 있습니다" },
    ],
  },
  {
    group: "전북",
    clusters: [
      { zone: "옥도면", areas: "군산시", postalRanges: ["54000"], note: "도서산간 추가운임이 적용됩니다" },
      { zone: "부안", postalRanges: ["56347-56349"] },
    ],
  },
  {
    group: "전남",
    clusters: [
      { zone: "영광", postalRanges: ["57068-57069"] },
      { zone: "목포", postalRanges: ["58760-58761"], note: "택배사에 따라 58762까지 포함하는 경우도 있습니다" },
      {
        zone: "신안",
        postalRanges: ["58800-58804", "58809-58810", "58816-58818", "58826", "58832", "58839-58841", "58843-58866"],
        note: "택배사에 따라 적용 범위가 다를 수 있습니다",
      },
      { zone: "진도", postalRanges: ["58953-58958"] },
      {
        zone: "완도",
        postalRanges: ["59102-59103", "59127", "59137-59145", "59149-59170"],
        note: "택배사에 따라 적용 범위가 다를 수 있습니다",
      },
      { zone: "보성 벌교읍", postalRanges: ["59421"], note: "도서산간 추가운임이 적용됩니다" },
      { zone: "고흥", postalRanges: ["59531", "59551", "59563", "59568"], note: "도서산간 추가운임이 적용됩니다" },
      { zone: "여수", postalRanges: ["59650", "59766", "59781-59790"] },
    ],
  },
];

const GENERAL_BASE_PROFILES: Record<ShippingSizeKey, Omit<ShippingSizeProfile, "key" | "label">> = {
  small: { maxSumCm: 80, includedWeightKg: 1, baseFare: 4000 },
  medium: { maxSumCm: 100, includedWeightKg: 3, baseFare: 5000 },
  large: { maxSumCm: 120, includedWeightKg: 5, baseFare: 6200 },
  xlarge: { maxSumCm: 160, includedWeightKg: 10, baseFare: 7800 },
};

function buildProfiles(
  overrides: Partial<Record<ShippingSizeKey, Partial<Omit<ShippingSizeProfile, "key" | "label">>>> = {}
): Record<ShippingSizeKey, ShippingSizeProfile> {
  return SHIPPING_SIZE_ORDER.reduce((acc, key) => {
    const base = GENERAL_BASE_PROFILES[key];
    const next = {
      ...base,
      ...overrides[key],
    };

    acc[key] = {
      key,
      label: SHIPPING_SIZE_LABELS[key],
      maxSumCm: next.maxSumCm,
      includedWeightKg: next.includedWeightKg,
      baseFare: next.baseFare,
    };
    return acc;
  }, {} as Record<ShippingSizeKey, ShippingSizeProfile>);
}

function buildBand(
  sizeKey: ShippingSizeKey,
  maxWeightKg: number,
  maxSumCm: number,
  fare: number,
  label = SHIPPING_SIZE_LABELS[sizeKey]
): ShippingRateBand {
  return { sizeKey, label, maxWeightKg, maxSumCm, fare };
}

// Verified against official public pages on 2026-03-07 where available.
// For carriers without a directly indexed public tariff page, conservative estimate profiles are retained.
export const SHIPPING_CARRIERS: ShippingCarrierMeta[] = [
  {
    key: "cj",
    name: "CJ대한통운",
    shortName: "CJ",
    category: "general",
    pricingMode: "profile",
    color: "#F58220",
    sourceUrl: "https://www.cjlogistics.com/ko/main",
    maxWeightKg: 20,
    maxSumCm: 160,
    extraWeightFeePerKg: 250,
    restrictionNote: "20kg 이하 · 3변 합 160cm 이하 · 지역별 할증 별도",
    estimateNote: "공개 운임표 비노출로 예약 화면 기준 추정 모델 적용",
    rateBasis: "공식 공개 운임표 미확인 · 오네 예약 기준 추정",
    sizeProfiles: buildProfiles(),
  },
  {
    key: "hanjin",
    name: "한진택배",
    shortName: "한진",
    category: "general",
    pricingMode: "band",
    color: "#004B8D",
    sourceUrl: "https://www.hanjin.com/kor/CMS/Contents/Contents.do?mCode=MN130",
    maxWeightKg: 20,
    maxSumCm: 160,
    restrictionNote: "20kg 이하 · 3변 합 160cm 이하 · 타권/제주 추가",
    estimateNote: "한진 요금안내 기반 동일권 기준",
    rateBasis: "한진 공식 요금안내(동일권 기준)",
    rateBands: [
      buildBand("small", 3, 80, 5000),
      buildBand("medium", 5, 100, 6000),
      buildBand("large", 15, 120, 7000),
      buildBand("xlarge", 20, 160, 8000),
    ],
  },
  {
    key: "logen",
    name: "로젠택배",
    shortName: "로젠",
    category: "general",
    pricingMode: "band",
    color: "#D9392E",
    sourceUrl: "https://www.ilogen.com/web/personal/chargeInfo",
    maxWeightKg: 25,
    maxSumCm: 160,
    restrictionNote: "타권 +1,000원 · 제주 추가운임 · 25kg 이하",
    estimateNote: "로젠 공식 요금안내 동일권 기준",
    rateBasis: "로젠 공식 요금안내(동일권 기준)",
    rateBands: [
      buildBand("small", 5, 100, 6000),
      buildBand("medium", 10, 120, 7000),
      buildBand("large", 20, 140, 9000),
      buildBand("xlarge", 25, 160, 12000),
    ],
  },
  {
    key: "epost",
    name: "우체국택배",
    shortName: "우체국",
    category: "general",
    pricingMode: "band",
    color: "#E85C2A",
    sourceUrl: "https://parcel.epost.go.kr/parcel/use_guide/charge_1.jsp",
    maxWeightKg: 30,
    maxSumCm: 160,
    restrictionNote: "30kg 이하 · 3변 합 160cm 이하 · 방문접수/익일배달은 별도",
    estimateNote: "우체국 창구 일반소포(D+3) 기준",
    rateBasis: "인터넷우체국 창구 일반소포 요금안내",
    rateBands: [
      buildBand("small", 3, 80, 2700),
      buildBand("medium", 5, 100, 3200),
      buildBand("large", 10, 120, 4700),
      buildBand("xlarge", 20, 160, 6700),
      buildBand("xlarge", 30, 160, 8200),
    ],
  },
  {
    key: "kdexp",
    name: "경동택배",
    shortName: "경동",
    category: "general",
    pricingMode: "band",
    color: "#009B4E",
    sourceUrl: "https://kdexp.com/service/charge/package_standard.do",
    maxWeightKg: 30,
    maxSumCm: 200,
    restrictionNote: "30kg 이하 · 3변 합 200cm 이하 · 지역별 편차 큼",
    estimateNote: "경동 표준운임 무게 기준 적용 · 부피·무게 중 높은 운임 적용",
    rateBasis: "경동 표준운임(무게 기준)",
    rateBands: [
      buildBand("small", 6, 100, 3000),
      buildBand("medium", 7, 120, 3400),
      buildBand("medium", 8, 120, 3800),
      buildBand("medium", 9, 120, 4200),
      buildBand("large", 10, 160, 4500),
      buildBand("large", 11, 160, 4600),
      buildBand("large", 12, 160, 4800),
      buildBand("large", 13, 160, 4900),
      buildBand("large", 14, 160, 5100),
      buildBand("large", 15, 160, 5200),
      buildBand("xlarge", 16, 200, 5400),
      buildBand("xlarge", 17, 200, 5500),
      buildBand("xlarge", 18, 200, 5700),
      buildBand("xlarge", 19, 200, 5800),
      buildBand("xlarge", 20, 200, 6000),
      buildBand("xlarge", 21, 200, 6300),
      buildBand("xlarge", 22, 200, 6600),
      buildBand("xlarge", 23, 200, 6900),
      buildBand("xlarge", 24, 200, 7200),
      buildBand("xlarge", 25, 200, 7500),
      buildBand("xlarge", 26, 200, 7800),
      buildBand("xlarge", 27, 200, 8100),
      buildBand("xlarge", 28, 200, 8400),
      buildBand("xlarge", 29, 200, 8700),
      buildBand("xlarge", 30, 200, 9000),
    ],
  },
  {
    key: "lotte",
    name: "롯데택배",
    shortName: "롯데",
    category: "general",
    pricingMode: "band",
    color: "#E0002A",
    sourceUrl: "https://www.lotteglogis.com/home/reservation/feeinfo/write",
    maxWeightKg: 20,
    maxSumCm: 160,
    restrictionNote: "동일구역 기준 · 타권/제주/고가품 할증 별도",
    estimateNote: "롯데 택배요금조회·안내 기준",
    rateBasis: "롯데글로벌로지스 택배요금조회·안내",
    rateBands: [
      buildBand("small", 5, 110, 5000),
      buildBand("large", 15, 130, 6000),
      buildBand("xlarge", 20, 160, 7000),
    ],
  },
  {
    key: "cu",
    name: "CU 편의점택배",
    shortName: "CU",
    category: "convenience",
    pricingMode: "band",
    color: "#7A38D8",
    sourceUrl: "https://www.cupost.co.kr/postbox/today/general/guidePrice.cupost",
    maxWeightKg: 30,
    maxSumCm: 160,
    restrictionNote: "동일권 기준 · 도서 +4,000원 · 착불 0~2kg +300원",
    estimateNote: "CUpost 국내택배 운임표 동일권 기준",
    rateBasis: "CUpost 국내택배 운임안내",
    rateBands: [
      buildBand("small", 0.35, 80, 2600, "초경량"),
      buildBand("small", 0.4, 80, 2800, "초경량"),
      buildBand("small", 0.45, 80, 2900, "초경량"),
      buildBand("small", 0.5, 80, 3100, "초경량"),
      buildBand("small", 0.6, 80, 3300, "소형"),
      buildBand("small", 0.7, 80, 3400, "소형"),
      buildBand("small", 0.8, 80, 3500, "소형"),
      buildBand("small", 0.9, 80, 3600, "소형"),
      buildBand("small", 1, 80, 3700, "소형"),
      buildBand("small", 1.5, 100, 3800, "소형"),
      buildBand("medium", 2, 100, 4100),
      buildBand("medium", 3, 100, 4300),
      buildBand("medium", 4, 120, 4400),
      buildBand("medium", 5, 120, 4600),
      buildBand("large", 10, 140, 5000),
      buildBand("xlarge", 20, 160, 6000),
      buildBand("xlarge", 30, 160, 7000),
    ],
  },
  {
    key: "gs25",
    name: "GS25 편의점택배",
    shortName: "GS25",
    category: "convenience",
    pricingMode: "band",
    color: "#0085CA",
    sourceUrl: "https://www.cvsnet.co.kr/service/national-delivery/use/contentsid/205/index.do",
    maxWeightKg: 20,
    maxSumCm: 160,
    restrictionNote: "동일권 기준 · 도서 +4,000원 · 착불 0~2kg +300원",
    estimateNote: "GS Postbox 국내택배 운임표 동일권 기준",
    rateBasis: "GS Postbox 국내택배 이용운임 안내",
    rateBands: [
      buildBand("small", 0.35, 80, 3400, "초경량"),
      buildBand("small", 0.4, 80, 3600, "초경량"),
      buildBand("small", 0.45, 80, 3700, "초경량"),
      buildBand("small", 0.5, 80, 3900, "초경량"),
      buildBand("small", 0.6, 80, 4100, "소형"),
      buildBand("small", 0.7, 80, 4200, "소형"),
      buildBand("small", 0.8, 80, 4300, "소형"),
      buildBand("small", 0.9, 80, 4400, "소형"),
      buildBand("small", 1, 80, 4500, "소형"),
      buildBand("small", 1.5, 100, 4800, "소형"),
      buildBand("medium", 2, 100, 5100),
      buildBand("medium", 3, 100, 5400),
      buildBand("medium", 4, 120, 5500),
      buildBand("medium", 5, 120, 5700),
      buildBand("large", 7, 140, 6700),
      buildBand("large", 10, 140, 7200),
      buildBand("xlarge", 15, 160, 8000),
      buildBand("xlarge", 20, 160, 9000),
    ],
  },
];

const SHIPPING_SOURCE_LABELS: Record<ShippingCarrierKey, string> = {
  cj: "CJ대한통운 공식 사이트 · 공개 운임표 미확인",
  hanjin: "한진 요금안내",
  logen: "로젠 요금안내",
  epost: "우체국 창구소포 요금안내",
  kdexp: "경동 표준운임",
  lotte: "롯데 택배요금조회/안내",
  cu: "CUpost 국내택배 운임안내",
  gs25: "GS Postbox 국내택배 안내",
};

export const SHIPPING_SOURCES = SHIPPING_CARRIERS.map(({ key, name, sourceUrl }) => ({
  name,
  url: sourceUrl,
  basis: SHIPPING_SOURCE_LABELS[key],
}));

export function parseShippingWeight(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const normalized = Math.round(value * 10) / 10;
  if (normalized < 0.1 || normalized > 30) return null;
  return normalized;
}

export function parseShippingSumCm(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const normalized = Math.round(value);
  if (normalized < 10 || normalized > 200) return null;
  return normalized;
}

export function resolveShippingSize(sumCm: number | null | undefined): ShippingSizeKey | null {
  if (sumCm == null) return null;
  if (sumCm <= SIZE_SUM_THRESHOLDS.small) return "small";
  if (sumCm <= SIZE_SUM_THRESHOLDS.medium) return "medium";
  if (sumCm <= SIZE_SUM_THRESHOLDS.large) return "large";
  // 160cm 초과도 특대로 분류 (경동 등 200cm까지 접수 가능한 택배사 존재)
  return "xlarge";
}

function estimateFromBands(
  carrier: ShippingCarrierMeta,
  input: ShippingEstimateInput,
  effectiveSumCm: number,
  normalizedSumCm: number | null
): ShippingEstimateResult {
  const matchingBand = carrier.rateBands?.find(
    (band) => input.weightKg <= band.maxWeightKg && effectiveSumCm <= band.maxSumCm
  );

  if (!matchingBand) {
    return {
      carrier,
      baseFare: 0,
      weightSurcharge: 0,
      totalFare: Number.POSITIVE_INFINITY,
      effectiveSize: resolveShippingSize(normalizedSumCm) ?? input.size,
      effectiveSizeLabel: SHIPPING_SIZE_LABELS[resolveShippingSize(normalizedSumCm) ?? input.size],
      sumCm: normalizedSumCm,
      isAvailable: false,
      restrictionText: carrier.restrictionNote,
      unavailableReason: `현재 조건은 ${carrier.rateBasis} 구간을 초과합니다.`,
    };
  }

  return {
    carrier,
    baseFare: matchingBand.fare,
    weightSurcharge: 0,
    totalFare: matchingBand.fare,
    effectiveSize: matchingBand.sizeKey,
    effectiveSizeLabel: matchingBand.label,
    sumCm: normalizedSumCm,
    isAvailable: true,
    restrictionText: carrier.restrictionNote,
  };
}

function estimateFromProfiles(
  carrier: ShippingCarrierMeta,
  input: ShippingEstimateInput,
  resolvedSize: ShippingSizeKey,
  normalizedSumCm: number | null
): ShippingEstimateResult {
  const profile = carrier.sizeProfiles?.[resolvedSize];
  if (!profile) {
    return {
      carrier,
      baseFare: 0,
      weightSurcharge: 0,
      totalFare: Number.POSITIVE_INFINITY,
      effectiveSize: resolvedSize,
      effectiveSizeLabel: SHIPPING_SIZE_LABELS[resolvedSize],
      sumCm: normalizedSumCm,
      isAvailable: false,
      restrictionText: carrier.restrictionNote,
      unavailableReason: "운임 프로필이 정의되지 않았습니다.",
    };
  }

  const exceedsWeight = input.weightKg > carrier.maxWeightKg;
  const exceedsSum = normalizedSumCm != null && normalizedSumCm > carrier.maxSumCm;

  if (exceedsWeight || exceedsSum) {
    return {
      carrier,
      baseFare: 0,
      weightSurcharge: 0,
      totalFare: Number.POSITIVE_INFINITY,
      effectiveSize: resolvedSize,
      effectiveSizeLabel: profile.label,
      sumCm: normalizedSumCm,
      isAvailable: false,
      restrictionText: carrier.restrictionNote,
      unavailableReason: exceedsWeight
        ? `최대 ${carrier.maxWeightKg}kg까지 접수 가능`
        : `3변 합 ${carrier.maxSumCm}cm 이하만 접수 가능`,
    };
  }

  const extraWeightKg = Math.max(0, Math.ceil(input.weightKg - profile.includedWeightKg));
  const weightSurcharge = extraWeightKg * (carrier.extraWeightFeePerKg ?? 0);
  const totalFare = profile.baseFare + weightSurcharge;

  return {
    carrier,
    baseFare: profile.baseFare,
    weightSurcharge,
    totalFare,
    effectiveSize: resolvedSize,
    effectiveSizeLabel: profile.label,
    sumCm: normalizedSumCm,
    isAvailable: true,
    restrictionText: carrier.restrictionNote,
  };
}

export function estimateShippingRates(input: ShippingEstimateInput): ShippingEstimateResult[] {
  const normalizedSumCm = input.sumCm ?? null;
  const effectiveSumCm = normalizedSumCm ?? SIZE_SUM_THRESHOLDS[input.size];
  const resolvedSize = resolveShippingSize(input.sumCm) ?? input.size;

  return SHIPPING_CARRIERS.map((carrier) => {
    if (input.weightKg > carrier.maxWeightKg) {
      return {
        carrier,
        baseFare: 0,
        weightSurcharge: 0,
        totalFare: Number.POSITIVE_INFINITY,
        effectiveSize: resolvedSize,
        effectiveSizeLabel: SHIPPING_SIZE_LABELS[resolvedSize],
        sumCm: normalizedSumCm,
        isAvailable: false,
        restrictionText: carrier.restrictionNote,
        unavailableReason: `최대 ${carrier.maxWeightKg}kg까지 접수 가능`,
      };
    }

    if (normalizedSumCm != null && normalizedSumCm > carrier.maxSumCm) {
      return {
        carrier,
        baseFare: 0,
        weightSurcharge: 0,
        totalFare: Number.POSITIVE_INFINITY,
        effectiveSize: resolvedSize,
        effectiveSizeLabel: SHIPPING_SIZE_LABELS[resolvedSize],
        sumCm: normalizedSumCm,
        isAvailable: false,
        restrictionText: carrier.restrictionNote,
        unavailableReason: `3변 합 ${carrier.maxSumCm}cm 이하만 접수 가능`,
      };
    }

    if (carrier.pricingMode === "band") {
      return estimateFromBands(carrier, input, effectiveSumCm, normalizedSumCm);
    }

    return estimateFromProfiles(carrier, input, resolvedSize, normalizedSumCm);
  }).sort((a, b) => {
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    return a.totalFare - b.totalFare;
  });
}
