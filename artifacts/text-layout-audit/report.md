# 텍스트 배치 개선 결과

## 결과
- 대상: Loan 14개 라우트, 브라우저 69개 상태.
- 최종 판정: page overflow, 값·단위/컨트롤 줄바꿈, 텍스트 overflow, 고아줄, 슬라이더 오류 모두 0건.
- `npm run typecheck` → `npm test` → `npm run build` 통과, 50개 테스트 통과.

## 적용 내용
- 대출 지표 Grid와 중도상환·학자금 결과를 좁은 화면에서 한 열로 전환했습니다.
- 주담대·전세·디딤돌 비교 표는 페이지 대신 표 내부에서만 스크롤합니다.
- 결과 보조문구와 헤더 안내는 단어·음절 고립을 줄이는 균형/자연 줄바꿈을 사용합니다.

## 관련 코드
- [responsive-accessibility.css](../../client/src/assets/css/responsive-accessibility.css)
- [LoanMetricGrid.vue](../../client/src/components/loan/LoanMetricGrid.vue)
- [MortgageCompareCalculator.vue](../../client/src/components/loan/MortgageCompareCalculator.vue)
- [PrepaymentFeeCalculator.vue](../../client/src/components/loan/PrepaymentFeeCalculator.vue)
- [StudentLoanCalculator.vue](../../client/src/components/loan/StudentLoanCalculator.vue)

근거: `../../../artifacts/text-layout-audit/final-consolidated-summary.json`. 열린 이슈는 [issues.json](./issues.json)입니다.
