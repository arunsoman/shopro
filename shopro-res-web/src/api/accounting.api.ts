// Accounting API
import axios from 'axios';

const API_BASE = '/api/v1/restaurants';

export interface ChartOfAccount {
  accountId: string;
  restaurantId: number;
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  accountSubType: string;
  parentAccountId: string | null;
  description: string;
  defaultTaxRate: number | null;
  isTaxable: boolean;
  isActive: boolean;
  allowManualEntry: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryDisbursement {
  disbursementId: string;
  restaurantId: number;
  staffId: string;
  staffName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  hourlyRate: number;
  totalHours: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  localTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  otherDeductions: number;
  totalTax: number;
  netPay: number;
  paymentMethod: string;
  paymentReference: string;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED';
  ledgerEntryId: string;
  notes: string;
  createdAt: string;
}

export interface TaxSummary {
  federalTax: number;
  stateTax: number;
  localTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalTax: number;
  totalGrossPay: number;
  totalNetPay: number;
  breakdown: Record<string, number> | null;
}

export interface AccountingLedger {
  entryId: string;
  restaurantId: number;
  transactionDate: string;
  entryType: string;
  referenceNumber: string;
  referenceId: string;
  referenceType: string;
  description: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  taxAmount: number;
  taxRate: number;
  currency: string;
  staffId: string;
  staffName: string;
  category: string;
  notes: string;
  isReconciled: boolean;
  createdAt: string;
}

export interface TrialBalanceEntry {
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
}

export interface PnLLineItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  percentage: number;
}

export interface PnLStatement {
  startDate: string;
  endDate: string;
  reportType: string;
  // Revenue
  foodSales: PnLLineItem[];
  beverageSales: PnLLineItem[];
  otherRevenue: PnLLineItem[];
  totalRevenue: number;
  // COGS
  foodCost: PnLLineItem[];
  beverageCost: PnLLineItem[];
  otherCogs: PnLLineItem[];
  totalCogs: number;
  grossProfit: number;
  // Labor
  laborExpenses: PnLLineItem[];
  totalLabor: number;
  // Operating Expenses
  operatingExpenses: PnLLineItem[];
  totalOperatingExpenses: number;
  // Summary
  totalExpenses: number;
  netIncome: number;
  laborPercentage: number;
  cogsPercentage: number;
  primeCost: number;
}

export interface DailySales {
  date: string;
  category: string;
  categoryLabel: string;
  amount: number;
  cashAmount: number;
  cardAmount: number;
  digitalAmount: number;
  orderCount: number;
}

export const accountingApi = {
  // Chart of Accounts
  getAccounts: async (restaurantId: number) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/accounts`);
    return data;
  },

  createAccount: async (restaurantId: number, account: Partial<ChartOfAccount>) => {
    const { data } = await axios.post(`${API_BASE}/${restaurantId}/accounting/accounts`, account);
    return data;
  },

  // Salary Disbursement
  getDisbursements: async (restaurantId: number) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/disbursements`);
    return data;
  },

  getPendingDisbursements: async (restaurantId: number) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/disbursements/pending`);
    return data;
  },

  createDisbursement: async (restaurantId: number, disbursement: Partial<SalaryDisbursement>) => {
    const { data } = await axios.post(`${API_BASE}/${restaurantId}/accounting/disbursements`, disbursement);
    return data;
  },

  disburseSalary: async (restaurantId: number, disbursementId: string) => {
    const { data } = await axios.post(`${API_BASE}/${restaurantId}/accounting/disbursements/${disbursementId}/disburse`);
    return data;
  },

  processPayroll: async (restaurantId: number, payPeriodStart: string, payPeriodEnd: string, payDate: string) => {
    const { data } = await axios.post(`${API_BASE}/${restaurantId}/accounting/disbursements/process-payroll`, {
      payPeriodStart,
      payPeriodEnd,
      payDate
    });
    return data;
  },

  // Tax Calculation
  calculateTaxes: async (restaurantId: number, grossPay: number, country = 'US') => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/taxes/calculate`, {
      params: { grossPay, country }
    });
    return data;
  },

  getPayrollTaxSummary: async (restaurantId: number, periodStart: string, periodEnd: string) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/taxes/summary`, {
      params: { periodStart, periodEnd }
    });
    return data;
  },

  // Ledger
  getLedger: async (restaurantId: number, startDate: string, endDate: string) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/ledger`, {
      params: { startDate, endDate }
    });
    return data;
  },

  createJournalEntry: async (restaurantId: number, entry: any) => {
    const { data } = await axios.post(`${API_BASE}/${restaurantId}/accounting/journal-entry`, entry);
    return data;
  },

  // Reports
  getTrialBalance: async (restaurantId: number, startDate: string, endDate: string) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/reports/trial-balance`, {
      params: { startDate, endDate }
    });
    return data;
  },

  getDashboard: async (restaurantId: number) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/reports/dashboard`);
    return data;
  },

  // P&L Statement
  getPnLStatement: async (restaurantId: number, startDate: string, endDate: string) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/reports/pnl`, {
      params: { startDate, endDate }
    });
    return data;
  },

  // Auto-populate Sales from Orders
  getAutoPopulateSales: async (restaurantId: number, date: string) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/sales/auto-populate`, {
      params: { date }
    });
    return data;
  }
};
