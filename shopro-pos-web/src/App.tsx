import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeContext';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import { Toaster } from 'sonner';
import { Loader2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SupplierProtectedRoute } from './features/auth/SupplierProtectedRoute';
import { SupplierAuthProvider } from './features/auth/SupplierAuthContext';
import type { StaffRole } from '@/lib/auth/AuthContext';

// --- Lazy loaded Layouts ---
const AuthenticatedLayout = lazy(() => import('./components/layout/AuthenticatedLayout'));
const SupplierPortalAuthenticatedLayout = lazy(() => import('./features/inventory/layouts/SupplierPortalAuthenticatedLayout'));

// --- Lazy loaded features ---
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const AccessDeniedPage = lazy(() => import('./features/auth/pages/AccessDeniedPage').then(m => ({ default: m.AccessDeniedPage })));
const SupplierLoginPage = lazy(() => import('./features/auth/pages/SupplierLoginPage').then(m => ({ default: m.SupplierLoginPage })));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const FloorPlanPage = lazy(() => import('./features/floor/pages/FloorPlanPage').then(m => ({ default: m.FloorPlanPage })));
const LayoutEditorPage = lazy(() => import('./features/floor/pages/LayoutEditorPage').then(m => ({ default: m.LayoutEditorPage })));
const MenuDashboard = lazy(() => import('./features/menu/pages/MenuDashboard').then(m => ({ default: m.MenuDashboard })));
const CategoriesPage = lazy(() => import('./features/menu/pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const MenuItemsPage = lazy(() => import('./features/menu/pages/MenuItemsPage').then(m => ({ default: m.MenuItemsPage })));
const ModifiersPage = lazy(() => import('./features/menu/pages/ModifiersPage').then(m => ({ default: m.ModifiersPage })));
const InventoryLayout = lazy(() => import('./features/inventory/layouts/InventoryLayout').then(m => ({ default: m.InventoryLayout })));
const InventoryDashboard = lazy(() => import('./features/inventory/pages/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const RecipesPage = lazy(() => import('./features/inventory/pages/RecipesPage').then(m => ({ default: m.RecipesPage })));
const SupplierManagementPage = lazy(() => import('./features/inventory/pages/SupplierManagementPage').then(m => ({ default: m.SupplierManagementPage })));
const RFQManagementPage = lazy(() => import('./features/inventory/pages/RFQManagementPage').then(m => ({ default: m.RFQManagementPage })));
const POManagementPage = lazy(() => import('./features/inventory/pages/POManagementPage').then(m => ({ default: m.POManagementPage })));
const GoodsReceivingPage = lazy(() => import('./features/inventory/pages/GoodsReceivingPage').then(m => ({ default: m.GoodsReceivingPage })));
const ThreeWayMatchPanel = lazy(() => import('./features/inventory/pages/ThreeWayMatchPanel').then(m => ({ default: m.ThreeWayMatchPanel })));
const AIThreeWayMatchPage = lazy(() => import('./features/inventory/pages/AIThreeWayMatchPage').then(m => ({ default: m.AIThreeWayMatchPage })));
const VendorRFQPage = lazy(() => import('./features/inventory/pages/VendorRFQPage').then(m => ({ default: m.VendorRFQPage })));
const DailyPerishablesPanel = lazy(() => import('./features/inventory/pages/DailyPerishablesPanel').then(m => ({ default: m.DailyPerishablesPanel })));
const CrmLayout = lazy(() => import('./features/crm/layouts/CrmLayout').then(m => ({ default: m.CrmLayout })));
const CustomerListPage = lazy(() => import('./features/crm/pages/CustomerListPage').then(m => ({ default: m.CustomerListPage })));
const CustomerDetailPage = lazy(() => import('./features/crm/pages/CustomerDetailPage').then(m => ({ default: m.CustomerDetailPage })));
const LoyaltyConfigPage = lazy(() => import('./features/crm/pages/LoyaltyConfigPage').then(m => ({ default: m.LoyaltyConfigPage })));
const SegmentsPage = lazy(() => import('./features/crm/pages/SegmentsPage'));
const PromoCodesPage = lazy(() => import('./features/crm/pages/PromoCodesPage'));
const CampaignsPage = lazy(() => import('./features/crm/pages/CampaignsPage').then(m => ({ default: m.CampaignsPage })));
const FeedbackDashboardPage = lazy(() => import('./features/crm/pages/FeedbackDashboardPage'));
const CrmAnalyticsPage = lazy(() => import('./features/crm/pages/CrmAnalyticsPage').then(m => ({ default: m.CrmAnalyticsPage })));
const CrmSettingsPage = lazy(() => import('./features/crm/pages/CrmSettingsPage').then(m => ({ default: m.CrmSettingsPage })));
const StaffListPage = lazy(() => import('./features/staff/pages/StaffListPage').then(m => ({ default: m.StaffListPage })));
const RoleManagementPage = lazy(() => import('./features/staff/pages/RoleManagementPage').then(m => ({ default: m.RoleManagementPage })));
const SettingsLayout = lazy(() => import('./features/settings/layouts/SettingsLayout').then(m => ({ default: m.SettingsLayout })));
const TablesideSettingsPage = lazy(() => import('./features/settings/pages/TablesideSettingsPage').then(m => ({ default: m.TablesideSettingsPage })));
const KdsSettings = lazy(() => import('./features/settings/components/kds/KdsSettings'));
const NotificationAdminLayout = lazy(() => import('./features/notifications/layouts/NotificationAdminLayout').then(m => ({ default: m.NotificationAdminLayout })));
const NotificationDashboardPage = lazy(() => import('./features/notifications/pages/NotificationDashboardPage').then(m => ({ default: m.NotificationDashboardPage })));
const NotificationTypesPage = lazy(() => import('./features/notifications/pages/NotificationTypesPage').then(m => ({ default: m.NotificationTypesPage })));
const NotificationChannelsPage = lazy(() => import('./features/notifications/pages/NotificationChannelsPage').then(m => ({ default: m.NotificationChannelsPage })));
const NotificationRoutingPage = lazy(() => import('./features/notifications/pages/NotificationRoutingPage').then(m => ({ default: m.NotificationRoutingPage })));
const NotificationLogsPage = lazy(() => import('./features/notifications/pages/NotificationLogsPage').then(m => ({ default: m.NotificationLogsPage })));
const NotificationSendPage = lazy(() => import('./features/notifications/pages/NotificationSendPage').then(m => ({ default: m.NotificationSendPage })));
const SupplierDashboard = lazy(() => import('./features/inventory/pages/SupplierDashboard').then(m => ({ default: m.SupplierDashboard })));
const SupplierRfqList = lazy(() => import('./features/inventory/pages/SupplierRfqList').then(m => ({ default: m.SupplierRfqList })));
const SupplierInventoryView = lazy(() => import('./features/inventory/pages/SupplierInventoryView').then(m => ({ default: m.SupplierInventoryView })));
const SupplierPOFulfillmentPage = lazy(() => import('./features/inventory/pages/SupplierPOFulfillmentPage').then(m => ({ default: m.SupplierPOFulfillmentPage })));
const SupplierPOListPage = lazy(() => import('./features/inventory/pages/SupplierPOListPage').then(m => ({ default: m.SupplierPOListPage })));
const SupplierProposalsList = lazy(() => import('./features/inventory/components/SupplierProposalsList').then(m => ({ default: m.SupplierProposalsList })));
const TaxesDashboardPage = lazy(() => import('./features/taxes/pages/TaxesDashboardPage').then(m => ({ default: m.TaxesDashboardPage })));
const ExpiryMonitor = lazy(() => import('./features/inventory/pages/ExpiryMonitor').then(m => ({ default: m.ExpiryMonitor })));
const WasteDonationLog = lazy(() => import('./features/inventory/pages/WasteDonationLog').then(m => ({ default: m.WasteDonationLog })));
const SupplierDetailPage = lazy(() => import('./features/inventory/pages/SupplierDetailPage').then(m => ({ default: m.SupplierDetailPage })));
const ShelfLifeRotationDashboard = lazy(() => import('./features/inventory/pages/ShelfLifeRotationDashboard').then(m => ({ default: m.ShelfLifeRotationDashboard })));
const YieldAnalysisPage = lazy(() => import('./features/inventory/pages/YieldAnalysisPage').then(m => ({ default: m.YieldAnalysisPage })));
const SKUDetailPage = lazy(() => import('./features/inventory/pages/SKUDetailPage').then(m => ({ default: m.SKUDetailPage })));
const RestockingAlertDashboard = lazy(() => import('./features/inventory/pages/RestockingAlertDashboard').then(m => ({ default: m.RestockingAlertDashboard })));

const PageLoader = () => (
    <div className="flex h-dvh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

// Shopro design system
import './App.css';

const queryClient = new QueryClient();

const ADMIN_ROLES: StaffRole[] = ['OWNER', 'MANAGER', 'GENERAL_MANAGER', 'ASSISTANT_MANAGER'];
const ALL_STAFF: StaffRole[] = [
  'OWNER', 'MANAGER', 'GENERAL_MANAGER', 'ASSISTANT_MANAGER', 'FB_MANAGER',
  'KITCHEN_MANAGER', 'EXECUTIVE_CHEF', 'SOUS_CHEF', 'CHEF_DE_PARTIE',
  'LINE_COOK', 'PREP_COOK', 'DISHWASHER', 'MAITRE_D', 'HOST',
  'BARTENDER', 'BUSSER', 'RUNNER', 'SENIOR_SERVER', 'JUNIOR_SERVER',
];

function AppContent() {
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <BrowserRouter>
      {/*
       * Brand accent bar — the animated teal→cyan→coral gradient strip
       * that runs across the very top of every page, echoing the logo palette.
       */}{' '}
      <div className="brand-bar fixed top-0 left-0 right-0 z-[70]" aria-hidden />
      <Toaster
        position="top-right"
        theme={theme}
        closeButton
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public ─────────────────────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/denied" element={<AccessDeniedPage />} />
          <Route path="/studio" element={<LayoutEditorPage />} />
          <Route path="/vendor/rfq/:rfqId" element={<VendorRFQPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* ── Protected shell — header + sidebar live inside AppContent wrapper ── */}
          <Route
            element={
              <ProtectedRoute allowedRoles={ALL_STAFF}>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Floor */}
          <Route path="/floor" element={<FloorPlanPage />} />

          {/* Inventory — Manager, Owner, Chef */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'GENERAL_MANAGER', 'ASSISTANT_MANAGER', 'EXECUTIVE_CHEF', 'SOUS_CHEF', 'KITCHEN_MANAGER']}>
                <InventoryLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="stock" replace />} />
            <Route path="stock" element={<InventoryDashboard />} />
            <Route path="stock/:id" element={<SKUDetailPage />} />
            <Route path="shelf-life" element={<ShelfLifeRotationDashboard />} />
            <Route path="yield" element={<YieldAnalysisPage />} />
            <Route path="perishables" element={<DailyPerishablesPanel />} />
            <Route path="expiry" element={<ExpiryMonitor />} />
            <Route path="alerts" element={<RestockingAlertDashboard />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="waste" element={<WasteDonationLog />} />
            <Route path="vendors" element={<SupplierManagementPage />} />
            <Route path="vendors/:id" element={<SupplierDetailPage />} />
            <Route path="procurement" element={<RFQManagementPage />} />
            <Route path="pos" element={<POManagementPage />} />
            <Route path="po/:id/receive" element={<GoodsReceivingPage />} />
            <Route path="po/:id/match" element={<ThreeWayMatchPanel />} />
            <Route path="po/smart-match" element={<AIThreeWayMatchPage />} />
          </Route>

          {/* Menu — admin only */}
          <Route
            path="/menu"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <MenuDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="categories" replace />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="items" element={<MenuItemsPage />} />
            <Route path="modifiers" element={<ModifiersPage />} />
          </Route>

          {/* CRM — admin only */}
          <Route
            path="/crm"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <CrmLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerListPage />} />
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route
              path="tiers"
              element={<LoyaltyConfigPage />}
            />
            <Route
              path="analytics"
              element={<CrmAnalyticsPage />}
            />
            <Route
              path="campaigns"
              element={<CampaignsPage />}
            />
            <Route
              path="segments"
              element={<SegmentsPage />}
            />
            <Route
              path="promos"
              element={<PromoCodesPage />}
            />
            <Route
              path="feedback"
              element={<FeedbackDashboardPage />}
            />
            <Route
              path="settings"
              element={<CrmSettingsPage />}
            />
          </Route>

          {/* Settings — admin only */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <SettingsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="floor-layout" replace />} />
            <Route path="floor-layout" element={<LayoutEditorPage />} />
            <Route path="tableside" element={<TablesideSettingsPage />} />
            <Route path="kds" element={<KdsSettings />} />
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <StaffListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <RoleManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={<Navigate to="/admin/notifications/dashboard" replace />}
            />
            <Route
              path="payments"
              element={<div className="p-8 text-foreground">Payments &amp; Terminal Settings — coming soon</div>}
            />
            <Route
              path="security"
              element={<div className="p-8 text-foreground">Security &amp; Audit Logs — coming soon</div>}
            />
          </Route>

          <Route
            path="/taxes"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <TaxesDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Notifications — admin only */}
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <AuthenticatedLayout />
            </ProtectedRoute>
          }
        >
          <Route element={<NotificationAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<NotificationDashboardPage />} />
            <Route path="types" element={<NotificationTypesPage />} />
            <Route path="channels" element={<NotificationChannelsPage />} />
            <Route path="routing" element={<NotificationRoutingPage />} />
            <Route path="send" element={<NotificationSendPage />} />
            <Route path="logs" element={<NotificationLogsPage />} />
          </Route>
        </Route>



        {/* ── Supplier Portal ──────────────────────────────────────── */}
        <Route
          element={
            <SupplierAuthProvider>
              <Outlet />
            </SupplierAuthProvider>
          }
        >
          <Route path="/supplier/login" element={<SupplierLoginPage />} />
          <Route
            element={
              <SupplierProtectedRoute>
                <SupplierPortalAuthenticatedLayout />
              </SupplierProtectedRoute>
            }
          >
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/rfqs" element={<SupplierRfqList />} />
            <Route path="/supplier/pos" element={<SupplierPOListPage />} />
            <Route path="/supplier/inventory" element={<SupplierInventoryView />} />
            <Route path="/supplier/proposals" element={<SupplierProposalsList />} />
            <Route path="/supplier/po/:id" element={<SupplierPOFulfillmentPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes >

      {/* ---- Global Sticky Thin Footer ---- */}
      <footer className="fixed bottom-0 left-0 right-0 h-7 border-t border-border/40 bg-background/80 backdrop-blur-md z-[60] flex items-center justify-between px-4 text-[9px] text-muted-foreground/60 select-none transition-colors pointer-events-none">
        <div className="flex items-center gap-4">
          <span className="font-medium">&copy; {new Date().getFullYear()} Shopro System Dashboard</span>
          <span className="opacity-30">|</span>
          <span className="flex items-center gap-1.5 opacity-80">
            <Clock className="h-2.5 w-2.5" />
            {formatDate(currentTime)} &bull; {formatTime(currentTime)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-1.5 py-0.5 rounded-sm bg-primary/5 border border-primary/10 text-primary font-mono font-bold">
            BUILD: v0.1.4-beta
          </span>
          <span className="opacity-40">NODE: {window.location.hostname}</span>
        </div>
      </footer>
    </Suspense>
  </BrowserRouter >
  );
}

import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
