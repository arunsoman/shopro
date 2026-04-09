// src/types/payment.types.ts

export type PaymentProviderType = 'ach' | 'vcard' | 'wire' | 'bnpl' | 'ap';

export interface PaymentField {
  id: string;
  label: string;
  placeholder: string;
}

export interface PaymentProviderDefinition {
  id: PaymentProviderType;
  label: string;
  sub: string;
  icon: string;
  fields: PaymentField[];
}

export interface PaymentProvider {
  id: string;
  type: PaymentProviderType;
  label: string;
  bank: string;
  account: string; // last 4
  icon: string;
  status: 'active' | 'pending';
}

export interface PaymentSupplier {
  id: string;
  name: string;
  contact: string;
  cat: string;
  bank?: string;
  routing?: string;
  account?: string;
}

export interface PaymentTransaction {
  id: string;
  supplierName: string;
  method: string;
  date: string;
  amount: number;
  ref: string;
  color: string;
}
