export interface Ingredient {
    id: string;
    name: string;
    unitOfMeasure: string;
    costPerUnit: number;
    yieldPct: number;
    effectiveCostPerUnit: number;
    currentStock: number;
    parLevel: number;
    reorderPoint: number;
    safetyLevel?: number;
    criticalLevel?: number;
    maxStockLevel?: number;
    autoReplenish?: boolean;
    allergens?: string[];
    supplierId?: string;
    supplierName?: string;
    activeOrderId?: string;
    activeOrderType?: 'PO' | 'RFQ';
    activeOrderStatus?: string;
}

export interface CreateIngredientRequest {
    name: string;
    unitOfMeasure: string;
    costPerUnit: number;
    yieldPct: number;
    parLevel: number;
    reorderPoint: number;
    supplierId?: string;
}

export interface UpdateIngredientRequest {
    name?: string;
    unitOfMeasure?: string;
    costPerUnit?: number;
    yieldPct?: number;
    parLevel?: number;
    reorderPoint?: number;
    safetyLevel?: number;
    criticalLevel?: number;
    maxStockLevel?: number;
    autoReplenish?: boolean;
    allergens?: string[];
    supplierId?: string;
}

export interface SubRecipe {
    id: string;
    name: string;
    yieldQuantity: number;
    unitOfMeasure: string;
    costPerUnit: number;
}

export interface Recipe {
    id: string;
    targetId: string; // MenuItem or SubRecipe ID
    recipeVersion: number;
    totalFoodCost: number;
    ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
    ingredientId?: string;
    subRecipeId?: string;
    ingredientName?: string;
    quantity: number;
    unitOfMeasure?: string;
    cost?: number; // effectiveCost or subRecipe cost
}

export interface UpdateRecipeRequest {
    ingredients: {
        ingredientId?: string;
        subRecipeId?: string;
        quantity: number;
    }[];
}

export type WasteReason = 'SPOILAGE' | 'DROPPED_PLATE' | 'PREP_ERROR' | 'EXPIRED' | 'OTHER';

export interface LogWasteRequest {
    orderItemId?: string;
    ingredientId?: string;
    reason: WasteReason;
    quantity: number;
    notes?: string;
    loggedById: string;
    authorizedById?: string;
}

export type PurchaseOrderStatus =
    | 'DRAFT'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'SENT'
    | 'ACKNOWLEDGED'
    | 'COUNTER_OFFERED'
    | 'SHIPPED'
    | 'PARTIALLY_RECEIVED'
    | 'RECEIVED'
    | 'DISCREPANCY_REVIEW'
    | 'PARTIALLY_FULFILLED'
    | 'GRN_FLAGGED'
    | 'INVOICE_MATCHED'
    | 'PAID'
    | 'CLOSED'
    | 'CANCELLED';

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    status: PurchaseOrderStatus;
    totalValue: number;
    expectedDeliveryDate?: string;
    createdAt: string;
    items: PurchaseOrderLine[];
    trackingNumber?: string;
    invoiceFileId?: string;
    deliveryNoteRef?: string;
    shippedAt?: string;
    acknowledgedAt?: string;
    counterOfferPrice?: number;
    counterOfferQty?: number;
    counterOfferDate?: string;
    counterOfferNotes?: string;
}

export interface POStatusHistory {
    id: string;
    poId: string;
    fromStatus?: PurchaseOrderStatus;
    toStatus: PurchaseOrderStatus;
    actorId: string;
    actorName: string;
    reason?: string;
    createdAt: string;
}

export interface SupplierPolicy {
    supplierId: string;
    autoAcknowledge: boolean;
    counterOfferAllowed: boolean;
    paymentTerms: string;
    qtyTolerance: number;
    priceTolerance: number;
}

export interface CounterOfferRequest {
    proposedPrice: number;
    proposedQuantity: number;
    reason: string;
}

export interface ShipOrderRequest {
    trackingNumber: string;
    deliveryNoteRef: string;
    invoiceFileId: string;
}

export interface CreatePurchaseOrderRequest {
    supplierId: string;
    expectedDeliveryDate: string;
    items: {
        ingredientId: string;
        orderedQty: number;
        unitCost: number;
    }[];
}

export interface PurchaseOrderLine {
    id: string;
    ingredientId: string;
    ingredientName: string;
    orderedQty: number;
    unitCost: number;
}

export interface BatchRecord {
    id: string;
    subRecipeId: string;
    subRecipeName: string;
    producedQty: number;
    remainingQty: number;
    status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED';
    producedAt: string;
    expiryAt?: string;
    notes?: string;
}

export interface TvaReportRow {
    ingredientId: string;
    ingredientName: string;
    unitOfMeasure: string;
    openingStock: number;
    purchases: number;
    theoreticalUsage: number;
    theoreticalClosingStock: number;
    actualClosingStock: number;
    variance: number;
    variancePercentage: number;
    isShrinkageAlert: boolean;
}

export interface Supplier {
    id: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    leadTimeDays: number;
    vendorRating: number;
}

export interface CreateSupplierRequest {
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    leadTimeDays: number;
}

export interface SupplierCatalogImportRequest {
    items: {
        productName: string;
        vendorSku: string;
        unitPrice: number;
        mappedIngredientId: string;
    }[];
}

export interface PriceComparison {
    ingredientId: string;
    ingredientName: string;
    prices: {
        supplierId: string;
        supplierName: string;
        price: number;
        vendorSku?: string;
        leadTime: number;
        vendorRating: number;
        isLowest: boolean;
    }[];
}

export type RfqStatus = 'OPEN' | 'CLOSED' | 'AWARDED' | 'FAILED' | 'CANCELLED';

export interface RFQ {
    id: string;
    ingredientId: string;
    ingredientName: string;
    requiredQty: number;
    status: RfqStatus;
    desiredDeliveryDate: string;
    bidDeadline: string;
}

export interface RFQResponse {
    id: string;
    ingredientId: string;
    ingredientName: string;
    requiredQty: number;
    status: RfqStatus;
    desiredDeliveryDate: string;
    bidDeadline: string;
}

export interface CreateRFQRequest {
    ingredientId: string;
    requiredQty: number;
    desiredDeliveryDate: string;
}

export interface VendorBid {
    id: string;
    rfqId: string;
    supplierId: string;
    supplierName: string;
    unitPrice: number;
    quantityAvailable: number;
    deliveryDate: string;
    paymentTerms?: string;
    notes?: string;
    status: 'SUBMITTED' | 'WON' | 'LOST' | 'REJECTED' | 'OVER_CEILING';
    createdAt: string;
}

export interface VendorBidRequest {
    supplierId: string;
    unitPrice: number;
    quantityAvailable: number;
    deliveryDate: string;
    paymentTerms?: string;
    notes?: string;
}

export type SupplierRole = 'SUPPLIER_ADMIN' | 'SUPPLIER_BIDDER' | 'SUPPLIER_PLANNER';

export interface SupplierUser {
    id: string;
    supplierId: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: SupplierRole;
    active: boolean;
}

export interface InviteSupplierUserRequest {
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: SupplierRole;
}

export type PriceProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface PriceProposal {
    id: string;
    supplierId: string;
    supplierName: string;
    ingredientId: string;
    ingredientName: string;
    unitOfMeasure: string;
    proposedPrice: number;
    currentPrice: number;
    notes?: string;
    status: PriceProposalStatus;
    createdAt: string;
    generatedPoId?: string;
    generatedPoStatus?: string;
}

export interface ReviewProposalRequest {
    status: 'ACCEPTED' | 'REJECTED';
    reason?: string;
    staffId: string;
}

export interface ReceiveGoodsRequest {
    receiverId: string;
    receivedQuantities: Record<string, number>;
    deliveryNoteReference?: string;
    notes?: string;
}

export interface MatchInvoiceRequest {
    invoiceNumber: string;
    invoicedQuantities: Record<string, number>;
    invoicedPrices: Record<string, number>;
    totalAmount: number;
    taxAmount: number;
}
