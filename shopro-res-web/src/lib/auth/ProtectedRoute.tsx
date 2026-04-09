import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type StaffRole, ADMIN_ROLES } from "./AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: StaffRole[];
    requireAdmin?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireAdmin }: ProtectedRouteProps) {
    const { isAuthenticated, hasRole } = useAuth();
    const location = useLocation();

    // Loading state handled in App.tsx Suspense or PageLoader
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !hasRole(ADMIN_ROLES)) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
