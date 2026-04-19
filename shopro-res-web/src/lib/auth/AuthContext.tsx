import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useAuthStore } from "@/store/auth.store";

// Event dispatched by api/client.ts when a 401 is received
export const AUTH_EXPIRED_EVENT = "rms:auth:expired";

// ---- Types ----
export type AuthType = 'ADMIN' | 'STAFF' | 'GUEST';

export type StaffRole =
    | "OWNER"
    | "MANAGER"
    | "GENERAL_MANAGER"
    | "ASSISTANT_MANAGER"
    | "FB_MANAGER"
    | "KITCHEN_MANAGER"
    | "EXECUTIVE_CHEF"
    | "SOUS_CHEF"
    | "CHEF_DE_PARTIE"
    | "LINE_COOK"
    | "PREP_COOK"
    | "DISHWASHER"
    | "MAITRE_D"
    | "HOST"
    | "BARTENDER"
    | "BUSSER"
    | "RUNNER"
    | "SENIOR_SERVER"
    | "JUNIOR_SERVER"
    | "GUEST"
    | "ADMIN";

export interface UserSession {
    id: string;
    fullName: string;
    role: StaffRole;
    type: AuthType;
    restaurantId?: number;
    restaurantName?: string;
    token?: string;
}

export const ADMIN_ROLES: StaffRole[] = ["OWNER", "MANAGER", "GENERAL_MANAGER", "ASSISTANT_MANAGER"];

// ---- Context ----
interface AuthContextValue {
    session: UserSession | null;
    setSession: (session: UserSession | null) => void;
    logout: () => void;
    hasRole: (roles: StaffRole[]) => boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "shopro_session";

function loadSession(): UserSession | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as UserSession) : null;
    } catch {
        return null;
    }
}

// ---- Provider ----
export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setInternalSession] = useState<UserSession | null>(loadSession());
    const { setAuth, clearAuth, authToken } = useRestaurantStore();

    useEffect(() => {
        if (!authToken && session) {
            setInternalSession(null);
            localStorage.removeItem(SESSION_KEY);
        }
    }, [authToken, session]);

    const setSession = useCallback((newSession: UserSession | null) => {
        console.log('[AuthContext] setSession called:', { 
            hasSession: !!newSession, 
            restaurantId: newSession?.restaurantId,
            type: newSession?.type 
        });

        if (newSession) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
            
            // Sync with useRestaurantStore (Legacy/Alternative)
            if (newSession.token) {
                setAuth(newSession.token, newSession.restaurantId || 3, newSession.restaurantName || 'The Market Table');
            }

            // Sync with useAuthStore (Primary for RestaurantProvider)
            useAuthStore.getState().setAuth(
                {
                    id: Number(newSession.id),
                    email: "", // User session doesn't always have email here
                    name: newSession.fullName,
                    role: (newSession.role as any),
                    restaurantId: newSession.restaurantId || 3,
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    accessToken: newSession.token || "",
                    refreshToken: "",
                    expiresIn: 3600
                }
            );
        } else {
            localStorage.removeItem(SESSION_KEY);
            clearAuth();
            useAuthStore.getState().logout();
        }
        setInternalSession(newSession);
    }, [setAuth, clearAuth]);

    const logout = useCallback(() => {
        setSession(null);
    }, [setSession]);

    // Listen for 401 events from api/client.ts → auto-logout expired sessions
    useEffect(() => {
        const handler = () => logout();
        window.addEventListener(AUTH_EXPIRED_EVENT, handler);
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
    }, [logout]);

    const hasRole = useCallback(
        (roles: StaffRole[]) => !!session && roles.includes(session.role),
        [session]
    );

    return (
        <AuthContext.Provider value={{ 
            session, 
            setSession, 
            logout, 
            hasRole, 
            isAuthenticated: !!session 
        }}>
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
