import { useState } from 'react';
import { Key, Mail, MessageSquare, Smartphone, Bell, Save, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const CHANNELS = [
    {
        id: 'c1',
        type: 'IN_APP',
        name: 'In-App WebSockets',
        icon: Bell,
        description: 'Real-time WebSocket notifications directly within the Shopro POS application.',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        isActive: true,
        config: { wsEndpoint: 'wss://api.shopro.com/stomp', fallbackPolling: 'true' }
    },
    {
        id: 'c2',
        type: 'EMAIL',
        name: 'SMTP Email Service',
        icon: Mail,
        description: 'Asynchronous email delivery (SendGrid integration). Required for critical off-schedule alerts.',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        isActive: true,
        config: { host: 'smtp.sendgrid.net', port: '587', username: 'apikey', fromAddress: 'alerts@shopro.com' }
    },
    {
        id: 'c3',
        type: 'PUSH',
        name: 'Firebase Cloud Messaging (FCM)',
        icon: Smartphone,
        description: 'Native push notifications for iOS and Android mobile POS clients.',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        isActive: false,
        config: { projectId: 'shopro-pos-mobile', senderId: '' }
    },
    {
        id: 'c4',
        type: 'WHATSAPP',
        name: 'WhatsApp Business API',
        icon: MessageSquare,
        description: 'Direct messages to staff/customers via WhatsApp.',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-600/10',
        isActive: false,
        config: { phoneNumberId: '', accessToken: '' }
    }
];

export function NotificationChannelsPage() {
    const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
    const [configValues, setConfigValues] = useState<Record<string, string>>(CHANNELS[0].config as unknown as Record<string, string>);

    const handleSelect = (channel: typeof CHANNELS[0]) => {
        setSelectedChannel(channel);
        setConfigValues(channel.config as unknown as Record<string, string>);
    };

    return (
        <div className="p-8 flex flex-col h-full bg-background relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
                        <Key className="h-6 w-6 text-primary" />
                        Delivery Channels
                    </h1>
                    <p className="text-muted text-sm mt-1">Configure integrations and credentials for external delivery pathways.</p>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Left Sidebar: Channel List */}
                <div className="w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 pb-4">
                    {CHANNELS.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => handleSelect(channel)}
                            className={clsx(
                                "p-4 rounded-xl border text-left transition-all",
                                selectedChannel.id === channel.id
                                    ? "bg-primary/5 border-primary shadow-sm"
                                    : "bg-surface border-border hover:border-primary/50 hover:bg-surface/80"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx("p-2 rounded-lg", channel.bgColor)}>
                                    <channel.icon size={20} className={channel.color} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground text-sm">{channel.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={clsx("h-1.5 w-1.5 rounded-full", channel.isActive ? "bg-emerald-500" : "bg-muted")} />
                                        <span className="text-[10px] text-muted font-medium uppercase tracking-wider">{channel.type}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Right Pane: Config Editor */}
                <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/5">
                        <div className="flex items-center gap-4">
                            <div className={clsx("p-3 rounded-xl", selectedChannel.bgColor)}>
                                <selectedChannel.icon size={28} className={selectedChannel.color} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold font-heading text-foreground">{selectedChannel.name}</h2>
                                <p className="text-sm text-muted mt-1">{selectedChannel.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6 bg-muted/5 p-4 rounded-lg border border-border">
                            <div>
                                <h3 className="font-semibold text-foreground text-sm">Channel Status</h3>
                                <p className="text-xs text-muted mt-0.5">Enable or disable this channel globally.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked={selectedChannel.isActive} />
                                <div className="w-11 h-6 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Key size={14} /> Connection Credentials
                        </h3>

                        <div className="space-y-4">
                            {Object.keys(selectedChannel.config).map((key) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-foreground mb-1.5 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    <input
                                        type={key.toLowerCase().includes('password') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                                        value={configValues[key] || ''}
                                        onChange={e => setConfigValues(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            ))}

                            {Object.keys(selectedChannel.config).length === 0 && (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 text-blue-500">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p className="text-sm">This channel does not require manual credential configuration.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-border bg-muted/5 flex items-center justify-end">
                        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center gap-2">
                            <Save size={16} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
