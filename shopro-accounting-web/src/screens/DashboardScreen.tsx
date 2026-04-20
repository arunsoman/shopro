import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Divider,
  Chip,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountingApi } from '../services/api';

export function DashboardScreen() {
  const [dateRange, setDateRange] = useState({
    start: '2026-01-01',
    end: '2026-04-20',
  });

  const { data: pnl = { lineItems: [] }, isLoading: loadingPnl } = useQuery({
    queryKey: ['pnl', dateRange],
    queryFn: () => accountingApi.getPnl(1, dateRange.start, dateRange.end),
  });

  const { data: primeCost = {} } = useQuery({
    queryKey: ['prime-cost', dateRange],
    queryFn: () => accountingApi.getPrimeCost(1, dateRange.start, dateRange.end),
  });

  const { data: balanceSheet = { assets: [], liabilities: [], equity: [] } } = useQuery({
    queryKey: ['balance-sheet', dateRange],
    queryFn: () => accountingApi.getBalanceSheet(1, dateRange.end),
  });

  // Helper for P&L coloring
  const getAmountColor = (amount: number) => (amount >= 0 ? 'success.main' : 'error.main');

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">CFO Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            label="Start Date"
            size="small"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <TextField
            type="date"
            label="End Date"
            size="small"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </Box>
      </Box>

      {/* Top KPI Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2">Net Operating Income</Typography>
              <Typography variant="h4" fontWeight="bold">
                ${pnl.netOperatingIncome?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2">Prime Cost %</Typography>
              <Typography variant="h4" fontWeight="bold">
                {primeCost.primeCostPercentage?.toFixed(2) || '0.00'}%
              </Typography>
              <Chip 
                label={primeCost.status || 'Sourced'} 
                size="small" 
                sx={{ bgcolor: 'white', color: 'black', mt: 1 }} 
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Assets</Typography>
              <Typography variant="h4" fontWeight="bold">
                ${balanceSheet.totalAssets?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Liabilities</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                ${balanceSheet.totalLiabilities?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* P&L Statement Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Profit & Loss Statement</Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableBody>
                    {pnl.lineItems?.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell 
                          sx={{ 
                            pl: item.category === 'REVENUE' ? 0 : item.category === 'COGS' ? 2 : 4,
                            fontWeight: item.category === 'REVENUE' ? 'bold' : 'normal'
                          }}
                        >
                          {item.accountName}
                        </TableCell>
                        <TableCell align="right" sx={{ color: getAmountColor(Number(item.amount)) }}>
                          ${item.amount?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }} colSpan={1}>Net Operating Income</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: getAmountColor(Number(pnl.netOperatingIncome)) }}>
                        ${pnl.netOperatingIncome?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Balance Sheet Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Balance Sheet Snapshot</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Assets</Typography>
                  {balanceSheet.assets?.map((a: any) => (
                    <Box key={a.accountName} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2">{a.accountName}</Typography>
                      <Typography variant="body2" fontWeight="bold">${a.balance?.toFixed(2)}</Typography>
                    </Box>
                  ))}
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Liabilities</Typography>
                  {balanceSheet.liabilities?.map((l: any) => (
                    <Box key={l.accountName} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                      <Typography variant="body2">{l.accountName}</Typography>
                      <Typography variant="body2" fontWeight="bold">${l.balance?.toFixed(2)}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
