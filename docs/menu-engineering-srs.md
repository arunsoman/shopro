# Menu Engineering System
# Software Requirements Specification (SRS)

**Document Version:** 1.0  
**Date:** April 2026  
**Project:** Shopro POS - Menu Engineering Module  
**Classification:** Internal Technical Specification

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Interface Requirements](#5-interface-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Business Rules](#7-business-rules)
8. [Appendices](#8-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the requirements for the **Menu Engineering Module** within the Shopro POS system. The purpose of this module is to provide restaurant operators with a comprehensive, data-driven framework for analyzing menu item performance based on profitability and popularity, enabling strategic menu optimization to maximize revenue and profit margins.

This document serves as the authoritative reference for:
- Software developers implementing the menu engineering features
- Quality assurance teams designing test plans
- Product managers prioritizing feature development
- Stakeholders understanding system capabilities

### 1.2 Scope

The Menu Engineering Module is a core component of the Shopro POS system designed to:

1. **Collect and aggregate sales data** from point-of-sale transactions
2. **Calculate key profitability metrics** including contribution margin, food cost percentage, and profit margin for each menu item
3. **Categorize menu items** using the industry-standard Stars/Puzzles/Plow Horses/Dogs matrix
4. **Provide actionable insights** through strategic recommendations for each category
5. **Optimize menu design** through layout suggestions, pricing psychology, and descriptive language recommendations
6. **Enable continuous improvement** through quarterly analysis cycles and trend tracking

The module shall integrate seamlessly with existing Shopro POS components including:
- Sales/Transaction Module
- Inventory Management Module
- Recipe/Recipe Cost Management Module
- Reporting and Analytics Module
- Multi-location Management Module (for chain operations)

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **Contribution Margin (CM)** | The amount of sales revenue left after deducting the variable costs (food cost) of a menu item. Formula: Selling Price - Food Cost |
| **Food Cost Percentage** | The percentage of sales revenue consumed by food ingredients. Formula: (Plate Cost ÷ Menu Price) × 100 |
| **Plate Cost** | The total cost of all ingredients required to produce one serving of a menu item |
| **Sales Mix** | The proportion of total sales represented by each menu item |
| **Popularity Index** | A measure of how frequently a menu item is ordered relative to other items |
| **Menu Engineering Matrix** | A 2×2 classification tool that categorizes menu items by profitability and popularity |
| **Star** | A menu item with high contribution margin AND high popularity |
| **Puzzle** | A menu item with high contribution margin BUT low popularity |
| **Plow Horse** | A menu item with low contribution margin BUT high popularity |
| **Dog** | A menu item with low contribution margin AND low popularity |
| **Golden Triangle** | The optimal menu placement zones where customer eye attention is highest |
| **Daypart** | A specific meal period (e.g., Breakfast, Lunch, Dinner) |
| **LTO** | Limited Time Offer - a temporary menu item or promotion |
| **PMIX** | Product Mix - a report showing sales distribution across menu items |
| **POS** | Point of Sale |
| **COGS** | Cost of Goods Sold |
| **API** | Application Programming Interface |
| **UI/UX** | User Interface / User Experience |

### 1.4 References

1. Menu Engineering: The Science of Designing a Profitable Restaurant - KwickOS
2. What is Menu Engineering? Learn How to Do & Calculate It - Chowbus
3. Menu Engineering: Analyze and Optimize Your Menu - DishCost
4. Menu Engineering: Strategies for Creating a Profitable Restaurant Menu - NetSuite
5. Menu Engineering for Restaurant Profitability - Black Pearl Investments
6. Restaurant Menu Engineering Guide (2026) - RestOps
7. Guide To Recipe & Menu Engineering for Restaurants - Restaurant365
8. Menu Engineering 101: Design a Menu That Increases Sales - MenuStack
9. What is Menu Engineering? The Benefits Explained - Nutritics

### 1.5 Overview

This SRS document is organized as follows:

- **Section 1 (Introduction):** Provides context and scope of the Menu Engineering Module
- **Section 2 (Overall Description):** Describes the product perspective, user characteristics, operating environment, and constraints
- **Section 3 (Functional Requirements):** Details the specific features and capabilities the system must provide
- **Section 4 (Non-Functional Requirements):** Specifies performance, security, usability, and other quality attributes
- **Section 5 (Interface Requirements):** Defines user interfaces, API specifications, and integration points
- **Section 6 (Data Requirements):** Describes data models, storage, and data quality requirements
- **Section 7 (Business Rules):** Documents validation logic and business constraints
- **Section 8 (Appendices):** Provides supplementary information including glossary and analysis models

---

## 2. Overall Description

### 2.1 Product Perspective

The Menu Engineering Module operates as an integrated component within the Shopro POS ecosystem. It receives transactional data from the Sales Module, ingredient cost data from the Inventory Module, and recipe data from the Recipe Management Module. The module synthesizes this data to generate menu engineering analyses and recommendations.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Shopro POS System                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   ┌──────────────────┐   ┌───────────────────┐  │
│  │   Sales/     │──▶│  Menu Engineering │──▶│   Reporting &     │  │
│  │ Transaction  │   │     Module       │   │   Analytics        │  │
│  │   Module     │   │                  │   │    Module          │  │
│  └──────────────┘   └──────────────────┘   └─────────────────────┘  │
│         │                   │                       ▲              │
│         ▼                   │                       │              │
│  ┌──────────────┐   ┌──────────────────┐         │              │
│  │  Inventory   │◀─▶│     Recipe        │─────────┘              │
│  │  Management  │   │   Management      │                        │
│  │   Module     │   │     Module        │                        │
│  └──────────────┘   └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Product Functions

The Menu Engineering Module provides the following core functions:

#### 2.2.1 Data Aggregation and Processing
- **F1.1:** Import sales transaction data from POS system
- **F1.2:** Import recipe costs from Recipe Management Module
- **F1.3:** Import ingredient costs from Inventory Module
- **F1.4:** Aggregate data by configurable time periods (daily, weekly, monthly, quarterly)
- **F1.5:** Filter data by daypart (Breakfast, Lunch, Dinner, Late Night)
- **F1.6:** Filter data by location (for multi-location operations)
- **F1.7:** Exclude anomalous transactions (complimentary items, voids, refunds)

#### 2.2.2 Profitability Analysis
- **F2.1:** Calculate contribution margin for each menu item
- **F2.2:** Calculate food cost percentage for each menu item
- **F2.3:** Calculate profit margin for each menu item
- **F2.4:** Calculate average contribution margin across menu categories
- **F2.5:** Calculate theoretical vs. actual food costs
- **F2.6:** Identify cost drivers by ingredient

#### 2.2.3 Popularity Analysis
- **F2.7:** Calculate sales volume for each menu item
- **F2.8:** Calculate menu item popularity index
- **F2.9:** Calculate category-level popularity distribution
- **F2.10:** Identify trending items (up/down from previous period)
- **F2.11:** Track daypart-specific popularity patterns

#### 2.2.4 Menu Engineering Matrix Classification
- **F3.1:** Classify each menu item into the Stars/Puzzles/Plow Horses/Dogs matrix
- **F3.2:** Use configurable thresholds for classification
- **F3.3:** Support category-specific matrices (separate analysis for appetizers, entrees, desserts)
- **F3.4:** Visualize matrix with interactive charts
- **F3.5:** Generate matrix summary reports

#### 2.2.5 Strategic Recommendations
- **F4.1:** Generate retention recommendations for Stars
- **F4.2:** Generate visibility improvement recommendations for Puzzles
- **F4.3:** Generate margin improvement recommendations for Plow Horses
- **F4.4:** Generate removal/replacement recommendations for Dogs
- **F4.5:** Provide pricing adjustment recommendations with impact projections

#### 2.2.6 Menu Design Optimization
- **F5.1:** Recommend optimal item placement based on Golden Triangle principle
- **F5.2:** Suggest descriptive language improvements for menu items
- **F5.3:** Recommend pricing psychology strategies (anchor items, charm pricing)
- **F5.4:** Generate menu layout mockups
- **F5.5:** Recommend photography placement for high-margin items

#### 2.2.7 Reporting and Visualization
- **F6.1:** Generate comprehensive menu engineering reports
- **F6.2:** Provide interactive dashboards with drill-down capabilities
- **F6.3:** Export reports in PDF, Excel, and CSV formats
- **F6.4:** Schedule automated report generation
- **F6.5:** Compare historical periods (period-over-period analysis)

#### 2.2.8 Workflow Management
- **F7.1:** Create and manage menu engineering analysis cycles
- **F7.2:** Track implementation status of recommendations
- **F7.3:** Assign tasks to team members
- **F7.4:** Set reminders for quarterly reviews

### 2.3 User Classes and Characteristics

The Menu Engineering Module serves multiple user classes with distinct needs:

#### 2.3.1 Restaurant Owner/Operator
- **Characteristics:** Primary decision-maker, focused on profitability, limited technical expertise
- **Needs:** 
  - Quick executive summary of menu performance
  - Clear action items to improve profitability
  - Comparison with industry benchmarks
- **Access Level:** Full read access to all reports and recommendations

#### 2.3.2 Restaurant Manager
- **Characteristics:** Day-to-day operations manager, responsible for implementation
- **Needs:**
  - Detailed category-level analysis
  - Staff training recommendations
  - Inventory and purchasing insights
- **Access Level:** Full read/write access to analysis and recommendations

#### 2.3.3 Chef/Kitchen Manager
- **Characteristics:** Focused on food quality, recipes, and kitchen operations
- **Needs:**
  - Recipe cost analysis
  - Ingredient cost breakdowns
  - Menu item profitability by station
- **Access Level:** Read access to recipe costs and item-level analysis

#### 2.3.4 Corporate/Regional Manager (Multi-location)
- **Characteristics:** Oversees multiple restaurant locations
- **Needs:**
  - Cross-location comparison
  - Standardized menu performance across locations
  - Location-specific recommendations
- **Access Level:** Multi-location aggregated data with drill-down to individual locations

#### 2.3.5 Financial Analyst
- **Characteristics:** Focused on detailed financial data and trends
- **Needs:**
  - Detailed calculations and methodology
  - Historical trend analysis
  - Custom report building
- **Access Level:** Full access to all data and calculation parameters

### 2.4 Operating Environment

#### 2.4.1 Platform Requirements
- **Cloud Deployment:** Primary deployment on cloud infrastructure (AWS/Azure/GCP)
- **Mobile Support:** iOS and Android native applications for dashboard access
- **Web Application:** Responsive web application for comprehensive analysis
- **On-Premise Option:** Optional on-premise deployment for enterprise customers

#### 2.4.2 Integration Requirements
- **Internal Integration:**
  - Shopro POS Sales Module (real-time transaction data)
  - Shopro Inventory Module (ingredient costs)
  - Shopro Recipe Management Module (recipe costs)
  - Shopro Reporting Module (report generation)
  - Shopro Multi-location Module (chain operations)

- **External Integration (Optional):**
  - Third-party accounting systems (QuickBooks, Xero)
  - Supplier ordering systems
  - Loyalty program platforms

#### 2.4.3 Data Retention Requirements
- **Transactional Data:** Minimum 24 months online, 7 years archived
- **Analysis Results:** Permanent retention
- **User Preferences:** Per user, persistent

### 2.5 Design and Implementation Constraints

#### 2.5.1 Technical Constraints
- **Data Latency:** Sales data must be available for analysis within 15 minutes of transaction
- **Calculation Performance:** Matrix calculations must complete within 30 seconds for menus up to 500 items
- **API Response Time:** 95th percentile response time under 2 seconds for standard queries

#### 2.5.2 Regulatory Constraints
- **Data Privacy:** Compliance with GDPR, CCPA, and local data protection regulations
- **Financial Data:** Support for audit trails on all financial calculations

#### 2.5.3 Business Constraints
- **Backward Compatibility:** Changes to calculation methodologies must not invalidate historical comparisons without notification
- **Multi-currency:** Support for multiple currencies in multi-national deployments

### 2.6 User Documentation

The following user documentation shall be provided:

1. **Quick Start Guide:** Getting started with menu engineering analysis
2. **User Manual:** Comprehensive guide to all features and functions
3. **Best Practices Guide:** Industry-standard approaches to menu engineering
4. **API Documentation:** For integrations and custom implementations
5. **Video Tutorials:** Step-by-step video guides for common tasks
6. **Contextual Help:** In-app help and tooltips

### 2.7 Assumptions and Dependencies

#### 2.7.1 Assumptions
- Users have access to accurate and up-to-date recipe costs
- POS system captures item-level transaction data
- Ingredient costs are tracked at the supplier/invoice level
- Users understand basic restaurant economics (food costs, margins)

#### 2.7.2 Dependencies
- **Required Dependencies:**
  - Shopro POS Sales Module
  - Shopro Recipe Management Module
  - Shopro Inventory Module

- **Optional Dependencies:**
  - Shopro Multi-location Module
  - Third-party accounting systems

---

## 3. Functional Requirements

### 3.1 Data Management

#### 3.1.1 Sales Data Import
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DM-001 | The system shall import sales transaction data from the Shopro POS Sales Module | Mandatory |
| FR-DM-002 | The system shall support import of sales data from external CSV/Excel files | Mandatory |
| FR-DM-003 | The system shall support date range filtering for sales data import | Mandatory |
| FR-DM-004 | The system shall support daypart filtering (Breakfast, Lunch, Dinner, Late Night) | Mandatory |
| FR-DM-005 | The system shall support location filtering for multi-location operations | Mandatory |
| FR-DM-006 | The system shall automatically exclude voided, refunded, and complimentary items from analysis | Mandatory |
| FR-DM-007 | The system shall support incremental data synchronization for real-time updates | Mandatory |
| FR-DM-008 | The system shall maintain data integrity checks during import | Mandatory |

#### 3.1.2 Recipe Cost Integration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RC-001 | The system shall import recipe costs from the Shopro Recipe Management Module | Mandatory |
| FR-RC-002 | The system shall automatically recalculate item costs when ingredient prices change | Mandatory |
| FR-RC-003 | The system shall support manual cost overrides with audit trail | Mandatory |
| FR-RC-004 | The system shall calculate theoretical food cost based on recipe standards | Mandatory |
| FR-RC-005 | The system shall provide cost breakdown by ingredient for each menu item | Mandatory |

### 3.2 Profitability Analysis

#### 3.2.1 Contribution Margin Calculation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PA-001 | The system shall calculate contribution margin for each menu item using the formula: CM = Selling Price - Food Cost | Mandatory |
| FR-PA-002 | The system shall calculate contribution margin as a percentage | Mandatory |
| FR-PA-003 | The system shall calculate category-level average contribution margin | Mandatory |
| FR-PA-004 | The system shall calculate overall average contribution margin | Mandatory |
| FR-PA-005 | The system shall rank menu items by contribution margin | Mandatory |
| FR-PA-006 | The system shall identify top 20% contributors to total margin | Mandatory |

#### 3.2.2 Food Cost Analysis
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-FC-001 | The system shall calculate food cost percentage using the formula: FC% = (Plate Cost ÷ Menu Price) × 100 | Mandatory |
| FR-FC-002 | The system shall flag items exceeding configurable food cost threshold | Mandatory |
| FR-FC-003 | The system shall compare theoretical vs. actual food cost | Mandatory |
| FR-FC-004 | The system shall calculate food cost variance by category | Mandatory |
| FR-FC-005 | The system shall provide ingredient-level cost impact analysis | Mandatory |

### 3.3 Popularity Analysis

#### 3.3.1 Sales Volume Metrics
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PO-001 | The system shall calculate unit sales volume for each menu item | Mandatory |
| FR-PO-002 | The system shall calculate menu item popularity as percentage of total sales | Mandatory |
| FR-PO-003 | The system shall calculate average units sold per day/week/month | Mandatory |
| FR-PO-004 | The system shall identify items by popularity quartiles | Mandatory |
| FR-PO-005 | The system shall track popularity trends over time | Mandatory |

#### 3.3.2 Daypart Analysis
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DA-001 | The system shall analyze menu item popularity by daypart | Mandatory |
| FR-DA-002 | The system shall identify items with strong daypart-specific performance | Mandatory |
| FR-DA-003 | The system shall recommend daypart-specific menu optimizations | Mandatory |

### 3.4 Menu Engineering Matrix

#### 3.4.1 Classification Engine
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ME-001 | The system shall classify menu items into four categories: Stars, Puzzles, Plow Horses, Dogs | Mandatory |
| FR-ME-002 | The system shall use average contribution margin as the profit threshold | Mandatory |
| FR-ME-003 | The system shall use configurable popularity threshold (default: 70% of equal distribution) | Mandatory |
| FR-ME-004 | The system shall support category-specific matrices (appetizers, entrees, desserts, beverages) | Mandatory |
| FR-ME-005 | The system shall recalculate classifications when data is refreshed | Mandatory |
| FR-ME-006 | The system shall provide classification change alerts | Mandatory |

#### 3.4.2 Matrix Visualization
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MV-001 | The system shall display menu engineering matrix as a 2×2 scatter plot | Mandatory |
| FR-MV-002 | The system shall color-code items by category | Mandatory |
| FR-MV-003 | The system shall display item details on hover/click | Mandatory |
| FR-MV-004 | The system shall show category distribution percentages | Mandatory |
| FR-MV-005 | The system shall allow filtering by menu category | Mandatory |

### 3.5 Strategic Recommendations

#### 3.5.1 Star Recommendations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SR-001 | The system shall recommend retaining and protecting Stars | Mandatory |
| FR-SR-002 | The system shall recommend optimal placement in Golden Triangle | Mandatory |
| FR-SR-003 | The system shall recommend against discounting Stars | Mandatory |
| FR-SR-004 | The system shall recommend modest price increase opportunities with demand elasticity analysis | Mandatory |
| FR-SR-005 | The system shall recommend using Stars in marketing | Mandatory |

#### 3.5.2 Puzzle Recommendations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PR-001 | The system shall recommend visibility improvements for Puzzles | Mandatory |
| FR-PR-002 | The system shall recommend menu repositioning to Golden Triangle | Mandatory |
| FR-PR-003 | The system shall recommend descriptive language improvements | Mandatory |
| FR-PR-004 | The system shall recommend photography addition | Mandatory |
| FR-PR-005 | The system shall recommend server training scripts | Mandatory |
| FR-PR-006 | The system shall recommend limited-time offer testing | Mandatory |

#### 3.5.3 Plow Horse Recommendations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PH-001 | The system shall recommend price adjustments with volume impact projections | Mandatory |
| FR-PH-002 | The system shall recommend portion size adjustments | Mandatory |
| FR-PH-003 | The system shall recommend ingredient substitutions with cost/quality analysis | Mandatory |
| FR-PH-004 | The system shall recommend bundling with high-margin items | Mandatory |
| FR-PH-005 | The system shall recommend premium upcharge options | Mandatory |
| FR-PH-006 | The system shall recommend moving to less prominent menu positions | Mandatory |

#### 3.5.4 Dog Recommendations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DR-001 | The system shall recommend removal of Dogs with rationale | Mandatory |
| FR-DR-002 | The system shall identify strategic reasons to retain Dogs (dietary, anchor) | Mandatory |
| FR-DR-003 | The system shall recommend recipe redesign opportunities | Mandatory |
| FR-DR-004 | The system shall recommend replacement with new Puzzle candidates | Mandatory |
| FR-DR-005 | The system shall recommend hiding Dogs in less visible positions | Mandatory |

### 3.6 Menu Design Optimization

#### 3.6.1 Layout Recommendations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-LR-001 | The system shall identify optimal placement using Golden Triangle analysis | Mandatory |
| FR-LR-002 | The system shall recommend anchoring with premium items | Mandatory |
| FR-LR-003 | The system shall recommend boxing/highlighting for specific items | Mandatory |
| FR-LR-004 | The system shall provide visual menu mockup suggestions | Mandatory |

#### 3.6.2 Descriptive Language
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DL-001 | The system shall analyze existing menu descriptions | Mandatory |
| FR-DL-002 | The system shall recommend sensory adjectives (texture, temperature, cooking method) | Mandatory |
| FR-DL-003 | The system shall recommend origin/provenance additions | Mandatory |
| FR-DL-004 | The system shall provide example descriptions for improvement | Mandatory |
| FR-DL-005 | The system shall calculate projected impact of description improvements | Mandatory |

#### 3.6.3 Pricing Psychology
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PP-001 | The system shall recommend removing dollar signs | Mandatory |
| FR-PP-002 | The system shall recommend avoiding price columns | Mandatory |
| FR-PP-003 | The system shall recommend charm pricing vs. round numbers based on restaurant type | Mandatory |
| FR-PP-004 | The system shall recommend decoy pricing strategy | Mandatory |
| FR-PP-005 | The system shall provide restaurant-type-specific recommendations | Mandatory |

### 3.7 Reporting and Analytics

#### 3.7.1 Report Generation
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RG-001 | The system shall generate comprehensive menu engineering reports | Mandatory |
| FR-RG-002 | The system shall support report scheduling (daily, weekly, monthly, quarterly) | Mandatory |
| FR-RG-003 | The system shall support PDF export | Mandatory |
| FR-RG-004 | The system shall support Excel export | Mandatory |
| FR-RG-005 | The system shall support CSV export | Mandatory |
| FR-RG-006 | The system shall support custom report templates | Mandatory |

#### 3.7.2 Dashboard
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DB-001 | The system shall provide interactive executive dashboard | Mandatory |
| FR-DB-002 | The system shall allow drill-down from summary to item details | Mandatory |
| FR-DB-003 | The system shall display real-time KPIs | Mandatory |
| FR-DB-004 | The system shall support customizable dashboard widgets | Mandatory |
| FR-DB-005 | The system shall provide alert notifications for significant changes | Mandatory |

#### 3.7.3 Historical Analysis
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-HA-001 | The system shall support period-over-period comparison | Mandatory |
| FR-DB-002 | The system shall track category migration over time | Mandatory |
| FR-DB-003 | The system shall calculate impact of implemented recommendations | Mandatory |
| FR-DB-004 | The system shall identify long-term trends | Mandatory |

### 3.8 Workflow and Collaboration

#### 3.8.1 Analysis Cycles
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AC-001 | The system shall support creation of menu engineering analysis cycles | Mandatory |
| FR-AC-002 | The system shall track implementation status of recommendations | Mandatory |
| FR-AC-003 | The system shall allow assignment of tasks to team members | Mandatory |
| FR-AC-004 | The system shall provide reminder notifications for quarterly reviews | Mandatory |

#### 3.8.2 Collaboration
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CL-001 | The system shall support commenting on recommendations | Mandatory |
| FR-CL-002 | The system shall support sharing reports with team members | Mandatory |
| FR-CL-003 | The system shall support approval workflows for menu changes | Mandatory |

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### 4.1.1 Response Times
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PT-001 | Page load time for dashboard | < 3 seconds |
| NFR-PT-002 | Report generation time (up to 500 items) | < 30 seconds |
| NFR-PT-003 | Matrix calculation time (up to 500 items) | < 30 seconds |
| NFR-PT-004 | API response time (95th percentile) | < 2 seconds |
| NFR-PT-005 | Data refresh latency | < 15 minutes |

#### 4.1.2 Scalability
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SC-001 | Support menu items per location | Up to 1,000 |
| NFR-SC-002 | Support locations per tenant | Up to 500 |
| NFR-SC-003 | Support concurrent users | Up to 100 per location |
| NFR-SC-004 | Transaction data handling | Up to 1M transactions/day |

#### 4.1.3 Availability
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AV-001 | System uptime | 99.9% |
| NFR-AV-002 | Planned maintenance window | < 4 hours/month |
| NFR-AV-003 | Backup frequency | Every 15 minutes |
| NFR-AV-004 | Recovery time objective (RTO) | < 1 hour |
| NFR-AV-005 | Recovery point objective (RPO) | < 15 minutes |

### 4.2 Usability Requirements

#### 4.2.1 User Interface
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-UI-001 | The system shall provide responsive design for desktop, tablet, and mobile | Mandatory |
| NFR-UI-002 | The system shall support all major browsers (Chrome, Firefox, Safari, Edge) | Mandatory |
| NFR-UI-003 | The system shall provide accessible interface (WCAG 2.1 Level AA) | Mandatory |
| NFR-UI-004 | The system shall support light and dark themes | Mandatory |
| NFR-UI-005 | The system shall provide multi-language support | Mandatory |

#### 4.2.2 User Experience
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-UX-001 | New users shall be able to complete basic analysis within 15 minutes | Mandatory |
| NFR-UX-002 | The system shall provide onboarding tutorial for first-time users | Mandatory |
| NFR-UX-003 | The system shall provide contextual help and tooltips | Mandatory |
| NFR-UX-004 | The system shall provide clear error messages and recovery options | Mandatory |
| NFR-UX-005 | The system shall maintain user session state | Mandatory |

### 4.3 Security Requirements

#### 4.3.1 Authentication and Authorization
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-SU-001 | The system shall support role-based access control (RBAC) | Mandatory |
| NFR-SU-002 | The system shall support multi-factor authentication | Mandatory |
| NFR-SU-003 | The system shall support SSO integration (SAML, OAuth) | Mandatory |
| NFR-SU-004 | The system shall enforce password complexity requirements | Mandatory |
| NFR-SU-005 | The system shall support session timeout and re-authentication | Mandatory |

#### 4.3.2 Data Security
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-DS-001 | The system shall encrypt data in transit (TLS 1.2+) | Mandatory |
| NFR-DS-002 | The system shall encrypt data at rest (AES-256) | Mandatory |
| NFR-DS-003 | The system shall support data residency requirements | Mandatory |
| NFR-DS-004 | The system shall implement data masking for sensitive fields | Mandatory |
| NFR-DS-005 | The system shall maintain audit logs of all data access | Mandatory |

#### 4.3.3 Compliance
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-CP-001 | The system shall comply with GDPR requirements | Mandatory |
| NFR-CP-002 | The system shall comply with CCPA requirements | Mandatory |
| NFR-CP-003 | The system shall support data export/deletion for compliance | Mandatory |
| NFR-CP-004 | The system shall maintain PCI DSS compliance for payment data | Mandatory |

### 4.4 Reliability Requirements

#### 4.4.1 Data Integrity
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-DI-001 | The system shall validate data integrity on import | Mandatory |
| NFR-DI-002 | The system shall prevent duplicate data entry | Mandatory |
| NFR-DI-003 | The system shall maintain referential integrity | Mandatory |
| NFR-DI-004 | The system shall implement transaction rollback | Mandatory |

#### 4.4.2 Error Handling
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-EH-001 | The system shall log all errors with stack traces | Mandatory |
| NFR-EH-002 | The system shall provide user-friendly error messages | Mandatory |
| NFR-EH-003 | The system shall implement automatic retry for transient failures | Mandatory |
| NFR-EH-004 | The system shall provide graceful degradation | Mandatory |

### 4.5 Maintainability Requirements

#### 4.5.1 Code Quality
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-CQ-001 | The system shall follow coding standards and style guides | Mandatory |
| NFR-CQ-002 | The system shall maintain code coverage > 80% | Mandatory |
| NFR-CQ-003 | The system shall implement automated unit tests | Mandatory |
| NFR-CQ-004 | The system shall implement automated integration tests | Mandatory |

#### 4.5.2 Deployment
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-DP-001 | The system shall support continuous integration/continuous deployment | Mandatory |
| NFR-DP-002 | The system shall support blue-green deployment | Mandatory |
| NFR-DP-003 | The system shall support canary releases | Mandatory |
| NFR-DP-004 | The system shall support rollback capabilities | Mandatory |

### 4.6 Compatibility Requirements

#### 4.6.1 Integration Compatibility
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-IC-001 | The system shall provide RESTful API | Mandatory |
| NFR-IC-002 | The system shall provide GraphQL API option | Mandatory |
| NFR-IC-003 | The system shall support webhook notifications | Mandatory |
| NFR-IC-004 | The system shall support CSV/Excel import/export | Mandatory |

#### 4.6.2 System Compatibility
| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-SC-001 | The system shall integrate with Shopro POS modules | Mandatory |
| NFR-SC-002 | The system shall integrate with common accounting software | Optional |
| NFR-SC-003 | The system shall integrate with email/notification services | Mandatory |

---

## 5. Interface Requirements

### 5.1 User Interfaces

#### 5.1.1 Dashboard Interface
The main dashboard shall provide:
- Summary cards showing key metrics (Total Revenue, Avg CM, Food Cost %, Top Performers)
- Interactive menu engineering matrix visualization
- Category distribution pie chart
- Trending items line chart
- Recent recommendations panel
- Quick action buttons

#### 5.1.2 Analysis Interface
The analysis interface shall provide:
- Filter controls (date range, daypart, location, category)
- Sortable data table with all menu items
- Inline editing capabilities
- Category assignment controls
- Bulk action support

#### 5.1.3 Reports Interface
The reports interface shall provide:
- Report template selection
- Parameter configuration
- Preview pane
- Export options
- Scheduling controls
- Report history

### 5.2 API Specifications

#### 5.2.1 REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/restaurants/{restaurantId}/menu-engineering/analyses` | GET | List all analyses |
| `/api/v1/restaurants/{restaurantId}/menu-engineering/analyses` | POST | Create new analysis |
| `/api/v1/restaurants/{restaurantId}/menu-engineering/analyses/{id}` | GET | Get analysis details |
| `/api/v1/restaurants/{restaurantId}/menu-engineering/analyses/{id}/matrix` | GET | Get menu engineering matrix |
| `/api/v1/restaurants/{restaurantId}/menu-engineering/analyses/{id}/recommendations` | GET | Get recommendations |
| `/api/v1/restaurants/{restaurantId}/menu-engineering/items/{id}/metrics` | GET | Get item-level metrics |
| `/api/v1/restaurants/{restaurantId}/menu-engineering/reports` | POST | Generate report |
| `/api/v1/restaurants/{restaurantId}/menu-engineering/export` | POST | Export data |

#### 5.2.2 Webhook Events

| Event | Description |
|-------|-------------|
| `analysis.completed` | Triggered when new analysis is completed |
| `classification.changed` | Triggered when item classification changes |
| `recommendation.generated` | Triggered when new recommendations are available |
| `threshold.exceeded` | Triggered when metrics exceed thresholds |

### 5.3 Integration Interfaces

#### 5.3.1 Shopro POS Integration
- **Data Received:**
  - Transaction records (item, quantity, price, timestamp, location)
  - Menu item definitions
  - Modifier and variant information
  
- **Data Provided:**
  - Menu engineering analysis results
  - Recommendations
  - Reports

#### 5.3.2 Inventory Module Integration
- **Data Received:**
  - Ingredient costs
  - Supplier information
  - Purchase order history
  
- **Data Provided:**
  - Ingredient usage forecasts
  - Cost variance reports

#### 5.3.3 Recipe Management Integration
- **Data Received:**
  - Recipe definitions
  - Ingredient quantities
  - Yield information
  
- **Data Provided:**
  - Cost analysis by recipe
  - Profitability recommendations

---

## 6. Data Requirements

### 6.1 Data Models

#### 6.1.1 MenuItem Entity
```
MenuItem {
    id: UUID (PK)
    location_id: UUID (FK)
    name: string
    description: string
    category_id: UUID (FK)
    price: decimal
    is_active: boolean
    created_at: timestamp
    updated_at: timestamp
}
```

#### 6.1.2 RecipeCost Entity
```
RecipeCost {
    id: UUID (PK)
    menu_item_id: UUID (FK)
    ingredient_id: UUID (FK)
    quantity: decimal
    unit_cost: decimal
    total_cost: decimal
    effective_date: date
    created_at: timestamp
}
```

#### 6.1.3 SalesTransaction Entity
```
SalesTransaction {
    id: UUID (PK)
    location_id: UUID (FK)
    item_id: UUID (FK)
    quantity: integer
    unit_price: decimal
    total_amount: decimal
    transaction_date: timestamp
    daypart: enum (BREAKFAST, LUNCH, DINNER, LATE_NIGHT)
    is_voided: boolean
    is_refunded: boolean
    is_complimentary: boolean
}
```

#### 6.1.4 MenuEngineeringAnalysis Entity
```
MenuEngineeringAnalysis {
    id: UUID (PK)
    location_id: UUID (FK)
    analysis_period_start: date
    analysis_period_end: date
    status: enum (PENDING, IN_PROGRESS, COMPLETED, FAILED)
    total_items_analyzed: integer
    average_contribution_margin: decimal
    average_popularity: decimal
    created_by: UUID (FK)
    created_at: timestamp
    completed_at: timestamp
}
```

#### 6.1.5 MenuItemClassification Entity
```
MenuItemClassification {
    id: UUID (PK)
    analysis_id: UUID (FK)
    menu_item_id: UUID (FK)
    contribution_margin: decimal
    food_cost_percentage: decimal
    popularity_index: decimal
    category: enum (STAR, PUZZLE, PLOW_HORSE, DOG)
    previous_category: enum (STAR, PUZZLE, PLOW_HORSE, DOG)
    category_changed_at: timestamp
}
```

#### 6.1.6 Recommendation Entity
```
Recommendation {
    id: UUID (PK)
    analysis_id: UUID (FK)
    menu_item_id: UUID (FK)
    type: enum (RETAIN, REPLATE, REPRICE, RETHINK)
    priority: enum (HIGH, MEDIUM, LOW)
    title: string
    description: text
    estimated_impact: decimal
    status: enum (PENDING, IN_PROGRESS, COMPLETED, DISMISSED)
    assigned_to: UUID (FK)
    due_date: date
    created_at: timestamp
    completed_at: timestamp
}
```

### 6.2 Data Storage Requirements

#### 6.2.1 Transactional Data
- **Database:** PostgreSQL (primary), Redis (cache)
- **Retention:** 24 months online, 7 years archived
- **Backup:** Real-time replication, daily full backups

#### 6.2.2 Analytical Data
- **Database:** PostgreSQL, ClickHouse (for large-scale analytics)
- **Retention:** 7 years online
- **Backup:** Daily incremental backups

#### 6.2.3 Document Storage
- **Storage:** S3-compatible object storage
- **Retention:** Permanent
- **Content:** Reports, exports, attachments

### 6.3 Data Quality Requirements

| Requirement | Description |
|-------------|-------------|
| Completeness | All required fields must be populated |
| Accuracy | Data must reflect actual values within 1% tolerance |
| Consistency | Data must be consistent across related tables |
| Timeliness | Data must be updated within 15 minutes of source transaction |
| Validity | Data must conform to defined formats and ranges |

---

## 7. Business Rules

### 7.1 Classification Rules

#### 7.1.1 Threshold Calculations
| Rule | Formula | Default |
|------|---------|---------|
| Average CM | Sum(CM for all items) / Count(items) | - |
| Popularity Threshold | (100% / Item count) × 0.7 | 70% |
| High Profit | CM ≥ Average CM | - |
| Low Profit | CM < Average CM | - |
| High Popularity | Units sold ≥ Popularity Threshold | - |
| Low Popularity | Units sold < Popularity Threshold | - |

#### 7.1.2 Category Assignment Rules
| Condition | Category |
|-----------|----------|
| CM ≥ Average CM AND Units ≥ Threshold | STAR |
| CM ≥ Average CM AND Units < Threshold | PUZZLE |
| CM < Average CM AND Units ≥ Threshold | PLOW_HORSE |
| CM < Average CM AND Units < Threshold | DOG |

### 7.2 Data Validation Rules

#### 7.2.1 Sales Data
- Transaction quantity must be > 0
- Unit price must be >= 0
- Total amount must equal quantity × unit price
- Transaction date must not be in the future
- Voided/refunded items must be excluded from calculations

#### 7.2.2 Recipe Cost Data
- Ingredient quantity must be > 0
- Unit cost must be >= 0
- Total cost must equal sum of (quantity × unit cost) for all ingredients

#### 7.2.3 Menu Item Data
- Name must not be blank
- Price must be > 0
- Category must be assigned

### 7.3 Business Constraints

| Constraint | Description |
|-----------|-------------|
| Minimum Analysis Period | 7 days |
| Maximum Analysis Period | 12 months |
| Recommended Analysis Frequency | Quarterly |
| Minimum Items for Matrix | 5 items |
| Maximum Items per Category Display | 100 items |

### 7.4 Pricing Rules

| Rule | Application |
|------|-------------|
| Price Range Validation | Price must be within ±50% of category average |
| Price Change Notification | Alert when price changes > 10% |
| Cost-Based Pricing Warning | Alert when food cost > 40% |
| Margin Floor | Minimum contribution margin: $2.00 |

---

## 8. Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Anchor Item** | A high-priced menu item placed to make other items appear more reasonably priced |
| **Average Check** | Total revenue divided by number of covers (customers) |
| **Blind Matrix** | Menu engineering matrix without item labels |
| **Category Migration** | Movement of items between matrix quadrants over time |
| **Charm Pricing** | Pricing strategy using .95 or .99 endings |
| **Contribution Margin** | Revenue minus variable costs |
| **Cover** | One customer or one meal (dinner/breakfast/lunch) |
| **Daypart** | A specific meal period |
| **Decoy Pricing** | Placing an overpriced item to make a target item seem like a better value |
| **Food Cost** | Cost of ingredients used to prepare a dish |
| **Golden Triangle** | The three menu positions receiving highest eye attention |
| **Menu Engineering** | Systematic analysis of menu items for profitability and popularity |
| **Menu Mix** | The selection of items offered on a menu |
| **Par Level** | The minimum quantity of an item to have on hand |
| **Plate Cost** | Total ingredient cost for one serving |
| **PMIX** | Product Mix - sales distribution across menu items |
| **Price Elasticity** | Measure of how demand changes with price changes |
| **Prime Cost** | Food cost + Labor cost |
| **Product Mix** | See PMIX |
| **Theoretical Food Cost** | Expected food cost based on recipe standards |
| **Yields** | Amount of usable product obtained from an ingredient |

### Appendix B: Calculation Formulas

#### B.1 Contribution Margin
```
CM = Selling Price - Food Cost (Plate Cost)
```

#### B.2 Food Cost Percentage
```
FC% = (Plate Cost / Selling Price) × 100
```

#### B.3 Menu Item Popularity
```
Popularity % = (Item Units Sold / Total Units Sold) × 100
```

#### B.4 Popularity Threshold
```
Threshold = (100% / Number of Items) × 0.7
```

#### B.5 Average Contribution Margin
```
Avg CM = Sum(CM for all items) / Number of items
```

#### B.6 Profit Impact Calculation
```
Annual Impact = (New CM - Old CM) × Average Daily Units × 365
```

### Appendix C: Menu Engineering Matrix Template

| | **Low Popularity** | **High Popularity** |
|---|---|---|
| **High Profit** | 🧩 Puzzles | ⭐ Stars |
| **Low Profit** | 🐶 Dogs | 🐴 Plow Horses |

### Appendix D: Implementation Checklist

#### D.1 Data Setup
- [ ] Configure POS integration
- [ ] Import menu items
- [ ] Set up recipe costs
- [ ] Configure ingredient costs
- [ ] Define dayparts
- [ ] Set up locations (if multi-location)

#### D.2 Analysis Configuration
- [ ] Set analysis period defaults
- [ ] Configure classification thresholds
- [ ] Set up alert thresholds
- [ ] Define user roles and permissions

#### D.3 Initial Analysis
- [ ] Run first analysis
- [ ] Review classification results
- [ ] Validate recommendations
- [ ] Implement high-priority changes

#### D.4 Ongoing Operations
- [ ] Schedule quarterly reviews
- [ ] Set up automated reports
- [ ] Configure notifications
- [ ] Train staff on recommendations

### Appendix E: Sample Reports

#### E.1 Executive Summary Report
```
MENU ENGINEERING EXECUTIVE SUMMARY
==================================
Location: [Location Name]
Period: [Start Date] - [End Date]

KEY METRICS
-----------
Total Menu Items Analyzed: [XXX]
Average Contribution Margin: $[XX.XX]
Average Food Cost: [XX.X]%
Average Popularity: [XX.X]%

CATEGORY DISTRIBUTION
--------------------
Stars: [XX] items ([XX]%)
Puzzles: [XX] items ([XX]%)
Plow Horses: [XX] items ([XX]%)
Dogs: [XX] items ([XX]%)

TOP PERFORMERS
--------------
[Item 1] - $[XX.XX] CM, [XXX] units
[Item 2] - $[XX.XX] CM, [XXX] units
[Item 3] - $[XX.XX] CM, [XXX] units

OPPORTUNITY ITEMS
-----------------
[Item] - $[XX.XX] CM potential (Puzzle)
Recommendation: [Description]

IMMEDIATE ACTIONS
-----------------
1. [Priority Recommendation]
2. [Priority Recommendation]
3. [Priority Recommendation]

ESTIMATED IMPACT
----------------
Implementation of all recommendations could increase profit by $[X,XXX] per [month/year]
```

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | Shopro POS Team | Initial release |

---

*End of Document*
