# Menu Engineering: Implemented vs Frontend Usage Report

## Executive Summary

This report identifies **all backend features** that have been fully implemented but are **NOT currently called by the frontend**. These represent potential enhancements or features that can be exposed to users.

---

## Frontend API Usage (What's Being Called)

| Frontend Function | Endpoint Called |
|-------------------|-----------------|
| `getAnalyses` | `GET /periods` |
| `getAnalysis` | `GET /periods/{id}` |
| `getAnalysisResults` | `GET /analyses/{id}/results` |
| `getExecutiveSummary` | `GET /analyses/{id}/executive-summary` |
| `getPeriodSummary` | `GET /analyses/{id}/period-detail` |
| `createAnalysis` | `POST /periods` |
| `runAnalysis` | `POST /analyses/{id}/run` |
| `deleteAnalysis` | `DELETE /periods/{id}` |
| `updateAnalysisPeriod` | `PATCH /periods/{id}` |
| `finalisePeriod` | `POST /periods/{id}/finalise` |
| `getLiveSales` | `GET /engineering/live` |
| `getPeriodCategories` | `GET /analyses/{id}/categories` |
| `getComparison` | `GET /analyses/compare` |
| `runWhatIf` | `POST /analyses/{id}/what-if` |
| `applyWhatIf` | `POST /analyses/{id}/apply-what-if` |
| `getRecommendations` | `GET /analyses/{id}/recommendations` |
| `getRecommendationsByType` | `GET /analyses/{id}/recommendations/by-type/{type}` |
| `getRecommendationsByPriority` | `GET /analyses/{id}/recommendations/by-priority/{priority}` |
| `getRecommendationsByItem` | `GET /analyses/{id}/recommendations/item/{menuItemId}` |
| `updateRecommendationStatus` | `PATCH /analyses/{id}/recommendations/{uuid}/status` |
| `updateRecommendationAssignedTo` | `PATCH /analyses/{id}/recommendations/{uuid}/assigned-to` |
| `updateRecommendationDueDate` | `PATCH /analyses/{id}/recommendations/{uuid}/due-date` |
| `createRecommendation` | `POST /analyses/{id}/recommendations` |
| `generateRecommendations` | `POST /analyses/{id}/recommendations/generate` |
| `updateRecommendation` | `PATCH /analyses/{id}/recommendations/{uuid}` |
| `deleteRecommendation` | `DELETE /analyses/{id}/recommendations/{uuid}` |
| `getMatrixVisualization` | `GET /analyses/{id}/matrix` |
| `getWorkflowStats` | `GET /analyses/{id}/workflow-stats` |
| `getDashboard` | `GET /engineering/dashboard` |
| `getTopPerformers` | `GET /analyses/{id}/top-performers` |
| `getOpportunityItems` | `GET /analyses/{id}/opportunity-items` |
| `getItemMetrics` | `GET /engineering/items/{itemId}/metrics` |

---

## Backend Features NOT Used by Frontend

### Category 1: Advanced Analytics (High Value)

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `GET /periods/{id}/analysis/food-cost-comparison` | Theoretical vs Actual Food Cost | Cost control dashboard |
| `GET /periods/{id}/analysis/price-elasticity` | Price elasticity recommendations | Pricing optimization UI |
| `GET /periods/{id}/analysis/market-basket` | Item co-occurrence analysis | Bundle/ upsell recommendations |
| `GET /periods/{id}/analysis/server-performance` | Server performance correlation | Staff performance dashboard |
| `GET /periods/{id}/analysis/demand-forecast` | Demand forecasting | Inventory planning |

**Recommendation**: Add new screens for:
- Cost Control Dashboard
- Pricing Optimization Panel
- Bundle Recommendations
- Staff Performance Insights
- Inventory Forecasting

---

### Category 2: Export & Integration

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `GET /periods/{id}/export` | Full data export | Download button |
| `GET /export/data?format=json` | JSON export | API consumption |
| `GET /export/data?format=csv` | CSV export | Excel download |
| `GET /export/quick` | Quick export URLs | Export modal |

**Recommendation**: 
- Connect "Export" button in ResultsTable
- Add CSV/Excel download options

---

### Category 3: Menu Design Recommendations

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `GET /periods/{id}/recommendations/menu-design` | Menu design specific recs | Menu engineering UI |
| `POST /periods/{id}/recommendations/menu-design/generate` | Generate menu design recs | Auto-generate |

**Recommendation**: 
- Add "Menu Design" tab in recommendations panel
- Create menu optimization wizard

---

### Category 4: Classification-Based Recommendations

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `GET /recommendations/classification/{classification}` | Get by WINNER/WORKHORSE/OPPORTUNITY/LOSER | Filter panel |
| `GET /recommendations/priority/{priority}` | Get by HIGH/MEDIUM/LOW | Priority view |
| `GET /recommendations/status/{status}` | Get by PENDING/IN_PROGRESS/COMPLETED | Workflow view |
| `GET /recommendations/overdue` | Get overdue recommendations | Alerts |

**Recommendation**:
- Add classification filter in recommendations list
- Create "Overdue" alerts widget
- Add priority-based sorting

---

### Category 5: Recommendation Actions

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `POST /recommendations/{id}/submit` | Submit for approval | Workflow |
| `POST /recommendations/{id}/approve` | Approve recommendation | Workflow |
| `POST /recommendations/{id}/reject` | Reject recommendation | Workflow |
| `POST /recommendations/{id}/assign` | Assign to team member | Assignment |
| `POST /recommendations/{id}/comment` | Add comment thread | Collaboration |

**Recommendation**:
- Add approval workflow buttons
- Create comment/collaboration panel
- Add assignment dropdown

---

### Category 6: Reviews & Reminders

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `GET /reviews/quarterly` | Quarterly review schedule | Calendar view |
| `GET /reviews/reminders` | Upcoming review reminders | Notification center |

**Recommendation**:
- Add review calendar
- Create reminder notifications

---

### Category 7: Integration Endpoints

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `GET /integrations/inventory-status` | Inventory sync status | Integration dashboard |
| `GET /integrations/recipe-status` | Recipe sync status | Integration dashboard |
| `GET /integrations/notifications` | Integration notifications | Notification center |
| `POST /webhooks/analysis-completed` | Webhook for analysis completion | Automation |
| `POST /webhooks/classification-changed` | Webhook for classification changes | Automation |

**Recommendation**:
- Add integration settings page
- Create webhook configuration UI

---

### Category 8: Simulation

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `POST /simulate/orders` | Generate test orders | Data seeding |
| `POST /periods/{id}/simulate` | Period simulation | Scenario planning |

**Recommendation**:
- Add "Generate Test Data" button for demo
- Create scenario planning tool

---

### Category 9: Analysis Variations

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `POST /analyze` | Run ad-hoc analysis | Quick analysis |
| `POST /analyze/by-category` | Category-specific analysis | Category deep-dive |
| `GET /periods/compare` | Compare multiple periods | Comparison tool |

**Recommendation**:
- Add "Quick Analysis" button
- Create category filter
- Enhance comparison UI

---

### Category 10: Settings & Configuration

| Endpoint | Description | Potential Use |
|----------|-------------|---------------|
| `GET /settings` | Get all settings | Settings page |
| (various settings endpoints) | Thresholds, preferences | Configuration |

**Recommendation**:
- Build Settings page
- Add threshold configuration UI

---

## Summary: Features Not Used

| Category | Count |
|----------|-------|
| Advanced Analytics | 5 |
| Export & Integration | 4 |
| Menu Design Recommendations | 2 |
| Classification-Based Recommendations | 4 |
| Recommendation Actions | 6 |
| Reviews & Reminders | 2 |
| Integration Endpoints | 5 |
| Simulation | 2 |
| Analysis Variations | 3 |
| Settings | 1 |

**Total Unused Backend Features: 34+**

---

## Recommended Next Steps

### High Priority (Quick Wins)
1. **Export Features** - Connect to existing Export button
2. **Price Elasticity** - Add pricing optimization screen
3. **Market Basket** - Add bundle recommendations
4. **Overdue Alerts** - Add notification widget

### Medium Priority (Value Add)
5. **Server Performance** - Staff dashboard
6. **Demand Forecast** - Inventory planning
7. **Approval Workflow** - Full recommendation lifecycle
8. **Comments/Collaboration** - Team features

### Lower Priority (Enhancements)
9. **Integration Settings** - Webhook configuration
10. **Quarterly Reviews** - Calendar view
11. **Menu Design** - Specialized recommendations
12. **Settings Page** - Full configuration UI

---

*Generated: 2026-04-17*
*Backend: MenuEngineeringController + MenuEngineeringPeriodService*
*Frontend: menuEngineering.api.ts*
