import { describe, expect, it } from "vitest";
import { JEONSE_LOAN_PRODUCTS } from "@/data/jeonseLoan";
import { GENERAL_RATES, SPECIAL_RATES } from "@/data/steppingStoneLoan";

describe("2026 policy loan snapshots", () => {
  it("청년·일반 버팀목 금리와 한도를 반영한다", () => {
    const youth = JEONSE_LOAN_PRODUCTS.find((item) => item.id === "youth");
    const general = JEONSE_LOAN_PRODUCTS.find((item) => item.id === "buttimok");
    expect(youth).toMatchObject({ minRate: 2.2, maxRate: 3.3, maxAmount: 150_000_000 });
    expect(general).toMatchObject({ minRate: 2.5, maxRate: 3.5, maxAmount: 120_000_000 });
  });

  it("디딤돌 일반·생애최초 신혼가구 금리표를 구분한다", () => {
    expect(GENERAL_RATES[0]?.rates["10"]).toBe(2.85);
    expect(SPECIAL_RATES[0]?.rates["10"]).toBe(2.55);
  });
});
