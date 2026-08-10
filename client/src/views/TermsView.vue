<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<template>
  <SEOHead
    title="이용약관 | shakilabs.com/loan"
    description="ShakiLabs 대출 계산기 이용약관입니다. 계산기 10종의 제공 범위, 금융 자문·대출 중개가 아니라는 한계, 규제 한도와 금리 기준일의 출처, 광고 게재와 면책을 안내합니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>
      <div class="retro-panel-content space-y-5 text-caption leading-relaxed text-muted-foreground">
        <p>
          이 약관은 ShakiLabs(이하 "운영자")가 shakilabs.com/loan에서 제공하는 대출 계산기(이하 "서비스")를
          쓸 때 적용됩니다. 서비스는 대출 상품을 팔지도, 중개하지도, 추천하지도 않는 계산 도구입니다.
          가장 중요한 내용은 제3조에 있으니 그 조항만은 꼭 읽어주세요.
        </p>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제1조 (약관의 효력)</h2>
          <p>
            서비스에 접속해 계산기를 사용하면 이 약관에 동의한 것으로 봅니다. 동의하지 않는 경우 서비스
            이용을 중단하시면 되며, 별도의 해지 절차나 위약금은 없습니다. 회원가입이 없으므로 이 약관은
            계정이 아니라 접속 행위 자체에 적용됩니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제2조 (제공하는 계산기)</h2>
          <p>운영자는 아래 계산기 10종과 그에 딸린 해설 콘텐츠를 무료로 제공합니다.</p>
          <ul class="ml-4 list-disc space-y-1">
            <li>DSR 한도 역산 — 연 소득과 기존 상환액으로 받을 수 있는 신규 대출 원금을 되짚습니다.</li>
            <li>LTV·DTI·DSR 동시 판정 — 세 규제 중 무엇이 먼저 한도를 깎는지 함께 보여줍니다.</li>
            <li>대환대출 갈아타기 — 금리 차이로 아끼는 이자에서 부대비용을 빼 손익분기 시점을 냅니다.</li>
            <li>상환방식 비교 — 원리금균등과 원금균등의 월 납입액·총이자 차이를 나란히 놓습니다.</li>
            <li>주택담보대출 금리 비교 — 은행별 공시 금리 구간으로 월 상환액 범위를 계산합니다.</li>
            <li>중도상환수수료 — 잔여 기간 비례 방식으로 부담할 수수료를 계산합니다.</li>
            <li>전세자금대출 이자 — 만기일시(이자만 납부) 여부를 반영해 월 이자를 냅니다.</li>
            <li>전세보증보험료 — 주택 유형과 부채비율 구간에 따른 보증료를 계산합니다.</li>
            <li>디딤돌대출 — 부부합산 소득 구간·차주 유형별 고정금리와 한도를 시뮬레이션합니다.</li>
            <li>학자금 대출 — 상환기준소득 초과분에 상환율을 적용한 의무상환액을 계산합니다.</li>
          </ul>
          <p>
            모든 계산은 이용자의 브라우저에서 수행되며 입력값은 서버로 전송되지 않습니다. 자세한 내용은
            개인정보 처리방침에 적었습니다. 운영자는 계산기의 추가·개선·중단, 화면 구성 변경을 사전 고지
            없이 할 수 있습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제3조 (금융 자문도, 대출 중개도 아닙니다)</h2>
          <p>
            이 조항이 서비스의 성격을 규정하는 핵심입니다.
          </p>
          <ul class="ml-4 list-disc space-y-1">
            <li>
              운영자는 금융소비자보호법에 따른 금융상품판매업자·금융상품자문업자가 아니며, 대출모집인으로
              등록되어 있지 않습니다. 서비스는 특정 은행이나 상품의 가입을 권유·추천·알선하지 않고, 대출
              신청을 접수하거나 금융기관에 전달하지도 않습니다.
            </li>
            <li>
              계산 결과는 이용자가 입력한 숫자와 공개된 일반 기준을 조합한 <b class="text-foreground">참고용 추정치</b>입니다.
              실제 승인 여부와 조건은 금융기관의 심사에서 신용평점, 소득 증빙 방식, 재직 형태, 담보물의
              감정가와 권리관계, 기존 대출의 종류, 세대원 주택 보유 현황 등 서비스가 알 수 없는 요소로
              결정됩니다.
            </li>
            <li>
              특히 DSR·LTV·DTI 계산은 규제 한도만 반영한 상한선입니다. 한도 안에 들어온다고 해서 대출이
              실행되는 것은 아니며, 금융기관은 자체 심사 기준으로 한도를 더 낮출 수 있습니다.
            </li>
            <li>
              디딤돌대출·전세자금대출 등 정책 상품의 자격 요건과 금리는 주택도시기금 운용지침과 취급기관의
              안내가 우선합니다. 서비스의 계산이 지침과 다르면 지침이 맞습니다.
            </li>
          </ul>
          <p>
            대출 실행, 갈아타기, 중도상환처럼 실제 돈이 오가는 결정을 하기 전에는 반드시 해당 금융기관이나
            자격을 갖춘 전문가에게 조건을 확인하십시오.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제4조 (기준 수치의 출처와 갱신)</h2>
          <p>
            계산에 쓰이는 규제 한도와 금리는 공개 자료를 옮겨 온 값이며, 화면마다 기준일을 함께
            표시합니다. LTV·DTI·DSR 한도와 스트레스 DSR 가산금리는 금융위원회 발표, 디딤돌대출 금리와
            한도는 한국주택금융공사·주택도시기금 공시, 은행별 주택담보대출 금리는 각 은행 공시와 한국은행
            금융통계를 따릅니다. 금리와 규제는 자주 바뀌므로, 표시된 기준일 이후에 발표된 변경은 반영되어
            있지 않을 수 있습니다. 이용자는 계산 전에 화면의 기준일을 확인할 책임이 있고, 운영자는 변경을
            확인하는 즉시 갱신하되 실시간 반영을 보장하지는 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제5조 (광고)</h2>
          <p>
            서비스는 이용료 없이 운영되며 그 재원은 Google AdSense 광고입니다. 광고에 나오는 금융상품이나
            업체는 운영자가 심사하거나 보증한 대상이 아니고, 계산 결과에 따라 특정 광고가 노출되도록
            연동하지도 않습니다. 광고를 보고 광고주와 거래한 결과는 이용자와 광고주 사이의 문제입니다.
            맞춤 광고 쿠키와 그 해제 방법은 개인정보 처리방침에서 안내합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제6조 (저작권)</h2>
          <p>
            화면 구성, 해설 문구, 계산 로직에 대한 권리는 운영자에게 있습니다. 개인적·비상업적 참고를 넘어
            무단으로 복제·배포·2차 가공하거나 자동화 수단으로 계산 결과를 대량 수집해 재배포하는 행위는
            금지합니다. 인용한 공공기관 자료의 권리는 각 기관에 있으며 출처를 표기해 사용합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제7조 (이용자의 의무)</h2>
          <p>
            이용자는 서비스의 정상 운영을 방해하지 않아야 합니다. 과도한 자동 요청, 우회·역설계 시도, 광고
            부정 클릭 유도가 이에 해당합니다. 또한 계산 결과를 마치 금융기관의 승인 조건인 것처럼 제3자에게
            제시하거나, 결과 화면을 가공해 대출 권유·모집에 사용해서는 안 됩니다. 이를 어겨 발생한 손해는
            해당 이용자가 책임집니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제8조 (보증의 부인과 면책)</h2>
          <p>
            운영자는 계산식과 기준 수치를 검증하려 노력하지만 결과의 정확성·완전성·최신성을 법적으로
            보증하지 않습니다. 법령 개정, 정부 대책 발표, 기준금리 변동, 은행 정책 변경으로 실제 조건과
            차이가 생길 수 있습니다. 이용자가 계산 결과를 근거로 내린 판단과 그로 인한 이자 손실, 수수료
            부담, 대출 거절 등 어떤 결과에 대해서도 운영자는 고의 또는 중대한 과실이 없는 한 책임을 지지
            않습니다. 무료로 제공되는 서비스의 특성상 점검·장애·불가항력으로 인한 중단에 대해서도 같습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제9조 (약관의 변경)</h2>
          <p>
            운영자는 필요에 따라 이 약관을 변경할 수 있으며, 변경된 내용은 이 페이지에 게시한 때부터
            적용됩니다. 게시 이후 서비스를 계속 이용하면 변경에 동의한 것으로 봅니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제10조 (준거법과 분쟁)</h2>
          <p>
            이 약관은 대한민국 법령에 따릅니다. 분쟁이 생기면 운영자와 이용자가 먼저 성실하게 협의하고,
            협의가 되지 않으면 민사소송법이 정하는 관할 법원에서 해결합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제11조 (문의)</h2>
          <p>
            계산이 잘못됐다고 생각되거나 기준 수치가 낡았다면 알려주세요. 아래 연락처로 보내주시면 영업일
            기준 24~48시간 이내에 답변드립니다.
          </p>
          <p class="text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>
          <p>시행일: 2026년 8월 5일 · 최종 개정: 2026년 8월 10일</p>
        </section>
      </div>
    </div>
  </div>
</template>
