import React from 'react';
import { useSupplierAuth } from '@/features/auth/SupplierAuthContext';
import { useSupplierPortalPOs } from '../hooks/useSupplierPortal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
    Package, 
    Calendar, 
    DollarSign, 
    ArrowRight,
    Search,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const SupplierPOListPage: React.FC = () => {
    const { session } = useSupplierAuth();
    const { data: pos, isLoading } = useSupplierPortalPOs(session?.supplierId);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

    const filteredPOs = pos?.filter(po => {
        const matchesSearch = po.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SENT': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ACKNOWLEDGED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'COUNTER_OFFERED': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'SHIPPED': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'PARTIALLY_FULFILLED': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'RECEIVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CLOSED': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-slate-400">Loading your orders...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by PO ID..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['ALL', 'SENT', 'ACKNOWLEDGED', 'COUNTER_OFFERED', 'SHIPPED', 'RECEIVED'].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                "text-xs h-8 whitespace-nowrap",
                                statusFilter === status && "bg-indigo-600 hover:bg-indigo-700"
                            )}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === 'ALL' ? 'All Orders' : status.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredPOs?.map((po) => (
                    <Card key={po.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white dark:bg-slate-900 group">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row items-stretch">
                                {/* Side branding color */}
                                <div className={cn(
                                    "w-1 md:w-1.5",
                                    po.status === 'SENT' ? "bg-blue-500" :
                                    po.status === 'ACKNOWLEDGED' ? "bg-indigo-500" :
                                    po.status === 'SHIPPED' ? "bg-purple-500" :
                                    po.status === 'RECEIVED' ? "bg-emerald-500" : "bg-slate-300"
                                )} />
                                
                                <div className="flex-1 p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex-shrink-0">
                                            <FileText className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 dark:text-slate-100">PO #{po.id.slice(0, 8)}</h3>
                                                <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-bold h-5", getStatusColor(po.status))}>
                                                    {po.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {po.createdAt ? format(new Date(po.createdAt), 'MMM d, yyyy') : 'Recently'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    {Number(po.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-12">
                                        <div className="space-y-1 text-left md:text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Delivery</p>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'MMM d, yyyy') : 'As Scheduled'}
                                            </p>
                                        </div>
                                        
                                        <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 group/btn" asChild>
                                            <Link to={`/supplier/po/${po.id}`} className="gap-2">
                                                { (po.status === 'SENT' || po.status === 'ACKNOWLEDGED') ? 'Manage Fulfillment' : 'View Details' }
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!filteredPOs || filteredPOs.length === 0) && (
                    <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <Package className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No purchase orders found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">
                            {searchTerm || statusFilter !== 'ALL' 
                                ? "Try adjusting your filters or search term to find what you're looking for." 
                                : "You don't have any purchase orders yet. Active auctions and awards will appear here."}
                        </p>
                        {(searchTerm || statusFilter !== 'ALL') && (
                            <Button variant="link" className="mt-4 text-indigo-600" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>
                                Reset all filters
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
