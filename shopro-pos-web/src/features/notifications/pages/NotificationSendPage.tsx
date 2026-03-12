import React, { useState, useEffect } from 'react';
import { Send, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { notificationApi } from '../api/notificationApi';

interface NotificationType {
    id: string;
    code: string;
    name: string;
    description: string;
}

export function NotificationSendPage() {
    const [types, setTypes] = useState<NotificationType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [formData, setFormData] = useState({
        typeCode: 'SYSTEM_WARNING',
        recipientId: '',
        recipientGroup: 'BROADCAST',
        payload: '{\n  "message": "Manual test notification",\n  "severity": "high"\n}'
    });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await notificationApi.getNotificationTypes();
                setTypes(response.data);
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, typeCode: response.data[0].code }));
                }
            } catch (error) {
                console.error('Failed to fetch types:', error);
                toast.error('Failed to load notification types');
            } finally {
                setIsLoadingTypes(false);
            }
        };
        fetchTypes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const request: any = {
                typeCode: formData.typeCode,
                payload: formData.payload
            };

            if (formData.recipientGroup === 'SPECIFIC') {
                request.recipientId = formData.recipientId;
            } else if (formData.recipientGroup !== 'DEFAULT') {
                request.recipientGroup = formData.recipientGroup;
            }
            // If recipientGroup is 'DEFAULT', we send neither recipientId nor recipientGroup

            await notificationApi.dispatchNotification(request);
            toast.success('Notification dispatched successfully');
        } catch (error) {
            console.error('Dispatch failed:', error);
            toast.error('Failed to dispatch notification');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-8 flex flex-col items-center bg-background min-h-full">
            <div className="w-full max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
                        <Send className="h-6 w-6 text-primary" />
                        Manual Dispatch
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Trigger a test notification, emergency broadcast, or manual alert directly from the engine.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl shadow-sm p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Event Type Code</label>
                            <select
                                value={formData.typeCode}
                                onChange={e => setFormData(prev => ({ ...prev, typeCode: e.target.value }))}
                                disabled={isLoadingTypes}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {isLoadingTypes ? (
                                    <option>Loading types...</option>
                                ) : (
                                    types.map(type => (
                                        <option key={type.id} value={type.code}>
                                            {type.code} ({type.name})
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Delivery Target</label>
                            <select
                                value={formData.recipientGroup}
                                onChange={e => setFormData(prev => ({ ...prev, recipientGroup: e.target.value }))}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="DEFAULT">System Default (Use Routing Rules)</option>
                                <option value="BROADCAST">Broadcast: Everyone</option>
                                <option value="MANAGERS">Group: All Managers</option>
                                <option value="SERVERS">Group: All Servers</option>
                                <option value="SPECIFIC">Specific User (Provide ID below)</option>
                            </select>
                        </div>
                    </div>

                    {formData.recipientGroup === 'SPECIFIC' && (
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target User ID</label>
                            <input
                                type="text"
                                placeholder="UUID of target recipient"
                                value={formData.recipientId}
                                onChange={e => setFormData(prev => ({ ...prev, recipientId: e.target.value }))}
                                required
                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Terminal size={14} /> Payload Data (JSON)
                        </label>
                        <textarea
                            rows={6}
                            value={formData.payload}
                            onChange={e => setFormData(prev => ({ ...prev, payload: e.target.value }))}
                            className="w-full bg-muted/10 border border-border rounded-lg px-4 py-3 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-muted-foreground mt-2">This data will be injected into the Handlebars template for the chosen Event Type.</p>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                        <button
                            type="submit"
                            disabled={isSending}
                            className={clsx(
                                "px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2",
                                isSending
                                    ? "bg-primary/50 text-white cursor-not-allowed"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                        >
                            <Send size={16} className={clsx(isSending && "animate-pulse")} />
                            {isSending ? 'Dispatching...' : 'Dispatch Notification'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
