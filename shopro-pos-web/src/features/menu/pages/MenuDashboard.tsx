import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Coffee, Grid, LayoutList, Settings } from "lucide-react";

export function MenuDashboard() {
    const location = useLocation();

    const navItems = [
        { label: "Overview", path: "/menu", icon: <Grid className="h-4 w-4" /> },
        { label: "Categories", path: "/menu/categories", icon: <LayoutList className="h-4 w-4" /> },
        { label: "Items", path: "/menu/items", icon: <Coffee className="h-4 w-4" /> },
        { label: "Modifiers", path: "/menu/modifiers", icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-zinc-950">
            <aside className="w-64 border-r bg-white px-4 py-6 dark:bg-zinc-900">
                <h2 className="mb-6 px-2 text-lg font-semibold tracking-tight">Menu Manager</h2>
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                location.pathname === item.path
                                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 overflow-auto p-8">
                <div className="mx-auto max-w-5xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
