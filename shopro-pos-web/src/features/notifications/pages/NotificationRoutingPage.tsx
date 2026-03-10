import React, { useState } from 'react';
import { Network, Search, Save, Check, X } from 'lucide-react';
import { clsx } from 'clsx';

const CHANNELS = ['IN_APP', 'EMAIL', 'PUSH'];

// Mocked Groups & Routing Rules
const MOCK_GROUPS = [
    { id: 'g1', name: 'General Manager', role: 'ADMIN' },
    { id: 'g2', name: 'Floor Managers', role: 'MANAGER' },
    { id: 'g3', name: 'Waitstaff & Runners', role: 'SERVER' },
    { id: 'g4', name: 'Kitchen & BOH', role: 'CHEF' },
    { id: 'g5', name: 'Purchasing', role: 'ADMIN' },
];

const MOCK_TYPES = [
    { id: 't1', code: 'STOCK_CRITICAL', name: 'Critical Stock Alert' },
    { id: 't2', code: 'PO_APPROVAL_REQUIRED', name: 'PO Approval Required' },
    { id: 't3', code: 'BID_RECEIVED', name: 'Vendor Bid Received' },
    { id: 't4', code: 'SYSTEM_WARNING', name: 'System / Hardware Warning' },
    { id: 't5', code: 'ORDER_READY', name: 'Order Ready for Pickup' },
    { id: 't6', code: 'ITEM_REJECTED', name: 'Kitchen 86\'d Item' },
    { id: 't7', code: 'ASSISTANCE_NEEDED', name: 'Customer Assistance Needed' },
    { id: 't8', code: 'TABLE_DIRTY', name: 'Table Needs Bussing' },
    { id: 't9', code: 'VOID_REQUEST', name: 'Void Approval Request' },
    { id: 't10', code: 'CURBSIDE_ARRIVAL', name: 'Curbside Arrival' },
    { id: 't11', code: 'SHRINKAGE_ALERT', name: 'High Variance Alert' },
    { id: 't12', code: 'OVERTIME_WARNING', name: 'Approaching Overtime' },
    { id: 't13', code: 'VIP_GUEST_SEATED', name: 'VIP Guest Seated' },
];

// Matrix format: [typeId][groupId] = ['IN_APP', 'EMAIL']
const MOCK_MATRIX: Record<string, Record<string, string[]>> = {
    t1: { g1: ['EMAIL'], g4: ['IN_APP'], g5: ['IN_APP', 'EMAIL'] },
    t2: { g1: ['IN_APP', 'EMAIL', 'PUSH'], g2: ['IN_APP'] },
    t3: { g5: ['IN_APP', 'EMAIL'] },
    t4: { g1: ['EMAIL', 'PUSH'], g2: ['IN_APP', 'PUSH'] },
    t5: { g2: ['IN_APP'], g3: ['IN_APP', 'PUSH'] },
    t6: { g2: ['IN_APP'], g3: ['IN_APP', 'PUSH'] },
    t7: { g2: ['IN_APP'], g3: ['IN_APP'] },
    t8: { g2: ['IN_APP'], g3: ['IN_APP'] },
    t9: { g1: ['IN_APP'], g2: ['IN_APP', 'PUSH'] },
    t10: { g2: ['IN_APP'], g3: ['IN_APP', 'PUSH'] },
    t11: { g1: ['IN_APP', 'EMAIL', 'PUSH'], g5: ['IN_APP', 'EMAIL'] },
    t12: { g1: ['EMAIL'], g2: ['IN_APP', 'EMAIL'] },
    t13: { g1: ['IN_APP', 'PUSH'], g2: ['IN_APP', 'PUSH'], g3: ['IN_APP'] },
};

export function NotificationRoutingPage() {
    const [search, setSearch] = useState('');
    const [matrix, setMatrix] = useState(MOCK_MATRIX);
    const [isDirty, setIsDirty] = useState(false);

    const toggleChannel = (typeId: string, groupId: string, channel: string) => {
        setMatrix(prev => {
            const next = { ...prev };
            if (!next[typeId]) next[typeId] = {};
            if (!next[typeId][groupId]) next[typeId][groupId] = [];

            const channels = next[typeId][groupId];
            if (channels.includes(channel)) {
                next[typeId][groupId] = channels.filter(c => c !== channel);
            } else {
                next[typeId][groupId] = [...channels, channel];
            }
            return next;
        });
        setIsDirty(true);
    };

    const handleSave = () => {
        setIsDirty(false);
        // Submit update to API
    };

    return (
        <div className="p-8 flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
                        <Network className="h-6 w-6 text-primary" />
                        Routing Matrix
                    </h1>
                    <p className="text-muted text-sm mt-1">Map Recipient Groups to Delivery Channels by Event Type.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={clsx(
                        "px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2",
                        isDirty
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-surface border border-border text-muted cursor-not-allowed"
                    )}
                >
                    <Save size={16} />
                    Save Changes
                </button>
            </div>

            <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border bg-muted/5 flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search event types..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted ml-auto">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500"><Check size={10} /></div> Enabled</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-background border border-border flex items-center justify-center text-muted/30"><X size={10} /></div> Disabled</div>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 p-0 m-0">
                    <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                        <thead className="bg-muted/5 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 font-medium border-b border-r border-border min-w-[200px] z-20 bg-muted/5 sticky left-0 text-foreground">
                                    Event Type
                                </th>
                                {MOCK_GROUPS.map(group => (
                                    <th key={group.id} className="px-6 py-4 font-medium border-b border-border text-center bg-muted/5" colSpan={CHANNELS.length}>
                                        <div className="flex flex-col items-center">
                                            <span className="text-foreground">{group.name}</span>
                                            <span className="text-[10px] font-mono text-muted mt-1 uppercase tracking-widest">{group.role}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="px-6 py-2 border-b border-r border-border min-w-[200px] z-20 bg-muted/5 sticky left-0"></th>
                                {MOCK_GROUPS.map(group => (
                                    <React.Fragment key={`ch-${group.id}`}>
                                        {CHANNELS.map((ch, idx) => (
                                            <th key={`${group.id}-${ch}`} className={clsx("py-2 px-3 text-[10px] font-semibold text-muted text-center border-b border-border tracking-wider", idx === CHANNELS.length - 1 && "border-r border-border")}>
                                                {ch.replace('_', ' ')}
                                            </th>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_TYPES.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase())).map((type) => (
                                <tr key={type.id} className="hover:bg-muted/5 transition-colors">
                                    <td className="px-6 py-4 border-r border-border bg-surface sticky left-0 z-10 group-hover:bg-muted/5 transition-colors border-b">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{type.name}</span>
                                            <span className="text-[10px] font-mono text-muted tracking-wider mt-0.5">{type.code}</span>
                                        </div>
                                    </td>

                                    {MOCK_GROUPS.map(group => (
                                        <React.Fragment key={`cell-${type.id}-${group.id}`}>
                                            {CHANNELS.map((channel, idx) => {
                                                const isEnabled = matrix[type.id]?.[group.id]?.includes(channel) || false;
                                                return (
                                                    <td
                                                        key={`${type.id}-${group.id}-${channel}`}
                                                        className={clsx(
                                                            "text-center py-4 px-3 border-b border-border",
                                                            idx === CHANNELS.length - 1 && "border-r border-border"
                                                        )}
                                                    >
                                                        <button
                                                            onClick={() => toggleChannel(type.id, group.id, channel)}
                                                            className={clsx(
                                                                "w-6 h-6 rounded-md flex items-center justify-center transition-all mx-auto active:scale-90",
                                                                isEnabled
                                                                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20"
                                                                    : "bg-surface border border-border text-muted/30 hover:border-muted hover:text-muted"
                                                            )}
                                                        >
                                                            {isEnabled ? <Check size={14} className="stroke-[3]" /> : <X size={14} />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
