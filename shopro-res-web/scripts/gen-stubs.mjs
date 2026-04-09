import fs from 'fs';
import path from 'path';

const APP_ROOT = 'shopro-res-web/src';

const stubs = [
    { path: 'features/auth/pages/AccessDeniedPage.tsx', name: 'AccessDeniedPage' },
    { path: 'features/auth/pages/SupplierLoginPage.tsx', name: 'SupplierLoginPage' },
    { path: 'features/floor/pages/LayoutEditorPage.tsx', name: 'LayoutEditorPage' },
    { path: 'features/menu/pages/MenuDashboard.tsx', name: 'MenuDashboard' },
    { path: 'features/menu/pages/CategoriesPage.tsx', name: 'CategoriesPage' },
    { path: 'features/menu/pages/MenuItemsPage.tsx', name: 'MenuItemsPage' },
    { path: 'features/menu/pages/ModifiersPage.tsx', name: 'ModifiersPage' },
    { path: 'features/menu/pages/MenuOverviewPage.tsx', name: 'MenuOverviewPage' },
    { path: 'features/inventory/layouts/InventoryLayout.tsx', name: 'InventoryLayout' },
    { path: 'features/inventory/pages/InventoryDashboard.tsx', name: 'InventoryDashboard' },
    { path: 'features/inventory/pages/RecipesPage.tsx', name: 'RecipesPage' },
    { path: 'features/inventory/pages/SupplierManagementPage.tsx', name: 'SupplierManagementPage' },
    { path: 'features/inventory/pages/RFQManagementPage.tsx', name: 'RFQManagementPage' },
    { path: 'features/inventory/pages/POManagementPage.tsx', name: 'POManagementPage' },
    { path: 'features/inventory/pages/GoodsReceivingPage.tsx', name: 'GoodsReceivingPage' },
    { path: 'features/inventory/pages/ThreeWayMatchPanel.tsx', name: 'ThreeWayMatchPanel' },
    { path: 'features/inventory/pages/AIThreeWayMatchPage.tsx', name: 'AIThreeWayMatchPage' },
    { path: 'features/inventory/pages/VendorRFQPage.tsx', name: 'VendorRFQPage' },
    { path: 'features/inventory/pages/DailyPerishablesPanel.tsx', name: 'DailyPerishablesPanel' },
    { path: 'features/crm/layouts/CrmLayout.tsx', name: 'CrmLayout' },
    { path: 'features/crm/pages/CustomerListPage.tsx', name: 'CustomerListPage' },
    { path: 'features/crm/pages/CustomerDetailPage.tsx', name: 'CustomerDetailPage' },
    { path: 'features/crm/pages/LoyaltyConfigPage.tsx', name: 'LoyaltyConfigPage' },
    { path: 'features/crm/pages/SegmentsPage.tsx', name: 'SegmentsPage', isDefault: true },
    { path: 'features/crm/pages/PromoCodesPage.tsx', name: 'PromoCodesPage', isDefault: true },
    { path: 'features/crm/pages/CampaignsPage.tsx', name: 'CampaignsPage' },
    { path: 'features/crm/pages/FeedbackDashboardPage.tsx', name: 'FeedbackDashboardPage', isDefault: true },
    { path: 'features/crm/pages/CrmAnalyticsPage.tsx', name: 'CrmAnalyticsPage' },
    { path: 'features/crm/pages/CrmSettingsPage.tsx', name: 'CrmSettingsPage' },
    { path: 'features/staff/pages/StaffListPage.tsx', name: 'StaffListPage' },
    { path: 'features/staff/pages/RoleManagementPage.tsx', name: 'RoleManagementPage' },
    { path: 'features/settings/layouts/SettingsLayout.tsx', name: 'SettingsLayout' },
    { path: 'features/settings/pages/TablesideSettingsPage.tsx', name: 'TablesideSettingsPage' },
    { path: 'features/settings/components/kds/KdsSettings.tsx', name: 'KdsSettings', isDefault: true },
    { path: 'features/notifications/layouts/NotificationAdminLayout.tsx', name: 'NotificationAdminLayout' },
    { path: 'features/notifications/pages/NotificationDashboardPage.tsx', name: 'NotificationDashboardPage' },
    { path: 'features/notifications/pages/NotificationTypesPage.tsx', name: 'NotificationTypesPage' },
    { path: 'features/notifications/pages/NotificationChannelsPage.tsx', name: 'NotificationChannelsPage' },
    { path: 'features/notifications/pages/NotificationRoutingPage.tsx', name: 'NotificationRoutingPage' },
    { path: 'features/notifications/pages/NotificationLogsPage.tsx', name: 'NotificationLogsPage' },
    { path: 'features/notifications/pages/NotificationSendPage.tsx', name: 'NotificationSendPage' },
    { path: 'features/inventory/pages/SupplierDashboard.tsx', name: 'SupplierDashboard' },
    { path: 'features/inventory/pages/SupplierRfqList.tsx', name: 'SupplierRfqList' },
    { path: 'features/inventory/pages/SupplierInventoryView.tsx', name: 'SupplierInventoryView' },
    { path: 'features/inventory/pages/SupplierPOFulfillmentPage.tsx', name: 'SupplierPOFulfillmentPage' },
    { path: 'features/inventory/pages/SupplierPOListPage.tsx', name: 'SupplierPOListPage' },
    { path: 'features/inventory/components/SupplierProposalsList.tsx', name: 'SupplierProposalsList' },
    { path: 'features/taxes/pages/TaxesDashboardPage.tsx', name: 'TaxesDashboardPage' },
    { path: 'features/inventory/pages/ExpiryMonitor.tsx', name: 'ExpiryMonitor' },
    { path: 'features/inventory/pages/WasteDonationLog.tsx', name: 'WasteDonationLog' },
    { path: 'features/inventory/pages/SupplierDetailPage.tsx', name: 'SupplierDetailPage' },
    { path: 'features/inventory/pages/ShelfLifeRotationDashboard.tsx', name: 'ShelfLifeRotationDashboard' },
    { path: 'features/inventory/pages/YieldAnalysisPage.tsx', name: 'YieldAnalysisPage' },
    { path: 'features/inventory/pages/SKUDetailPage.tsx', name: 'SKUDetailPage' },
    { path: 'features/inventory/pages/RestockingAlertDashboard.tsx', name: 'RestockingAlertDashboard' },
    { path: 'features/finance/layouts/FinanceLayout.tsx', name: 'FinanceLayout' },
    { path: 'features/finance/pages/FinanceOverviewPage.tsx', name: 'FinanceOverviewPage' },
    { path: 'features/finance/pages/LedgerPage.tsx', name: 'LedgerPage' },
    { path: 'features/finance/pages/PnLPage.tsx', name: 'PnLPage' },
    { path: 'features/finance/pages/BalanceSheetPage.tsx', name: 'BalanceSheetPage' },
    { path: 'features/finance/pages/AccountsPage.tsx', name: 'AccountsPage' }
];

stubs.forEach(stub => {
    const fullPath = path.join(APP_ROOT, stub.path);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const content = `import React from 'react';
import { StubPage } from '@/components/shared/StubPage';

${stub.isDefault ? `const ${stub.name} = () => <StubPage title="${stub.name}" />;
export default ${stub.name};` : `export const ${stub.name} = () => <StubPage title="${stub.name}" />;`}
`;

    fs.writeFileSync(fullPath, content);
    console.log(`Generated: ${stub.path}`);
});
