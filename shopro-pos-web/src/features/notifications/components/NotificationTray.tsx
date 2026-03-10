import { Bell, X, Check, Trash2, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotifications, type NotificationUser } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function NotificationBadge({ user, onClick }: { user?: NotificationUser; onClick?: () => void }) {
    const { unreadCount } = useNotifications(user);

    return (
        <div
            className="relative cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onClick}
        >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold"
                >
                    {unreadCount}
                </Badge>
            )}
        </div>
    );
}

export function NotificationTray({ open, onClose, user }: { open: boolean; onClose: () => void; user?: NotificationUser }) {
    const { notifications, markAsRead, dismiss } = useNotifications(user);

    if (!open) return null;

    return (
        <div className="absolute right-0 top-14 w-80 max-h-[500px] bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
            {/* Header */}
            <div className="relative p-4 border-b border-white/5 flex items-center justify-between overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Notifications</h3>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose} 
                    className="h-8 w-8 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-hide py-1">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 text-zinc-600">
                             <Bell className="h-6 w-6" />
                        </div>
                        <p className="text-zinc-500 font-medium text-xs">All caught up</p>
                    </div>
                ) : (
                    <div className="px-2 space-y-1">
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden",
                                    !n.isRead ? "bg-white/[0.03] hover:bg-white/[0.06]" : "hover:bg-white/[0.04]"
                                )}
                                onClick={() => markAsRead(n.id)}
                            >
                                {!n.isRead && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                )}
                                
                                <div className="flex gap-4">
                                    <div className="mt-0.5">
                                        <NotificationIcon priority={n.priority} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className={cn(
                                                "text-xs tracking-tight leading-snug",
                                                !n.isRead ? "font-bold text-zinc-100" : "font-medium text-zinc-400"
                                            )}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-zinc-600 font-medium whitespace-nowrap">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-zinc-500 line-clamp-2 pr-6">
                                            {n.message}
                                        </p>
                                        
                                        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                            {!n.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-3 text-[10px] font-bold rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border border-indigo-500/20"
                                                    onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                >
                                                    <Check className="h-3 w-3 mr-1.5" />
                                                    Mark Read
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-red-500/5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20"
                                                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1.5" />
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-white/5 bg-white/[0.01]">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-xl transition-all"
                        onClick={onClose}
                    >
                        Close Tray
                    </Button>
                </div>
            )}
        </div>
    );
}

function NotificationIcon({ priority }: { priority: string }) {
    switch (priority) {
        case 'CRITICAL':
            return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
        case 'HIGH':
            return <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />;
        default:
            return <Info className="h-4 w-4 text-primary shrink-0" />;
    }
}
