import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Chip,
  CircularProgress,
} from '@mui/material';
import CalculatorIcon from '@mui/icons-material/Calculate';
import SendIcon from '@mui/icons-material/Send';
import MoneyIcon from '@mui/icons-material/Money';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountingApi } from '../services/api';

const payrollSchema = z.object({
  staffId: z.string().uuid(),
  staffName: z.string().min(1, 'Staff name is required'),
  payPeriodStart: z.string(),
  payPeriodEnd: z.string(),
  payDate: z.string(),
  hourlyRate: z.number().positive(),
  totalHours: z.number().nonnegative(),
  paymentMethod: z.enum(['CASH', 'CHECK', 'BANK']),
  paymentReference: z.string().optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

export function PayrollScreen() {
  const [calculation, setCalculation] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      payPeriodStart: new Date().toISOString().split('T')[0],
      payPeriodEnd: new Date().toISOString().split('T')[0],
      payDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK',
    }
  });

  const hourlyRate = watch('hourlyRate');
  const totalHours = watch('totalHours');

  const calculateMutation = useMutation({
    mutationFn: async (data: PayrollFormData) => {
      const response = await accountingApi.calculatePayroll({
        ...data,
        restaurantId: 1,
      });
      return response.data;
    },
    onSuccess: (data) => setCalculation(data),
  });

  const processMutation = useMutation({
    mutationFn: async (data: PayrollFormData) => {
      return accountingApi.processPayroll({
        ...data,
        restaurantId: 1,
        createdBy: 'current-manager',
      });
    },
    onSuccess: () => {
      toast.success('Payroll processed and posted to ledger');
      reset();
      setCalculation(null);
    },
    onError: (err: any) => toast.error(`Payroll Error: ${err.message}`),
  });

  const handleCalculate = () => {
    const currentData = {
      staffId: '00000000-0000-0000-0000-000000000000',
      staffName: 'Employee Name',
      payPeriodStart: watch('payPeriodStart'),
      payPeriodEnd: watch('payPeriodEnd'),
      payDate: watch('payDate'),
      hourlyRate: hourlyRate || 0,
      totalHours: totalHours || 0,
      paymentMethod: watch('paymentMethod'),
      paymentReference: watch('paymentReference') || '',
    };
    calculateMutation.mutate(currentData);
  };

  const onSubmit = (data: PayrollFormData) => {
    setIsProcessing(true);
    processMutation.mutate(data, {
      onSettled: () => setIsProcessing(false)
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Payroll Processing</Typography>
        <Typography variant="body2" color="text.secondary">
          Double-Entry System: Auto-posts to Wages, Taxes, and Cash accounts
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      {...register('staffName')}
                      label="Employee Name"
                      fullWidth
                      error={!!errors.staffName}
                      helperText={errors.staffName?.message}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      {...register('payPeriodStart')}
                      label="Period Start"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      {...register('payPeriodEnd')}
                      label="Period End"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('payDate')}
                      label="Payment Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      {...register('hourlyRate', { valueAsNumber: true })}
                      label="Hourly Rate ($)"
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        setValue('hourlyRate', parseFloat(e.target.value));
                        handleCalculate();
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      {...register('totalHours', { valueAsNumber: true })}
                      label="Total Hours"
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        setValue('totalHours', parseFloat(e.target.value));
                        handleCalculate();
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      {...register('paymentMethod')}
                      select
                      label="Payment Method"
                      fullWidth
                      SelectProps={{ native: true }}
                    >
                      <option value="BANK">Bank Transfer</option>
                      <option value="CHECK">Check</option>
                      <option value="CASH">Cash</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      {...register('paymentReference')}
                      label="Reference (Check #)"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    type="submit"
                    disabled={isProcessing || !calculation}
                  >
                    {isProcessing ? <CircularProgress size={24} /> : 'Process & Post Payroll'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: '#fcfcfc' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalculatorIcon color="primary" />
                <Typography variant="h6">Payroll Preview</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {!calculation ? (
                <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                  <Typography>Enter hours and rate to see the automatic tax breakdown</Typography>
                </Box>
              ) : (
                <Box>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Gross Earnings</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${calculation.grossPay.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>Federal Income Tax</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            - ${calculation.federalTax.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>State Income Tax</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            - ${calculation.stateTax.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>Social Security</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            - ${calculation.socialSecurityTax.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>Medicare</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            - ${calculation.medicareTax.toFixed(2)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>NET TAKE-HOME PAY</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main', fontSize: '1.2rem' }}>
                            ${calculation.netPay.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MoneyIcon fontSize="small" />
                      <Typography variant="subtitle2">Employer Cost (Matching)</Typography>
                    </Box>
                    <Typography variant="body2">
                      Employer pays an additional <strong>${(calculation.employerSocialSecurity + calculation.employerMedicare).toFixed(2)}</strong> in taxes.
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      <b>Ledger Impact:</b> This will create 6 entries in the double-entry ledger, affecting Wages Expense, Payroll Tax Expense, Cash/Bank, and 4 Tax Payable accounts.
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
