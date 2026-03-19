import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useIngredients } from '../hooks/useInventory';
import { useSuppliers } from '../hooks/useSuppliers';
import { useCreateBid } from '../hooks/useRFQ';
import { format } from 'date-fns';
import { type BidLineItemRequest, type Ingredient } from '../api/types';

interface CreateBidFlowProps {
  open: boolean;
  onClose: () => void;
}

export const CreateBidFlow: React.FC<CreateBidFlowProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedIngredients, setSelectedIngredients] = useState<(BidLineItemRequest & { name: string, unit: string })[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [bidDeadline, setBidDeadline] = useState<string>('');
  const [sameForAllDelivery, setSameForAllDelivery] = useState(true);
  const [globalDeliveryDate, setGlobalDeliveryDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const { data: ingredientsData, isLoading: ingredientsLoading } = useIngredients(0, 1000);
  const { data: suppliers } = useSuppliers();
  const createBidMutation = useCreateBid();

  const handleAddIngredient = (ingredient: Ingredient | null) => {
    if (ingredient && !selectedIngredients.find(item => item.ingredientId === ingredient.id)) {
      setSelectedIngredients([
        ...selectedIngredients,
        {
          ingredientId: ingredient.id,
          name: ingredient.name,
          unit: ingredient.unitOfMeasure,
          quantity: 1,
          deliveryDate: sameForAllDelivery ? globalDeliveryDate : format(new Date(), 'yyyy-MM-dd')
        }
      ]);
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setSelectedIngredients(selectedIngredients.filter(item => item.ingredientId !== id));
  };

  const handleQuantityChange = (id: string, qty: string) => {
    const val = parseFloat(qty) || 0;
    setSelectedIngredients(selectedIngredients.map(item => 
      item.ingredientId === id ? { ...item, quantity: val } : item
    ));
  };

  const handleDeliveryDateChange = (id: string, date: string) => {
    setSelectedIngredients(selectedIngredients.map(item => 
      item.ingredientId === id ? { ...item, deliveryDate: date } : item
    ));
  };

  const toggleSupplier = (id: string) => {
    setSelectedSupplierIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleLoadDailyPerishables = () => {
    if (!ingredientsData?.content) return;

    const dailyIngredients = ingredientsData.content.filter(ing => ing.dailyRestockEnrolled);
    const newItems = dailyIngredients
      .filter(ing => !selectedIngredients.find(item => item.ingredientId === ing.id))
      .map(ing => {
        const needed = Math.max(0, (ing.parLevel || 0) - (ing.currentStock || 0));
        return {
          ingredientId: ing.id,
          name: ing.name,
          unit: ing.unitOfMeasure,
          quantity: needed > 0 ? needed : 1, // Default to 1 if par logic results in 0
          deliveryDate: sameForAllDelivery ? globalDeliveryDate : format(new Date(), 'yyyy-MM-dd')
        };
      });

    if (newItems.length > 0) {
      setSelectedIngredients([...selectedIngredients, ...newItems]);
    }
  };

  const handleSubmit = async () => {
    const bidRequest = {
      items: selectedIngredients.map(({ ingredientId, quantity, deliveryDate }) => ({
        ingredientId,
        quantity,
        deliveryDate: sameForAllDelivery ? globalDeliveryDate : deliveryDate
      })),
      supplierIds: selectedSupplierIds,
      bidDeadline: new Date(bidDeadline).toISOString()
    };

    createBidMutation.mutate(bidRequest, {
      onSuccess: () => {
        onClose();
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setActiveStep(0);
    setSelectedIngredients([]);
    setSelectedSupplierIds([]);
    setBidDeadline('');
    setSameForAllDelivery(true);
  };

  const renderIngredientsStep = () => (
    <Box sx={{ py: 2 }}>
      <Autocomplete
        options={ingredientsData?.content ?? []}
        getOptionLabel={(option) => (typeof option === 'object' && option?.name ? option.name : '')}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_: any, value: Ingredient | null) => handleAddIngredient(value)}
        loading={ingredientsLoading}
        noOptionsText={ingredientsLoading ? t('common.loading') : t('inventory.rfq.createBid.noIngredients')}
        renderInput={(params: any) => (
          <TextField
            {...params}
            label={t('inventory.rfq.createBid.addIngredient')}
            variant="outlined"
            size="small"
            fullWidth
          />
        )}
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />} 
          onClick={handleLoadDailyPerishables}
          disabled={!ingredientsData?.content}
        >
          {t('inventory.rfq.createBid.loadDaily')}
        </Button>
      </Box>

      <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {selectedIngredients.map((item) => (
          <ListItem key={item.ingredientId} sx={{ borderBottom: '1px solid var(--border)', py: 1.5 }}>
            <ListItemText 
              primary={<Typography variant="body1" sx={{ color: 'var(--foreground)', fontWeight: 600 }}>{item.name}</Typography>} 
              secondary={<Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{t('inventory.common.unit')}: {item.unit}</Typography>} 
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                type="number"
                label={t('inventory.common.quantity')}
                value={item.quantity}
                onChange={(e: any) => handleQuantityChange(item.ingredientId, e.target.value)}
                size="small"
                sx={{ width: 100 }}
              />
              {!sameForAllDelivery && (
                <TextField
                  type="date"
                  label={t('inventory.rfq.createBid.expectedDelivery')}
                  value={item.deliveryDate}
                  onChange={(e: any) => handleDeliveryDateChange(item.ingredientId, e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              )}
              <IconButton edge="end" onClick={() => handleRemoveIngredient(item.ingredientId)}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderSuppliersStep = () => (
    <Box sx={{ py: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>{t('inventory.rfq.createBid.selectSuppliers')}</Typography>
      <Grid container spacing={2}>
        {suppliers?.filter(s => s.bidEligible).map((supplier) => (
          <Grid size={{ xs: 12, sm: 6 }} key={supplier.id}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                cursor: 'pointer',
                borderColor: selectedSupplierIds.includes(supplier.id) ? 'var(--primary)' : 'var(--border)',
                bgcolor: selectedSupplierIds.includes(supplier.id) ? 'hsl(var(--primary) / 0.05)' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  bgcolor: 'hsl(var(--primary) / 0.02)'
                }
              }}
              onClick={() => toggleSupplier(supplier.id)}
            >
              <FormControlLabel
                control={<Checkbox checked={selectedSupplierIds.includes(supplier.id)} />}
                label={
                  <Box>
                    <Typography variant="body1" sx={{ color: 'var(--foreground)', fontWeight: 600 }}>{supplier.companyName}</Typography>
                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{supplier.vendorRating} ⭐</Typography>
                  </Box>
                }
                onClick={(e: any) => e.stopPropagation()}
                onChange={() => toggleSupplier(supplier.id)}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderFinalDetailsStep = () => (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <TextField
            fullWidth
            type="datetime-local"
            label={t('inventory.rfq.createBid.bidEndDate')}
            value={bidDeadline}
            onChange={(e: any) => setBidDeadline(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={12}>
          <FormControlLabel
            control={<Switch checked={sameForAllDelivery} onChange={(e: any) => setSameForAllDelivery(e.target.checked)} />}
            label={t('inventory.rfq.createBid.sameForAll')}
          />
        </Grid>
        {sameForAllDelivery && (
          <Grid size={12}>
            <TextField
              fullWidth
              type="date"
              label={t('inventory.rfq.createBid.expectedDelivery')}
              value={globalDeliveryDate}
              onChange={(e: any) => setGlobalDeliveryDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'var(--muted)', borderRadius: 2, border: '1px solid var(--border)' }}>
        <Typography variant="h6" sx={{ color: 'var(--foreground)', fontWeight: 700, mb: 1 }}>{t('inventory.common.summary')}</Typography>
        <Divider sx={{ mb: 2, borderColor: 'var(--border)' }} />
        <Box sx={{ spaceY: 1 }}>
          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{t('inventory.rfq.createBid.ingredients')}: <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{selectedIngredients.length}</span></Typography>
          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{t('inventory.rfq.createBid.inviteSuppliers')}: <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{selectedSupplierIds.length}</span></Typography>
          <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{t('inventory.rfq.createBid.bidEndDate')}: <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>{bidDeadline || '-'}</span></Typography>
        </Box>
      </Box>
    </Box>
  );

  const steps = [
    { label: t('inventory.rfq.createBid.ingredients'), render: renderIngredientsStep, valid: selectedIngredients.length > 0 },
    { label: t('inventory.rfq.createBid.inviteSuppliers'), render: renderSuppliersStep, valid: selectedSupplierIds.length > 0 },
    { label: t('inventory.common.summary'), render: renderFinalDetailsStep, valid: !!bidDeadline }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarIcon color="primary" />
        {t('inventory.rfq.createBid.title')}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
            {t('common.step')} {activeStep + 1} / {steps.length} — {steps[activeStep].label}
          </Typography>
        </Box>
        {steps[activeStep].render()}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Box sx={{ flexGrow: 1 }} />
        {activeStep > 0 && (
          <Button startIcon={<PrevIcon />} onClick={handleBack}>
            {t('common.back')}
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            endIcon={<NextIcon />} 
            onClick={handleNext}
            disabled={!steps[activeStep].valid}
          >
            {t('common.next')}
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={!steps[activeStep].valid || createBidMutation.isPending}
          >
            {createBidMutation.isPending ? t('common.saving') : t('inventory.rfq.createBid.title')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
