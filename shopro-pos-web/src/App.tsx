import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeContext';
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from 'sonner';
import { LoginPage } from './features/auth/pages/LoginPage';
import { AccessDeniedPage } from './features/auth/pages/AccessDeniedPage';
import { MenuDashboard } from './features/menu/pages/MenuDashboard';
import { CategoriesPage } from './features/menu/pages/CategoriesPage';
import { MenuItemsPage } from './features/menu/pages/MenuItemsPage';
import { ModifiersPage } from './features/menu/pages/ModifiersPage';
import { FloorPlanPage } from './features/floor/pages/FloorPlanPage';
import { LayoutEditorPage } from './features/floor/pages/LayoutEditorPage';
import { SettingsLayout } from './features/settings/layouts/SettingsLayout';
import { TablesideSettingsPage } from './features/settings/pages/TablesideSettingsPage';
import KdsSettings from './features/settings/components/kds/KdsSettings';
import { CrmLayout } from './features/crm/layouts/CrmLayout';
import { CustomerListPage } from './features/crm/pages/CustomerListPage';
import { CustomerDetailPage } from './features/crm/pages/CustomerDetailPage';
import { LoyaltyConfigPage } from './features/crm/pages/LoyaltyConfigPage';
import SegmentsPage from './features/crm/pages/SegmentsPage';
import PromoCodesPage from './features/crm/pages/PromoCodesPage';
import { CampaignsPage } from './features/crm/pages/CampaignsPage';
import FeedbackDashboardPage from './features/crm/pages/FeedbackDashboardPage';
import { CrmAnalyticsPage } from './features/crm/pages/CrmAnalyticsPage';
import { CrmSettingsPage } from './features/crm/pages/CrmSettingsPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { StaffListPage } from './features/staff/pages/StaffListPage';
import { RoleManagementPage } from './features/staff/pages/RoleManagementPage';
import { VendorRFQPage } from './features/inventory/pages/VendorRFQPage';
import { InventoryLayout } from './features/inventory/layouts/InventoryLayout';
import { InventoryDashboard } from './features/inventory/pages/InventoryDashboard';
import { RecipesPage } from './features/inventory/pages/RecipesPage';
import { SupplierManagementPage } from './features/inventory/pages/SupplierManagementPage';
import { RFQManagementPage } from './features/inventory/pages/RFQManagementPage';
import { NotificationAdminLayout } from './features/notifications/layouts/NotificationAdminLayout';
import { NotificationDashboardPage } from './features/notifications/pages/NotificationDashboardPage';
import { NotificationTypesPage } from './features/notifications/pages/NotificationTypesPage';
import { NotificationChannelsPage } from './features/notifications/pages/NotificationChannelsPage';
import { NotificationRoutingPage } from './features/notifications/pages/NotificationRoutingPage';
import { NotificationLogsPage } from './features/notifications/pages/NotificationLogsPage';
import { NotificationSendPage } from './features/notifications/pages/NotificationSendPage';
import { SupplierAuthProvider } from './features/auth/SupplierAuthContext';
import { SupplierProtectedRoute } from './features/auth/SupplierProtectedRoute';
import { SupplierLoginPage } from './features/auth/pages/SupplierLoginPage';
import { SupplierPortalLayout } from './features/inventory/layouts/SupplierPortalLayout';
import { SupplierDashboard } from './features/inventory/pages/SupplierDashboard';
import { SupplierRfqList } from './features/inventory/pages/SupplierRfqList';
import { SupplierInventoryView } from './features/inventory/pages/SupplierInventoryView';
import { SupplierPOFulfillmentPage } from './features/inventory/pages/SupplierPOFulfillmentPage';
import { SupplierPOListPage } from './features/inventory/pages/SupplierPOListPage';
import { SupplierProposalsList } from './features/inventory/components/SupplierProposalsList';
import { POManagementPage } from './features/inventory/pages/POManagementPage';
import { NotificationProvider } from './features/notifications/contexts/NotificationContext';
import type { StaffRole } from '@/lib/auth/AuthContext';

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

  return (
    <BrowserRouter>
      {/*
       * Brand accent bar — the animated teal→cyan→coral gradient strip
       * that runs across the very top of every page, echoing the logo palette.
       */}
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

      <Routes>
        {/* ── Public ─────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/denied" element={<AccessDeniedPage />} />
        <Route path="/vendor/rfq/:rfqId" element={<VendorRFQPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Protected shell — header + sidebar live inside AppShell ── */}
        <Route
          element={
            <ProtectedRoute allowedRoles={ALL_STAFF}>
              {/* pt-[3px] clears the brand-bar height */}
              <div className="pt-[3px] flex flex-col min-h-dvh">
                <AppShell />
              </div>
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
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="vendors" element={<SupplierManagementPage />} />
            <Route path="procurement" element={<RFQManagementPage />} />
            <Route path="pos" element={<POManagementPage />} />
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
        </Route>

        {/* Admin Notifications — admin only */}
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <div className="pt-[3px] flex flex-col min-h-dvh">
                <AppShell />
              </div>
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
        <Route path="/supplier/login" element={<SupplierLoginPage />} />
        <Route
          element={
            <SupplierProtectedRoute>
              <div className="pt-[3px] flex flex-col min-h-dvh font-body">
                <SupplierPortalLayout />
              </div>
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes >
    </BrowserRouter >
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SupplierAuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </SupplierAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
