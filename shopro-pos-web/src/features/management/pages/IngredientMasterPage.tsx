import React, { useState } from 'react';
import { useIngredients } from '../../inventory/hooks/useInventory';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Info,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Tag,
  PackageCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ManagementIngredientDialog } from '../components/ManagementIngredientDialog';
import type { Ingredient } from '../../inventory/api/types';

export const IngredientMasterPage: React.FC = () => {
  const [page] = useState(0);
  const [size] = useState(10);
  const [search, setSearch] = useState('');
  const { data: pageData } = useIngredients(page, size);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | undefined>();

  const ingredients = pageData?.content || [];
  const filtered = ingredients.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.itemCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedIngredient(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ingredient Master</h2>
          <p className="text-sm text-muted-2">Manage yields, unit conversions, and theoretical costing.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Add Ingredient
        </Button>
      </div>

      <Card className="bg-surface border-border overflow-hidden">
        <CardHeader className="border-b border-white/5 py-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Search by code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 border-white/10"
              />
            </div>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                 {pageData?.totalElements || 0} Total SKUs
               </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Ingredient</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>UoM (PU/RU/IU)</TableHead>
                <TableHead className="text-right">Yield %</TableHead>
                <TableHead className="text-right">RU Cost</TableHead>
                <TableHead className="text-right">IU Cost</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No ingredients found mapping to management standards.
                  </TableCell>
                </TableRow>
              ) : filtered.map((i) => (
                <TableRow 
                  key={i.id} 
                  className="hover:bg-white/5 border-white/5 cursor-pointer group"
                  onClick={() => handleEdit(i)}
                >
                  <TableCell className="font-mono text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                    {i.itemCode || '---'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{i.name}</span>
                      <span className="text-[10px] text-muted-2 truncate max-w-[200px]">{i.itemDescription || 'No description'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-secondary/10 border-transparent capitalize">
                      {i.managementCategory?.toLowerCase() || 'Other'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-info-bright">{i.purchaseUnit || '??'}</span>
                      <span className="text-muted-foreground/30">/</span>
                      <span className="text-warning-bright">{i.recipeUnit || '??'}</span>
                      <span className="text-muted-foreground/30">/</span>
                      <span className="text-success-bright">{i.inventoryUnit || '??'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={cn(
                      "inline-flex items-center gap-1",
                      i.yieldPct < 0.8 ? "text-warning" : "text-success"
                    )}>
                      {(i.yieldPct * 100).toFixed(0)}%
                      {i.yieldPct < 0.8 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[12px] text-warning-bright">
                    ${(i.ruCost || 0).toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[12px] text-success-bright">
                    ${(i.iuCost || 0).toFixed(4)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-4 rounded-xl border border-white/5 bg-info/5 flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
               <Info className="h-5 w-5 text-info" />
            </div>
            <div>
               <h4 className="text-sm font-semibold text-info">Theoretical Costing</h4>
               <p className="text-[11px] text-info-bright opacity-80 leading-relaxed mt-1">
                 RU Cost is calculated as Current Price / (# RU per PU) / Yield %. This drives the RECIPE COST reported in Prime Cost summaries.
               </p>
            </div>
         </div>
         <div className="p-4 rounded-xl border border-white/5 bg-warning/5 flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
               <Tag className="h-5 w-5 text-warning" />
            </div>
            <div>
               <h4 className="text-sm font-semibold text-warning">Yield Variances</h4>
               <p className="text-[11px] text-warning-bright opacity-80 leading-relaxed mt-1">
                 Yield calculations significantly impact food cost. Use Butcher Yield tests for proteins to ensure accurate theorectical data.
               </p>
            </div>
         </div>
         <div className="p-4 rounded-xl border border-white/5 bg-success/5 flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
               <PackageCheck className="h-5 w-5 text-success" />
            </div>
            <div>
               <h4 className="text-sm font-semibold text-success">Unit Alignment</h4>
               <p className="text-[11px] text-success-bright opacity-80 leading-relaxed mt-1">
                 IU (Inventory Unit) is how you COUNT. PU (Purchase Unit) is how you BUY. Ensure conversions map correctly to avoid stock-on-hand errors.
               </p>
            </div>
         </div>
      </div>

      <ManagementIngredientDialog 
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        ingredient={selectedIngredient}
      />
    </div>
  );
};

export default IngredientMasterPage;
