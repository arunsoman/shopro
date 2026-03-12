import { useState } from 'react';
import { Plus, Search, Filter, Edit2, BellRing, Settings2, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';

interface NotificationType {
    id: string;
    code: string;
    name: string;
    category: string;
    severity: string;
    isActive: boolean;
    channels: string[];
}

// MOCKED DATA FOR RECORDING
const MOCK_TYPES: NotificationType[] = [
    { id: '1', code: 'STOCK_CRITICAL', name: 'Critical Stock Alert', category: 'INVENTORY', severity: 'CRITICAL', isActive: true, channels: ['IN_APP', 'EMAIL'] },
    { id: '2', code: 'PO_APPROVAL_REQUIRED', name: 'PO Approval Required', category: 'PURCHASING', severity: 'WARNING', isActive: true, channels: ['IN_APP', 'EMAIL', 'PUSH'] },
    { id: '3', code: 'BID_RECEIVED', name: 'Vendor Bid Received', category: 'PURCHASING', severity: 'INFO', isActive: true, channels: ['IN_APP', 'EMAIL'] },
    { id: '4', code: 'SYSTEM_WARNING', name: 'System / Hardware Warning', category: 'SYSTEM', severity: 'WARNING', isActive: true, channels: ['IN_APP', 'EMAIL', 'PUSH'] },
    { id: '5', code: 'ORDER_READY', name: 'Order Ready for Pickup', category: 'FLOOR', severity: 'INFO', isActive: true, channels: ['IN_APP', 'PUSH'] },
    { id: '6', code: 'ITEM_REJECTED', name: 'Kitchen 86\'d Item', category: 'KDS', severity: 'WARNING', isActive: true, channels: ['IN_APP', 'PUSH'] },
    { id: '7', code: 'ASSISTANCE_NEEDED', name: 'Customer Assistance Needed', category: 'FLOOR', severity: 'WARNING', isActive: true, channels: ['IN_APP'] },
    { id: '8', code: 'TABLE_DIRTY', name: 'Table Needs Bussing', category: 'FLOOR', severity: 'INFO', isActive: true, channels: ['IN_APP'] },
    { id: '9', code: 'VOID_REQUEST', name: 'Void Approval Request', category: 'FLOOR', severity: 'WARNING', isActive: true, channels: ['IN_APP', 'PUSH'] },
    { id: '10', code: 'CURBSIDE_ARRIVAL', name: 'Curbside Arrival', category: 'FLOOR', severity: 'INFO', isActive: true, channels: ['IN_APP', 'PUSH'] },
    { id: '11', code: 'SHRINKAGE_ALERT', name: 'High Variance Alert', category: 'INVENTORY', severity: 'CRITICAL', isActive: true, channels: ['IN_APP', 'EMAIL', 'PUSH'] },
    { id: '12', code: 'OVERTIME_WARNING', name: 'Approaching Overtime', category: 'SYSTEM', severity: 'WARNING', isActive: true, channels: ['IN_APP', 'EMAIL'] },
    { id: '13', code: 'VIP_GUEST_SEATED', name: 'VIP Guest Seated', category: 'FLOOR', severity: 'INFO', isActive: true, channels: ['IN_APP', 'PUSH'] },
];

const SEVERITY_COLORS: Record<string, string> = {
    INFO: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    WARNING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    CRITICAL: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const CATEGORY_COLORS: Record<string, string> = {
    SYSTEM: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    INVENTORY: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    PURCHASING: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    KDS: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    FLOOR: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
};

export function NotificationTypesPage() {
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<any | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const handleEdit = (type: any) => {
        setSelectedType(type);
        setIsEditorOpen(true);
    };

    const handleCreate = () => {
        setSelectedType(null);
        setIsEditorOpen(true);
    };

    const filteredTypes = MOCK_TYPES.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
                        <BellRing className="h-6 w-6 text-primary" />
                        Notification Types
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Configure system event types, severity levels, and their base templates.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
                >
                    <Plus size={16} />
                    Create Type
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search triggers by code or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/10 transition-colors">
                    <Filter size={16} className="text-muted-foreground" />
                    More Filters
                </button>
            </div>

            {/* Data Table */}
            <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-muted/5 border-b border-border text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-medium">Trigger Code</th>
                                <th className="px-6 py-4 font-medium">Name & Category</th>
                                <th className="px-6 py-4 font-medium">Severity</th>
                                <th className="px-6 py-4 font-medium">Delivery Channels (Base)</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <code className="text-xs font-mono bg-muted/10 text-muted-foreground px-2 py-1 rounded border border-border/50">
                                            {type.code}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{type.name}</span>
                                            <span className={clsx("text-[10px] font-bold tracking-wider uppercase w-fit px-1.5 py-0.5 rounded border mt-1", CATEGORY_COLORS[type.category])}>
                                                {type.category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx("text-xs font-medium px-2 py-1 rounded-full border", SEVERITY_COLORS[type.severity])}>
                                            {type.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {type.channels.map(ch => (
                                                <span key={ch} className="text-[10px] font-semibold bg-surface border border-border text-muted-foreground px-1.5 py-0.5 rounded">
                                                    {ch.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={clsx("h-2 w-2 rounded-full", type.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted")} />
                                            <span className={type.isActive ? "text-foreground font-medium" : "text-muted-foreground"}>
                                                {type.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(type)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Edit Template">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Settings">
                                                <Settings2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTypes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No notification types found matching "{search}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Editor Side Sheet Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
                    isEditorOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsEditorOpen(false)}
            />

            {/* Editor Side Sheet */}
            <div
                className={clsx(
                    "fixed top-0 bottom-0 right-0 w-[500px] bg-surface border-l border-border z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isEditorOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-lg font-heading font-bold text-foreground">
                        {selectedType ? 'Edit Notification Template' : 'Create New Type'}
                    </h2>
                    <button onClick={() => setIsEditorOpen(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Trigger Code</label>
                            <input type="text" defaultValue={selectedType?.code} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" placeholder="e.g. USER_SIGNED_UP" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Name</label>
                                <input type="text" defaultValue={selectedType?.name} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Display Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
                                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                                    <option>SYSTEM</option>
                                    <option>INVENTORY</option>
                                    <option>PURCHASING</option>
                                    <option>FLOOR</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Severity</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="severity" defaultChecked={selectedType?.severity === 'INFO'} className="text-blue-500 focus:ring-blue-500" />
                                    <span className="text-sm font-medium">Info</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="severity" defaultChecked={selectedType?.severity === 'WARNING'} className="text-amber-500 focus:ring-amber-500" />
                                    <span className="text-sm font-medium">Warning</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="severity" defaultChecked={selectedType?.severity === 'CRITICAL'} className="text-rose-500 focus:ring-rose-500" />
                                    <span className="text-sm font-medium">Critical</span>
                                </label>
                            </div>
                        </div>

                        <hr className="border-border my-2" />

                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Base Template (English)</label>
                            <div className="space-y-3 bg-muted/5 border border-border rounded-lg p-4">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Subject / Notification Title</label>
                                    <input type="text" defaultValue={selectedType ? `Alert: ${selectedType.name}` : ''} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Message Body (Supports Handlebars &#123;&#123;vars&#125;&#125;)</label>
                                    <textarea rows={4} defaultValue={selectedType ? `Please review the ${selectedType.name.toLowerCase()} that was triggered on {{date}}.` : ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 font-mono text-xs" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="p-6 border-t border-border bg-muted/5 flex items-center justify-end gap-3">
                    <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => setIsEditorOpen(false)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95">
                        Save Template
                    </button>
                </div>
            </div>
        </div>
    );
}
