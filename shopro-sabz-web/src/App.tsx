import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

// Auth & Providers
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';

// Initialize Theme
import './index.css';

// Lazy loaded pages
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MenuPage = lazy(() => import('./pages/MenuPage').then(m => ({ default: m.MenuPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const CallbackPage = lazy(() => import('./pages/CallbackPage').then(m => ({ default: m.CallbackPage })));

const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { session } = useAuth();
    if (!session) {
        return <Navigate to="/register" replace />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster 
                    position="top-right" 
                    closeButton 
                    toastOptions={{
                        style: {
                            fontFamily: "'Syne', sans-serif",
                        }
                    }}
                />
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/callback" element={<CallbackPage />} />
                        <Route path="/order/:id/confirmation" element={<OrderConfirmationPage />} />
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/menu" element={<MenuPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        
                        {/* Placeholder for future reservations landing page */}
                        <Route path="/" element={<Navigate to="/menu" replace />} />
                        <Route path="*" element={<Navigate to="/register" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
