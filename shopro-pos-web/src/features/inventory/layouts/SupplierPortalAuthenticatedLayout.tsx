import { SupplierPortalLayout } from './SupplierPortalLayout';
import { NotificationProvider } from '@/features/notifications/contexts/NotificationContext';

function SupplierNotificationWrapper() {
    // Re-use notification provider for supplier as well if needed, 
    // or just leave SupplierPortalLayout to handle its own if preferred.
    // Based on existing code, SupplierPortalLayout uses NotificationBadge/Tray.
    return (
        <NotificationProvider>
            <div className="pt-[3px] flex flex-col min-h-dvh font-body">
                <SupplierPortalLayout />
            </div>
        </NotificationProvider>
    );
}

export default function SupplierAuthenticatedLayout() {
    return (
        <SupplierNotificationWrapper />
    );
}
