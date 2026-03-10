import { Navigate } from "react-router-dom";
import { useSupplierAuth, type SupplierRole } from "@/features/auth/SupplierAuthContext";

interface SupplierProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: SupplierRole[];
    redirectTo?: string;
}

export function SupplierProtectedRoute({
    children,
    allowedRoles,
    redirectTo = "/supplier/login",
}: SupplierProtectedRouteProps) {
    const { session } = useSupplierAuth();

    if (!session) {
        return <Navigate to={redirectTo} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
        return <Navigate to="/denied" replace />;
    }

    return <>{children}</>;
}
