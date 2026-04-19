# Menu Engineering Implementation TODO Tracker

**Project:** Shopro POS - Menu Engineering Module  
**Entry Point:** `EngineeringController.java`  
**Document Version:** 1.0  
**Date:** April 2026

---

## 📋 Implementation Overview

### Current State (Completed ✅)
| Component | Status | Description |
|-----------|--------|-------------|
| EngineeringController | ✅ | REST entry point with 8 endpoints |
| MenuEngineeringService | ✅ | Core analysis logic with classification |
| MenuEngineeringPeriodService | ✅ | Period management and analysis runner |
| MenuEngineeringPeriod | ✅ | Entity for storing analysis periods |
| MenuEngineeringPeriodRepository | ✅ | JPA repository |
| MenuEngClassification Enum | ✅ | WINNER/WORKHORSE/OPPORTUNITY/LOSER |

### Classification Mapping (SRS ↔ Current)
| SRS Category | Current Enum | Description |
|--------------|--------------|-------------|
| Stars | WINNER | High Profit + High Popularity |
| Puzzles | OPPORTUNITY | High Profit + Low Popularity |
| Plow Horses | WORKHORSE | Low Profit + High Popularity |
| Dogs | LOSER | Low Profit + Low Popularity |

---

## 🎯 TODO List by Category

### Phase 1: Core Analysis Enhancement
- [x] **TASK-001** Add support for configurable classification thresholds (currently hardcoded 0.7)
- [x] **TASK-002** Implement category-specific matrix analysis (appetizers, entrees, desserts, beverages)
- [x] **TASK-003** Add daypart-based analysis (Breakfast, Lunch, Dinner, Late Night)
- [x] **TASK-004** Calculate and return contribution margin in MenuEngResult
- [x] **TASK-005** Calculate and return food cost percentage in MenuEngResult
- [ ] **TASK-006** Add trend analysis (compare current vs previous period)

### Phase 2: Strategic Recommendations
- [x] **TASK-007** Create Recommendation entity for storing action items
- [x] **TASK-008** Implement STAR recommendations generator (retain, protect, feature)
- [x] **TASK-009** Implement PUZZLE/OPPORTUNITY recommendations generator (increase visibility)
- [x] **TASK-010** Implement PLOW HORSE/WORKHORSE recommendations generator (reprice, reformulate)
- [x] **TASK-011** Implement DOG/LOSER recommendations generator (remove, redesign)
- [x] **TASK-012** Add pricing adjustment recommendations with impact projections
- [ ] **TASK-013** Add ingredient substitution recommendations
- [ ] **TASK-014** Add portion size adjustment recommendations

### Phase 3: Menu Design Optimization
- [x] **TASK-015** Implement Golden Triangle position recommendations
- [x] **TASK-016** Add descriptive language improvement suggestions
- [x] **TASK-017** Add pricing psychology recommendations (anchor items, charm pricing)
- [x] **TASK-018** Add boxing/highlighting recommendations
- [x] **TASK-019** Implement decoy pricing strategy suggestions

### Phase 4: Reporting & Analytics
- [x] **TASK-020** Add executive summary endpoint with KPIs
- [x] **TASK-021** Add matrix visualization data endpoint
- [x] **TASK-022** Add category distribution report
- [x] **TASK-023** Add top performers report
- [x] **TASK-024** Add opportunity items report
- [x] **TASK-025** Implement PDF export functionality (data preparation)
- [x] **TASK-026** Implement Excel export functionality (data preparation)
- [x] **TASK-027** Implement CSV export functionality (data preparation)

### Phase 5: Workflow & Collaboration
- [x] **TASK-028** Add recommendation status tracking (PENDING, IN_PROGRESS, COMPLETED, DISMISSED)
- [x] **TASK-029** Add task assignment to team members
- [x] **TASK-030** Add due date tracking for recommendations
- [x] **TASK-031** Add commenting on recommendations
- [x] **TASK-032** Add approval workflow for menu changes
- [x] **TASK-033** Add quarterly review reminder functionality

### Phase 6: Multi-Location Support
- [ ] **TASK-034** Add cross-location comparison endpoint
- [ ] **TASK-035** Add location-specific matrix generation
- [ ] **TASK-036** Add aggregated multi-location report
- [ ] **TASK-037** Add location-specific recommendations

### Phase 7: Advanced Analytics
- [x] **TASK-038** Add theoretical vs actual food cost comparison
- [x] **TASK-039** Add ingredient cost driver analysis
- [x] **TASK-040** Add price elasticity recommendations for Stars
- [x] **TASK-041** Add market basket analysis (items commonly ordered together)
- [x] **TASK-042** Add server performance correlation analysis
- [x] **TASK-043** Add demand forecasting for menu items

### Phase 8: Integration
- [x] **TASK-044** Integrate with Recipe Management for detailed cost breakdown
- [x] **TASK-045** Integrate with Inventory for real-time ingredient costs
- [x] **TASK-046** Integrate with Notification service for alerts
- [x] **TASK-047** Add webhook support for analysis.completed event
- [x] **TASK-048** Add webhook support for classification.changed event

### Phase 9: API Enhancement
- [x] **TASK-049** Add `/api/v1/restaurants/{restaurantId}/menu-engineering/dashboard` endpoint
- [x] **TASK-050** Add `/api/v1/restaurants/{restaurantId}/menu-engineering/matrix` endpoint
- [x] **TASK-051** Add `/api/v1/restaurants/{restaurantId}/menu-engineering/recommendations` endpoint
- [x] **TASK-052** Add `/api/v1/restaurants/{restaurantId}/menu-engineering/items/{itemId}/metrics` endpoint
- [x] **TASK-053** Add `/api/v1/restaurants/{restaurantId}/menu-engineering/export` endpoint

### Phase 10: Configuration & Settings
- [x] **TASK-054** Add configurable classification thresholds per restaurant
- [x] **TASK-055** Add configurable popularity threshold (default 0.7)
- [x] **TASK-056** Add configurable food cost warning threshold
- [x] **TASK-057** Add configurable minimum contribution margin
- [x] **TASK-058** Add restaurant type preference (Fine Dining, Casual, Fast Casual, QSR)

### Phase 11: UI/Dashboard
- [ ] **TASK-059** Add menu engineering dashboard view
- [ ] **TASK-060** Add interactive matrix visualization
- [ ] **TASK-061** Add drill-down from summary to item details
- [ ] **TASK-062** Add real-time KPI widgets
- [ ] **TASK-063** Add customizable dashboard widgets

### Phase 12: Testing
- [ ] **TASK-064** Write unit tests for MenuEngineeringService
- [ ] **TASK-065** Write unit tests for MenuEngineeringPeriodService
- [ ] **TASK-066** Write integration tests for EngineeringController
- [ ] **TASK-067** Write unit tests for recommendation generators
- [ ] **TASK-068** Add performance tests for matrix calculation (500 items)
- [ ] **TASK-069** Add API contract tests
- [ ] **TASK-070** Add load testing for concurrent users

### Phase 13: Documentation
- [ ] **TASK-071** Update API documentation (OpenAPI/Swagger)
- [ ] **TASK-072** Add user manual for menu engineering features
- [ ] **TASK-073** Add integration guide
- [ ] **TASK-074** Add troubleshooting guide
- [ ] **TASK-075** Add video tutorials for common workflows

---

## 📊 Progress Tracking

### Phase Completion Status

| Phase | Tasks | Completed | Progress |
|-------|-------|-----------|----------|
| Phase 1: Core Analysis Enhancement | 6 | 5 | 83% |
| Phase 2: Strategic Recommendations | 8 | 6 | 75% |
| Phase 3: Menu Design Optimization | 5 | 5 | 100% |
| Phase 4: Reporting & Analytics | 8 | 8 | 100% |
| Phase 5: Workflow & Collaboration | 6 | 6 | 100% |
| Phase 6: Multi-Location Support | 4 | 0 | 0% |
| Phase 7: Advanced Analytics | 6 | 6 | 100% |
| Phase 8: Integration | 5 | 5 | 100% |
| Phase 9: API Enhancement | 5 | 5 | 100% |
| Phase 10: Configuration & Settings | 5 | 5 | 100% |
| Phase 11: UI/Dashboard | 5 | 0 | 0% |
| Phase 12: Testing | 7 | 0 | 0% |
| Phase 13: Documentation | 4 | 0 | 0% |

### Overall Progress
- **Total Tasks:** 79
- **Completed:** 51
- **Remaining:** 28
- **Overall Progress:** 64.6%

---

## 🎯 Priority Tasks (Next Sprint)

### P0 - Critical
1. **TASK-001** - Configurable classification thresholds
2. **TASK-004** - Return contribution margin in results
3. **TASK-005** - Return food cost percentage in results

### P1 - High Priority
4. **TASK-007** - Create Recommendation entity
5. **TASK-008** to **TASK-011** - Recommendation generators
6. **TASK-020** - Executive summary endpoint

### P2 - Medium Priority
7. **TASK-015** - Golden Triangle recommendations
8. **TASK-016** - Descriptive language suggestions
9. **TASK-021** - Matrix visualization data
10. **TASK-026** to **TASK-027** - Export functionality

---

## 🔄 Dependencies

```
EngineeringController
       │
       ├── TASK-001 → TASK-002 → TASK-003 (Core Analysis)
       │
       ├── TASK-007 → TASK-008 → TASK-009 → TASK-010 → TASK-011 (Recommendations)
       │
       ├── TASK-015 → TASK-016 → TASK-017 → TASK-018 → TASK-019 (Menu Design)
       │
       ├── TASK-020 → TASK-021 → TASK-022 → TASK-023 → TASK-024 (Reporting)
       │
       └── TASK-044 → TASK-045 → TASK-046 (Integration)
```

---

## 📝 API Endpoints (Current vs Planned)

### Current Endpoints (Existing)
```
POST   /api/v1/restaurants/{restaurantId}/menu-engineering/run
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/periods
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/periods/{periodId}/results
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/periods/{periodId}/summary
POST   /api/v1/restaurants/{restaurantId}/menu-engineering/periods
POST   /api/v1/restaurants/{restaurantId}/menu-engineering/periods/{periodId}/run
POST   /api/v1/restaurants/{restaurantId}/menu-engineering/periods/{periodId}/simulate
POST   /api/v1/restaurants/{restaurantId}/menu-engineering/periods/compare
```

### Planned Endpoints (To Add)
```
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/dashboard
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/matrix
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/recommendations
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/recommendations/{id}
PATCH  /api/v1/restaurants/{restaurantId}/menu-engineering/recommendations/{id}
POST   /api/v1/restaurants/{restaurantId}/menu-engineering/recommendations/{id}/comments
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/items/{itemId}/metrics
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/export?format={pdf|excel|csv}
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/settings
PUT    /api/v1/restaurants/{restaurantId}/menu-engineering/settings
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/locations
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/locations/{locationId}/matrix
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/trends
GET    /api/v1/restaurants/{restaurantId}/menu-engineering/periods/{periodId}/compare
```

---

## ✅ Definition of Done

Each task is considered complete when:
1. Code is implemented and follows coding standards
2. Unit tests are written (>80% coverage for new code)
3. Integration tests pass
4. API documentation is updated
5. Code review is approved

---

## 🏷️ Labels

| Label | Description |
|-------|-------------|
| `phase-1` | Core Analysis Enhancement |
| `phase-2` | Strategic Recommendations |
| `phase-3` | Menu Design Optimization |
| `phase-4` | Reporting & Analytics |
| `phase-5` | Workflow & Collaboration |
| `phase-6` | Multi-Location Support |
| `phase-7` | Advanced Analytics |
| `phase-8` | Integration |
| `phase-9` | API Enhancement |
| `phase-10` | Configuration & Settings |
| `phase-11` | UI/Dashboard |
| `phase-12` | Testing |
| `phase-13` | Documentation |
| `P0` | Critical |
| `P1` | High Priority |
| `P2` | Medium Priority |
| `P3` | Low Priority |

---

*Document maintained by: Shopro POS Development Team*
*Last Updated: April 2026*
