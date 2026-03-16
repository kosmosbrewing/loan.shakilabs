import type { CategoryKey } from "./marketFees";

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  emoji: string;
  slug: string; // SEO URL용
}

export const CATEGORIES: CategoryInfo[] = [
  { key: "clothing", label: "의류/패션", emoji: "👕", slug: "clothing" },
  { key: "food", label: "식품", emoji: "🍎", slug: "food" },
  { key: "electronics", label: "전자기기", emoji: "📱", slug: "electronics" },
  { key: "living", label: "생활/건강", emoji: "🏠", slug: "living" },
  { key: "beauty", label: "뷰티", emoji: "💄", slug: "beauty" },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryInfo> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
) as Record<CategoryKey, CategoryInfo>;

// SEO 슬러그 → 카테고리 키 매핑
export const SLUG_TO_CATEGORY: Record<string, CategoryKey> = {
  clothing: "clothing",
  food: "food",
  electronics: "electronics",
  beauty: "beauty",
  living: "living",
};
