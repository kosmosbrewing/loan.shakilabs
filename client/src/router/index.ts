import { nextTick } from "vue";
import type { Router, RouteRecordRaw } from "vue-router";
import { showAlert } from "@/composables/useAlert";
import { trackPageView } from "@/lib/analytics";
import { useAuthStore } from "@/stores/auth";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/refinance",
    name: "Refinance",
    component: () => import("@/views/RefinanceView.vue"),
  },
  {
    path: "/refinance/:amount(\\d+)",
    name: "RefinanceAmount",
    component: () => import("@/views/RefinanceView.vue"),
    props: (route) => ({
      initialBalance: Number(route.params.amount) * 10000,
    }),
  },
  {
    path: "/dsr",
    name: "Dsr",
    component: () => import("@/views/DsrView.vue"),
  },
  {
    path: "/dsr/:income(\\d+)",
    name: "DsrIncome",
    component: () => import("@/views/DsrView.vue"),
    props: (route) => ({
      initialIncome: Number(route.params.income) * 10000,
    }),
  },
  {
    path: "/repayment",
    name: "Repayment",
    component: () => import("@/views/RepaymentView.vue"),
  },
  {
    path: "/repayment/:amount(\\d+)",
    name: "RepaymentAmount",
    component: () => import("@/views/RepaymentView.vue"),
    props: (route) => ({
      initialPrincipal: Number(route.params.amount) * 10000,
    }),
  },
  {
    path: "/prepayment-fee",
    name: "PrepaymentFee",
    component: () => import("@/views/PrepaymentFeeView.vue"),
  },
  {
    path: "/prepayment-fee/:amount(\\d+)",
    name: "PrepaymentFeeAmount",
    component: () => import("@/views/PrepaymentFeeView.vue"),
    props: (route) => ({
      initialAmount: Number(route.params.amount) * 10000,
    }),
  },
  {
    path: "/student-loan",
    name: "StudentLoan",
    component: () => import("@/views/StudentLoanView.vue"),
  },
  {
    path: "/student-loan/:balance(\\d+)",
    name: "StudentLoanBalance",
    component: () => import("@/views/StudentLoanView.vue"),
    props: (route) => ({
      initialBalance: Number(route.params.balance) * 10000,
    }),
  },
  {
    path: "/mortgage-compare",
    name: "MortgageCompare",
    component: () => import("@/views/MortgageCompareView.vue"),
  },
  {
    path: "/mortgage-compare/:amount(\\d+)",
    name: "MortgageCompareAmount",
    component: () => import("@/views/MortgageCompareView.vue"),
    props: (route) => ({
      initialLoanAmount: Number(route.params.amount) * 10000,
    }),
  },

  {
    path: "/jeonse-loan",
    name: "JeonseLoan",
    component: () => import("@/views/JeonseLoanView.vue"),
  },
  {
    path: "/jeonse-loan/:amount(\\d+)",
    name: "JeonseLoanAmount",
    component: () => import("@/views/JeonseLoanView.vue"),
    props: (route) => ({
      initialDeposit: Number(route.params.amount) * 10000,
    }),
  },

  {
    path: "/stepping-stone-loan",
    name: "SteppingStoneLoan",
    component: () => import("@/views/SteppingStoneLoanView.vue"),
  },
  {
    path: "/stepping-stone-loan/:amount(\\d+)",
    name: "SteppingStoneLoanAmount",
    component: () => import("@/views/SteppingStoneLoanView.vue"),
    props: (route) => ({
      initialPropertyPrice: Number(route.params.amount) * 10000,
    }),
  },
  {
    path: "/ltv-dti",
    name: "LtvDti",
    component: () => import("@/views/LtvDtiView.vue"),
  },
  {
    path: "/ltv-dti/:amount(\\d+)",
    name: "LtvDtiAmount",
    component: () => import("@/views/LtvDtiView.vue"),
    props: (route) => ({
      initialPropertyPrice: Number(route.params.amount) * 10000,
    }),
  },

  { path: "/switch-loan", redirect: "/refinance" },
  { path: "/loan-limit", redirect: "/dsr" },
  { path: "/equal-principal", redirect: "/repayment" },
  { path: "/equal-payment", redirect: "/repayment" },
  { path: "/repay-fee", redirect: "/prepayment-fee" },

  {
    path: "/about",
    name: "About",
    component: () => import("@/views/AboutView.vue"),
  },
  {
    path: "/terms",
    name: "Terms",
    component: () => import("@/views/TermsView.vue"),
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("@/views/PrivacyView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function createScrollBehavior(): Router["options"]["scrollBehavior"] {
  return (to, from, savedPosition) => {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 80 };
    // query parameter만 변경된 경우 스크롤 유지
    if (to.path === from.path) return false;
    return { top: 0 };
  };
}

export function setupRouterGuards(router: Router): void {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    const needsAuthState = Boolean(to.meta.requiresAuth || to.meta.requiresAdmin || to.meta.guestOnly);

    if (needsAuthState && !authStore.isInitialized) {
      try {
        await authStore.loadUser({ throwOnError: true });
      } catch {
        if (isBrowser()) {
          showAlert("사용자 정보를 불러오지 못했습니다.", { type: "error" });
        }
        return false;
      }
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return "/";
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      if (isBrowser()) {
        showAlert("로그인이 필요합니다.", { type: "error" });
      }
      return "/";
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      if (isBrowser()) {
        showAlert("관리자 권한이 필요합니다.", { type: "error" });
      }
      return "/";
    }

    return true;
  });

  router.afterEach((to, _from, failure) => {
    if (failure || !isBrowser()) return;
    void nextTick(() => {
      trackPageView(to.fullPath, document.title);
    });
  });
}
