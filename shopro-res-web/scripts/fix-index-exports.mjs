import fs from 'fs';
import path from 'path';

const APP_ROOT = 'shopro-res-web/src/features';

const features = {
    'auth': ['LoginPage', 'AccessDeniedPage', 'SupplierLoginPage', 'ProtectedRoute', 'SupplierProtectedRoute'],
    'dashboard': ['DashboardPage'],
    'floor': ['FloorPlanPage', 'LayoutEditorPage', 'SessionDetailPage', 'GuestAnalyticsPage'],
    'menu': ['MenuDashboard', 'CategoriesPage', 'MenuItemsPage', 'ModifiersPage', 'MenuOverviewPage', 'EngineeringHub', 'RecipeMasterPage', 'RecipeEditorPage', 'MenuEngineeringPage'],
    'inventory': ['InventoryLayout', 'InventoryDashboard', 'InventoryHub', 'IngredientMasterPage', 'CountEntryPage', 'IngredientDetail', 'RecipesPage', 'SupplierManagementPage', 'RFQManagementPage', 'POManagementPage', 'GoodsReceivingPage', 'ThreeWayMatchPanel', 'AIThreeWayMatchPage', 'VendorRFQPage', 'DailyPerishablesPanel', 'SupplierDashboard', 'SupplierRfqList', 'SupplierInventoryView', 'SupplierPOFulfillmentPage', 'SupplierPOListPage', 'ExpiryMonitor', 'WasteDonationLog', 'SupplierDetailPage', 'ShelfLifeRotationDashboard', 'YieldAnalysisPage', 'SKUDetailPage', 'RestockingAlertDashboard'],
    'crm': ['CrmLayout', 'CustomerListPage', 'CustomerDetailPage', 'LoyaltyConfigPage', 'SegmentsPage', 'PromoCodesPage', 'CampaignsPage', 'FeedbackDashboardPage', 'CrmAnalyticsPage', 'CrmSettingsPage'],
    'staff': ['StaffListPage', 'RoleManagementPage'],
    'settings': ['SettingsLayout', 'TablesideSettingsPage', 'KdsSettings'],
    'notifications': ['NotificationAdminLayout', 'NotificationDashboardPage', 'NotificationTypesPage', 'NotificationChannelsPage', 'NotificationRoutingPage', 'NotificationLogsPage', 'NotificationSendPage'],
    'taxes': ['TaxesDashboardPage'],
    'finance': ['FinanceLayout', 'FinanceOverviewPage', 'LedgerPage', 'PnLPage', 'BalanceSheetPage', 'AccountsPage'],
    'engineering': ['CostingHub'],
    'purchasing': ['PurchasingHub', 'InvoiceLogPage', 'InvoiceEntryPage']
};

Object.entries(features).forEach(([feature, components]) => {
    const featureDir = path.join(APP_ROOT, feature);
    if (!fs.existsSync(featureDir)) {
        fs.mkdirSync(featureDir, { recursive: true });
    }

    const indexFile = path.join(featureDir, 'index.ts');
    
    // Generate exports for each component
    // Note: Some might be in pages/, some in components/, some in layouts/
    // My stub generator put most in pages/ or layouts/ or components/
    // I'll check common paths
    
    const exportLines = components.map(comp => {
        // Try logic to find where the file actually is
        const pathsToTry = [
            `./pages/${comp}`,
            `./layouts/${comp}`,
            `./components/${comp}`,
            `./components/kds/${comp}`,
            `./${comp}`
        ];

        for (const p of pathsToTry) {
            const fullLocalPath = path.join(featureDir, p + '.tsx');
            if (fs.existsSync(fullLocalPath)) {
                return `export * from '${p}';`;
            }
        }
        return `// export * from './${comp}'; // Not found`;
    });

    fs.writeFileSync(indexFile, exportLines.filter(line => !line.startsWith('//')).join('\n') + '\n');
    console.log(`Generated index.ts for: ${feature}`);
});
