<script setup lang="ts">
import SEOHead from "@/components/common/SEOHead.vue";
</script>

<template>
  <SEOHead
    title="개인정보 처리방침 | shakilabs.com/loan"
    description="대출 계산기가 받는 소득·부채·담보 가액 입력값이 어디까지 가는지 계산기별로 밝힌 개인정보 처리방침입니다. 주소 쿼리에 남는 숫자, DSR 이어보기 임시 저장, 제3자 광고 쿠키와 옵트아웃 방법을 안내합니다."
  />

  <div class="container space-y-5 py-5">
    <div class="retro-panel overflow-hidden">
      <div class="retro-titlebar rounded-t-2xl">
        <h1 class="retro-title">개인정보 처리방침</h1>
      </div>
      <div class="retro-panel-content space-y-5 text-caption leading-relaxed text-muted-foreground">
        <p>
          ShakiLabs 대출 계산기(shakilabs.com/loan, 이하 "서비스")는 연 소득, 기존 대출 상환액, 담보 주택
          가격처럼 남에게 알리고 싶지 않은 숫자를 입력받습니다. 그래서 이 방침의 첫 번째 목적은 "그 숫자가
          어디까지 가는가"를 두루뭉술한 약속이 아니라 계산기 단위로 적는 것입니다. 결론부터 적으면, 계산에
          쓰이는 값은 이용자의 브라우저를 벗어나지 않습니다. 다만 서비스에는 결과를 그대로 공유할 수 있게
          하는 기능이 있고 그 과정에서 숫자가 주소에 실리므로, 이용자가 알고 쓸 수 있도록 3항에 따로
          적었습니다.
        </p>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">1. 계산기가 입력받는 항목 (전수)</h2>
          <p>
            서비스에는 계산기 10종이 있고, 각 계산기가 받는 항목은 아래가 전부입니다. 목록에 없는 항목을
            요구하는 입력란은 서비스 어디에도 없습니다.
          </p>
          <ul class="ml-4 list-disc space-y-1">
            <li><b class="text-foreground">DSR 한도</b> — 연 소득, 기존 대출의 연간 원리금상환액, 적용 DSR 상한, 신규 대출 금리, 대출 기간</li>
            <li><b class="text-foreground">LTV·DTI·DSR 동시 판정</b> — 주택 가격, 연 소득, 기존 부채의 연 상환액, 대출 금리, 대출 기간, 규제지역 여부, 차주 구분(일반 무주택·생애최초·저소득)</li>
            <li><b class="text-foreground">대환대출 갈아타기</b> — 남은 대출 잔액, 현재 금리, 갈아탈 금리, 남은 개월 수, 새 대출 기간, 갈아탈 때 드는 부대비용</li>
            <li><b class="text-foreground">상환방식 비교·주담대 금리 비교</b> — 대출 원금, 연이율, 대출 기간, 상환 방식(원리금균등·원금균등·만기일시)</li>
            <li><b class="text-foreground">중도상환수수료</b> — 최초 대출금, 중도상환할 금액, 수수료율, 수수료 부과기간, 실행 후 경과 개월, 연간 면제 비율</li>
            <li><b class="text-foreground">전세자금대출·전세보증보험료</b> — 전세보증금, 금리, 기간, 이자만 납부 여부, 주택 유형(아파트·그 외), 부채비율 구간</li>
            <li><b class="text-foreground">디딤돌대출</b> — 부부합산 연소득, 주택 가격, 차주 유형(일반·생애최초·신혼), 대출 기간(년), 수도권 여부</li>
            <li><b class="text-foreground">학자금 대출</b> — 대출 잔액, 연 소득, 상환기준소득, 상환율, 자발적 상환액, 이자율</li>
          </ul>
          <p>
            이 값들은 이용자 기기의 브라우저 안에서 자바스크립트로 계산되며, 계산을 위해 서버로 보내는
            요청 자체가 없습니다. 저장하는 데이터베이스도 없습니다. 서비스는 회원가입·로그인 절차가 없어
            이름, 이메일 주소, 연락처를 받지 않습니다. 주민등록번호, 계좌번호, 카드번호, 신용점수,
            재직·소득 증빙 서류를 넣는 입력란은 애초에 만들지 않았습니다. 금융기관에 실제 대출을 신청할 때
            요구되는 이런 서류는 해당 기관에 직접 제출하는 것이며, 서비스가 중간에서 받아 전달하지
            않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">2. 주소창에 남는 숫자 — 링크를 공유하기 전에 확인하세요</h2>
          <p>
            서비스는 계산 결과를 다시 찾아오거나 남에게 보여줄 수 있도록, 입력한 값을 화면 주소의 쿼리에
            실어 둡니다. 예를 들어 DSR 계산기에서 연 소득 7,200만원과 기존 상환액 840만원을 넣으면 주소는
            <code class="rounded bg-muted px-1 text-foreground">/loan/dsr?e=8400000&amp;i=72000000&amp;l=0.4&amp;r=4.5&amp;t=360</code>
            형태가 됩니다. 이 덕분에 새로고침해도 결과가 유지되고 북마크가 그대로 동작하지만, 반대로
            <b class="text-foreground">이 주소를 복사해 메신저나 게시판에 올리면 그 안의 소득·부채 숫자도 함께 전달됩니다.</b>
            공유 전에 주소를 한 번 확인해 주세요.
          </p>
          <p>
            외부로 새는 경로는 서비스 쪽에서 차단해 두었습니다. 모든 응답에
            <code class="rounded bg-muted px-1 text-foreground">Referrer-Policy: strict-origin-when-cross-origin</code>
            헤더를 적용해, 화면의 외부 링크를 눌러 다른 사이트로 이동하더라도 쿼리를 포함한 전체 주소가
            그 사이트에 전달되지 않습니다. 다만 이용자가 스스로 주소를 복사해 공유하는 경우까지 기술적으로
            막을 수는 없습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">3. 이 탭에만 남는 임시 저장 — DSR 이어보기</h2>
          <p>
            DSR 계산기에는 "이 탭에서 DSR 입력 이어보기" 기능이 있습니다. 켜면 해당 화면의 주소(위 2항의
            쿼리 포함)와 저장 시각이 브라우저 sessionStorage의
            <code class="rounded bg-muted px-1 text-foreground">loan:dsr-session-draft:v1</code>
            키에 기록됩니다. 저장되는 것은 주소와 시각뿐이며, 별도의 식별자나 기기 정보를 함께 넣지
            않습니다. 저장 후 8시간이 지나면 불러오기 대상에서 제외되고, sessionStorage 특성상 탭이나
            브라우저를 닫으면 사라지며, 화면의 "입력 기억 끄기" 버튼으로 즉시 삭제할 수 있습니다. 이
            데이터는 기기 밖으로 전송되지 않습니다. 나머지 계산기 9종은 이 임시 저장을 사용하지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">4. 자동으로 수집되는 접속 기록</h2>
          <p>
            어떤 계산기가 실제로 쓰이는지 파악하고 오류를 찾기 위해, 방문한 페이지 주소, 접속 일시,
            브라우저·기기 유형, 대략적인 접속 지역이 Google Analytics 4를 통해 자동으로 기록됩니다.
            이 기록은 개인을 특정하지 않는 익명 통계로만 처리합니다.
          </p>
          <p>
            여기서 한 가지를 분명히 밝힙니다.
            <b class="text-foreground">2항에서 설명한 대로 페이지 주소에 계산 입력값이 포함되므로,
            분석 도구에 남는 페이지 주소에도 그 숫자가 함께 담깁니다.</b>
            즉 "연 소득 7,200만원을 넣은 DSR 화면이 조회됐다"는 사실은 통계에 남습니다. 다만 이 숫자는
            이름·연락처·계정 정보와 연결되지 않으므로 특정 개인의 소득으로 식별되지 않으며, 서비스는 이를
            개인 단위로 조회하거나 제3자에게 판매하지 않습니다. 이런 기록조차 남기고 싶지 않다면 브라우저의
            추적 차단 기능을 사용하시면 되고, 차단해도 모든 계산 기능은 그대로 동작합니다.
          </p>
          <p>
            자바스크립트 오류 진단을 위해 Sentry를 사용할 수 있습니다. 이때
            <code class="rounded bg-muted px-1 text-foreground">sendDefaultPii = false</code>
            로 설정해 IP 주소 등 개인 식별 정보를 오류 보고에 함께 담지 않도록 하고 있습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">5. 쿠키와 제3자 광고 (Google AdSense)</h2>
          <p>
            서비스는 이용료를 받지 않는 대신 Google AdSense 광고로 운영비를 충당합니다. 광고와 관련해
            다음을 알려드립니다.
          </p>
          <ul class="ml-4 list-disc space-y-1">
            <li>
              Google을 포함한 제3자 광고 사업자는 쿠키를 사용하여 이용자가 본 서비스 또는 다른 웹사이트를
              방문한 기록을 기반으로 광고를 게재합니다.
            </li>
            <li>
              Google은 광고 쿠키를 사용하여 이용자의 본 사이트 및 다른 사이트 방문 기록에 기반한
              맞춤 광고를 제공합니다.
            </li>
            <li>
              이용자는
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-2 hover:text-foreground"
              >Google 광고 설정(adssettings.google.com)</a>
              에서 맞춤 광고를 해제할 수 있으며,
              <a
                href="https://www.aboutads.info/choices"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-2 hover:text-foreground"
              >aboutads.info/choices</a>
              에서 제3자 광고 사업자의 맞춤 광고용 쿠키 사용을 일괄 거부할 수 있습니다.
            </li>
            <li>
              광고 게재 위치는 화면 어디서나 본문과 구분됩니다. 오류 화면, 주소를 잘못 입력했을 때 뜨는
              404 화면처럼 읽을 내용이 없는 화면에는 광고 스크립트 자체를 넣지 않습니다.
            </li>
            <li>
              브라우저 설정에서 쿠키 저장을 거부하거나 저장된 쿠키를 삭제할 수 있습니다. 쿠키를 거부해도
              계산 기능에는 아무런 제한이 없습니다.
            </li>
          </ul>
          <p>
            Google의 광고 데이터 처리에 대한 자세한 내용은
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2 hover:text-foreground"
            >Google 광고 기술 정책</a>
            에서 확인할 수 있습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">6. 보관 기간</h2>
          <p>
            1항의 계산 입력값은 보관하지 않으므로 보관 기간이라는 개념이 없습니다. 3항의 임시 저장은 최대
            8시간, 탭을 닫으면 그 전이라도 소멸합니다. 4항의 접속 통계는 Google Analytics의 기본 보존
            설정(최대 26개월)이 지나면 자동 파기됩니다. 서비스가 별도로 내려받아 보관하는 사본은
            없습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">7. 처리 위탁과 제3자 제공</h2>
          <p>
            서비스는 수집한 정보를 판매하거나 대출 모집인·금융기관·마케팅 업체에 넘기지 않습니다. 서비스
            운영에 필요한 범위에서 아래 사업자의 도구를 사용하며, 각 도구가 처리하는 정보에는 해당
            사업자의 개인정보 처리방침이 함께 적용됩니다.
          </p>
          <ul class="ml-4 list-disc space-y-1">
            <li>Google AdSense — 광고 게재 및 성과 측정</li>
            <li>Google Analytics 4 — 방문 통계</li>
            <li>Sentry — 자바스크립트 오류 수집(개인 식별 정보 미포함 설정)</li>
            <li>Vercel — 정적 파일 호스팅 및 접속 로그</li>
          </ul>
          <p>법령에 따른 적법한 요청이 있는 경우를 제외하고 그 밖의 제3자 제공은 하지 않습니다.</p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">8. 이용자의 권리</h2>
          <p>
            이용자는 브라우저 설정으로 쿠키를 거부·삭제할 수 있고, 5항의 링크로 맞춤 광고를 해제할 수
            있으며, 3항의 임시 저장은 화면 버튼으로 즉시 지울 수 있습니다. 서비스가 이용자를 식별해
            보관하는 정보는 없으나, 열람·정정·삭제를 요청하고 싶은 사항이 있으면 아래 문의처로
            알려주시면 확인 가능한 범위에서 지체 없이 처리합니다. 서비스는 만 14세 미만 아동을 대상으로
            하지 않으며 아동의 개인정보를 의도적으로 수집하지 않습니다.
          </p>
        </section>

        <section class="space-y-2">
          <h2 class="text-body font-bold text-foreground">9. 방침의 변경과 문의</h2>
          <p>
            계산기가 추가되거나 사용하는 도구가 바뀌면 이 방침을 함께 고쳐 이 페이지에 게시합니다.
            개인정보 처리에 관한 문의는 아래 연락처로 보내주시면 영업일 기준 24~48시간 이내에
            답변드립니다.
          </p>
          <p class="text-foreground">운영: ShakiLabs · 문의: skdba1313@gmail.com</p>
          <p>시행일: 2026년 8월 5일 · 최종 개정: 2026년 8월 10일</p>
        </section>
      </div>
    </div>
  </div>
</template>
