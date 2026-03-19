import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthContext";
import { Settings, LogOut, Delete, LogIn, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

const PIN_DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

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

const ROLE_HINTS = [
    { 
        role: "Owner", 
        pin: "1111", 
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDvNTmVVpS0ApbgfhpUMeQUvUhDQNfH384c5ftGUl7Kx-CdpxJSHN5FEN73F3U2jebmxL0y5iUpBpKG1dgWagoMtz4a8a7P9bhfdUoRB1cmUExVQcr73oZIVY5ga6vgPIBiw40fbduFyrUvAvgNb_kPBuDrb56SI51-uLwDl-wmiNkf9C8rEteOSL8SIvwJEh5uSnG3drZJgpTGjijx8bH1aUUOvQolajkeSbJ3dqkZyE8DiwKtL5yuogLDpFA7sI2c6NQ5q1jlA" 
    },
    { 
        role: "Manager", 
        pin: "2222", 
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaIQziBtV4nqKyZ3vYtejwNgKdENwOj5y_Gi2426b4YKjdAFoZ6fxisXB0vbOaPAjStmjPVduFjgdyNPn30iBrxsWuB5YAco7bvSw2ZA-SHUjg9Z7XQnzOToAPbpSrM7UsEGNr6c7NJQmDUL5sgeRl-CF8Ime6A4dfPJF6brlK-aeq5x3VTljee4_bq8SHHTtXqCZT2L8Qva3aUzxOg89nqXsN2xbe9dApj3iOYUEuTnijEGKgaMESu02S7QrBmp-m3rbuTMAyFg" 
    },
    { 
        role: "Host", 
        pin: "3333", 
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAql8Q7876VHsZ54gCCXnZWJeesJcqMVRPq-8UGcGwz6qXUk2WFRozq-My39owpaCLx3DPDxKPkKoMPisSPpBdJ86kMWQMW7gGZxoDk5heE8UDkU_xWGZwY48SOy1bBe1h-LhXA9PmWG8enf03zqXnZZ9dZftgVSjWT9NVI7gPk7errYatmSVbOOnV0PSxE2u6RoSTyl_EZnrn2dmCyuLCk5TrfiYwOMxsiPlKbVN3nJBm7Z8mUvjNpMuDlhyK1V1aYKqLkCica5w" 
    },
    { 
        role: "Server", 
        pin: "4444", 
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCznj3xDO_jAzfpWKOk0Wht6WBDM-9zlZsMa0G4PWkJ8-Lc1cH4t6Ryv3G3cTMYYASOE6Twe0CwDKWWE4iE8jYdy0XRAIh8SUWL6YaoHmqkVWrqds5NXG6m0FsVj6LCY3WM3g4dTTs7ogJrz-yFo0ulLD6BRPJB4P6Bp6SupOnHiRHALwfeF-5H9TKe89VHzL2RryVYx8OM1C6JW2ZXmZVJk44o_eVmxTTCrZU0f9DfeXUgwp62OqrLodLtPISnNA3hld3NSbqSw" 
    },
    { 
        role: "Busser", 
        pin: "6666", 
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBkqHTQkz4haSnSIbMcRL8y8Cu9bHIHdfY0AT_FRjFG8g446i7a2uAc5wHxh0LiR6_6huAS7-qG4UICGyV6R9xhQIGzkWujAkpRc4gpi78tD7kgVhgT9W9rGTeJF96tfEjdMNom6p-nyISJBKmFqTaZMOExOp5LaSsRDiw2Rumt-QuJgpuzRMWxX8wb6eyqHp9tziTaLhgP_-smRMMLHpq07BfuOLkHxzLuQeoe2q0JG98UVO2cq5QyGBZqIgdcDum86n9_Bg3m-w" 
    },
    { 
        role: "Cashier", 
        pin: "5555", 
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBh8BB1Xgfar9-N7KYchbXwTHrc3XH6Ze0pNL8qMp_hKH5wskBVJHlJpW0wl-SzAigwr3Xee-eDJcQ-W_eav4nPGeabtXygh0vERjelACqKVpHBi-66B3P_-oVhdDz66h8Hzi8VrD3aQVEm1x_x3Mxr9S7DLUdYkGS7vIJO-wZdG3ndvbr1vLXKRaXVV3gx7SRmXcdzwOocob_XzOKwnQhMUV3myD9jdPXh1gDrKFh1a9XSS2n44JHFdqLLyZ-WezQRmMue7o5mAQ" 
    },
];

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [pin, setPin] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async (submittedPin: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const session = await login(submittedPin);
            const home = ROLE_HOME[session.role] ?? "/floor";
            navigate(home, { replace: true });
        } catch (err: any) {
            const msg = err?.message ?? t('auth.incorrectPin');
            setError(msg);
            setPin("");
        } finally {
            setIsLoading(false);
        }
    }, [login, navigate]);

    const handleDigit = useCallback(
        (d: string) => {
            if (pin.length >= 4) return;
            const next = pin + d;
            setPin(next);
            setError(null);

            if (next.length === 4) {
                handleSubmit(next);
            }
        },
        [pin, handleSubmit]
    );

    const handleBackspace = () => {
        setPin((p) => p.slice(0, -1));
        setError(null);
    };

    return (
        <div className="min-h-screen bg-background font-['Manrope'] text-foreground flex flex-col overflow-x-hidden">
            {/* Top Navigation Bar */}
            <nav className="flex items-center justify-between px-6 md:px-10 py-6">
                <div className="flex items-center gap-3">
                    {/* Inline SVG logo — no external dependency */}
                    <svg className="h-9 w-9" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="36" height="36" rx="10" fill="hsl(var(--primary))"/>
                        <path d="M18 8C12.477 8 8 12.477 8 18C8 23.523 12.477 28 18 28C23.523 28 28 23.523 28 18C28 12.477 23.523 8 18 8ZM18 11C21.866 11 25 14.134 25 18C25 21.866 21.866 25 18 25C14.134 25 11 21.866 11 18C11 14.134 14.134 11 18 11ZM15 15.5C15 14.672 15.672 14 16.5 14H19.5C20.328 14 21 14.672 21 15.5C21 16.328 20.328 17 19.5 17H16.5C15.672 17 15 16.328 15 15.5ZM15 20.5C15 19.672 15.672 19 16.5 19H19.5C20.328 19 21 19.672 21 20.5C21 21.328 20.328 22 19.5 22H16.5C15.672 22 15 21.328 15 20.5Z" fill="white"/>
                    </svg>
                    <span className="font-extrabold text-2xl tracking-tight text-foreground">Shopro</span>
                </div>
                <div className="flex items-center gap-6">
                    <LanguageSelector />
                    <div className="hidden sm:flex gap-6">
                        <button className="text-muted-foreground font-semibold hover:text-primary transition-colors">{t('common.help')}</button>
                        <button className="text-muted-foreground font-semibold hover:text-primary transition-colors">{t('common.support')}</button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition-all">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-error hover:bg-muted rounded-full transition-all">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg flex flex-col items-center">
                    {/* Login Header */}
                    <div className="text-center mb-8 animate-fade-up">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">{t('auth.welcome')}</h1>
                        <p className="text-muted-foreground text-lg">{t('auth.enterPin')}</p>
                    </div>

                    {/* PIN Display */}
                    <div className="flex gap-5 mb-10 bg-muted/30 p-6 rounded-2xl animate-scale-in">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "pin-dot",
                                    i < pin.length && "filled"
                                )}
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 px-4 py-2 bg-error-container/20 text-error text-sm font-bold rounded-lg animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Keypad Bento Grid */}
                    <div className="grid grid-cols-3 gap-5 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        {PIN_DIGITS.map((d) => (
                            <button
                                key={d}
                                onClick={() => handleDigit(d)}
                                disabled={isLoading || pin.length >= 4}
                                className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white text-2xl font-bold flex items-center justify-center hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-200 active:scale-90"
                            >
                                {d}
                            </button>
                        ))}
                        <button 
                            onClick={handleBackspace}
                            className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 flex items-center justify-center hover:bg-error/10 hover:text-error transition-all active:scale-90"
                        >
                            <Delete className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={() => handleDigit("0")}
                            disabled={isLoading || pin.length >= 4}
                            className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white text-2xl font-bold flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-200 active:scale-90"
                        >
                            0
                        </button>
                        <button 
                            onClick={() => pin.length === 4 && handleSubmit(pin)}
                            disabled={isLoading || pin.length < 4}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[#8800de] text-white flex items-center justify-center hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-95 disabled:opacity-40"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Quick Staff Login Section */}
                    <div className="w-full bg-slate-100/50 dark:bg-slate-800/40 p-8 rounded-[2.5rem] relative overflow-hidden animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('auth.quickStaffLogin')}</h2>
                                <span className="bg-[#a13920] text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">{t('auth.newShift')}</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
                                {ROLE_HINTS.map((staff) => (
                                    <button 
                                        key={staff.role}
                                        onClick={() => {
                                            if (isLoading) return;
                                            setPin("");
                                            staff.pin.split("").forEach((d, i) => {
                                                setTimeout(() => {
                                                    setPin(p => p.length < 4 ? p + d : p);
                                                    if (i === 3) handleSubmit(staff.pin);
                                                }, i * 60);
                                            });
                                        }}
                                        className="flex flex-col items-center gap-3 group"
                                    >
                                        <div className="w-16 h-16 rounded-full p-[3px] bg-slate-200 dark:bg-slate-700 group-hover:bg-primary transition-all duration-300 transform group-hover:scale-110">
                                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-800">
                                                <img 
                                                    alt={staff.role} 
                                                    className="w-full h-full object-cover" 
                                                    src={staff.avatar} 
                                                />
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] transition-colors group-hover:text-primary">
                                            {t(`roles.${staff.role.toUpperCase()}`, { defaultValue: staff.role })}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-10 py-8 flex flex-col md:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800/50">
                <p className="text-slate-400 text-xs mb-4 md:mb-0">{t('common.copyright')}</p>
                <div className="flex gap-8">
                    <button className="text-slate-400 text-xs font-semibold hover:text-primary transition-colors">{t('common.privacy')}</button>
                    <button className="text-slate-400 text-xs font-semibold hover:text-primary transition-colors">{t('common.terms')}</button>
                    <button className="text-slate-400 text-xs font-semibold hover:text-primary transition-colors">{t('common.contact')}</button>
                </div>
            </footer>
        </div>
    );
}
