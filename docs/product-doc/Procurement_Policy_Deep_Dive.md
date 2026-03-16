# Procurement Policy Configuration — Deep Dive

## 1. Feature Overview
The Procurement Policy Configuration is a critical governance layer in Shopro's supply chain module. It allows restaurant administrators to define granular automation rules and financial tolerances on a per-supplier basis. These policies ensure that the **3-Way Match** process (Purchase Order vs. Goods Receipt vs. Vendor Invoice) is enforced with precision, preventing overpayment and stock discrepancies.

---

## 2. Policy Dimensions

### 2.1 Financial Tolerances (3-Way Match)
These settings determine the "safe zone" for variances before the system triggers a manual audit.

- **Price Variance Tolerance (0% - 20%)**:
    - **Logic**: Calculates the percentage difference between the **PO Unit Price** and the **Invoice Unit Price**.
    - **Enforcement**: If `(InvoicedPrice - POPrice) / POPrice > Tolerance`, the Purchase Order status is automatically shifted to `DISCREPANCY_REVIEW`.
- **Quantity Variance Tolerance (0% - 50%)**:
    - **Logic**: Compares the **Received Quantity (GRN)** against the **Invoiced Quantity**.
    - **Enforcement**: If the vendor invoices for significantly more than what was physically received at the loading dock, the system blocks automated payment processing.

### 2.2 Automation & Interaction Rules
- **Automated Acknowledgment**: When enabled, the system automatically accepts a vendor's acknowledgment of a PO if the promised delivery date and price match the original order exactly.
- **Counter-Offer Permissions**: A security toggle that permits or blocks a vendor's ability to propose alternative pricing or substituted items during the bidding process.
- **Standardized Payment Terms**: Hardcoded or custom terms (e.g., "Net 30", "COD") that are automatically injected into every generated Purchase Order for that supplier.

---

## 3. Technical Implementation

### 3.1 Data Model (`SupplierPolicy`)
The policy is stored in the `supplier_policy` table, linked 1:1 with the `supplier` entity.

| Column | Data Type | Description |
|---|---|---|
| `supplier_id` | UUID (PK) | Foreign key to the Supplier. |
| `auto_acknowledge` | BOOLEAN | Toggle for perfect-match auto-approval. |
| `counter_offer_allowed` | BOOLEAN | RBAC for vendor bid interactions. |
| `payment_terms` | VARCHAR(100) | Injected into PO metadata. |
| `qty_tolerance` | DECIMAL(5,2) | Percentage threshold for receiving. |
| `price_tolerance` | DECIMAL(5,2) | Percentage threshold for invoicing. |

### 3.2 Backend Enforcement (`ReceivingServiceImpl`)
The `processInvoiceAndMatch` method performs the heavy lifting:

```java
// Logic snippet from ReceivingServiceImpl.java
BigDecimal qtyTolerance = policy.getQtyTolerance().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
BigDecimal priceTolerance = policy.getPriceTolerance().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

// ... variance calculations ...

if (priceVarianceRequiresReview || quantityDiscrepancy) {
    stateMachineService.transition(poId, PurchaseOrderStatus.DISCREPANCY_REVIEW, staffId, "Discrepancy detected outside tolerance");
} else {
    stateMachineService.transition(poId, PurchaseOrderStatus.CLOSED, staffId, "3-Way Match Passed");
}
```

---

## 4. UI Implementation
Located in the **Supplier Registry**, the configuration is managed via a premium "Glassmorphism" dialog. It features:
- **Interactive Range Sliders**: For intuitive tolerance setting.
- **Real-time Validation**: Ensures policies are saved and applied to all in-flight orders for that supplier.

---

## 5. Future Roadmap: Global Procurement Policies
While currently per-supplier, the codebase (ref: `BidScoringJob.java`) includes hooks for global weights that will eventually govern:
- **Price Sensitivity**: How much weight the automated awarding algorithm gives to the lowest bid.
- **Reliability Weight**: Impact of a supplier's historical "Vendor Rating" on bid selection.
- **Delivery Speed Weight**: Priority given to faster lead times during automated restocking.
