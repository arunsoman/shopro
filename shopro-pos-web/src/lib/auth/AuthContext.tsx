import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { apiClient } from "@/lib/api/client";

// ---- Types ----
export type StaffRole =
    | "OWNER"
    | "MANAGER"
    | "HOST"
    | "HOSTESS"
    | "SERVER"
    | "CASHIER"
    | "BUSSER"
    | "CHEF"
    | "LINE_COOK"
    | "EXPEDITOR";

export interface StaffSession {
    id: string;
    fullName: string;
    role: StaffRole;
}

/** Roles that can access back-office / admin screens (Menu, Settings, Reports) */
export const ADMIN_ROLES: StaffRole[] = ["OWNER", "MANAGER"];

/** Roles that can access operational screens (Floor Plan, Orders) */
export const OPERATIONAL_ROLES: StaffRole[] = [
    "HOST",
    "HOSTESS",
    "SERVER",
    "CASHIER",
    "BUSSER",
    "CHEF",
    "LINE_COOK",
    "EXPEDITOR",
    "MANAGER",
    "OWNER",
];

// ---- Context ----
interface AuthContextValue {
    session: StaffSession | null;
    login: (pin: string) => Promise<StaffSession>;
    logout: () => void;
    hasRole: (roles: StaffRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "shopro_session";

function loadSession(): StaffSession | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as StaffSession) : null;
    } catch {
        return null;
    }
}

// ---- Provider ----
export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<StaffSession | null>(loadSession);

    const login = useCallback(async (pin: string): Promise<StaffSession> => {
        const { data } = await apiClient.post<StaffSession>("/auth/login", { pin });
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        setSession(data);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
    }, []);

    const hasRole = useCallback(
        (roles: StaffRole[]) => !!session && roles.includes(session.role),
        [session]
    );

    return (
        <AuthContext.Provider value={{ session, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

// ---- Hook ----
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
