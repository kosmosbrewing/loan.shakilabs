# 대출 계산기 · shakilabs

**▶ 라이브 서비스: <https://shakilabs.com/loan>**

DSR·LTV 한도부터 주담대 금리 비교, 전세보증보험 보증료(HUG 2025-03 요율)까지 대출 의사결정 계산기 모음.

## 주요 도구

- [DSR 계산](https://shakilabs.com/loan/dsr)
- [LTV·DTI·DSR 통합](https://shakilabs.com/loan/ltv-dti)
- [주담대 금리 비교](https://shakilabs.com/loan/mortgage-compare)
- [전세보증보험 보증료](https://shakilabs.com/loan/jeonse-guarantee-fee)
- [대환대출 갈아타기](https://shakilabs.com/loan/refinance)
- [중도상환수수료](https://shakilabs.com/loan/prepayment-fee)

전체 서비스 12종: <https://shakilabs.com>

## 스택

Vue 3 (Composition API) · TypeScript · Vite · Tailwind CSS · 공유 UI `@shakilabs/ui`
정적 프리렌더/SSG로 배포하며, 계산 로직은 Vitest 경계값 테스트로 검증합니다.

## 개발

```bash
cd client
npm install
npm run dev
```
