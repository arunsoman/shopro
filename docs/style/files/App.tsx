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
import { InventoryDemoPage } from './features/inventory/pages/InventoryDemoPage';
import { CrmLayout } from './features/crm/layouts/CrmLayout';
import { CustomerListPage } from './features/crm/pages/CustomerListPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { StaffListPage } from './features/staff/pages/StaffListPage';
import { VendorRFQPage } from './features/inventory/pages/VendorRFQPage';
import type { StaffRole } from '@/lib/auth/AuthContext';

// Shopro design system
import './App.css';

const queryClient = new QueryClient();

const ADMIN_ROLES: StaffRole[] = ['OWNER', 'MANAGER'];
const ALL_STAFF: StaffRole[] = [
  'OWNER', 'MANAGER', 'HOST', 'HOSTESS', 'SERVER',
  'CASHIER', 'BUSSER', 'CHEF', 'LINE_COOK', 'EXPEDITOR',
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
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/denied"            element={<AccessDeniedPage />} />
        <Route path="/vendor/rfq/:rfqId" element={<VendorRFQPage />} />
        <Route path="/"                  element={<Navigate to="/dashboard" replace />} />

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
              <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'CHEF']}>
                <InventoryDemoPage />
              </ProtectedRoute>
            }
          />

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
            <Route path="items"      element={<MenuItemsPage />} />
            <Route path="modifiers"  element={<ModifiersPage />} />
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
            <Route
              path="tiers"
              element={
                <div className="p-8 font-body font-medium text-foreground">
                  Loyalty Tiers Configuration — coming soon
                </div>
              }
            />
            <Route
              path="campaigns"
              element={
                <div className="p-8 font-body font-medium text-foreground">
                  Marketing Campaigns — coming soon
                </div>
              }
            />
            <Route
              path="settings"
              element={
                <div className="p-8 font-body font-medium text-foreground">
                  CRM Global Settings — coming soon
                </div>
              }
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
            <Route path="floor-layout"  element={<LayoutEditorPage />} />
            <Route path="tableside"     element={<TablesideSettingsPage />} />
            <Route path="kds"           element={<KdsSettings />} />
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                  <StaffListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={<div className="p-8 text-foreground">Notifications Config — coming soon</div>}
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
