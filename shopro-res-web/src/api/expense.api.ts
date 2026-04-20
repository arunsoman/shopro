// Expense API - Domain-specific expense operations
import axios from 'axios';

const API_BASE = '/api/v1/restaurants';

export interface ExpenseCategory {
  id: string;
  label: string;
  description?: string;
  accountCode: string;
  accountName: string;
}

export interface ExpenseEntry {
  id: string;
  restaurantId: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'credit_card';
  status: 'draft' | 'posted';
  notes?: string;
  createdAt: string;
  postedAt?: string;
}

export interface JournalEntryRequest {
  description: string;
  transactionDate: string;
  referenceNumber?: string;
  lines: {
    accountCode: string;
    accountId?: string;
    debit: number;
    credit: number;
    description: string;
    notes?: string;
    category?: string;
  }[];
}

export interface CreateExpenseRequest {
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'credit_card';
  notes?: string;
}

export const expenseApi = {
  // Get all expenses
  getExpenses: async (restaurantId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/expenses?${params}`);
    return data;
  },

  // Create expense entry
  createExpense: async (restaurantId: number, expense: CreateExpenseRequest) => {
    const { data } = await axios.post(`${API_BASE}/${restaurantId}/accounting/expenses`, expense);
    return data;
  },

  // Create journal entry (for posting expenses)
  createJournalEntry: async (restaurantId: number, entry: JournalEntryRequest) => {
    const { data } = await axios.post(`${API_BASE}/${restaurantId}/accounting/journal-entry`, entry);
    return data;
  },

  // Get expense categories
  getCategories: async (restaurantId: number) => {
    const { data } = await axios.get(`${API_BASE}/${restaurantId}/accounting/expense-categories`);
    return data;
  },
};

// Re-export accounting API
export * from './accounting.api';
