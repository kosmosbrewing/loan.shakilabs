# loan.shakilabs — 작업 규칙

- 스택: Vue 3 + Vite(클라이언트 SPA), 공통 UI `@shakilabs/ui`(`client/vendor/*.tgz` 고정). 배포는 Vercel Git 통합(`shakilabs.com/loan`).

## 검증 (CI와 같은 순서, `client/`에서)
```sh
npm ci
npm run typecheck
npm test
npm run build
node scripts/verify-sbom-identity.mjs && node scripts/verify-vendor-readme.mjs
```
- 빌드가 "UI characters changed" 등 폰트 게이트로 멈추면 `npm run fonts:subset` 후 다시 빌드.
- 빌드가 `public/sitemap.xml`의 lastmod만 바꿨다면 그 변경은 커밋하지 않는다(`git checkout -- client/public/sitemap.xml`).
- 테스트를 skip하거나 게이트를 끄지 않는다.

## 계산기 화면 레이아웃
1. lg(1024px) 이상은 `ShCalculatorSplit`으로 왼쪽 입력 | 오른쪽 결과 2등분. 모바일은 DOM 순서대로 입력 → 결과 → 보조.
2. 결과가 입력보다 300px 이상 길면 `below-input` 슬롯(입력과 관련된 표·출처 노트)으로 왼쪽을 채우거나, 결과의 상세 표·차트를 1×2 아래 전폭으로 내린다.
3. 결과 칸 sticky는 컴포넌트가 창 높이·내용 높이로 스스로 판정한다 — 뷰에서 켜지 않는다. **`ShCalculatorSplit`이나 그 조상 요소에 `overflow-*`를 걸면 sticky가 죽는다**(`position:sticky`가 조용히 무효화됨, 콘솔 에러 없음 — 실측 필수).
4. 반폭 칸 안의 표는 가로로 잘리면 안 된다(문서 넘침 0이어도 실패). `ShTable`(min-width 32rem 강제)이나 6열 이상 표는 below-input이 아니라 1×2 아래 전폭에 둔다.
