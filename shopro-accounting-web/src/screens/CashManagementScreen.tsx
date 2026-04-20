import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountingApi } from '../services/api';
import type { CashBalance } from '../types/accounting';

export function CashManagementScreen() {
  const queryClient = useQueryClient();
  const [transferData, setTransferData] = useState({
    amount: '',
    fromAccountId: '',
    toAccountId: '',
    reference: '',
  });

  const { data: balances = [] } = useQuery({
    queryKey: ['cash-balances'],
    queryFn: () => accountingApi.getCashBalances(1), // Restaurant ID 1
  });

  const transferMutation = useMutation({
    mutationFn: async (data: any) => {
      return accountingApi.transferFunds(data);
    },
    onSuccess: () => {
      toast.success('Funds transferred successfully');
      queryClient.invalidateQueries({ queryKey: ['cash-balances'] });
      setTransferData({ amount: '', fromAccountId: '', toAccountId: '', reference: '' });
    },
    onError: (err: any) => toast.error(`Transfer failed: ${err.message}`),
  });

  const handleTransfer = () => {
    if (!transferData.amount || !transferData.fromAccountId || !transferData.toAccountId) {
      toast.error('Please fill all required fields');
      return;
    }

    transferMutation.mutate({
      restaurantId: 1,
      fromAccountId: transferData.fromAccountId,
      toAccountId: transferData.toAccountId,
      amount: parseFloat(transferData.amount),
      transactionDate: new Date().toISOString().split('T')[0],
      reference: transferData.reference,
      description: `Cash transfer from ${transferData.fromAccountId} to ${transferData.toAccountId}`,
      createdBy: 'current-user'
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountBalanceWalletIcon color="primary" />
        <Typography variant="h4">Cash & Bank Management</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Account Balances */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Liquid Assets</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableBody>
                {balances.map((acc: any) => (
                  <TableRow key={acc.accountId} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{acc.accountName}</Typography>
                      <Typography variant="caption" color="text.secondary">{acc.accountCode}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      ${acc.balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Transfer Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SwapHorizIcon color="primary" />
                <Typography variant="h6">Transfer Funds</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="From Account"
                    fullWidth
                    select
                    value={transferData.fromAccountId}
                    onChange={(e) => setTransferData({ ...transferData, fromAccountId: e.target.value })}
                  >
                    {balances.map((acc: any) => (
                      <option key={acc.accountId} value={acc.accountId}>
                        {acc.accountName} (${acc.balance.toFixed(2)})
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="To Account"
                    fullWidth
                    select
                    value={transferData.toAccountId}
                    onChange={(e) => setTransferData({ ...transferData, toAccountId: e.target.value })}
                  >
                    {balances.map((acc: any) => (
                      <option key={acc.accountId} value={acc.accountId}>
                        {acc.accountName} (${acc.balance.toFixed(2)})
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Amount ($)"
                    type="number"
                    fullWidth
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reference/Note"
                    fullWidth
                    value={transferData.reference}
                    onChange={(e) => setTransferData({ ...transferData, reference: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleTransfer}
                    disabled={transferMutation.isPending}
                    sx={{ py: 1.5 }}
                  >
                    {transferMutation.isPending ? 'Processing...' : 'Execute Transfer'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
