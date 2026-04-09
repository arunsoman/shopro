import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { apiClient } from "@/lib/api/client";
import { FapiClient } from "@/lib/security/fapi-client";

// ---- Types ----
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
    | "CUSTOMER";

export type UserRole = StaffRole | "CUSTOMER";

export interface UserSession {
    id: string;
    fullName: string;
    role: UserRole;
    email?: string;
    phoneNumber?: string;
    idToken?: string;
}

/** Roles that can access back-office / admin screens (Menu, Settings, Reports, Taxes) */
export const ADMIN_ROLES: StaffRole[] = ["OWNER", "MANAGER", "GENERAL_MANAGER", "ASSISTANT_MANAGER"];

/** Roles that can access operational screens (Floor Plan, Orders) */
export const OPERATIONAL_ROLES: StaffRole[] = [
    "OWNER",
    "MANAGER",
    "GENERAL_MANAGER",
    "ASSISTANT_MANAGER",
    "FB_MANAGER",
    "KITCHEN_MANAGER",
    "EXECUTIVE_CHEF",
    "SOUS_CHEF",
    "CHEF_DE_PARTIE",
    "LINE_COOK",
    "PREP_COOK",
    "DISHWASHER",
    "MAITRE_D",
    "HOST",
    "BARTENDER",
    "BUSSER",
    "RUNNER",
    "SENIOR_SERVER",
    "JUNIOR_SERVER",
];

// ---- Context ----
interface AuthContextValue {
    session: UserSession | null;
    login: (pin: string) => Promise<UserSession>;
    customerLogin: () => Promise<void>;
    completeLogin: (code: string, state: string) => Promise<void>;
    register: (data: any) => Promise<UserSession>;
    logout: () => void;
    hasRole: (roles: UserRole[]) => boolean;
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
    const [session, setSession] = useState<UserSession | null>(loadSession);

    const fapi = new FapiClient({
        issuerUrl: "http://localhost:3001",
        clientId: "sabz-web-client",
        redirectUri: "http://localhost:3001/callback",
        scope: "openid profile email phone shopro:read"
    });

    const login = useCallback(async (pin: string): Promise<UserSession> => {
        // Transitional: Still support PIN login for internal staff (temporarily)
        const { data } = await apiClient.post<UserSession>("/auth/login", { pin });
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        setSession(data);
        return data;
    }, []);

    const customerLogin = useCallback(async (): Promise<void> => {
        try {
            await fapi.startParFlow();
        } catch (error) {
            console.error("FAPI 2.0 Auth start failed", error);
            throw error;
        }
    }, [fapi]);

    const completeLogin = useCallback(async (code: string, state: string): Promise<void> => {
        try {
            const { idToken, claims } = await fapi.exchangeCodeForToken(code, state);
            
            const guestSession: UserSession = {
                id: claims.sub,
                fullName: claims.name,
                email: claims.email,
                phoneNumber: claims.phone_number,
                role: "CUSTOMER",
                idToken: idToken
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(guestSession));
            setSession(guestSession);
        } catch (error) {
            console.error("FAPI 2.0 Auth completion failed", error);
            throw error;
        }
    }, [fapi]);

    const register = useCallback(async (data: any): Promise<UserSession> => {
        console.info("Customer registration requested", data);
        const { data: session } = await apiClient.post<UserSession>("/auth/register", data);
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setSession(session);
        return session;
    }, []);

    const logout = useCallback(() => {
        const idToken = session?.idToken;
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        
        // Redirect to OIDC End Session endpoint
        window.location.href = fapi.getLogoutUrl(idToken);
    }, [session, fapi]);

    const hasRole = useCallback(
        (roles: UserRole[]) => !!session && roles.includes(session.role),
        [session]
    );

    return (
        <AuthContext.Provider value={{ session, login, customerLogin, completeLogin, register, logout, hasRole }}>
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
