import { ViteSSG } from "vite-ssg";
import { createPinia } from "pinia";
import App from "./App.vue";
import { createScrollBehavior, routes, setupRouterGuards } from "./router";
import "./assets/css/main.css";
import "@shakilabs/ui/styles.css";
// v3 셸 오버라이드는 반드시 패키지 스타일 뒤에 온다
import "./assets/css/shell.css";
import "./assets/css/responsive-accessibility.css";
import { initAnalytics, trackEvent } from "./lib/analytics";
import { initSentry } from "./lib/sentry";
import { useConstantsStore } from "@/stores/constants";

let hasRegisteredGlobalErrorTracking = false;

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function registerGlobalErrorTracking(): void {
  if (import.meta.env.SSR || typeof window === "undefined" || hasRegisteredGlobalErrorTracking) return;

  window.addEventListener("error", (event) => {
    trackEvent("app_error", {
      message: normalizeErrorMessage(event.error ?? event.message),
      info: "window.error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    trackEvent("app_error", {
      message: normalizeErrorMessage(event.reason),
      info: "window.unhandledrejection",
    });
  });

  hasRegisteredGlobalErrorTracking = true;
}

function scheduleAnalyticsInit(): void {
  if (import.meta.env.SSR) return;

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => initAnalytics(), { timeout: 4000 });
  } else {
    setTimeout(() => initAnalytics(), 0);
  }
}

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior: createScrollBehavior(),
  },
  async ({ app, router, isClient, initialState }) => {
    const pinia = createPinia();

    app.config.errorHandler = (error, _instance, info) => {
      console.error("[global-error]", error, info);
      trackEvent("app_error", {
        message: normalizeErrorMessage(error),
        info,
      });
    };

    app.use(pinia);
    setupRouterGuards(router);

    if (import.meta.env.SSR) {
      initialState.pinia = pinia.state.value;
    } else {
      pinia.state.value = initialState.pinia || {};
    }

    registerGlobalErrorTracking();

    if (isClient) {
      initSentry(app);
      const constantsStore = useConstantsStore(pinia);
      try {
        await constantsStore.loadConstants();
      } catch (error) {
        console.warn("[constants] load failed, fallback applied", error);
      }

      scheduleAnalyticsInit();
    }
  }
);
