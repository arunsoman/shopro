import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DraftIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { accountingApi } from '../services/api';
import type { ExpenseCategory, PaymentMethod, ExpenseLine } from '../types/accounting';

const expenseLineSchema = z.object({
  expenseAccountId: z.string().uuid('Please select an expense type'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
});

const expenseFormSchema = z.object({
  date: z.string(),
  paymentMethodAccountId: z.string().uuid('Please select a payment method'),
  paymentReference: z.string().optional(),
  lines: z.array(expenseLineSchema).min(1, 'At least one expense line is required'),
});

type FormData = z.infer<typeof expenseFormSchema>;

export function ExpenseEntryScreen() {
  const queryClient = useQueryClient();
  const [isDraft, setIsDraft] = useState(false);
  const [mode, setMode] = useState<'entry' | 'drafts'>('entry');

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      lines: [{ expenseAccountId: '', description: '', amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const watchedLines = watch('lines');

  // Fetch expense categories for dropdown
  const { data: categories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: ['expense-categories'],
    queryFn: () => accountingApi.getExpenseCategories(1), // TODO: Get from auth context
  });

  // Fetch payment methods for dropdown
  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ['payment-methods'],
    queryFn: () => accountingApi.getPaymentMethods(1),
  });

  // Fetch drafts
  const { data: drafts = [] } = useQuery({
    queryKey: ['expense-drafts'],
    queryFn: () => accountingApi.getExpenseDrafts(1),
    enabled: mode === 'drafts',
  });

  // Mutation: Create draft
  const createDraftMutation = useMutation({
    mutationFn: accountingApi.createExpenseDraft,
    onSuccess: () => {
      toast.success('Draft saved successfully');
      queryClient.invalidateQueries({ queryKey: ['expense-drafts'] });
      reset();
      setMode('drafts');
    },
    onError: (error: any) => {
      toast.error(`Failed to save draft: ${error.message}`);
    },
  });

  // Mutation: Post expense
  const postExpenseMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isDraft) {
        return accountingApi.createExpenseDraft({ ...data, createdBy: 'current-user' });
      }
      return accountingApi.postExpense({ ...data, restaurantId: 1 });
    },
    onSuccess: () => {
      toast.success(isDraft ? 'Draft saved' : 'Expense posted to ledger');
      reset();
    },
    onError: (error: any) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Mutation: Post draft
  const postDraftMutation = useMutation({
    mutationFn: (batchId: string) => accountingApi.postExpenseDraft(batchId, 'current-user'),
    onSuccess: () => {
      toast.success('Draft posted to ledger');
      queryClient.invalidateQueries({ queryKey: ['expense-drafts'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to post: ${error.message}`);
    },
  });

  // Mutation: Delete draft
  const deleteDraftMutation = useMutation({
    mutationFn: accountingApi.deleteExpenseDraft,
    onSuccess: () => {
      toast.success('Draft deleted');
      queryClient.invalidateQueries({ queryKey: ['expense-drafts'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const onSubmit = (data: FormData) => {
    if (mode === 'drafts') return;
    postExpenseMutation.mutate(data);
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    handleSubmit(onSubmit)();
  };

  const handlePost = () => {
    setIsDraft(false);
    handleSubmit(onSubmit)();
  };

  const handleAddRow = () => {
    append({ expenseAccountId: '', description: '', amount: 0 });
  };

  const calculateTotal = () => {
    return watchedLines.reduce((sum, line) => sum + (line.amount || 0), 0);
  };

  if (mode === 'drafts') {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Draft Expenses</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setMode('entry')}
          >
            New Expense
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Lines</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
              {drafts.map((draft: any) => (
                <TableRow key={draft.batchId}>
                  <TableCell>{draft.date}</TableCell>
                  <TableCell>${draft.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{draft.lines.length} items</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="success"
                      startIcon={<SendIcon />}
                      onClick={() => postDraftMutation.mutate(draft.batchId)}
                      sx={{ mr: 1 }}
                    >
                      Post
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteDraftMutation.mutate(draft.batchId)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {drafts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No drafts found. Create a new expense entry.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Add Expenses</Typography>
        <Button
          variant="outlined"
          startIcon={<DraftIcon />}
          onClick={() => setMode('drafts')}
        >
          View Drafts
        </Button>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('date')}
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('paymentMethodAccountId')}
                  select
                  label="Paid By"
                  fullWidth
                  SelectProps={{ native: true }}
                  error={!!errors.paymentMethodAccountId}
                  helperText={errors.paymentMethodAccountId?.message}
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.code} value={method.code}>
                      {method.name}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TableContainer>
              <Table>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell sx={{ width: '40%' }}>
                        <TextField
                          {...register(`lines.${index}.expenseAccountId`)}
                          select
                          label="Expense Type"
                          fullWidth
                          SelectProps={{ native: true }}
                          error={!!errors.lines?.[index]?.expenseAccountId}
                          helperText={errors.lines?.[index]?.expenseAccountId?.message}
                        >
                          <option value="">Select expense type</option>
                          {categories.map((cat) => (
                            <option key={cat.code} value={cat.code}>
                              {cat.name}
                            </option>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ width: '35%' }}>
                        <TextField
                          {...register(`lines.${index}.description`)}
                          label="Description"
                          fullWidth
                          placeholder="e.g., April Rent"
                          error={!!errors.lines?.[index]?.description}
                        />
                      </TableCell>
                      <TableCell sx={{ width: '20%' }}>
                        <TextField
                          {...register(`lines.${index}.amount`, { valueAsNumber: true })}
                          label="Amount"
                          type="number"
                          fullWidth
                          InputProps={{ startAdornment: '$' }}
                          error={!!errors.lines?.[index]?.amount}
                          helperText={errors.lines?.[index]?.amount?.message}
                        />
                      </TableCell>
                      <TableCell sx={{ width: '5%' }}>
                        <IconButton
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              sx={{ mt: 2 }}
            >
              Add Row
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, bgcolor: 'primary.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => reset()}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveDraft}
            disabled={postExpenseMutation.isPending}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handlePost}
            disabled={postExpenseMutation.isPending}
          >
            Post to Ledger
          </Button>
        </Box>
      </form>
    </Box>
  );
}
