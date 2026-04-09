// ─────────────────────────────────────────────────────────────
// router/ProtectedRoute.tsx
// Wraps all authenticated routes.
// Redirects to /login if not authenticated.
// Shows full-page spinner while auth state is resolving.
// ─────────────────────────────────────────────────────────────

import React, { type FC } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/router/routes";

const FullPageSpinner: FC = () => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f0e0c",
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        border: "3px solid #2e2c29",
        borderTopColor: "#f59e0b",
        borderRadius: "50%",
        animation: "spin 0.75s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const ProtectedRoute: FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Not authenticated — redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  // Authenticated — render child routes via <Outlet />
  return <Outlet />;
};