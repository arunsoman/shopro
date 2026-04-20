import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'sonner';

import { ExpenseEntryScreen } from './screens/ExpenseEntryScreen';
import { TaxConfigurationScreen } from './screens/TaxConfigurationScreen';
import { PayrollScreen } from './screens/PayrollScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { CashManagementScreen } from './screens/CashManagementScreen';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/expenses" element={<ExpenseEntryScreen />} />
            <Route path="/taxes" element={<TaxConfigurationScreen />} />
            <Route path="/payroll" element={<PayrollScreen />} />
            <Route path="/cash" element={<CashManagementScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
