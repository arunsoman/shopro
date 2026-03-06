import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthContext";
import { Lock, Delete } from "lucide-react";

const PIN_DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const ROLE_HOME: Record<string, string> = {
    OWNER: "/dashboard",
    MANAGER: "/dashboard",
    HOST: "/dashboard",
    HOSTESS: "/dashboard",
    SERVER: "/dashboard",
    CASHIER: "/dashboard",
    BUSSER: "/dashboard",
    CHEF: "/dashboard",
    LINE_COOK: "/dashboard",
    EXPEDITOR: "/dashboard",
};

// Role hint cards shown below the PIN pad
const ROLE_HINTS = [
    { role: "Owner", pin: "1111", color: "from-amber-500 to-orange-600" },
    { role: "Manager", pin: "2222", color: "from-violet-500 to-purple-700" },
    { role: "Host", pin: "3333", color: "from-cyan-500 to-blue-600" },
    { role: "Server", pin: "4444", color: "from-emerald-500 to-green-700" },
    { role: "Cashier", pin: "5555", color: "from-rose-500 to-pink-700" },
    { role: "Busser", pin: "6666", color: "from-slate-500 to-zinc-700" },
];

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [pin, setPin] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [_attempts, setAttempts] = useState(0);

    const handleDigit = useCallback(
        (d: string) => {
            if (pin.length >= 4) return;
            const next = pin + d;
            setPin(next);
            setError(null);

            // Auto-submit when 4 digits are entered
            if (next.length === 4) {
                handleSubmit(next);
            }
        },
        [pin]
    );

    const handleBackspace = () => {
        setPin((p) => p.slice(0, -1));
        setError(null);
    };

    const handleSubmit = async (submittedPin: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const session = await login(submittedPin);
            const home = ROLE_HOME[session.role] ?? "/floor";
            navigate(home, { replace: true });
        } catch (err: any) {
            const msg = err?.message ?? "Incorrect PIN. Please try again.";
            setError(msg);
            setAttempts((a) => a + 1);
            setPin("");
        } finally {
            setIsLoading(false);
        }
    };

    const isLocked = error?.includes("locked");

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                {/* Logo / Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4">
                        <Lock className="h-7 w-7 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Shopro POS</h1>
                    <p className="text-zinc-400 text-sm mt-1">Enter your PIN to sign in</p>
                </div>

                {/* PIN dots */}
                <div className="flex justify-center gap-4 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={[
                                "w-5 h-5 rounded-full border-2 transition-all duration-150",
                                i < pin.length
                                    ? "bg-indigo-500 border-indigo-400 scale-110"
                                    : "bg-transparent border-zinc-600",
                            ].join(" ")}
                        />
                    ))}
                </div>

                {/* Error / status message */}
                {error && (
                    <div
                        className={[
                            "mb-4 px-4 py-2.5 rounded-lg text-sm text-center font-medium",
                            isLocked
                                ? "bg-red-900/40 border border-red-700/50 text-red-300"
                                : "bg-red-900/30 border border-red-800/30 text-red-400",
                        ].join(" ")}
                    >
                        {error}
                    </div>
                )}

                {/* PIN Pad */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
                    <div className="grid grid-cols-3 gap-3">
                        {PIN_DIGITS.slice(0, 9).map((d) => (
                            <button
                                key={d}
                                onClick={() => handleDigit(d)}
                                disabled={isLoading || isLocked || pin.length >= 4}
                                className={[
                                    "h-16 rounded-xl text-2xl font-semibold transition-all duration-100",
                                    "bg-zinc-800 text-white active:scale-95",
                                    "hover:bg-zinc-700 hover:text-white",
                                    "disabled:opacity-40 disabled:cursor-not-allowed",
                                    "border border-zinc-700/50",
                                    "shadow-sm shadow-black/30",
                                ].join(" ")}
                            >
                                {d}
                            </button>
                        ))}

                        {/* 0 row  */}
                        <button
                            onClick={handleBackspace}
                            disabled={isLoading || pin.length === 0}
                            className="h-16 rounded-xl text-zinc-400 transition-all active:scale-95 hover:bg-zinc-800/60 disabled:opacity-30"
                        >
                            <Delete className="h-5 w-5 mx-auto" />
                        </button>
                        <button
                            onClick={() => handleDigit("0")}
                            disabled={isLoading || isLocked || pin.length >= 4}
                            className={[
                                "h-16 rounded-xl text-2xl font-semibold transition-all duration-100",
                                "bg-zinc-800 text-white active:scale-95",
                                "hover:bg-zinc-700",
                                "disabled:opacity-40 disabled:cursor-not-allowed",
                                "border border-zinc-700/50",
                                "shadow-sm shadow-black/30",
                            ].join(" ")}
                        >
                            0
                        </button>
                        <button
                            onClick={() => pin.length === 4 && handleSubmit(pin)}
                            disabled={isLoading || pin.length < 4}
                            className="h-16 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
                        >
                            {isLoading ? "…" : "Enter"}
                        </button>
                    </div>
                </div>

                {/* Role hint cards — for testing only */}
                <div className="mt-8">
                    <p className="text-center text-xs text-zinc-600 mb-3 uppercase tracking-widest font-medium">
                        Test Accounts
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {ROLE_HINTS.map(({ role, pin: hintPin, color }) => (
                            <button
                                key={role}
                                onClick={() => {
                                    setPin("");
                                    setError(null);
                                    // Fill PIN automatically for convenience
                                    hintPin.split("").forEach((d, i) =>
                                        setTimeout(() => {
                                            setPin((p) => (p.length < 4 ? p + d : p));
                                            if (i === 3) setTimeout(() => handleSubmit(hintPin), 50);
                                        }, i * 80)
                                    );
                                }}
                                className={[
                                    "p-2 rounded-lg text-white text-xs font-medium",
                                    `bg-gradient-to-br ${color}`,
                                    "opacity-80 hover:opacity-100 transition-opacity",
                                    "flex flex-col items-center gap-0.5",
                                ].join(" ")}
                            >
                                <span className="font-bold">{role}</span>
                                <span className="font-mono opacity-70">{hintPin}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
