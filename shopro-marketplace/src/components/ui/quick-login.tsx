import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export interface QuickLoginUser {
  label: string;
  email: string;
  roleDescription: string;
}

interface QuickLoginProps {
  users: QuickLoginUser[];
  onSelect: (email: string) => void;
  className?: string;
}

export function QuickLogin({ users, onSelect, className }: QuickLoginProps) {
  return (
    <div className={cn("space-y-4 pt-4 border-t border-border mt-6", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground whitespace-nowrap">
          Quick Access (Dev Only)
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {users.map((user) => (
          <button
            key={user.email}
            type="button"
            onClick={() => onSelect(user.email)}
            className="group relative flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-border group-hover:border-primary/30 group-hover:text-primary transition-colors">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.roleDescription}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-[10px] font-bold uppercase tracking-tighter bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                Select
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
