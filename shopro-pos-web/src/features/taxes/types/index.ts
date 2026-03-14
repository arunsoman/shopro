export interface Country {
  id: string;
  isoCode: string;
  name: string;
  currency: string;
  taxModel: 'VAT' | 'GST' | 'SALES_TAX' | 'VAT_INCLUSIVE';
  taxIncluded: boolean;
}

export interface TaxRule {
  id: string;
  ruleCode: string;
  ruleName: string;
  defaultRate: number;
  appliesToDineIn: boolean;
  appliesToTakeaway: boolean;
  appliesToHot?: boolean;
  appliesToCold?: boolean;
  isCascading: boolean;
  cascadeOnRuleId?: string;
  itemCategory?: string;
  isAppliesToAlcohol: boolean;
  priceThresholdMin?: number;
  priceThresholdMax?: number;
  sortOrder: number;
}

export interface VenueCountryAssignment {
  venueId: string;
  country: Country;
  active: boolean;
}

export interface TaxLineItemRequest {
  itemId: string;
  unitPrice: number;
  quantity: number;
  temperature?: 'HOT' | 'COLD';
  itemCategory?: string;
}

export interface TaxCalculationRequest {
  ticketId: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  serviceChargeAmount?: number;
  items: TaxLineItemRequest[];
}

export interface TaxBreakdownEntry {
  ruleCode: string;
  ruleName: string;
  rate: number;
  amount: number;
}

export interface GstSplit {
  cgst: number;
  sgst: number;
}

export interface TaxLineItemResult {
  itemId: string;
  baseAmount: number;
  totalTax: number;
  breakdowns: TaxBreakdownEntry[];
  gstSplit?: GstSplit;
}

export interface TaxCalculationResponse {
  ticketId: string;
  subtotal: number;
  totalTax: number;
  serviceChargeTax: number;
  finalTotal: number;
  items: TaxLineItemResult[];
  taxSummary: Record<string, number>;
}
