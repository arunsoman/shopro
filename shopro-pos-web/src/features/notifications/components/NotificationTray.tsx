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
            className="relative cursor-pointer group"
            onClick={onClick}
        >
            <div className="p-2 rounded-xl transition-all duration-300 group-hover:bg-white/10 group-active:scale-95">
                <Bell className={cn(
                    "h-[22px] w-[22px] transition-colors duration-300",
                    unreadCount > 0 ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-foreground"
                )} />
            </div>
            
            {unreadCount > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute top-1.5 right-1.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center text-[10px] font-black border-2 border-[#180B33] shadow-[0_0_10px_rgba(var(--destructive),0.4)] animate-in zoom-in duration-300"
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
            )}
        </div>
    );
}

export function NotificationTray({ open, onClose, user }: { open: boolean; onClose: () => void; user?: NotificationUser }) {
    const { notifications, markAsRead, dismiss } = useNotifications(user);

    if (!open) return null;

    return (
        <div className="absolute right-0 top-14 w-80 max-h-[500px] bg-surface/98 backdrop-blur-xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
            {/* Header */}
            <div className="relative p-4 border-b border-border flex items-center justify-between overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">Notifications</h3>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose} 
                    className="h-8 w-8 rounded-xl hover:bg-muted/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-hide py-1">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                        <div className="p-3 rounded-2xl bg-muted/20 text-muted-foreground">
                             <Bell className="h-6 w-6" />
                        </div>
                        <p className="text-muted-foreground font-medium text-xs">All caught up</p>
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
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                )}
                                
                                <div className="flex gap-4">
                                    <div className="mt-0.5">
                                        <NotificationIcon priority={n.priority} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className={cn(
                                                "text-xs tracking-tight leading-snug",
                                                !n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                                            )}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 pr-6">
                                            {n.message}
                                        </p>
                                        
                                        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                            {!n.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-3 text-[10px] font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors border border-primary/20"
                                                    onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                >
                                                    <Check className="h-3 w-3 mr-1.5" />
                                                    Mark Read
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-destructive/5 text-muted hover:bg-destructive/10 hover:text-destructive border border-white/5 hover:border-destructive/20 transition-colors"
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
                <div className="p-3 border-t border-border bg-muted/5">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-xl transition-all"
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
