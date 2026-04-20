import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth/AuthContext";
import ShoProLoginPage from "./features/auth/pages/ShoProLoginPage";
import StaffLoginPage from "./features/auth/pages/StaffLoginPage";
import GuestLoginPage from "./features/auth/pages/GuestLoginPage";
import Dashboard from "@/features/dashboard/pages/DashboardPage"; 
import InventoryHub from "@/features/inventory/pages/InventoryHub";
import PurchasingHub from "@/features/purchasing/PurchasingHubPage";
import RecipeHub from "@/features/recipes-menu/pages/RecipeHub";
import EngineeringHubPage from "@/features/menu-engineering/pages/EngineeringHubPage";
import PeriodSetupPage from "@/features/menu-engineering/pages/PeriodSetupPage";
import PeriodDetailPage from "@/features/menu-engineering/pages/PeriodDetailPage";
import LiveSalesCounterPage from "@/features/menu-engineering/pages/LiveSalesCounterPage";
import PeriodHistoryPage from "@/features/menu-engineering/pages/PeriodHistoryPage";
import WhatIfSimulatorPage from "@/features/menu-engineering/pages/WhatIfSimulatorPage";
import PeriodComparisonPage from "@/features/menu-engineering/pages/PeriodComparisonPage";

import ExpoKds from "@/features/kds/ExpoKds";
import IngredientMasterPage from "@/features/inventory/pages/IngredientMasterPage";
import InventoryCountEntry from "@/features/inventory/pages/InventoryCountEntry";
import PeriodHistory from "@/features/inventory/pages/PeriodHistory";
import LowStockAlerts from "@/features/inventory/pages/LowStockAlerts";
import NewIngredientForm from "@/features/inventory/pages/NewIngredientForm";
import IngredientDetail from "@/features/inventory/pages/IngredientDetail";
import PeriodDetail from "@/features/inventory/pages/PeriodDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StubPage } from "@/components/shared/StubPage";
import { RestaurantProvider } from "@/providers";
import { ToastProvider } from "@/providers/ToastProvider";
import SupplierDirectory from "@/features/purchasing/SupplierDirectoryPage";
import InvoiceEntry from "@/features/purchasing/InvoiceEntryPage";
import InvoiceEditorPage from "@/features/purchasing/InvoiceEditorPage";
import InvoiceLog from "@/features/purchasing/InvoiceLogPage";
import WeeklySummaryPage from "@/features/purchasing/WeeklySummaryPage";
import TrendChartPage from "@/features/purchasing/TrendChartPage";
import POListPage from "@/features/purchasing/POListPage";
import POEditorPage from "@/features/purchasing/POEditorPage";
import PODetailPage from "@/features/purchasing/PODetailPage";
import GRNEditorPage from "@/features/purchasing/GRNEditorPage";
import GRNDetailPage from "@/features/purchasing/GRNDetailPage";
import GRNListPage from "@/features/purchasing/GRNListPage";
import GRNConflictPage from "@/features/purchasing/GRNConflictPage";
import MatchingDashboardPage from "@/features/purchasing/MatchingDashboardPage";
import VarianceAlertPage from "@/features/purchasing/VarianceAlertPage";
import POStagingPage from "@/features/purchasing/POStagingPage";
import MatchAuditPage from "@/features/purchasing/MatchAuditPage";
import SalesMenuCosting from "@/features/recipes-menu/pages/SalesMenuCosting";
import RecipeScreens from "@/features/recipes-menu/pages/RecipeScreens";
import RecipeDetail from "@/features/recipes-menu/pages/RecipeDetail";
// LocationPrimeCost removed — use PRIME_COST_LOCATIONS route
// (menu-engineering screens above)
import RecipeEditor from "@/features/recipes-menu/pages/RecipeEditor";
import { ExperimentPage } from "@/features/experiments/pages/ExperimentPage";
import ReportsPage from "@/features/reports/pages/ReportsPage";
import { PrimeCostHubPage, StaffManagementPage, StaffManagementHubPage, TableStaffMapPage, SalaryDisbursementPage, ChartOfAccountsPage, FinanceHubPage, PnLStatementPage, ExpenseEntryPage, CashManagementPage, SalesEntryPage } from "@/router/LazyPages";
import PaymentFeature from "@/features/payments/PaymentFeature";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();
// ─── MINI ZUSTAND-COMPATIBLE STORE ───────────────────────────────────────────
// No external deps — mirrors zustand's create() + selector API exactly.

function createStore<T extends object>(
  initializer: (
    set: (partial: Partial<T> | ((s: T) => Partial<T>)) => void,
    get: () => T
  ) => T
) {
  let state: T;
  const listeners = new Set<() => void>();

  const set = (partial: Partial<T> | ((s: T) => Partial<T>)) => {
    state = { ...state, ...(typeof partial === "function" ? partial(state) : partial) };
    listeners.forEach((l) => l());
  };

  const get = () => state;
  state = initializer(set, get);

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };

  function useStore(): T;
  function useStore<S>(selector: (s: T) => S): S;
  function useStore<S>(selector?: (s: T) => S) {
    const sel = selector ?? ((s: T) => s as unknown as S);
    return useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
  }

  useStore.getState = get;
  useStore.setState = set;

  return useStore;
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Screen = 
  | "login" | "dashboard" | "card-detail" | "inventory" | "kds" | "prime-cost" | "engineering" | "purchasing" | "recipes" 
  | "finance-hub" | "finance-pnl" | "finance-expenses" | "finance-cash" | "finance-sales" | "accounting" | "accounting-salary" | "accounting-accounts" 
  | "inventory-ingredients" | "inventory-count" | "inventory-history" | "inventory-alerts" | "inventory-new-ingredient" | "inventory-ingredient-detail" | "inventory-period-detail"
  | "purchase-suppliers" | "purchase-invoice-entry" | "purchase-invoice-log" | "purchase-invoice-editor"
  | "purchase-weekly" | "purchase-trend" | "purchase-alerts"
  | "purchase-po-list" | "purchase-po-editor" | "purchase-po-detail"
  | "purchase-grn-list" | "purchase-grn-editor" | "purchase-grn-detail" | "purchase-grn-conflicts"
  | "purchase-po-staging"
  | "purchase-matching" | "purchase-variance" | "purchase-audit"
  | "recipe-menu-items" | "recipe-menu-item-editor" 
  | "recipe-list" | "recipe-editor" | "recipe-editor-detail"
  | "recipe-cost-groups" | "recipe-converter"
  | "engineering" | "engineering-setup" | "engineering-detail" | "engineering-results" | "engineering-quadrant" | "engineering-categories" | "engineering-live" | "engineering-history" | "engineering-whatif" | "engineering-comparison"
  | "kds" | "prime-cost" | "prime-cost-multi" | "labor-staffing" | "staff-management" | "supplier-pay" | "experiment-lab" | "reports" | "finance-hub" | "accounting" | "accounting-salary" | "accounting-accounts";

interface ShellState {
  homeIcon: boolean; searchBar: boolean; themeSwitcher: boolean;
  localeFlag: boolean; notificationBell: boolean; notificationCount: number;
  logoutIcon: boolean; copyright: boolean; clock: boolean;
  buildVersion: boolean; sessionTimer: boolean;
  showSlot(key: string, value: boolean | number): void;
  applyPreset(preset: "preLogin" | "postLogin"): void;
  setNotificationCount(n: number): void;
}

interface AppState {
  user: { name: string; email: string } | null;
  isLoggedIn: boolean; screen: Screen; history: Screen[];
  sideNavOpen: boolean; selectedCard: number | null;
  selectedIngredientId: number | null;
  selectedPeriodId: number | null;
  selectedInvoiceId: number | 'new' | null;
  selectedPOId: string | 'new' | null;
  selectedGRNId: string | null;
  selectedRecipeId: number | 'new' | null;
  selectedMenuItemId: number | 'new' | null;
  selectedEngineeringId: number | null;
  selectedComparisonIds: { id1: number; id2: number } | null;
  login(name: string, email: string): void;
  logout(): void;
  navigate(screen: Screen): void;
  back(): void;
  openCard(id: number): void;
  closeCard(): void;
  openIngredientDetail(id: number): void;
  openPeriodDetail(id: number): void;
  openEngineeringDetail(id: number): void;
  openEngineeringComparison(id1: number, id2: number): void;
  openRecipeDetail(id: number): void;
  openMenuItemDetail(id: number): void;
  toggleSideNav(): void;
  activeDashboardTab: string | null;
  setActiveDashboardTab(tab: string | null): void;
}

// ─── SHELL STORE ──────────────────────────────────────────────────────────────

const PRE = { homeIcon: false, searchBar: false, themeSwitcher: false, localeFlag: false, notificationBell: false, logoutIcon: false, copyright: true, clock: true, buildVersion: true, sessionTimer: false };
const POST = { homeIcon: true, searchBar: true, themeSwitcher: true, localeFlag: true, logoutIcon: true, copyright: true, clock: true, buildVersion: true, sessionTimer: true };

const useShellStore = createStore<ShellState>((set) => ({
  ...PRE, notificationCount: 0, notificationBell: false,
  showSlot: (key, value) => set({ [key]: value } as Partial<ShellState>),
  applyPreset: (preset) => set(preset === "postLogin" ? POST : PRE),
  setNotificationCount: (n) => set({ notificationCount: n, notificationBell: n > 0 }),
}));

// ─── APP STORE ────────────────────────────────────────────────────────────────

export const useAppStore = createStore<AppState>((set) => ({
  user: null, isLoggedIn: false, screen: "login",
  sideNavOpen: false, selectedCard: null,
  selectedIngredientId: null,
  selectedPeriodId: null,
  selectedInvoiceId: null,
  selectedPOId: null,
  selectedGRNId: null,
  selectedRecipeId: null,
  selectedMenuItemId: null,
  selectedEngineeringId: null,
  selectedComparisonIds: null,
  activeDashboardTab: null,
  setActiveDashboardTab: (tab) => set({ activeDashboardTab: tab }),
  history: [],
  login: (name, email) => {
    set({ user: { name, email }, isLoggedIn: true, screen: "dashboard" });
    useShellStore.getState().applyPreset("postLogin");
    setTimeout(() => useShellStore.getState().setNotificationCount(3), 2500);
  },
  logout: () => {
    set({ user: null, isLoggedIn: false, screen: "login", sideNavOpen: false, selectedCard: null, selectedIngredientId: null, selectedPeriodId: null, history: [] });
    useShellStore.getState().applyPreset("preLogin");
    useShellStore.getState().setNotificationCount(0);
  },
  navigate: (screen) => set((s) => ({ 
    history: s.screen !== screen ? [...s.history, s.screen] : s.history, 
    screen 
  })),
  back: () => set((s) => {
    const prev = s.history[s.history.length - 1];
    return prev ? { screen: prev, history: s.history.slice(0, -1) } : s;
  }),
  openCard: (id) => set({ selectedCard: id, screen: "card-detail", sideNavOpen: true }),
  closeCard: () => set({ selectedCard: null, screen: "dashboard", sideNavOpen: false }),
  openIngredientDetail: (id: number) => set({ selectedIngredientId: id, screen: "inventory-ingredient-detail" }),
  openPeriodDetail: (id: number) => set({ selectedPeriodId: id, screen: "inventory-period-detail" }),
  openEngineeringDetail: (id: number) => set({ selectedEngineeringId: id, screen: "engineering-detail" }),
  openEngineeringComparison: (id1: number, id2: number) => set({ selectedComparisonIds: { id1, id2 }, screen: "engineering-comparison" }),
  openRecipeDetail: (id: number) => set({ selectedRecipeId: id, screen: "recipe-editor-detail" }),
  openMenuItemDetail: (id: number) => set({ selectedMenuItemId: id, screen: "recipe-menu-item-editor" }),
  toggleSideNav: () => set((s) => ({ sideNavOpen: !s.sideNavOpen })),
}));

// ── EXPOSE STORE FOR PLAYWRIGHT ──────────────────────────────────────────────
if (typeof window !== 'undefined') { (window as any).__APP_STORE__ = useAppStore; }

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CARDS = [
  { id: 1, title: "Revenue Analytics", tag: "Finance", value: "$2.4M", delta: "+12.3%", positive: true, desc: "Quarterly performance breakdown across all product lines with trend analysis and forecasting." },
  { id: 2, title: "User Growth", tag: "Product", value: "84.2K", delta: "+8.7%", positive: true, desc: "Monthly active users, retention cohorts, and acquisition channel attribution." },
  { id: 3, title: "Infra Health", tag: "Engineering", value: "99.97%", delta: "-0.02%", positive: false, desc: "System uptime, latency percentiles, error rates, and deployment pipeline status." },
  { id: 4, title: "Support Queue", tag: "Ops", value: "142", delta: "+23", positive: false, desc: "Open tickets by priority, first-response SLA compliance, and agent workload distribution." },
  { id: 5, title: "Campaigns", tag: "Marketing", value: "3.1%", delta: "+0.4%", positive: true, desc: "Active campaign CTR, conversion funnels, A/B test results, and spend efficiency." },
  { id: 6, title: "Churn Risk", tag: "CS", value: "6.2%", delta: "-1.1%", positive: true, desc: "At-risk accounts identified by ML model with recommended intervention actions." },
];

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

const Ic = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// function useClock() {
//   const [t, set] = useState(() => new Date().toLocaleTimeString());
//   useEffect(() => { const id = setInterval(() => set(new Date().toLocaleTimeString()), 1000); return () => clearInterval(id); }, []);
//   return t;
// }

function useSessionTimer(active: boolean) {
  const [s, set] = useState(0);
  useEffect(() => {
    if (!active) { set(0); return; }
    const id = setInterval(() => set((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ─── STICKY HEADER ────────────────────────────────────────────────────────────

function StickyHeader() {
  const homeIcon = useShellStore((s) => s.homeIcon);
  const searchBar = useShellStore((s) => s.searchBar);
  const themeSwitcher = useShellStore((s) => s.themeSwitcher);
  const localeFlag = useShellStore((s) => s.localeFlag);
  const notificationBell = useShellStore((s) => s.notificationBell);
  const notificationCount = useShellStore((s) => s.notificationCount);
  const logoutIcon = useShellStore((s) => s.logoutIcon);

  const { isAuthenticated, logout: authLogout } = useAuth();
  const applyPreset = useShellStore((s) => s.applyPreset);

  useEffect(() => {
    if (isAuthenticated) {
      applyPreset("postLogin");
    } else {
      applyPreset("preLogin");
    }
  }, [isAuthenticated, applyPreset]);

  const logout = () => {
    authLogout();
    useAppStore.getState().logout();
  };
  const navigate = useAppStore((s) => s.navigate);
  const closeCard = useAppStore((s) => s.closeCard);
  const toggleSideNav = useAppStore((s) => s.toggleSideNav);

  const [dark, setDark] = useState(false);
  const [locIdx, setLocIdx] = useState(0);
  const locales = ["🇺🇸", "🇩🇪", "🇯🇵", "🇫🇷", "🇮🇳"];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 10, background: "var(--hdr)", borderBottom: "1px solid var(--brd)", zIndex: 100 }}>

      {/* LEFT */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
        {homeIcon && (
          <button className="ib" onClick={() => { navigate("dashboard"); closeCard(); }} title="Home">
            <Ic d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />
          </button>
        )}
        {isAuthenticated && (
          <button className="ib" onClick={toggleSideNav} title="Menu">
            <Ic d="M3 6h18M3 12h18M3 18h18" />
          </button>
        )}
        <span style={{ fontFamily: 'var(--fb)', fontSize: 18, fontWeight: 700, color: 'var(--tx)', letterSpacing: '-0.025em' }}>Nexus</span>
        {searchBar && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--inp)", borderRadius: 20, padding: "6px 14px", border: "1px solid var(--brd)", marginLeft: 8 }}>
            <Ic d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" size={13} />
            <input placeholder="Search…" style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--tx)", width: 150 }} />
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {themeSwitcher && (
          <button className="ib" onClick={() => setDark((d) => !d)} title="Theme">
            <Ic d={dark ? "M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36l-.7.7M6.34 17.66l-.7.7m12.72 0l-.7-.7M6.34 6.34l-.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z" : "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"} />
          </button>
        )}
        {localeFlag && (
          <button className="ib" style={{ fontSize: 15 }} onClick={() => setLocIdx((i) => (i + 1) % locales.length)} title="Locale">
            {locales[locIdx]}
          </button>
        )}
        {notificationBell && (
          <button className="ib" style={{ position: "relative" }} title={`${notificationCount} notifications`}>
            <Ic d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            <span style={{ position: "absolute", top: 4, right: 4, background: "var(--dng)", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{notificationCount}</span>
          </button>
        )}
        {logoutIcon && (
          <button className="ib" onClick={logout} title="Logout">
            <Ic d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </button>
        )}
      </div>
    </header>
  );
}

// ─── STICKY FOOTER ────────────────────────────────────────────────────────────

function StickyFooter() {
  const copyright = useShellStore((s) => s.copyright);
  const clockSlot = useShellStore((s) => s.clock);
  const buildVersion = useShellStore((s) => s.buildVersion);
  const sessionTimer = useShellStore((s) => s.sessionTimer);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  // const time = useClock();
  const session = useSessionTimer(isLoggedIn);

  return (
    <footer style={{ height: 32, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, background: "var(--ftr)", borderTop: "1px solid var(--brd)", fontSize: 10, color: "var(--mu)", zIndex: 100, fontWeight: 500, letterSpacing: '0.025em' }}>
      {copyright && <span style={{ textTransform: 'uppercase', opacity: 0.5 }}>© 2025 ShoPro AI</span>}
      {buildVersion && <><span style={{ color: "var(--brd)" }}>|</span><span style={{ opacity: 0.3 }}>v1.8.0</span></>}
      <div style={{ flex: 1 }} />
      {sessionTimer && isLoggedIn && <span style={{ color: "var(--ac)", fontVariantNumeric: "tabular-nums" }}>Session {session}</span>}
      {sessionTimer && isLoggedIn && <span style={{ color: "var(--brd)" }}>|</span>}
      {/* {clockSlot && <span style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>} */}
    </footer>
  );
}

// ─── SIDE NAV ─────────────────────────────────────────────────────────────────

function SideNav() {
  const open = useAppStore((s) => s.sideNavOpen);
  const navigate = useAppStore((s) => s.navigate);
  const selectedCard = useAppStore((s) => s.selectedCard);
  const card = CARDS.find((c) => c.id === selectedCard);

  const navItems = [
    { label: "Dashboard",   screen: "dashboard",   d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { label: "Inventory",   screen: "inventory",   d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { label: "Kitchen",     screen: "kds",         d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
    { label: "Prime Cost",  screen: "prime-cost",  d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Engineering", screen: "engineering", d: "M7 21a1 1 0 01-1-1V4a1 1 0 011-1h5a2 2 0 012 2v11a2 2 0 01-2 2H7zm0-8h7" },
    { label: "Purchasing",  screen: "purchasing",  d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Experiments", screen: "experiment-lab", d: "M4.5 3h15M6 3v16a2 2 0 002 2h8a2 2 0 002-2V3M6 14h12" },
    { label: "Reports",     screen: "reports",        d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "Supplier Pay", screen: "supplier-pay", d: "M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { label: "Staff Mgmt",  screen: "staff-management", d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 110 8 4 4 0 010-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
    { label: "Kitchen Costs", screen: "recipes",     d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { label: "Finance",     screen: "finance-hub",   d: "M9 7h6m0 10v-3.5c0-1.5-1.5-2.5-3-2.5m-6 4h4m-4 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 114 0 2 2 0 01-4 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" },
  ];

  return (
    <aside style={{ width: open ? 220 : 0, flexShrink: 0, overflow: "hidden", transition: "width 0.32s cubic-bezier(0.4,0,0.2,1)", background: "var(--snv)", borderRight: "1px solid var(--brd)" }}>
      <div style={{ width: 220, padding: "12px 0", opacity: open ? 1 : 0, transition: "opacity 0.2s", display: "flex", flexDirection: "column", height: "100%" }}>
        {navItems.map((item) => (
          <button key={item.label} data-testid={`nav-${item.screen}`} onClick={() => navigate(item.screen as Screen)} className="ni" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 18px", background: "transparent", border: "none", cursor: "pointer", color: "var(--mu)", fontSize: 13, fontWeight: 600, textAlign: "left", transition: 'all 0.2s ease' }}>
            <Ic d={item.d} size={15} />
            {item.label}
          </button>
        ))}
        {card && (
          <div style={{ margin: "auto 12px 12px", padding: 14, background: "var(--crd)", borderRadius: 10, border: "1px solid var(--brd)" }}>
            <div style={{ fontSize: 10, color: "var(--ac)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{card.tag}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--tx)", marginBottom: 8 }}>{card.title}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--tx)", fontFamily: "var(--fb)" }}>{card.value}</div>
            <div style={{ fontSize: 12, color: card.positive ? "var(--ok)" : "var(--dng)", marginTop: 3, fontWeight: 600 }}>{card.delta}</div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

function LoginRouter() {
  const url = window.location.href.toLowerCase();
  const mode = new URLSearchParams(window.location.search).get('mode')?.toLowerCase();

  if (url.includes('staff') || mode === 'staff') {
    return <StaffLoginPage />;
  }

  if (url.includes('guest') || mode === 'guest') {
    return <GuestLoginPage />;
  }

  // Default: ShoProLoginPage covers localhost dev and shopro.* production domains
  return <ShoProLoginPage />;
}


// ─── CANVAS ───────────────────────────────────────────────────────────────────

function Canvas() {
  const { isAuthenticated, session } = useAuth();
  const screen = useAppStore((s) => s.screen);
  
  // Sync AppStore with Auth state
  useEffect(() => {
    useAppStore.setState((s) => ({ ...s, isLoggedIn: isAuthenticated }));
  }, [isAuthenticated]);

  // If we're authenticated but the screen is still 'login', default to 'dashboard'
  const displayScreen = (isAuthenticated && screen === "login") ? "dashboard" : screen;

  if (!isAuthenticated) return <LoginRouter />;

  return (
    <div style={{ flex: 1, display: "flex", height: "calc(100vh - 88px)", 
    maxHeight: "calc(100vh - 88px)", overflow: "hidden" }}>
      <SideNav />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "hidden", position: "relative" }}>
          <ErrorBoundary key={displayScreen} label={`Screen: ${displayScreen}`}>
          {displayScreen === "dashboard" && <Dashboard />}
          {displayScreen === "inventory" && <InventoryHub />}
          {displayScreen === "inventory-ingredients" && <IngredientMasterPage />}
          {displayScreen === "inventory-count" && <InventoryCountEntry />}
          {displayScreen === "inventory-history" && <PeriodHistory />}
          {displayScreen === "inventory-alerts" && <LowStockAlerts />}
          {displayScreen === "inventory-new-ingredient" && <NewIngredientForm />}
          {displayScreen === "inventory-ingredient-detail" && <IngredientDetail />}
          {displayScreen === "inventory-period-detail" && <PeriodDetail />}
          {displayScreen === "purchasing" && <PurchasingHub />}
          {displayScreen === "purchase-suppliers" && <SupplierDirectory />}
          {displayScreen === "purchase-invoice-entry" && <InvoiceEntry />}
          {displayScreen === "purchase-invoice-editor" && <InvoiceEditorPage />}
          {displayScreen === "purchase-invoice-log" && <InvoiceLog />}
          {displayScreen === "purchase-weekly" && <WeeklySummaryPage />}
          {displayScreen === "purchase-trend" && <TrendChartPage />}
          {displayScreen === "purchase-alerts" && <VarianceAlertPage />}
          {displayScreen === "purchase-po-list" && <POListPage />}
          {displayScreen === "purchase-po-editor" && <POEditorPage />}
          {displayScreen === "purchase-po-detail" && <PODetailPage />}
          {displayScreen === "purchase-grn-list" && <GRNListPage />}
          {displayScreen === "purchase-grn-editor" && <GRNEditorPage />}
          {displayScreen === "purchase-grn-detail" && <GRNDetailPage />}
          {displayScreen === "purchase-grn-conflicts" && <GRNConflictPage />}
          {displayScreen === "purchase-matching" && <MatchingDashboardPage />}
          {displayScreen === "purchase-variance" && <VarianceAlertPage />}
          {displayScreen === "purchase-audit" && <MatchAuditPage />}
          {displayScreen === "purchase-po-staging" && <POStagingPage />}
          {displayScreen === "recipes" && <RecipeHub />}
          {displayScreen === "recipe-menu-items" && <SalesMenuCosting />}
          {displayScreen === "recipe-menu-item-editor" && <StubPage title="Menu Item Editor" />}
          {displayScreen === "recipe-list" && <RecipeScreens />}
          {displayScreen === "recipe-editor" && <RecipeEditor />}
          {displayScreen === "recipe-editor-detail" && <RecipeDetail />}
          {displayScreen === "recipe-cost-groups" && <StubPage title="Cost Groups" />}
          {displayScreen === "recipe-converter" && <StubPage title="Unit Converter" />}
          {displayScreen === "engineering" && <EngineeringHubPage />}
          {displayScreen === "engineering-setup" && <PeriodSetupPage />}
          {displayScreen === "engineering-detail" && <PeriodDetailPage periodId={useAppStore.getState().selectedEngineeringId} />}
          {displayScreen === "engineering-live" && <LiveSalesCounterPage />}
          {displayScreen === "engineering-history" && <PeriodHistoryPage />}
          {displayScreen === "engineering-whatif" && <WhatIfSimulatorPage periodId={useAppStore.getState().selectedEngineeringId} />}
          {displayScreen === "engineering-comparison" && <PeriodComparisonPage />}
          {displayScreen === "kds" && <ExpoKds outletId={session?.restaurantId || 3} />}
          {displayScreen === "prime-cost" && <PrimeCostHubPage />}
          {displayScreen === "staff-management" && <StaffManagementHubPage />}
          {displayScreen === "table-staff-map" && <TableStaffMapPage />}
          {displayScreen === "labor-staffing" && <StaffManagementPage />}
          {displayScreen === "finance-hub" && <FinanceHubPage />}
          {displayScreen === "finance-pnl" && <PnLStatementPage />}
          {displayScreen === "finance-expenses" && <ExpenseEntryPage />}
          {displayScreen === "finance-cash" && <CashManagementPage />}
          {displayScreen === "finance-sales" && <SalesEntryPage />}
          {displayScreen === "accounting-salary" && <SalaryDisbursementPage />}
          {displayScreen === "accounting-accounts" && <ChartOfAccountsPage />}
          {displayScreen === "supplier-pay" && <PaymentFeature />}
          {displayScreen === "experiment-lab" && <ExperimentPage />}
          {displayScreen === "reports" && <ReportsPage />}
          {/* {displayScreen === "prime-cost-multi" && <MultiLocationPrimeCost restaurantIds={[session?.restaurantId || 3]} />} */}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

// ─── ROUTE SYNC (Bridge between URL and Custom Store) ─────────────────────────

function RouteSync() {
  const { pathname } = useLocation();

  useEffect(() => {
    const store = useAppStore.getState();

    // ── SS2: Purchasing ──────────────────────────────────
    if (matchPath("/purchasing", pathname)) {
      store.navigate("purchasing");
    } else if (matchPath("/purchasing/invoices/new", pathname)) {
      useAppStore.setState({ screen: "purchase-invoice-editor" });
    } else if (matchPath("/purchasing/invoices/:id", pathname)) {
      const match = matchPath("/purchasing/invoices/:id", pathname);
      const id = match?.params.id;
      if (id) {
        useAppStore.setState({ 
          screen: "purchase-invoice-entry", 
          selectedInvoiceId: isNaN(parseInt(id)) ? 'new' : parseInt(id) 
        });
      }
    } else if (matchPath("/purchasing/invoices", pathname)) {
      store.navigate("purchase-invoice-log");
    } else if (matchPath("/experiments", pathname)) {
      store.navigate("experiment-lab");
    } else if (matchPath("/reports", pathname)) {
      store.navigate("reports");
    } else if (matchPath("/purchasing/weekly-summary", pathname)) {
      store.navigate("purchase-weekly");
    } else if (matchPath("/purchasing/suppliers", pathname)) {
      store.navigate("purchase-suppliers");
    } else if (matchPath("/purchasing/proof-alerts", pathname)) {
      store.navigate("purchase-alerts");
    } else if (matchPath("/purchasing/trend", pathname)) {
      store.navigate("purchase-trend");
    } else if (matchPath("/purchasing/pos/new", pathname)) {
      useAppStore.setState({ screen: "purchase-po-editor", selectedPOId: 'new' });
    } else if (matchPath("/purchasing/pos/:id/edit", pathname)) {
      const match = matchPath("/purchasing/pos/:id/edit", pathname);
      useAppStore.setState({ screen: "purchase-po-editor", selectedPOId: match?.params.id || null });
    } else if (matchPath("/purchasing/pos/:id", pathname)) {
      const match = matchPath("/purchasing/pos/:id", pathname);
      useAppStore.setState({ screen: "purchase-po-detail", selectedPOId: match?.params.id || null });
    } else if (matchPath("/purchasing/pos", pathname)) {
      store.navigate("purchase-po-list");
    } else if (matchPath("/purchasing/staging", pathname)) {
      store.navigate("purchase-po-staging");
    } else if (matchPath("/purchasing/grns", pathname)) {
      store.navigate("purchase-grn-list");
    } else if (matchPath("/purchasing/grns/new", pathname)) {
      store.navigate("purchase-grn-editor");
    } else if (matchPath("/purchasing/grns/:id", pathname)) {
      const match = matchPath("/purchasing/grns/:id", pathname);
      useAppStore.setState({ screen: "purchase-grn-detail", selectedGRNId: match?.params.id || null });
    } else if (matchPath("/purchasing/matching", pathname)) {
      store.navigate("purchase-matching");
    } else if (matchPath("/purchasing/variance-alerts", pathname)) {
      store.navigate("purchase-variance");
    } else if (matchPath("/purchasing/audit", pathname)) {
      store.navigate("purchase-audit");
    } else if (matchPath("/payments", pathname)) {
      store.navigate("supplier-pay");
    } else if (matchPath("/labor", pathname)) {
      store.navigate("labor-staffing");
    } else if (matchPath("/staff-management", pathname)) {
      store.navigate("staff-management");
    } else if (matchPath("/prime-cost", pathname)) {
      store.navigate("prime-cost");
    } else if (matchPath("/accounting/salary", pathname)) {
      store.navigate("accounting-salary");
    } else if (matchPath("/accounting/accounts", pathname)) {
      store.navigate("accounting-accounts");
    } else if (matchPath("/accounting", pathname)) {
      store.navigate("accounting-salary");
    }

    // ── SS0: Dashboard ──────────────────────────────────
    else if (pathname === "/" || pathname === "/dashboard") {
      store.navigate("dashboard");
    }

    // ── SS1: Inventory ──────────────────────────────────
    else if (matchPath("/inventory", pathname)) {
      store.navigate("inventory");
    } else if (matchPath("/inventory/ingredients", pathname)) {
      store.navigate("inventory-ingredients");
    } else if (matchPath("/inventory/count", pathname)) {
      store.navigate("inventory-count");
    }

    // ── SS3: Recipes ────────────────────────────────────
    else if (matchPath("/recipes", pathname)) {
      store.navigate("recipes");
    }

    // ── SS4: Engineering ────────────────────────────────
    else if (matchPath("/engineering", pathname)) {
      store.navigate("engineering");
    } else if (matchPath("/engineering/new", pathname)) {
      store.navigate("engineering-setup");
    } else if (matchPath("/engineering/live", pathname)) {
      store.navigate("engineering-live");
    } else if (matchPath("/engineering/history", pathname)) {
      store.navigate("engineering-history");
    } else if (matchPath("/engineering/compare", pathname)) {
      store.navigate("engineering-comparison");
    } else if (matchPath("/engineering/periods/:id/whatif", pathname)) {
      const match = matchPath("/engineering/periods/:id/whatif", pathname);
      useAppStore.setState({ screen: "engineering-whatif", selectedEngineeringId: match?.params.id ? Number(match.params.id) : null });
    } else if (matchPath("/engineering/periods/:id", pathname)) {
      const match = matchPath("/engineering/periods/:id", pathname);
      useAppStore.setState({ screen: "engineering-detail", selectedEngineeringId: match?.params.id ? Number(match.params.id) : null });
    }
  }, [pathname]);

  return null;
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <RestaurantProvider>
              <RouteSync />
              <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
                <StickyHeader />
                <Canvas />
                <StickyFooter />
              </div>
            </RestaurantProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}