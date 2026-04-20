// FinanceHubPage — Finance Hub with Navigation Cards
import React, { type FC } from "react";
import NavCard from "@/components/shared/cards/NavCard";
import type { NavCardContent } from "@/components/shared/cards/NavCard";
import { HubHeader } from "@/components/shared/headers/HubHeader";
import { useAppStore } from "@/App";

const FINANCE_NAV_CARDS: NavCardContent[] = [
  { 
    label: "Record Sales", 
    desc: "Enter daily sales", 
    route: "finance-sales", 
    Icon: () => <span className="text-3xl">💰</span>, 
    iconColor: "text-green-600", 
    iconBg: "bg-green-500/10" 
  },
  { 
    label: "Record Expenses", 
    desc: "Enter expenses easily", 
    route: "finance-expenses", 
    Icon: () => <span className="text-3xl">💳</span>, 
    iconColor: "text-red-600", 
    iconBg: "bg-red-500/10" 
  },
  { 
    label: "Cash & Bank", 
    desc: "Manage deposits & withdrawals", 
    route: "finance-cash", 
    Icon: () => <span className="text-3xl">🏦</span>, 
    iconColor: "text-blue-600", 
    iconBg: "bg-blue-500/10" 
  },
  { 
    label: "Supplier Pay", 
    desc: "Pay suppliers & manage invoices", 
    route: "supplier-pay", 
    Icon: () => <span className="text-3xl">📦</span>, 
    iconColor: "text-indigo-600", 
    iconBg: "bg-indigo-500/10" 
  },
  { 
    label: "Salary Disbursement", 
    desc: "Process payroll & taxes", 
    route: "accounting-salary", 
    Icon: () => <span className="text-3xl">👥</span>, 
    iconColor: "text-cyan-600", 
    iconBg: "bg-cyan-500/10" 
  },
  { 
    label: "P&L Statement", 
    desc: "Profit & Loss report", 
    route: "finance-pnl", 
    Icon: () => <span className="text-3xl">📊</span>, 
    iconColor: "text-amber-600", 
    iconBg: "bg-amber-500/10" 
  },
  { 
    label: "Chart of Accounts", 
    desc: "View ledgers & accounts", 
    route: "accounting-accounts", 
    Icon: () => <span className="text-3xl">📒</span>, 
    iconColor: "text-purple-600", 
    iconBg: "bg-purple-500/10" 
  },
];

const FinanceHubPage: FC = () => {
  const navigate = useAppStore(s => s.navigate);
  const back = useAppStore(s => s.back);

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 overflow-y-auto">
      
      <HubHeader
        title="Finance"
        subtitle="Financial Management"
        onBack={() => back()}
      />

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 pb-10">
        {FINANCE_NAV_CARDS.map((card) => (
          <NavCard
            key={card.label}
            card={card}
            onClick={() => navigate(card.route as any)}
          />
        ))}
      </div>
    </div>
  );
};

export default FinanceHubPage;
