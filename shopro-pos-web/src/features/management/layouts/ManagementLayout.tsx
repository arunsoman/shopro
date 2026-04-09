import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Settings, Utensils, ClipboardCheck, BarChart3, Users, Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Restaurant Profile', href: '/management/profile', icon: Settings },
  { name: 'Ingredient Master', href: '/management/ingredients', icon: Utensils },
  { name: 'Recipe Management', href: '/management/recipes', icon: BookOpen },
  { name: 'Menu Costing', href: '/management/costing', icon: BarChart3 },
  { name: 'Labor Tracking', href: '/management/labor', icon: Users },
  { name: 'Guest Patterns', href: '/management/guest-counts', icon: Clock },
  { name: 'Accounting Checklist', href: '/management/checklist', icon: ClipboardCheck },
];

export const ManagementLayout: React.FC = () => {
  return (
    <div className="flex h-full flex-col space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Restaurant Management</h1>
        <p className="text-muted-2">
          Comprehensive back-office platform for inventory, recipes, labor, and financial tracking.
        </p>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground/70"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ManagementLayout;
