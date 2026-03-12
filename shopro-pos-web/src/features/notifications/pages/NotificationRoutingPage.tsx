import React, { useState, useEffect } from 'react';
import { Network, Search, Save, Check, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '../../../lib/api/client';

interface NotificationType {
    code: string;
    name: string;
}

interface RecipientGroup {
    id: string;
    name: string;
    roleCode: string;
}

interface Channel {
    id: string;
    type: string;
    name: string;
}

interface RoutingMatrixData {
    types: NotificationType[];
    groups: RecipientGroup[];
    channels: Channel[];
    matrix: Record<string, Record<string, string[]>>;
}

export function NotificationRoutingPage() {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [data, setData] = useState<RoutingMatrixData | null>(null);
    const [matrix, setMatrix] = useState<Record<string, Record<string, string[]>>>({});
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMatrix();
    }, []);

    const fetchMatrix = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<RoutingMatrixData>('/notification-admin/routing-matrix');
            setData(response.data);
            setMatrix(response.data.matrix || {});
            setIsDirty(false);
        } catch (error) {
            console.error('Failed to fetch routing matrix:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleChannel = (typeCode: string, groupRole: string, channelType: string) => {
        setMatrix(prev => {
            const currentTypeRules = prev[typeCode] || {};
            const currentGroupChannels = currentTypeRules[groupRole] || [];
            
            const newGroupChannels = currentGroupChannels.includes(channelType)
                ? currentGroupChannels.filter(c => c !== channelType)
                : [...currentGroupChannels, channelType];
                
            return {
                ...prev,
                [typeCode]: {
                    ...currentTypeRules,
                    [groupRole]: newGroupChannels
                }
            };
        });
        setIsDirty(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await apiClient.post('/notification-admin/routing-matrix', matrix);
            setIsDirty(false);
        } catch (error) {
            console.error('Failed to save routing matrix:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return null;

    const filteredTypes = data.types.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) || 
        t.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 flex flex-col h-full bg-background relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
                        <Network className="h-6 w-6 text-primary" />
                        Routing Matrix
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Map Recipient Groups to Delivery Channels by Event Type.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty || saving}
                    className={clsx(
                        "px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2",
                        isDirty && !saving
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-surface border border-border text-muted-foreground cursor-not-allowed"
                    )}
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border bg-muted/5 flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search event types..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground ml-auto">
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
                                {data.groups.map(group => (
                                    <th key={group.id} className="px-6 py-4 font-medium border-b border-border text-center bg-muted/5" colSpan={data.channels.length}>
                                        <div className="flex flex-col items-center">
                                            <span className="text-foreground">{group.name}</span>
                                            <span className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">{group.roleCode}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="px-6 py-2 border-b border-r border-border min-w-[200px] z-20 bg-muted/5 sticky left-0"></th>
                                {data.groups.map(group => (
                                    <React.Fragment key={`ch-${group.id}`}>
                                        {data.channels.map((ch, idx) => (
                                            <th key={`${group.id}-${ch.id}`} className={clsx("py-2 px-3 text-[10px] font-semibold text-muted-foreground text-center border-b border-border tracking-wider", idx === data.channels.length - 1 && "border-r border-border")}>
                                                {ch.type.replace('_', ' ')}
                                            </th>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTypes.map((type) => (
                                <tr key={type.code} className="hover:bg-muted/5 transition-colors group">
                                    <td className="px-6 py-4 border-r border-border bg-surface sticky left-0 z-10 group-hover:bg-muted/5 transition-colors border-b">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{type.name}</span>
                                            <span className="text-[10px] font-mono text-muted-foreground tracking-wider mt-0.5">{type.code}</span>
                                        </div>
                                    </td>

                                    {data.groups.map(group => (
                                        <React.Fragment key={`cell-${type.code}-${group.id}`}>
                                            {data.channels.map((channel, idx) => {
                                                const isEnabled = matrix[type.code]?.[group.roleCode]?.includes(channel.type) || false;
                                                return (
                                                    <td
                                                        key={`${type.code}-${group.id}-${channel.id}`}
                                                        className={clsx(
                                                            "text-center py-4 px-3 border-b border-border",
                                                            idx === data.channels.length - 1 && "border-r border-border"
                                                        )}
                                                    >
                                                        <button
                                                            onClick={() => toggleChannel(type.code, group.roleCode, channel.type)}
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
