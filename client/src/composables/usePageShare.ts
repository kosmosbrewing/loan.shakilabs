import { ref } from "vue";
import { showAlert } from "./useAlert";
import { copyToClipboard } from "@/lib/routeState";
import { ensureKakaoSdk } from "@/lib/kakaoSdk";
import { trackEvent } from "@/lib/analytics";

interface PageShareOptions {
  title: string;
  description: string;
  summaryText?: string;
  buttonLabel?: string;
}

export function usePageShare(options: PageShareOptions) {
  const showShareModal = ref(false);
  const kakaoBusy = ref(false);
  const isBrowser = typeof window !== "undefined";

  function getPage(): string {
    return isBrowser ? window.location.pathname : "/";
  }

  function openShare(): void {
    trackEvent("ux_share_modal_open", { page: getPage() });
    showShareModal.value = true;
  }

  function closeShare(): void {
    showShareModal.value = false;
  }

  async function copyLink(): Promise<void> {
    if (!isBrowser) return;

    const url = window.location.href;
    const copied = await copyToClipboard(url);
    try {
      if (!copied) throw new Error("Clipboard API unavailable");
      trackEvent("ux_share_link_copy_success", { page: getPage() });
      showAlert("링크가 복사되었습니다");
    } catch {
      trackEvent("ux_share_link_copy_fail", { page: getPage() });
      showAlert("링크 복사에 실패했습니다", { type: "error" });
    }
  }

  async function shareKakao(): Promise<void> {
    if (kakaoBusy.value) return;
    if (!isBrowser) return;

    kakaoBusy.value = true;

    try {
      await ensureKakaoSdk();
      if (!window.Kakao?.Share) throw new Error("Kakao Share not available");

      const url = window.location.href;
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: options.title,
          description: options.description,
          imageUrl: `${window.location.origin}/favicon.png`,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          {
            title: options.buttonLabel ?? "비교하러 가기",
            link: { mobileWebUrl: url, webUrl: url },
          },
        ],
      });
      trackEvent("ux_share_kakao_success", { page: getPage() });
    } catch {
      trackEvent("ux_share_kakao_fail", { page: getPage() });
      showAlert("카카오톡 공유에 실패했습니다", { type: "error" });
    } finally {
      kakaoBusy.value = false;
    }
  }

  return {
    showShareModal,
    kakaoBusy,
    summaryText: options.summaryText ?? options.title,
    openShare,
    closeShare,
    shareKakao,
    copyLink,
  };
}
