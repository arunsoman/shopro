import { NotificationProvider } from '@/features/notifications/contexts/NotificationContext';
import { AppShell } from './AppShell';

export default function AuthenticatedLayout() {
    return (
        <NotificationProvider>
            <div className="pt-[3px] flex flex-col min-h-dvh">
                <AppShell />
            </div>
        </NotificationProvider>
    );
}
