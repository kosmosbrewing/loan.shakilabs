<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<template>
  <SEOHead
    title="이용약관 | shakilabs.com/loan"
    description="ShakiLabs 대출 계산기 이용약관입니다. 서비스 제공 범위, 정보 제공의 한계(금융 자문 아님), 광고 게재, 면책과 준거법을 안내합니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">이용약관</h1>
      </div>
      <div class="retro-panel-content space-y-5 text-caption leading-relaxed text-muted-foreground">
        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제1조 (목적과 적용 범위)</h2>
          <p>
            본 약관은 ShakiLabs(이하 "운영자")가 제공하는 대출 계산기 서비스(shakilabs.com/loan, 이하
            "서비스")의 이용 조건과 운영자·이용자 간의 권리와 의무를 규정합니다. 서비스에 접속하여
            계산 기능을 이용하는 경우 본 약관에 동의한 것으로 봅니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제2조 (서비스의 내용)</h2>
          <p>
            서비스는 원리금균등·원금균등 상환방식 비교, DSR·LTV·DTI 한도 계산, 대환대출 손익 비교,
            전세자금대출·디딤돌대출·학자금대출 시뮬레이션, 중도상환 수수료 계산 등 대출과 관련된
            무료 계산 도구를 제공합니다. 회원가입 없이 누구나 이용할 수 있으며, 입력한 값은 서버에
            전송되지 않고 이용자의 브라우저 안에서만 처리됩니다. 서비스의 기능과 콘텐츠는 품질 개선을
            위해 사전 고지 없이 추가·변경·중단될 수 있습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제3조 (정보 제공의 한계 — 금융 자문이 아님)</h2>
          <p>
            서비스가 제공하는 모든 계산 결과와 가이드 콘텐츠는 이용자가 입력한 값과 공개된 일반 기준에
            따라 산출되는 참고용 추정치입니다. 서비스는 금융소비자보호법상 금융상품 자문·판매·중개
            서비스가 아니며, 특정 금융상품의 가입을 권유하거나 추천하지 않습니다. 실제 금리·한도·수수료는
            금융기관의 심사, 개인의 신용도, 담보 조건, 적용 시점의 법령과 정책에 따라 달라지므로,
            대출 실행·갈아타기 등 실제 의사결정 전에는 반드시 해당 금융기관 또는 자격을 갖춘 전문가의
            확인을 거쳐야 합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제4조 (광고의 게재)</h2>
          <p>
            서비스는 무료 운영 재원을 마련하기 위해 Google AdSense 등 제3자 광고를 게재합니다.
            광고 영역은 본문 콘텐츠와 구분되어 표시되며, 광고에 소개되는 상품·서비스는 운영자와
            무관합니다. 이용자가 광고를 통해 광고주와 거래하는 경우 그 거래의 책임은 이용자와
            광고주에게 있습니다. 쿠키를 이용한 맞춤 광고와 그 해제 방법은 개인정보 처리방침에서
            안내합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제5조 (지식재산권)</h2>
          <p>
            서비스의 화면 구성, 텍스트, 가이드 콘텐츠, 계산 로직 등에 대한 권리는 운영자 또는 정당한
            권리자에게 귀속됩니다. 개인적이고 비상업적인 이용 범위를 넘어 운영자의 사전 동의 없이
            복제·배포·2차 가공하는 행위는 금지됩니다. 서비스가 인용하는 공공기관 자료는 각 기관의
            공표 자료를 출처와 함께 표기합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제6조 (이용자의 의무)</h2>
          <p>
            이용자는 서비스의 안정적인 운영을 방해하는 행위를 해서는 안 됩니다. 과도한 자동화 접근
            (크롤링·스크래핑), 서비스 역설계, 광고 시스템에 대한 부정 클릭 유도 등이 이에 해당하며,
            위반으로 발생한 손해에 대해서는 해당 이용자가 책임을 부담합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제7조 (면책)</h2>
          <p>
            운영자는 계산 결과와 콘텐츠의 정확성·완전성·최신성을 보장하기 위해 노력하지만, 이를
            법적으로 보증하지 않습니다. 법령 개정, 금융기관 정책 변경, 시장 금리 변동으로 실제 조건과
            차이가 발생할 수 있습니다. 계산 결과를 근거로 한 이용자의 판단과 그로 인한 손해에 대하여
            운영자는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다. 또한 무료로 제공되는 서비스의
            특성상 시스템 점검, 장애, 불가항력으로 인한 일시적 중단에 대해서도 같습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제8조 (약관의 변경)</h2>
          <p>
            운영자는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 이 페이지에 게시한 때부터
            효력이 발생합니다. 변경 게시 이후 서비스를 계속 이용하는 경우 변경 약관에 동의한 것으로
            봅니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제9조 (준거법과 분쟁 해결)</h2>
          <p>
            본 약관은 대한민국 법령에 따라 해석되고 적용됩니다. 서비스 이용과 관련하여 분쟁이 발생한
            경우 운영자와 이용자는 성실히 협의하여 해결하고, 협의가 이루어지지 않으면 민사소송법에
            따른 관할 법원에서 해결합니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">제10조 (문의)</h2>
          <p>
            약관과 서비스 이용에 관한 문의는 아래 연락처로 보내주시면 영업일 기준 24~48시간 이내에
            답변드립니다.
          </p>
          <p class="text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>
          <p>시행일: 2026년 8월 5일</p>
        </section>
      </div>
    </div>
  </div>
</template>
