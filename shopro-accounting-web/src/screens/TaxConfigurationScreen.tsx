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
  IconButton,
  MenuItem,
  Divider,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountingApi } from '../services/api';

const taxSchema = z.object({
  taxName: z.string().min(1, 'Tax name is required'),
  taxType: z.enum(['SALES', 'INCOME', 'PAYROLL']),
  taxRate: z.number().min(0, 'Rate cannot be negative'),
  countryCode: z.string().length(2, 'Use 2-letter country code (e.g. US)'),
  stateCode: z.string().optional(),
  localCode: z.string().optional(),
  priority: z.number().int().min(1),
  taxAppliesTo: z.string().optional(),
  description: z.string().optional(),
  accountCode: z.string().min(1, 'Accounting code is required'),
});

type TaxFormData = z.infer<typeof taxSchema>;

export function TaxConfigurationScreen() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTaxId, setSelectedTaxId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      taxType: 'SALES',
      priority: 1,
      countryCode: 'US',
    }
  });

  const { data: taxes = [] } = useQuery({
    queryKey: ['tax-configs'],
    queryFn: () => accountingApi.getTaxes(1), // Restaurant ID 1
  });

  const saveMutation = useMutation({
    mutationFn: accountingApi.saveTax,
    onSuccess: () => {
      toast.success('Tax configuration saved');
      queryClient.invalidateQueries({ queryKey: ['tax-configs'] });
      setIsEditing(false);
      setSelectedTaxId(null);
      reset();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: accountingApi.deleteTax,
    onSuccess: () => {
      toast.success('Tax removed');
      queryClient.invalidateQueries({ queryKey: ['tax-configs'] });
    },
  });

  const onSubmit = (data: TaxFormData) => {
    saveMutation.mutate({ ...data, taxConfigId: selectedTaxId as any });
  };

  const handleEdit = (tax: any) => {
    setSelectedTaxId(tax.taxConfigId);
    setValue('taxName', tax.taxName);
    setValue('taxType', tax.taxType);
    setValue('taxRate', tax.taxRate);
    setValue('countryCode', tax.countryCode);
    setValue('stateCode', tax.stateCode);
    setValue('localCode', tax.localCode);
    setValue('priority', tax.priority);
    setValue('taxAppliesTo', tax.taxAppliesTo);
    setValue('description', tax.description);
    setValue('accountCode', tax.accountCode);
    setIsEditing(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Global Tax Configuration</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            reset();
            setIsEditing(true);
            setSelectedTaxId(null);
          }}
        >
          Add New Tax Rule
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Tax List */}
        <Grid item xs={12} md={7}>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {taxes.map((tax: any) => (
                  <TableRow key={tax.taxConfigId} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{tax.taxName}</Typography>
                      <Typography variant="caption" color="text.secondary">{tax.countryCode} - {tax.taxType}</Typography>
                    </TableCell>
                    <TableCell>{tax.taxRate}%</TableCell>
                    <TableCell>P{tax.priority}</TableCell>
                    <TableCell>
                      <Chip label={tax.taxAppliesTo || 'All'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleEdit(tax)}>Edit</Button>
                      <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(tax.taxConfigId)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {taxes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No tax rules configured.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Editor Panel */}
        {isEditing && (
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedTaxId ? 'Edit Tax Rule' : 'Create New Tax Rule'}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        {...register('taxName')}
                        label="Tax Name (e.g. State Sales Tax)"
                        fullWidth
                        error={!!errors.taxName}
                        helperText={errors.taxName?.message}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        {...register('taxType')}
                        select
                        label="Tax Type"
                        fullWidth
                        SelectProps={{ native: true }}
                      >
                        <option value="SALES">Sales Tax</option>
                        <option value="INCOME">Income Tax</option>
                        <option value="PAYROLL">Payroll Tax</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        {...register('taxRate', { valueAsNumber: true })}
                        label="Rate (%)"
                        type="number"
                        fullWidth
                        error={!!errors.taxRate}
                        helperText={errors.taxRate?.message}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        {...register('countryCode')}
                        label="Country Code (2L)"
                        fullWidth
                        error={!!errors.countryCode}
                        helperText={errors.countryCode?.message}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        {...register('priority', { valueAsNumber: true })}
                        label="Priority"
                        type="number"
                        fullWidth
                        error={!!errors.priority}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('taxAppliesTo')}
                        label="Applies To (Category, e.g. ALCOHOL)"
                        fullWidth
                        placeholder="Leave empty for all items"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('accountCode')}
                        label="Ledger Account Code"
                        fullWidth
                        error={!!errors.accountCode}
                        helperText={errors.accountCode?.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        {...register('description')}
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                    <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      type="submit"
                      disabled={saveMutation.isPending}
                    >
                      Save Tax Rule
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
