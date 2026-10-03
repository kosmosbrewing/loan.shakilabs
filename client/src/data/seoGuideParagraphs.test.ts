import { describe, expect, it } from "vitest";

import { STEPPING_STONE_DIGEST } from "./digests";
import {
  LOAN_ABOUT_GUIDE,
  LOAN_DSR_GUIDE,
  LOAN_HOME_GUIDE,
  LOAN_JEONSE_GUARANTEE_PAGE_GUIDE,
  LOAN_JEONSE_GUIDE,
  LOAN_LTV_GUIDE,
  LOAN_MORTGAGE_GUIDE,
  LOAN_PREPAYMENT_GUIDE,
  LOAN_REFINANCE_GUIDE,
  LOAN_REPAYMENT_GUIDE,
  LOAN_STEPPING_STONE_GUIDE,
  LOAN_STUDENT_LOAN_GUIDE,
  type GuideData,
} from "./seoGuides";

// BRIEF-V8 loan — /stepping-stone-loan 계산기 아래에 643자 단일 문단이 있었다(가독성 결함:
// 보조 산문은 200~250자 안쪽이어야 한다). seller #3(commit 831fb89)과 같은 규칙으로 고쳤다 —
// GuideSection.body를 string | string[]로 늘리고, 이미 나뉘어 있던 문장들을 chunkSentences로
// 200자 이내 문단으로만 재배열했다(SeoRichGuide.vue가 배열이면 <p>를 요소마다 하나씩 찍는다).
// 역방향 확인: 분할을 되돌려 다시 하나의 긴 문단으로 합치면 아래 "250자 상한" 테스트가 즉시
// 실패해야 한다 — 그 외 어떤 수치·문장도 지우지 않았음은 재조합 테스트가 보장한다.
const MAX_PARAGRAPH_CHARS = 250;

function paragraphsOf(body: string | string[]): string[] {
  return Array.isArray(body) ? body : [body];
}

// loan 앱이 노출하는 가이드 12개 전부 — 계산기 10페이지 + /(홈) + /about.
const GUIDES: Record<string, GuideData> = {
  LOAN_HOME_GUIDE,
  LOAN_DSR_GUIDE,
  LOAN_LTV_GUIDE,
  LOAN_REPAYMENT_GUIDE,
  LOAN_JEONSE_GUIDE,
  LOAN_MORTGAGE_GUIDE,
  LOAN_ABOUT_GUIDE,
  LOAN_REFINANCE_GUIDE,
  LOAN_PREPAYMENT_GUIDE,
  LOAN_STUDENT_LOAN_GUIDE,
  LOAN_STEPPING_STONE_GUIDE,
  LOAN_JEONSE_GUARANTEE_PAGE_GUIDE,
};

describe("가이드 문단 길이 상한 (BRIEF-V8 loan)", () => {
  it.each(Object.entries(GUIDES))("%s: 모든 섹션의 렌더 문단(<p>)이 250자를 넘지 않는다", (_name, guide) => {
    for (const section of guide.sections ?? []) {
      for (const paragraph of paragraphsOf(section.body)) {
        expect(
          paragraph.length,
          `"${section.h2}" 문단이 ${MAX_PARAGRAPH_CHARS}자를 넘음(${paragraph.length}자): ${paragraph}`,
        ).toBeLessThanOrEqual(MAX_PARAGRAPH_CHARS);
      }
    }
  });

  it("/stepping-stone-loan의 643자 문단(incomeCeilingCliff)이 여러 문단으로 쪼개져 있다", () => {
    // STEPPING_STONE_DIGEST 7번째 발견(인덱스 6) — v8 감사가 지목한 643자 단일 문단의 출처.
    const finding = STEPPING_STONE_DIGEST[6];
    expect(finding.h2, "다이제스트 순서가 바뀌었다 — incomeCeilingCliff가 맞는지 확인").toContain("소득 상한");
    expect(Array.isArray(finding.body), "body가 배열(여러 문단)이 아니다 — 분할이 되돌아갔다").toBe(true);
    expect((finding.body as string[]).length).toBeGreaterThan(1);
    for (const paragraph of finding.body as string[]) {
      expect(paragraph.length).toBeLessThanOrEqual(MAX_PARAGRAPH_CHARS);
    }
  });

  it("643자 문단이 원문 문장을 전부 보존한다 — 재조합(역방향 확인)으로 삭제 여부를 검사", () => {
    const finding = STEPPING_STONE_DIGEST[6];
    const combined = paragraphsOf(finding.body).join(" ");

    // 분할 전 643자 문단에 있던 5개 문장의 고정 문구(계산 숫자는 조건마다 달라지므로 제외)가
    // 모두 남아 있는지 확인한다 — 하나라도 없으면 분할 과정에서 문장이 삭제된 것이다.
    expect(combined).toContain("이면 자격이 유지되어 금리");
    expect(combined).toContain("로 판정하는데, 이때 그대로 남는 값은 상품 한도");
    expect(combined).toContain("소득이 다음 금리 구간");
    expect(combined).toContain("으로 함께 움직이기 때문입니다.");
    expect(combined).toContain("자격을 잃고도 같은 금액을 빌린다고 놓고 비교하면");
    expect(combined).toContain("일반 유형의 상한");
    expect(combined).toContain("판정만 새로 붙습니다.");
    expect(combined).toContain(
      "자격 절벽이 숫자를 얼마나 흔드는지는 상한이 금리표 구간 경계와 겹치는지에 달렸다는 뜻이고, " +
        "이 계산기는 자격 밖이어도 수치를 계속 보여 주므로 결과 상단의 자격 판정을 먼저 읽는 순서가 맞습니다.",
    );
  });
});
