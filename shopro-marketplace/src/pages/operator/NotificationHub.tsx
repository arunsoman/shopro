import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Globe, 
  Activity, 
  Filter, 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  Eye, 
  Trash2, 
  UserPlus, 
  Share2,
  ExternalLink,
  Settings,
  Users,
  History as HistoryIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Tab = "types" | "channels" | "routing" | "recipients" | "logs";

export default function NotificationHub() {
  const [activeTab, setActiveTab] = useState<Tab>("types");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [data, setData] = useState<{ types: any[], channels: any[], logs: any[] }>({
    types: [],
    channels: [],
    logs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = {
        types: "/api/operator/administration/notifications/types",
        channels: "/api/operator/administration/notifications/channels",
        logs: "/api/operator/administration/notifications/logs",
        routing: "/api/operator/administration/notifications/routing",
        recipients: "/api/operator/administration/notifications/recipients"
      };

      const res = await fetch(endpoints[activeTab as keyof typeof endpoints] || endpoints.types);
      const json = await res.json();
      
      setData((prev: any) => ({
        ...prev,
        [activeTab]: activeTab === 'logs' ? json.content : json
      }));
    } catch (error) {
      console.error("Failed to fetch notification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    // Standard mock implementation for applying changes via API
    try {
      let endpoint = "";
      let method = "POST";
      let body = {};

      if (activeModal?.includes("type")) {
        endpoint = "/api/operator/administration/notifications/types";
        method = selectedItem ? "PATCH" : "POST";
        body = { ...selectedItem };
      } else if (activeModal === "config_channel") {
        endpoint = `/api/operator/administration/notifications/channels/${selectedItem.id}`;
        method = "PATCH";
        body = { config: selectedItem.config, status: selectedItem.status };
      } else if (activeModal === "test_pipeline") {
        endpoint = "/api/operator/administration/notifications/test";
        method = "POST";
        body = { channelId: selectedItem.id, recipient: "test@example.com" };
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setActiveModal(null);
        fetchData();
        // In a real app, trigger a success toast here
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "types", label: "Notification Types", icon: <Bell className="w-4 h-4" /> },
    { id: "channels", label: "Delivery Channels", icon: <Settings className="w-4 h-4" /> },
    { id: "routing", label: "Routing Matrix", icon: <Share2 className="w-4 h-4" /> },
    { id: "recipients", label: "Recipients", icon: <Users className="w-4 h-4" /> },
    { id: "logs", label: "Delivery Logs", icon: <HistoryIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-(--sp-text-1) to-(--sp-text-2) bg-clip-text text-transparent text-left">
            Notification Hub
          </h1>
          <p className="text-(--sp-text-2) mt-2 max-w-2xl text-left">
            Configure multi-channel alerts, priority routing, and real-time synchronization across the Shopro ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveModal("create_type")}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Alert</span>
          </button>
        </div>
      </div>

      {/* Cinematic Tabs */}
      <div className="flex items-center gap-2 p-1 bg-(--sp-bg-1)/30 backdrop-blur-md rounded-2xl border border-(--sp-border) overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "text-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.05)]" 
                : "text-(--sp-text-2) hover:text-(--sp-text-1) hover:bg-white/5"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full bg-(--sp-bg-1)/20 border border-(--sp-border) rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-(--sp-bg-1)/20 border border-(--sp-border) rounded-xl text-sm font-medium hover:bg-(--sp-bg-1)/40 transition-all">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <div className="w-px h-8 bg-(--sp-border) mx-1 hidden sm:block" />
          <TooltipIconButton tooltip="Force Sync Engine">
            <Activity className="w-4 h-4" />
          </TooltipIconButton>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid gap-6"
        >
          {activeTab === "types" && <TypesList items={data.types} onEdit={(type) => { setSelectedItem(type); setActiveModal("edit_type"); }} />}
          {activeTab === "channels" && <ChannelsGrid items={data.channels} onConfigure={(ch) => { setSelectedItem(ch); setActiveModal("config_channel"); }} onTest={(ch) => { setSelectedItem(ch); setActiveModal("test_pipeline"); }} />}
          {activeTab === "routing" && <RoutingMatrix />}
          {activeTab === "recipients" && <RecipientsManager />}
          {activeTab === "logs" && <LogsTable items={data.logs} onView={(log) => { setSelectedItem(log); setActiveModal("view_log"); }} />}
        </motion.div>
      </AnimatePresence>

      {/* Unified Modal System */}
      <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="sm:max-w-[600px] bg-(--sp-bg-1) border-(--sp-border) text-foreground backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {activeModal === "create_type" && "Define Alert Type"}
              {activeModal === "edit_type" && `Update ${selectedItem?.code}`}
              {activeModal === "config_channel" && `Configure ${selectedItem?.name}`}
              {activeModal === "test_pipeline" && `Test Pipeline: ${selectedItem?.name}`}
              {activeModal === "view_log" && "Execution Metadata"}
            </DialogTitle>
            <DialogDescription className="text-(--sp-text-2)">
              {activeModal === "create_type" && "Define a new event code and bind default delivery channels."}
              {activeModal === "config_channel" && "Set authentication credentials and endpoint URLs for this gateway."}
              {activeModal === "test_pipeline" && "Send a synthetic payload to verify reachability and template rendering."}
              {activeModal === "view_log" && "Detailed trace of message transformation and provider response."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 overflow-y-auto max-h-[60vh]">
            {activeModal?.includes("type") && <TypeForm initialData={selectedItem} />}
            {activeModal === "config_channel" && <ChannelConfigForm channel={selectedItem} />}
            {activeModal === "test_pipeline" && <TestPipelineForm channel={selectedItem} />}
            {activeModal === "view_log" && <LogMetadataView log={selectedItem} />}
          </div>

          <DialogFooter className="gap-3">
            <button 
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-(--sp-border) hover:bg-(--sp-bg-0) transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleApplyChanges}
              className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              {activeModal === "view_log" ? "Close" : "Apply Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TypesList({ items, onEdit }: { items: any[]; onEdit: (type: any) => void }) {
  const types = items.length > 0 ? items : [
    { id: "1", code: "ORDER_READY", name: "Dish Ready", severity: "INFO", status: "ACTIVE", channels: ["IN_APP"] },
    { id: "2", code: "STOCK_CRITICAL", name: "Stock Breach", severity: "CRITICAL", status: "ACTIVE", channels: ["IN_APP", "EMAIL", "APNS"] },
    { id: "3", code: "VOID_REQUEST", name: "Void Approval", severity: "CRITICAL", status: "ACTIVE", channels: ["IN_APP", "WHATSAPP"] },
    { id: "4", code: "PO_APPROVAL", name: "PO Approval", severity: "WARNING", status: "ACTIVE", channels: ["EMAIL", "WHATSAPP"] },
  ];

  return (
    <div className="bg-(--sp-bg-1)/10 border border-(--sp-border) rounded-3xl overflow-hidden backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--sp-border) bg-(--sp-bg-1)/30">
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Type Code</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Description</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Severity</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Channels</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Status</th>
              <th className="px-6 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--sp-border)">
            {types.map((type) => (
              <tr key={type.id} className="group hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => onEdit(type)}>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-mono text-sm font-bold">{type.code}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="font-medium text-(--sp-text-1)">{type.name}</span>
                </td>
                <td className="px-6 py-5">
                  <StatusBadge status={type.severity as any} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    {type.channels.map((ch: string) => (
                      <div key={ch} className="p-1.5 bg-(--sp-bg-0) rounded-lg border border-(--sp-border)" title={ch}>
                        {ch === "IN_APP" && <Globe className="w-3.5 h-3.5" />}
                        {ch === "EMAIL" && <Mail className="w-3.5 h-3.5" />}
                        {ch === "WHATSAPP" && <MessageSquare className="w-3.5 h-3.5" />}
                        {ch === "APNS" && <Smartphone className="w-3.5 h-3.5" />}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-sm font-medium text-(--sp-text-1)">{type.status}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 hover:bg-(--sp-bg-1) rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChannelsGrid({ items, onConfigure, onTest }: { items: any[]; onConfigure: (ch: any) => void; onTest: (ch: any) => void }) {
  const channels = items.length > 0 ? items : [
    { id: "1", name: "In-App Console", type: "WS", status: "ACTIVE", config: "WebSocket Connected", latency: "12ms", successRate: 99.9, icon: <Globe className="w-5 h-5" /> },
    { id: "2", name: "SendGrid Email", type: "SMTP", status: "ACTIVE", config: "API Key Verified", latency: "240ms", successRate: 98.5, icon: <Mail className="w-5 h-5" /> },
    { id: "3", name: "Twilio WhatsApp", type: "API", status: "ACTIVE", config: "Token Valid", latency: "450ms", successRate: 96.2, icon: <MessageSquare className="w-5 h-5" /> },
    { id: "4", name: "Firebase Push", type: "FCM", status: "INACTIVE", config: "Project: shopro-pos", latency: "0ms", successRate: 0, icon: <Smartphone className="w-5 h-5" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {channels.map((ch) => (
        <div key={ch.id} className="group relative bg-(--sp-bg-1)/10 border border-(--sp-border) rounded-3xl p-6 hover:border-primary/50 transition-all backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-(--sp-bg-0) border border-(--sp-border) flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              {ch.icon}
            </div>
            <StatusBadge status={ch.status as any} />
          </div>
          <h3 className="text-lg font-bold mb-1 text-left">{ch.name}</h3>
          <p className="text-[10px] text-(--sp-text-2) font-mono tracking-tighter uppercase text-left">{ch.config}</p>
          <div className="mt-8 pt-6 border-t border-(--sp-border) flex items-center justify-between">
            <button 
              onClick={() => onConfigure(ch)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Configure <ChevronRight className="w-3 h-3" />
            </button>
            <button 
              onClick={() => onTest(ch)}
              className="text-xs font-bold text-(--sp-text-2) hover:text-primary transition-colors"
            >
              Test Pipeline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoutingMatrix() {
  const roles = ["ADMIN", "MANAGER", "OPERATOR", "BUYER", "SUPPLIER"];
  const channels = ["IN_APP", "EMAIL", "SMS", "WHATSAPP"];
  
  return (
    <div className="bg-(--sp-bg-1)/10 border border-(--sp-border) rounded-3xl overflow-hidden backdrop-blur-xl">
      <div className="p-8 border-b border-(--sp-border)">
        <h3 className="text-xl font-bold text-left">Role-Channel Routing Matrix</h3>
        <p className="text-sm text-(--sp-text-2) text-left">Global delivery priorities per user role.</p>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-4"></th>
              {channels.map(ch => (
                <th key={ch} className="p-4 text-[10px] font-bold text-(--sp-text-2) uppercase tracking-widest text-center">{ch}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role} className="border-t border-(--sp-border)/50">
                <td className="p-4 font-bold text-sm">{role}</td>
                {channels.map(ch => (
                  <td key={ch} className="p-4 text-center">
                    <button className="w-6 h-6 rounded-md bg-(--sp-bg-0) border border-(--sp-border) hover:bg-primary/20 transition-colors mx-auto flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipientsManager() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-(--sp-bg-1)/10 border border-(--sp-border) rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-left">Channel Opt-ins</h3>
          <button className="flex items-center gap-2 px-4 py-2 border border-(--sp-border) rounded-xl text-xs font-bold hover:bg-(--sp-bg-0)">
            <UserPlus className="w-4 h-4" />
            <span>Add Rule</span>
          </button>
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-(--sp-bg-0)/50 rounded-2xl border border-(--sp-border)/40">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-blue-500/10 flex items-center justify-center font-bold text-primary">U{i}</div>
                <div className="text-left">
                  <p className="text-sm font-bold">User Group {i}</p>
                  <p className="text-[10px] text-(--sp-text-2) uppercase tracking-wider">Default: Email + In-App</p>
                </div>
              </div>
              <button className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 backdrop-blur-xl">
        <h3 className="text-lg font-bold mb-4 text-left">Quick Stats</h3>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-(--sp-text-2) uppercase mb-2">Total Reach</p>
            <p className="text-3xl font-bold">1,842 Users</p>
          </div>
          <div>
            <p className="text-xs text-(--sp-text-2) uppercase mb-2">Engaged (24h)</p>
            <p className="text-3xl font-bold">428</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsTable({ items, onView }: { items: any[]; onView: (log: any) => void }) {
  const logs = items.length > 0 ? items : [
    { id: "L1", type: "ORDER_READY", channel: "IN_APP", recipient: "Staff-01", status: "DELIVERED", timestamp: "2 mins ago" },
    { id: "L2", type: "STOCK_CRITICAL", channel: "EMAIL", recipient: "Manager-A", status: "SENT", timestamp: "15 mins ago" },
    { id: "L3", type: "VOID_REQUEST", channel: "WHATSAPP", recipient: "Admin-X", status: "FAILED", timestamp: "1 hour ago" },
  ];

  return (
    <div className="bg-(--sp-bg-1)/10 border border-(--sp-border) rounded-3xl overflow-hidden backdrop-blur-xl shadow-inner">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--sp-border) bg-(--sp-bg-1)/30">
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Alert Type</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Recipient</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Channel</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Status</th>
              <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-(--sp-text-2)">Time</th>
              <th className="px-6 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--sp-border)">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onView(log)}>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-sm font-bold font-mono text-(--sp-text-1)">{log.type}</span>
                </td>
                <td className="px-6 py-5 text-left">
                  <span className="text-sm font-medium text-(--sp-text-2)">{log.recipient}</span>
                </td>
                <td className="px-6 py-5 font-bold text-xs text-(--sp-text-1)">{log.channel}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={log.status as any} />
                    {log.error && <span className="text-[10px] text-rose-500 font-medium">{log.error}</span>}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-(--sp-text-2)">{log.time}</td>
                <td className="px-6 py-5 text-right">
                  <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-(--sp-bg-1)/30 border-t border-(--sp-border) flex items-center justify-between">
        <span className="text-xs text-(--sp-text-2)">Showing 4 of 2,842 logs</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-(--sp-bg-0) border border-(--sp-border) rounded-lg text-xs hover:bg-(--sp-bg-1) disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-(--sp-bg-0) border border-(--sp-border) rounded-lg text-xs hover:bg-(--sp-bg-1)">Next</button>
        </div>
      </div>
    </div>
  );
}

/* Forms for Modals */
function TypeForm({ initialData }: { initialData?: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">Event Code</label>
          <input className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 font-mono text-sm" defaultValue={initialData?.code} placeholder="e.g. USER_LOGIN" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">Severity</label>
          <select className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 text-sm appearance-none" defaultValue={initialData?.severity}>
            <option>INFO</option>
            <option>WARNING</option>
            <option>CRITICAL</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">Description</label>
        <textarea className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 text-sm" rows={3} defaultValue={initialData?.name} placeholder="Explain when this notification is triggered..." />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">Channel Bindings</label>
        <div className="grid grid-cols-2 gap-3">
          {["IN_APP", "EMAIL", "SMS", "WHATSAPP"].map(ch => (
            <div key={ch} className="flex items-center gap-2 p-3 bg-(--sp-bg-0) border border-(--sp-border) rounded-xl">
              <input type="checkbox" className="w-4 h-4 rounded border-primary bg-primary/20" defaultChecked={initialData?.channels?.includes(ch)} />
              <span className="text-xs font-bold">{ch}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelConfigForm({ channel }: { channel: any }) {
  return (
    <div className="space-y-6">
      {channel?.type === "EMAIL" && (
        <>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">SMTP Host</label>
            <input className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 text-sm" placeholder="smtp.sendgrid.net" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">API Key</label>
              <input type="password" title="Key already set" className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 text-sm" defaultValue="SG.xxxxxxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">From Address</label>
              <input className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 text-sm" placeholder="alerts@shopro.com" />
            </div>
          </div>
        </>
      )}
      {channel?.type === "IN_APP" && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <p className="text-sm font-medium">No external keys required. This channel uses the integrated WebSocket Hub on port 8080.</p>
        </div>
      )}
      {channel?.type !== "IN_APP" && channel?.type !== "EMAIL" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">API Endpoint</label>
            <input className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 text-sm" placeholder="https://api.messenger.com/v1" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">Access Token</label>
            <input type="password" title="Token hidden" className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 text-sm" />
          </div>
        </div>
      )}
    </div>
  );
}

function TestPipelineForm({ channel }: { channel: any }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">Recipient Target</label>
        <input className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 text-sm" placeholder={channel?.type === "EMAIL" ? "you@example.com" : "User ID or Phone"} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block">Sample Payload (JSON)</label>
        <textarea className="w-full bg-(--sp-bg-0) border border-(--sp-border) rounded-xl px-4 py-2 font-mono text-[10px]" rows={5} defaultValue={JSON.stringify({ orderId: "RES-501", customer: "John Doe", items: 4 }, null, 2)} />
      </div>
    </div>
  );
}

function LogMetadataView({ log }: { log: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-(--sp-bg-0) border border-(--sp-border) rounded-2xl text-left">
          <p className="text-[10px] text-(--sp-text-2) uppercase mb-1">Execution Time</p>
          <p className="text-sm font-bold">{log?.time}</p>
        </div>
        <div className="p-4 bg-(--sp-bg-0) border border-(--sp-border) rounded-2xl text-left">
          <p className="text-[10px] text-(--sp-text-2) uppercase mb-1">Status</p>
          <StatusBadge status={log?.status} />
        </div>
      </div>
      <div className="p-6 bg-(--sp-bg-0) border border-(--sp-border) rounded-2xl">
        <label className="text-[10px] font-bold uppercase tracking-widest text-(--sp-text-2) text-left block mb-4">Internal Metadata Trace</label>
        <pre className="text-[10px] font-mono text-primary whitespace-pre-wrap">{JSON.stringify(log?.meta, null, 2)}</pre>
      </div>
    </div>
  );
}
