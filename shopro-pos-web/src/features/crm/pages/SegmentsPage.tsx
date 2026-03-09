import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "../api/crmApi";
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
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
import { Plus, Users, Trash2, Filter, Save } from "lucide-react";
import { toast } from "sonner";
import { SegmentResponse, CreateSegmentRequest, SegmentField, SegmentOperator } from "../schema/crmSchema";

export default function SegmentsPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    const { data: segments, isLoading } = useQuery({
        queryKey: ["crm", "segments"],
        queryFn: () => crmApi.getSegments()
    });

    const createSegmentMutation = useMutation({
        mutationFn: (data: CreateSegmentRequest) => crmApi.createSegment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crm", "segments"] });
            setIsCreateOpen(false);
            toast.success("Segment created successfully");
        }
    });

    const deleteSegmentMutation = useMutation({
        mutationFn: (id: string) => crmApi.deleteSegment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crm", "segments"] });
            toast.success("Segment deleted");
        }
    });

    if (isLoading) return <div>Loading segments...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customer Segments</h1>
                    <p className="text-muted-foreground">Define dynamic groups for targeted marketing.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Segment
                        </Button>
                    </DialogTrigger>
                    <SegmentBuilderDialog onSubmit={(data) => createSegmentMutation.mutate(data)} isSubmitting={createSegmentMutation.isPending} />
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {segments?.map((segment) => (
                    <Card key={segment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">{segment.name}</CardTitle>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        if (confirm("Delete this segment?")) deleteSegmentMutation.mutate(segment.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription>{segment.description || "No description provided."}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                    <Filter className="h-3 w-3" /> Targeted Rules
                                </div>
                                {segment.rules.map((rule, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                                        <Badge variant="outline" className="bg-background">{rule.field}</Badge>
                                        <span className="text-muted-foreground font-mono text-xs">{rule.operator.replace(/_/g, " ")}</span>
                                        <span className="font-medium">{rule.ruleValue}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 pt-3 flex justify-between items-center text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> Matching Guests: 
                                <span className="font-semibold text-foreground ml-1">---</span>
                            </div>
                            <span>Active</span>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function SegmentBuilderDialog({ onSubmit, isSubmitting }: { onSubmit: (data: CreateSegmentRequest) => void, isSubmitting: boolean }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState<any[]>([{ field: "TIER", operator: "EQUALS", ruleValue: "" }]);

    const addRule = () => setRules([...rules, { field: "LTV", operator: "GREATER_THAN", ruleValue: "" }]);
    const removeRule = (idx: number) => setRules(rules.filter((_, i) => i !== idx));
    const updateRule = (idx: number, field: string, value: string) => {
        const newRules = [...rules];
        newRules[idx][field] = value;
        setRules(newRules);
    };

    const handleSave = () => {
        if (!name) return toast.error("Name is required");
        if (rules.some(r => !r.ruleValue)) return toast.error("All rules must have a value");
        onSubmit({ name, description, rules });
    };

    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Create Segment</DialogTitle>
                <DialogDescription>
                    Define the criteria that customers must meet to be part of this group.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Segment Name</label>
                    <Input placeholder="e.g., VIP High Spenders" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Input placeholder="e.g., Lifetime spend > $1000" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Rule Builder
                        </h4>
                        <Button variant="outline" size="sm" onClick={addRule}>
                            Add Rule
                        </Button>
                    </div>
                    
                    {rules.map((rule, idx) => (
                        <div key={idx} className="flex gap-2 items-end bg-muted/30 p-3 rounded-lg border border-border/50">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground px-1">Field</label>
                                <Select value={rule.field} onValueChange={(v) => updateRule(idx, "field", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LTV">Lifetime Value</SelectItem>
                                        <SelectItem value="TIER">Loyalty Tier</SelectItem>
                                        <SelectItem value="VISIT_COUNT">Visit Count</SelectItem>
                                        <SelectItem value="TAG">Dietary Tag</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground px-1">Condition</label>
                                <Select value={rule.operator} onValueChange={(v) => updateRule(idx, "operator", v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EQUALS">Is</SelectItem>
                                        <SelectItem value="GREATER_THAN">Greater Than</SelectItem>
                                        <SelectItem value="LESS_THAN">Less Than</SelectItem>
                                        <SelectItem value="IN">In List</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-[1.5] space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-muted-foreground px-1">Value</label>
                                <Input 
                                    placeholder="Enter value..." 
                                    value={rule.ruleValue} 
                                    onChange={(e) => updateRule(idx, "ruleValue", e.target.value)} 
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="mb-[1px] text-muted-foreground"
                                onClick={() => removeRule(idx)}
                                disabled={rules.length === 1}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => (window as any).isCreateOpen = false}>Cancel</Button>
                <Button className="gap-2" onClick={handleSave} disabled={isSubmitting}>
                    <Save className="h-4 w-4" /> {isSubmitting ? "Creating..." : "Save Segment"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
