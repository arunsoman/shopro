import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { apiClient } from "@/lib/api/client";

export type SupplierRole = 'SUPPLIER_ADMIN' | 'SUPPLIER_BIDDER' | 'SUPPLIER_PLANNER';

export interface SupplierSession {
    userId: UUID;
    supplierId: UUID;
    fullName: string;
    supplierName: string;
    role: SupplierRole;
    token?: string;
}

type UUID = string;

interface SupplierAuthContextValue {
    session: SupplierSession | null;
    login: (email: string, password: string) => Promise<SupplierSession>;
    logout: () => void;
}

const SupplierAuthContext = createContext<SupplierAuthContextValue | null>(null);

const SUPPLIER_SESSION_KEY = "supplier_session";

function loadSession(): SupplierSession | null {
    try {
        const raw = localStorage.getItem(SUPPLIER_SESSION_KEY);
        return raw ? (JSON.parse(raw) as SupplierSession) : null;
    } catch {
        return null;
    }
}

export function SupplierAuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<SupplierSession | null>(loadSession);

    const login = useCallback(async (email: string, password: string): Promise<SupplierSession> => {
        const { data } = await apiClient.post<SupplierSession>("/supplier/auth/login", { email, password });
        localStorage.setItem(SUPPLIER_SESSION_KEY, JSON.stringify(data));
        setSession(data);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(SUPPLIER_SESSION_KEY);
        setSession(null);
    }, []);

    return (
        <SupplierAuthContext.Provider value={{ session, login, logout }}>
            {children}
        </SupplierAuthContext.Provider>
    );
}

export function useSupplierAuth() {
    const ctx = useContext(SupplierAuthContext);
    if (!ctx) throw new Error("useSupplierAuth must be used inside <SupplierAuthProvider>");
    return ctx;
}
