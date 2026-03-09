import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "../api/crmApi";
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Ticket, Trash2, Calendar, Target, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PromoCodeResponse, CreatePromoCodeRequest, DiscountType } from "../schema/crmSchema";
import { format } from "date-fns";

export default function PromoCodesPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    const { data: promos, isLoading } = useQuery({
        queryKey: ["crm", "promos"],
        queryFn: () => crmApi.getPromoCodes()
    });

    const { data: segments } = useQuery({
        queryKey: ["crm", "segments"],
        queryFn: () => crmApi.getSegments()
    });

    const createPromoMutation = useMutation({
        mutationFn: (data: CreatePromoCodeRequest) => crmApi.createPromoCode(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crm", "promos"] });
            setIsCreateOpen(false);
            toast.success("Promo code created");
        }
    });

    const deletePromoMutation = useMutation({
        mutationFn: (id: string) => crmApi.deletePromoCode(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crm", "promos"] });
            toast.success("Promo code deleted");
        }
    });

    if (isLoading) return <div>Loading promos...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
                    <p className="text-muted-foreground">Manage discounts and seasonal offers.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Promo Code
                        </Button>
                    </DialogTrigger>
                    <PromoBuilderDialog 
                        segments={segments || []} 
                        onSubmit={(data) => createPromoMutation.mutate(data)} 
                        isSubmitting={createPromoMutation.isPending} 
                    />
                </Dialog>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Targeting</TableHead>
                            <TableHead>Validity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {promos?.map((promo) => (
                            <TableRow key={promo.id}>
                                <TableCell className="font-bold font-mono">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="h-4 w-4 text-primary" />
                                        {promo.code}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">
                                        {promo.currentUses} / {promo.maxUses || "∞"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {promo.segmentId ? (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Target className="h-3 w-3" />
                                            {segments?.find(s => s.id === promo.segmentId)?.name || "Segment"}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">All Customers</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {promo.validUntil ? format(new Date(promo.validUntil), "MMM dd, yyyy") : "No expiry"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={promo.isActive ? "success" : "destructive"}>
                                        {promo.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            if (confirm("Delete this promo?")) deletePromoMutation.mutate(promo.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function PromoBuilderDialog({ segments, onSubmit, isSubmitting }: { segments: any[], onSubmit: (data: CreatePromoCodeRequest) => void, isSubmitting: boolean }) {
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
    const [discountValue, setDiscountValue] = useState("");
    const [maxUses, setMaxUses] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [segmentId, setSegmentId] = useState("all");

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setCode(result);
    };

    const handleSave = () => {
        if (!code || !discountValue) return toast.error("Missing required fields");
        onSubmit({
            code,
            description,
            discountType,
            discountValue: parseFloat(discountValue),
            maxUses: maxUses ? parseInt(maxUses) : undefined,
            validUntil: validUntil || undefined,
            segmentId: segmentId === "all" ? undefined : segmentId,
        });
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>New Promo Code</DialogTitle>
                <DialogDescription>Create a discount code for your customers.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Promo Code</label>
                        <Input placeholder="HOLIDAY20" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
                    </div>
                    <Button variant="outline" className="mt-8 flex gap-2" size="sm" onClick={generateCode}>
                        <RefreshCw className="h-3 w-3" /> Auto
                    </Button>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select value={discountType} onValueChange={(v: DiscountType) => setDiscountType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                <SelectItem value="FIXED_AMOUNT">Fixed Amount ($)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Value</label>
                        <Input type="number" placeholder="20" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium flex gap-2 items-center">
                        <Target className="h-4 w-4" /> Guest Targeting
                    </label>
                    <Select value={segmentId} onValueChange={setSegmentId}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Guests</SelectItem>
                            {segments.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium flex gap-2 items-center">
                            <Ticket className="h-4 w-4" /> Usage Limit
                        </label>
                        <Input type="number" placeholder="Optional" value={maxUses} onChange={e => setMaxUses(e.target.value)} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium flex gap-2 items-center">
                            <Calendar className="h-4 w-4" /> Valid Until
                        </label>
                        <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button className="w-full" onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Save Promo Code"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
