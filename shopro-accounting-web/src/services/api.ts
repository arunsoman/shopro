import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083/api/v1/accounting';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const accountingApi = {
  // Taxes
  getTaxes: async (restaurantId: number) => { 
    const response = await api.get(`/taxes?restaurantId=${restaurantId}`);
    return response.data;
  },
  
  saveTax: async (data: any) => { 
    const response = await api.post('/taxes', data);
    return response.data;
  },
  
  // Expenses
  getExpenseCategories: async (restaurantId: number) => { 
    const response = await api.get(`/expenses/categories?restaurantId=${restaurantId}`);
    return response.data;
  },
  
  getPaymentMethods: async (restaurantId: number) => { 
    const response = await api.get(`/expenses/payment-methods?restaurantId=${restaurantId}`);
    return response.data;
  },
  
  createExpenseDraft: async (data: any) => { 
    const response = await api.post('/expenses/draft', data);
    return response.data;
  },
  
  getDrafts: async (restaurantId: number) => { 
    const response = await api.get(`/expenses/drafts?restaurantId=${restaurantId}`);
    return response.data;
  },
  
  postDraft: async (batchId: string, postedBy: string) => { 
    const response = await api.post(`/expenses/draft/${batchId}/post?postedBy=${postedBy}`);
    return response.data;
  },
  
  postExpense: async (data: any) => { 
    const response = await api.post('/expenses', data);
    return response.data;
  },
  
  // Payroll
  calculatePayroll: async (data: any) => { 
    const response = await api.post('/payroll/calculate', data);
    return response.data;
  },
  
  processPayroll: async (data: any) => { 
    const response = await api.post('/payroll/process', data);
    return response.data;
  },
  
  // Cash Management
  getCashBalances: async (restaurantId: number) => { 
    const response = await api.get(`/cash/balances?restaurantId=${restaurantId}`);
    return response.data;
  },
  
  transferFunds: async (data: any) => { 
    const response = await api.post('/cash/transfer', data);
    return response.data;
  },
  
  // Invoices
  createInvoice: async (data: any) => { 
    const response = await api.post('/invoices', data);
    return response.data;
  },
  
  payInvoice: async (data: any) => { 
    const response = await api.post('/invoices/pay', data);
    return response.data;
  },
  
  // Reports
  getPnl: async (restaurantId: number, start: string, end: string) => { 
    const response = await api.get(`/reports/pnl?restaurantId=${restaurantId}&start=${start}&end=${end}`);
    return response.data;
  },
  
  getBalanceSheet: async (restaurantId: number, asOfDate: string) => { 
    const response = await api.get(`/reports/balance-sheet?restaurantId=${restaurantId}&asOfDate=${asOfDate}`);
    return response.data;
  },
  
  getPrimeCost: async (restaurantId: number, start: string, end: string) => { 
    const response = await api.get(`/reports/prime-cost?restaurantId=${restaurantId}&start=${start}&end=${end}`);
    return response.data;
  },
};
