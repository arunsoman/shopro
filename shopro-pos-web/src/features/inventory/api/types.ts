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
    | 'PARTIALLY_RECEIVED'
    | 'RECEIVED'
    | 'DISCREPANCY_REVIEW'
    | 'PARTIALLY_FULFILLED'
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

export type RfqStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface RFQ {
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

export interface VendorBidRequest {
    supplierId: string;
    unitPrice: number;
    quantityAvailable: number;
    deliveryDate: string;
    paymentTerms?: string;
    notes?: string;
}
