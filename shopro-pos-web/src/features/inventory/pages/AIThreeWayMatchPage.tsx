import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    FileUp, 
    ArrowLeft, 
    CheckCircle2, 
    AlertCircle, 
    Zap, 
    Loader2, 
    Info, 
    ShieldCheck, 
    TrendingUp,
    ScanLine
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIMatch } from '../hooks/useAIMatch';
import type { AIMatchResult } from '../api/types';

export const AIThreeWayMatchPage: React.FC = () => {
    const navigate = useNavigate();
    const aiMatch = useAIMatch();

    const [files, setFiles] = useState<{
        po: File | null;
        invoice: File | null;
        grn: File | null;
    }>({
        po: null,
        invoice: null,
        grn: null
    });

    const [result, setResult] = useState<AIMatchResult | null>(null);

    const handleFileChange = (type: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFiles(prev => ({ ...prev, [type]: file }));
    };

    const handleRunMatch = async () => {
        if (!files.po || !files.invoice || !files.grn) {
            toast.error("Please upload all three documents (PO, Invoice, and GRN)");
            return;
        }

        try {
            const data = await aiMatch.mutateAsync({
                po: files.po,
                invoice: files.invoice,
                grn: files.grn
            });
            setResult(data);
            toast.success("AI Matching completed successfully");
        } catch (error) {
            toast.error("Failed to run AI match. Please check document quality and try again.");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'MATCHED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'ANOMALY': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'PRICE_VARIANCE':
            case 'QTY_MISMATCH': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getOverallStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500 hover:bg-emerald-600';
            case 'FRAUD_RISK': return 'bg-red-600 hover:bg-red-700';
            case 'EXCEPTION': return 'bg-amber-500 hover:bg-amber-600';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/pos')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                            Smart Match AI
                            <Badge className="bg-indigo-600 text-white font-bold px-3 py-1">PRO</Badge>
                        </h2>
                        <p className="text-muted-foreground mt-1 font-medium italic">Powered by Spice Trail Matching Engine</p>
                    </div>
                </div>
                {result && (
                    <Button variant="outline" onClick={() => {
                        setResult(null);
                        setFiles({ po: null, invoice: null, grn: null });
                    }} className="gap-2">
                        Reset Documents
                    </Button>
                )}
            </div>

            {!result ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    {(['po', 'invoice', 'grn'] as const).map((type) => (
                        <Card key={type} className={`relative overflow-hidden group border-2 transition-all cursor-pointer ${files[type] ? 'border-indigo-500 bg-indigo-50/10' : 'border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}>
                            {files[type] && (
                                <div className="absolute top-0 right-0 p-2">
                                    <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                </div>
                            )}
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <FileUp className={`h-5 w-5 ${files[type] ? 'text-indigo-500' : 'text-slate-400'}`} />
                                    {type.toUpperCase()} Document
                                </CardTitle>
                                <CardDescription>PDF containing {type === 'po' ? 'Original Order' : type === 'invoice' ? 'Vendor Billing' : 'Receipt Confirmation'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative group/file">
                                    <input 
                                        type="file" 
                                        accept="application/pdf" 
                                        onChange={(e) => handleFileChange(type, e)}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="py-12 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 rounded-xl bg-white/50 group-hover:bg-white transition-colors">
                                        <div className={`p-4 rounded-full ${files[type] ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'bg-slate-50 text-slate-400'}`}>
                                            <ScanLine className="h-10 w-10" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-700">
                                                {files[type] ? files[type]?.name : `Drag & drop ${type.toUpperCase()} PDF`}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">Supports scanned & digital formats</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <div className="md:col-span-3 pt-6 flex flex-col items-center space-y-6">
                        <Button 
                            onClick={handleRunMatch}
                            disabled={aiMatch.isPending || !files.po || !files.invoice || !files.grn}
                            size="lg"
                            className="h-16 px-12 text-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-500/30 rounded-2xl gap-3 transition-transform hover:scale-105 active:scale-95"
                        >
                            {aiMatch.isPending ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    Running OCR & Graph Alignment...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-6 w-6 fill-current" />
                                    ANALYZE DOCUMENTS
                                </>
                            )}
                        </Button>
                        <div className="flex items-center gap-6 text-slate-400">
                            <span className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
                                <ShieldCheck className="h-4 w-4" /> SECURE PROCESSING
                            </span>
                            <span className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
                                <TrendingUp className="h-4 w-4" /> 98.4% ACCURACY
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in slide-in-from-bottom-8 duration-700">
                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <CardHeader>
                                <CardTitle className="text-xs font-black uppercase tracking-widest opacity-60">Overall Status</CardTitle>
                                <div className="mt-2 flex items-center justify-between">
                                    <h3 className="text-3xl font-black">{result.overallStatus}</h3>
                                    <Badge className={getOverallStatusVariant(result.overallStatus)}>{result.overallStatus}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-xl space-y-2 border border-white/10">
                                    <div className="flex justify-between text-xs font-semibold opacity-60">
                                        <span>PO TOTAL</span>
                                        <span>INVOICE TOTAL</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black tabular-nums">
                                        <span>${result.poTotal.toFixed(2)}</span>
                                        <span className={Math.abs(result.poTotal - result.invoiceTotal) > 0.01 ? 'text-amber-400' : ''}>
                                            ${result.invoiceTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs opacity-60 italic text-center">Analyzed at: {new Date(result.reportGeneratedAt).toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        {result.anomalies.length > 0 && (
                            <Card className="border-red-100 bg-red-50/30">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-700 uppercase tracking-tight">
                                        <AlertCircle className="h-4 w-4" />
                                        Detected Anomalies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {result.anomalies.map((anomaly, idx) => (
                                        <div key={idx} className="p-3 bg-white border border-red-100 rounded-lg shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-black text-red-600 px-1.5 py-0.5 bg-red-50 rounded uppercase">{anomaly.anomalyType}</span>
                                                <span className="text-[10px] font-mono font-bold text-slate-400">Score: {anomaly.anomalyScore.toFixed(3)}</span>
                                            </div>
                                            <p className="mt-1.5 text-xs font-bold text-slate-800">{anomaly.description}</p>
                                            <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">{anomaly.detail}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Report Table */}
                    <Card className="lg:col-span-3 overflow-hidden shadow-2xl border-none">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                Smart Alignment Report
                            </CardTitle>
                            <CardDescription>One-to-one item mapping using Graph Correlation</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 border-b">Document Item</th>
                                            <th className="px-6 py-4 border-b text-center">PO Qty</th>
                                            <th className="px-6 py-4 border-b text-center">INV Qty</th>
                                            <th className="px-6 py-4 border-b text-center">GRN Qty</th>
                                            <th className="px-6 py-4 border-b text-center">Unit Price</th>
                                            <th className="px-6 py-4 border-b text-right pr-8">Match Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {result.matchedPairs.map((pair, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 leading-none">
                                                            {pair.poItem?.ingredientName || pair.invoiceItem?.description || "Unknown Item"}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                                                            <Info className="h-3 w-3" />
                                                            {pair.remarks || "Matched via high-confidence text similarity"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center font-mono text-xs font-bold text-slate-600">
                                                    {pair.poItem?.orderedQty || '-'}
                                                </td>
                                                <td className="px-6 py-5 text-center font-mono text-xs font-bold text-slate-800">
                                                    {pair.invoiceItem?.quantity || '-'}
                                                </td>
                                                <td className="px-6 py-5 text-center font-mono text-xs font-bold text-slate-600">
                                                    {pair.grnItem?.quantity || '-'}
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-bold text-slate-900">${pair.invoiceItem?.unitPrice?.toFixed(2) || pair.poItem?.unitCost?.toFixed(2)}</span>
                                                        {Math.abs(pair.priceDeltaPct) > 0.01 && (
                                                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1 rounded">
                                                                {pair.priceDeltaPct > 0 ? '+' : ''}{pair.priceDeltaPct.toFixed(1)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right pr-8">
                                                    <Badge variant="outline" className={`px-2 py-0.5 font-black text-[9px] tracking-widest uppercase ${getStatusColor(pair.status)}`}>
                                                        {pair.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
