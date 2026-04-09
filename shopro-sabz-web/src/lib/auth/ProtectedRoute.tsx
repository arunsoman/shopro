import { Navigate } from "react-router-dom";
import { useAuth, type StaffRole } from "./AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** If provided, only these roles can access this route. Redirects to /denied if wrong role. */
    allowedRoles?: StaffRole[];
    /** Where to send unauthenticated users. Defaults to /login */
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = "/login",
}: ProtectedRouteProps) {
    const { session } = useAuth();

    if (!session) {
        return <Navigate to={redirectTo} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
        return <Navigate to="/denied" replace />;
    }

    return <>{children}</>;
}
