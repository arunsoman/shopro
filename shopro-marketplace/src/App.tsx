import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantShell } from './components/layout/RestaurantShell';
import { OperatorShell } from './components/layout/OperatorShell';
import { SupplierShell } from './components/layout/SupplierShell';

// Phase 1: Auth Screens
import RestaurantLogin from './pages/auth/RestaurantLogin';
import OperatorLogin from './pages/auth/OperatorLogin';
import SupplierLogin from './pages/auth/SupplierLogin';
import SupplierRegistration from './pages/auth/SupplierRegistration';

// Phase 3: Portal Screens
import RestaurantDashboard from './pages/restaurant/Dashboard';
import Catalog from './pages/restaurant/Catalog';
import OrderHistory from './pages/restaurant/OrderHistory';
import POCreation from './pages/restaurant/POCreation';
import PODetail from './pages/restaurant/PODetail';
import OrderAmendment from './pages/restaurant/OrderAmendment';
import DeliveryConfirmation from './pages/restaurant/DeliveryConfirmation';
import Inventory from './pages/restaurant/Inventory';
import Payments from './pages/restaurant/Payments';
import Support from './pages/restaurant/Support';
import KYC from './pages/restaurant/KYC';
import Settings from './pages/restaurant/Settings';
import AutoPORules from './pages/restaurant/AutoPORules';
import AutoPOSchedules from './pages/restaurant/AutoPOSchedules';
import AutoPOActivity from './pages/restaurant/AutoPOActivity';
import OperatorDashboard from './pages/operator/Dashboard';
import POInbox from './pages/operator/POInbox';
import POReview from './pages/operator/POReview';
import POSplit from './pages/operator/POSplit';
import SubPOManagement from './pages/operator/SubPOManagement';
import BidCreation from './pages/operator/BidCreation';
import BidEvaluation from './pages/operator/BidEvaluation';
import BiddingManagement from './pages/operator/BiddingManagement';
import AutoPOAdmin from './pages/operator/AutoPOAdmin';
import RestaurantManagement from './pages/operator/RestaurantManagement';
import SupplierVetting from './pages/operator/SupplierVetting';
import SupplierManagement from './pages/operator/SupplierManagement';
import SupplierDetail from './pages/operator/SupplierDetail';
import CategoryManagement from './pages/operator/CategoryManagement';
import ProductMaster from './pages/operator/ProductMaster';
import PricingRules from './pages/operator/PricingRules';
import PricingRefresh from './pages/operator/PricingRefresh';
import DiscountManagement from './pages/operator/DiscountManagement';
import OrderOperations from './pages/operator/OrderOperations';
import DisputeCenter from './pages/operator/DisputeCenter';
import SettlementLogs from './pages/operator/SettlementLogs';
import PayoutApproval from './pages/operator/PayoutApproval';
import RevenueAnalytics from './pages/operator/RevenueAnalytics';
import UserRoles from './pages/operator/UserRoles';
import AuditTrail from './pages/operator/AuditTrail';
import SystemHealth from './pages/operator/SystemHealth';
import APIKeys from './pages/operator/APIKeys';
import Webhooks from './pages/operator/Webhooks';
import MarketplaceSettings from './pages/operator/MarketplaceSettings';
import AutomationLogic from './pages/operator/AutomationLogic';
import WorkflowSchedules from './pages/operator/WorkflowSchedules';
import AutomationLog from './pages/operator/AutomationLog';
import UserManagement from './pages/operator/UserManagement';
import StatementOfAccounts from './pages/operator/StatementOfAccounts';
import PaymentReconciliation from './pages/operator/PaymentReconciliation';
import CreditNoteIssue from './pages/operator/CreditNoteIssue';
import TaxCompliance from './pages/operator/TaxCompliance';
import SourcingWizard from './pages/operator/SourcingWizard';
import DemandForecasting from './pages/operator/DemandForecasting';
import MarginOptimization from './pages/operator/MarginOptimization';
import POOutbox from './pages/operator/POOutbox';
import FinancialReports from './pages/operator/FinancialReports';
import NotificationHub from './pages/operator/NotificationHub';
import PriceComparison from './pages/operator/PriceComparison';
import OrderAudit from './pages/operator/OrderAudit';
import Traceability from './pages/operator/Traceability';

import SupplierDashboard from './pages/supplier/Dashboard';
import LeadResponse from './pages/supplier/LeadResponse';
import OrderFulfillment from './pages/supplier/OrderFulfillment';
import InventoryManagement from './pages/supplier/InventoryManagement';
import BidsAndPOs from './pages/supplier/BidsAndPOs';
import Logistics from './pages/supplier/Logistics';
import FinanceHub from './pages/supplier/FinanceHub';
import SupplierKYC from './pages/supplier/KYC';
import SupplierSettings from './pages/supplier/Settings';
import SupplierProfile from './pages/supplier/Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth (Standalone Screens) */}
        <Route path="/login/restaurant" element={<RestaurantLogin />} />
        <Route path="/login/operator" element={<OperatorLogin />} />
        <Route path="/login/supplier" element={<SupplierLogin />} />
        <Route path="/register/supplier" element={<SupplierRegistration />} />

        {/* Restaurant Portal */}
        <Route path="/restaurant/*" element={
          <RestaurantShell>
            <Routes>
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="orders/new" element={<POCreation />} />
              <Route path="orders/:poId" element={<PODetail />} />
              <Route path="orders/:poId/amend" element={<OrderAmendment />} />
              <Route path="orders/:poId/confirm" element={<DeliveryConfirmation />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="payments" element={<Payments />} />
              <Route path="support" element={<Support />} />
              <Route path="verification" element={<KYC />} />
              <Route path="settings" element={<Settings />} />
              <Route path="auto-po/rules" element={<AutoPORules />} />
              <Route path="auto-po/schedules" element={<AutoPOSchedules />} />
              <Route path="auto-po/activity" element={<AutoPOActivity />} />
              <Route path="*" element={<Navigate to="/restaurant/dashboard" replace />} />
            </Routes>
          </RestaurantShell>
        } />

        {/* Operator Portal */}
        <Route path="/operator/login" element={<OperatorLogin />} />
        <Route path="/operator/*" element={
          <OperatorShell>
            <Routes>
              <Route path="dashboard" element={<OperatorDashboard />} />
              <Route path="po/inbox" element={<POInbox />} />
              <Route path="po/outbox" element={<POOutbox />} />
              <Route path="po/:poId" element={<POReview />} />
              <Route path="po/:poId/split" element={<POSplit />} />
              <Route path="po/:poId/sub-pos" element={<SubPOManagement />} />
              <Route path="po/:poId/audit" element={<OrderAudit />} />
              <Route path="bids" element={<BiddingManagement />} />
              <Route path="bids/new" element={<BidCreation />} />
              <Route path="bids/:eventId" element={<BidEvaluation />} />
              <Route path="auto-po" element={<AutoPOAdmin />} />
              <Route path="restaurants" element={<RestaurantManagement />} />
              <Route path="suppliers/vetting" element={<SupplierVetting />} />
              <Route path="suppliers" element={<SupplierManagement />} />
              <Route path="suppliers/:supplierId" element={<SupplierDetail />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="products" element={<ProductMaster />} />
              <Route path="pricing-rules" element={<PricingRules />} />
              <Route path="pricing-refresh" element={<PricingRefresh />} />
              <Route path="discounts" element={<DiscountManagement />} />
              <Route path="orders" element={<OrderOperations />} />
              <Route path="orders/traceability" element={<Traceability />} />
              <Route path="disputes" element={<DisputeCenter />} />
              <Route path="settlement-logs" element={<SettlementLogs />} />
              <Route path="payouts" element={<PayoutApproval />} />
              <Route path="revenue" element={<RevenueAnalytics />} />
              <Route path="roles" element={<UserRoles />} />
              <Route path="audit-trail" element={<AuditTrail />} />
              <Route path="system-health" element={<SystemHealth />} />
              <Route path="api-keys" element={<APIKeys />} />
              <Route path="webhooks" element={<Webhooks />} />
              <Route path="marketplace-settings" element={<MarketplaceSettings />} />
              <Route path="automation-logic" element={<AutomationLogic />} />
              <Route path="automation-schedules" element={<WorkflowSchedules />} />
              <Route path="automation-log" element={<AutomationLog />} />
              <Route path="administration/notifications" element={<NotificationHub />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="ledger" element={<StatementOfAccounts />} />
              <Route path="reconciliation" element={<PaymentReconciliation />} />
              <Route path="credit-notes" element={<CreditNoteIssue />} />
              <Route path="tax" element={<TaxCompliance />} />
              <Route path="sourcing/comparison" element={<PriceComparison />} />
              <Route path="sourcing-wizard" element={<SourcingWizard />} />
              <Route path="demand-forecasting" element={<DemandForecasting />} />
              <Route path="margin-optimization" element={<MarginOptimization />} />
              <Route path="financial-reports" element={<FinancialReports />} />

              <Route path="*" element={<Navigate to="/operator/dashboard" replace />} />
            </Routes>
          </OperatorShell>
        } />

        {/* Supplier Portal */}
        <Route path="/supplier/*" element={
          <SupplierShell>
            <Routes>
               <Route path="dashboard" element={<SupplierDashboard />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="bids-pos" element={<BidsAndPOs />} />
              <Route path="leads" element={<LeadResponse />} />
              <Route path="logistics" element={<Logistics />} />
              <Route path="finance/*" element={<FinanceHub />} />
              <Route path="verification" element={<SupplierKYC />} />
              <Route path="settings" element={<SupplierSettings />} />
              <Route path="profile" element={<SupplierProfile />} />
              <Route path="*" element={<Navigate to="/supplier/dashboard" replace />} />
            </Routes>
          </SupplierShell>
        } />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login/restaurant" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
