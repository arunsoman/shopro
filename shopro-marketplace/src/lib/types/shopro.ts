export type UUID = string;

export type ShoproRole =
  | "SUPER_ADMIN" | "OPS_MANAGER" | "PROCUREMENT_OFFICER"
  | "FINANCE_OFFICER" | "SUPPLIER_RELATIONS" | "SUPPORT_AGENT" | "AUDITOR";

export type POStatus =
  | "DRAFT" | "RAISED" | "CLARIFICATION_REQUESTED" | "ACCEPTED"
  | "REJECTED" | "SPLITTING" | "SPLIT_COMPLETE" | "IN_FULFILLMENT"
  | "PARTIALLY_DELIVERED" | "DELIVERED" | "CLOSED";

export type SubPOStatus =
  | "CREATED" | "DISPATCHED_TO_SUPPLIER" | "ACKNOWLEDGED"
  | "PREPARING" | "DISPATCHED" | "DELIVERED" | "PAID";

export type BidStatus      = "OPEN" | "CLOSED" | "AWARDED" | "CANCELLED";
export type AssignmentMode = "DIRECT" | "BID";
export type VettingStatus  = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "CONDITIONAL" | "REJECTED" | "SUSPENDED";
export type PayoutStatus   = "PENDING_DELIVERY" | "IN_QUEUE" | "INITIATED" | "APPROVED" | "PAID" | "HELD" | "FAILED";
export type TriggerType    = "STOCK_THRESHOLD" | "SCHEDULED" | "REORDER_RULE";
export type AutoPOStatus   = "PENDING" | "EVENT_PUBLISHED" | "PO_CREATED" | "PO_SKIPPED" | "FAILED" | "REQUIRES_REVIEW";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface OrderLineItem {
  productId: UUID;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: UUID;
  restaurantId: UUID;
  restaurantName: string;
  status: POStatus;
  lineItems: OrderLineItem[];
  deliveryAddress: Address;
  requiredDeliveryDate: string;
  specialInstructions?: string;
  totalValue: number;
  currency: string;
  source: "MANUAL" | "AUTO";
  createdAt: string;
  acceptedAt?: string;
  closedAt?: string;
}

export interface CatalogProduct {
  id: UUID;
  name: string;
  category: string;
  unit: string;
  basePrice: number;
  description?: string;
  isAvailable: boolean;
  isSeasonal: boolean;
  imageUrl?: string;
  tags: string[];
}

export interface CartItem {
  productId: UUID;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface Notification {
  id: UUID;
  type: "order" | "payment" | "bid" | "shipment" | "system" | "document";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}
