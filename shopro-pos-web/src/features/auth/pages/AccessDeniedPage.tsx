import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function AccessDeniedPage() {
    const { session, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-900/20 border border-red-700/30 mb-5">
                    <ShieldOff className="h-7 w-7 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-zinc-400 text-sm mb-2">
                    Your role (<strong className="text-zinc-300">{session?.role}</strong>) does not have
                    permission to view this page.
                </p>
                <p className="text-zinc-500 text-xs mb-6">
                    Ask a Manager to grant you access, or switch to an account with the required role.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => { logout(); navigate("/login", { replace: true }); }}
                        className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                    >
                        Switch User
                    </button>
                </div>
            </div>
        </div>
    );
}
