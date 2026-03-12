import { useState } from 'react';
import { FileText, Search, Filter, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const MOCK_LOGS = [
    { id: 'log_90192', timestamp: new Date(Date.now() - 1000 * 60 * 2), type: 'PO_APPROVAL', recipient: 'manager@shopro.com', channel: 'EMAIL', status: 'SENT', attempts: 1, error: null },
    { id: 'log_90193', timestamp: new Date(Date.now() - 1000 * 60 * 5), type: 'STOCK_CRITICAL', recipient: 'kitchen_display_1', channel: 'IN_APP', status: 'SENT', attempts: 1, error: null },
    { id: 'log_90194', timestamp: new Date(Date.now() - 1000 * 60 * 15), type: 'SYSTEM_WARNING', recipient: 'owner@shopro.com', channel: 'SMS', status: 'FAILED', attempts: 3, error: 'Twilio 400: Invalid phone number' },
    { id: 'log_90195', timestamp: new Date(Date.now() - 1000 * 60 * 60), type: 'VOID_REQUEST', recipient: 'Manager App', channel: 'PUSH', status: 'SENT', attempts: 1, error: null },
];

export function NotificationLogsPage() {
    const [search, setSearch] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <div className="p-8 flex flex-col h-full bg-background relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Delivery Logs
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Real-time stream of all dispatched notifications, including delivery failures.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="bg-surface border border-border text-foreground hover:bg-muted/5 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2"
                >
                    <RefreshCw size={16} className={clsx(isRefreshing && "animate-spin text-primary")} />
                    Refresh
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Dispatch ID, Recipient, or Event Type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/10 transition-colors">
                    <Filter size={16} className="text-muted-foreground" />
                    Status: All
                </button>
            </div>

            <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-muted/5 border-b border-border text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-medium">Timestamp</th>
                                <th className="px-6 py-4 font-medium">Dispatch ID</th>
                                <th className="px-6 py-4 font-medium">Event Type</th>
                                <th className="px-6 py-4 font-medium">Recipient</th>
                                <th className="px-6 py-4 font-medium">Channel</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Attempts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_LOGS.filter(l => l.recipient.includes(search) || l.id.includes(search) || l.type.includes(search)).map((log) => (
                                <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                        {format(log.timestamp, 'MMM d, yyyy HH:mm:ss')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-muted/10 text-muted-foreground px-2 py-1 rounded border border-border/50">
                                            {log.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {log.type}
                                    </td>
                                    <td className="px-6 py-4 text-foreground">
                                        {log.recipient}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-surface border border-border px-1.5 py-0.5 rounded">
                                            {log.channel.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {log.status === 'SENT' ? (
                                                <><CheckCircle2 size={16} className="text-emerald-500" /><span className="text-emerald-500 font-medium text-xs">Delivered</span></>
                                            ) : (
                                                <div className="flex flex-col group relative">
                                                    <div className="flex items-center gap-1.5">
                                                        <AlertCircle size={16} className="text-rose-500" /><span className="text-rose-500 font-medium text-xs">Failed</span>
                                                    </div>
                                                    {log.error && (
                                                        <span className="absolute left-0 bottom-full mb-1 min-w-[200px] bg-foreground text-background text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                            {log.error}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground tabular-nums">
                                        {log.attempts}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
