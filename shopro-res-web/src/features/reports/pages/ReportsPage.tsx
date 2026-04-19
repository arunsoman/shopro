import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from "@/lib/auth/AuthContext";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, TrendingUp, Download, DollarSign, BarChart3, Clock, Percent, AlertTriangle, Briefcase, Scissors, Star, Zap, Search, Target, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface GuestData {
  date: string;
  guestCount: number;
  intensity: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  intensity: number;
}

interface LaborData {
  date: string;
  laborCost: number;
  laborMinutes: number;
  laborPercentage: number;
  intensity: number;
}

interface PrimeCostData {
  date: string;
  revenue: number;
  cogs: number;
  laborCost: number;
  primeCost: number;
  primeCostPercentage: number;
  intensity?: number;
}

interface OvertimeData {
  staffId: string;
  staffName: string;
  weeklyHours: number;
  standardHours: number;
  overtimeHours: number;
  overtimeCost: number;
}

interface MenuEngineeringData {
  menuItemId: number;
  name: string;
  unitsSold: number;
  costPerUnit: number;
  pricePerUnit: number;
  marginPerUnit: number;
  totalMargin: number;
  salesMixPercentage: number;
  quadrant: 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';
}

interface TableTurnaroundData {
  tableId: number;
  tableName: string;
  totalSessions: number;
  avgTurnaroundMinutes: number;
  avgRevenuePerSession: number;
  turnoverRate: number;
  intensity: number;
}

interface InventoryVarianceData {
  ingredientId: number;
  ingredientName: string;
  theoreticalUsage: number;
  actualUsage: number;
  varianceQuantity: number;
  variancePercentage: number;
  costImpact: number;
}

// --- Components ---

const Tooltip = ({ content, children }: { content: React.ReactNode, children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-gray-700"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ReportsPage() {
  const { session } = useAuth();
  const restaurantId = session?.restaurantId || 3;

  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScrolled, setIsScrolled] = useState(false);

  const [guestData, setGuestData] = useState<GuestData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [laborData, setLaborData] = useState<LaborData[]>([]);
  const [primeData, setPrimeData] = useState<PrimeCostData[]>([]);
  const [overtimeData, setOvertimeData] = useState<OvertimeData[]>([]);
  const [menuData, setMenuData] = useState<MenuEngineeringData[]>([]);
  const [tableData, setTableData] = useState<TableTurnaroundData[]>([]);
  const [varianceData, setVarianceData] = useState<InventoryVarianceData[]>([]);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => {
    const start = view === 'month' ? startOfMonth(currentDate) : startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = view === 'month' ? endOfMonth(currentDate) : endOfWeek(currentDate, { weekStartsOn: 1 });
    return { start, end };
  }, [view, currentDate]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const rangeStart = view === 'month'
          ? startOfMonth(currentDate)
          : startOfWeek(currentDate, { weekStartsOn: 1 });

        const rangeEnd = view === 'month'
          ? endOfMonth(currentDate)
          : endOfWeek(currentDate, { weekStartsOn: 1 });

        const formattedDate = format(rangeStart, 'yyyy-MM-dd');
        const formattedRangeEnd = format(rangeEnd, 'yyyy-MM-dd');

        const [guestRes, revRes, laborRes, primeRes, otRes, menuRes, tableRes, varRes] = await Promise.all([
          fetch(`/api/v1/restaurants/${restaurantId}/reports/guest-heatmap?view=${view}&startDate=${formattedDate}`),
          fetch(`/api/v1/restaurants/${restaurantId}/reports/revenue-heatmap?view=${view}&startDate=${formattedDate}`),
          fetch(`/api/v1/restaurants/${restaurantId}/reports/labor-heatmap?view=${view}&startDate=${formattedDate}`),
          fetch(`/api/v1/restaurants/${restaurantId}/reports/prime-cost?view=${view}&startDate=${formattedDate}`),
          fetch(`/api/v1/restaurants/${restaurantId}/reports/overtime-leakage?weekStart=${formattedDate}`),
          fetch(`/api/v1/restaurants/${restaurantId}/reports/menu-engineering?startDate=${formattedDate}&endDate=${formattedRangeEnd}`),
          fetch(`/api/v1/restaurants/${restaurantId}/reports/table-turnaround?startDate=${formattedDate}&endDate=${formattedRangeEnd}`),
          fetch(`/api/v1/restaurants/${restaurantId}/reports/inventory-variance?startDate=${formattedDate}&endDate=${formattedRangeEnd}`)
        ]);

        if (!guestRes.ok || !revRes.ok || !laborRes.ok || !primeRes.ok || !otRes.ok || !menuRes.ok || !tableRes.ok || !varRes.ok) throw new Error("Failed to fetch reporting data");

        const [gJson, rJson, lJson, pJson, oJson, mJson, tJson, vJson] = await Promise.all([
          guestRes.json(),
          revRes.json(),
          laborRes.json(),
          primeRes.json(),
          otRes.json(),
          menuRes.json(),
          tableRes.json(),
          varRes.json()
        ]);

        setGuestData(gJson);
        setRevenueData(rJson);
        setLaborData(lJson);
        setMenuData(mJson);

        // Enrich prime data with intensity for heatmap
        const maxPrimePct = Math.max(...pJson.map((d: any) => d.primeCostPercentage), 0);
        setPrimeData(pJson.map((d: any) => ({
          ...d,
          intensity: maxPrimePct > 0 ? d.primeCostPercentage / maxPrimePct : 0
        })));

        setOvertimeData(oJson);
        setTableData(tJson);
        setVarianceData(vJson);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [view, currentDate, restaurantId]);

  // Scroll handler for Intelligence Hub header
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 20);
  };

  const handlePrev = () => {
    setCurrentDate(prev => view === 'month' ? subMonths(prev, 1) : subWeeks(prev, 1));
  };

  const handleNext = () => {
    setCurrentDate(prev => view === 'month' ? addMonths(prev, 1) : addWeeks(prev, 1));
  };

  // Aggregates
  const totalGuests = guestData.reduce((sum, d) => sum + d.guestCount, 0);
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalCOGS = primeData.reduce((sum, d) => sum + d.cogs, 0);
  const totalLaborCost = laborData.reduce((sum, d) => sum + d.laborCost, 0);
  const avgPrimePct = primeData.length > 0 ? primeData.reduce((sum, d) => sum + d.primeCostPercentage, 0) / primeData.length : 0;
  const totalOTCost = overtimeData.reduce((sum, d) => sum + d.overtimeCost, 0);

  const starsCount = menuData.filter(d => d.quadrant === 'STAR').length;
  const plowhorsesCount = menuData.filter(d => d.quadrant === 'PLOWHORSE').length;

  return (
    <div
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto max-h-[calc(100vh-8rem)] bg-[#F8FAFC] dark:bg-[#09090B] p-8 scroll-smooth antialiased relative"
    >
      <div className="max-w-[1600px] mx-auto space-y-12">

        {/* Header Area - Intelligence Hub Sticky Navigation */}
        <div className={`sticky top-[-2rem] z-50 -mx-8 px-8 py-6 mb-8 transition-all duration-500 rounded-b-[2.5rem] ${isScrolled
            ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border-b border-gray-100 dark:border-zinc-800'
            : 'bg-transparent border-b-0'
          }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className={`font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-4 transition-all duration-500 ${isScrolled ? 'text-3xl' : 'text-5xl'}`}>
                <div className={`bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-500 ${isScrolled ? 'p-1.5' : 'p-2.5'}`}>
                  <LayoutDashboard className={`${isScrolled ? 'w-5 h-5' : 'w-8 h-8'} text-white transition-all`} />
                </div>
                Intelligence Hub
              </h1>
              {!isScrolled && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-zinc-500 dark:text-zinc-400 mt-3 text-xl font-semibold flex items-center gap-2"
                >
                  <Search className="w-5 h-5 text-indigo-400" />
                  Scalable Performance: Operations, Costs & Menu Engineering
                </motion.p>
              )}
            </div>

            <div className={`flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 transition-all duration-500 ${isScrolled ? 'scale-90 opacity-90' : 'scale-100 opacity-100'}`}>
              <button
                onClick={() => setView('month')}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${view === 'month' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                Month-over-Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${view === 'week' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
              >
                Weekly Deep-Dive
              </button>
            </div>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <StatCard
            title="Total Guests"
            value={totalGuests.toLocaleString()}
            icon={<Users className="w-5 h-5 text-blue-500" />}
            color="blue"
          />
          <StatCard
            title="Revenue"
            value={`$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
            color="emerald"
          />
          <StatCard
            title="Prime Cost %"
            value={`${avgPrimePct.toFixed(1)}%`}
            icon={<Percent className="w-5 h-5 text-violet-500" />}
            color="violet"
            subtitle="Target: <60%"
          />
          <StatCard
            title="Menu Stars"
            value={starsCount}
            icon={<Star className="w-5 h-5 text-amber-500" />}
            color="amber"
            subtitle="High Popularity & Margin"
          />
          <StatCard
            title="Menu Plowhorses"
            value={plowhorsesCount}
            icon={<Zap className="w-5 h-5 text-orange-500" />}
            color="orange"
            subtitle="High Popularity, Low Margin"
          />
          <StatCard
            title="OT Exposure"
            value={`$${totalOTCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
            color="rose"
            warning={totalOTCost > 0}
          />
          <StatCard
            title="Avg Turnaround"
            value={tableData.length > 0 ? `${Math.round(tableData.reduce((sum, d) => sum + d.avgTurnaroundMinutes, 0) / tableData.length)} min` : 'N/A'}
            icon={<Clock className="w-5 h-5 text-indigo-500" />}
            color="indigo"
            subtitle="Efficiency Target: <75m"
          />
        </div>

        {/* Navigation Control */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <button onClick={handlePrev} className="p-3 bg-gray-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all border border-gray-100 dark:border-zinc-700 active:scale-90">
              <ChevronLeft className="w-7 h-7 text-gray-700 dark:text-zinc-300" />
            </button>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white min-w-[280px] text-center tracking-tighter">
              {view === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(range.start, 'MMM d, yyyy')}`}
            </h2>
            <button onClick={handleNext} className="p-3 bg-gray-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all border border-gray-100 dark:border-zinc-700 active:scale-90">
              <ChevronRight className="w-7 h-7 text-gray-700 dark:text-zinc-300" />
            </button>
          </div>
          <button className="flex items-center gap-3 px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-base font-black hover:opacity-90 transition-all shadow-2xl active:scale-95 group">
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" /> Export Analytics
          </button>
        </div>

        {loading ? (
          <div className="h-[700px] flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-indigo-100 dark:border-zinc-800 rounded-full" />
              <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <p className="text-zinc-500 font-black animate-pulse text-2xl tracking-tighter uppercase italic">Analyzing Insights...</p>
          </div>
        ) : (
          <div className="space-y-12">

            {/* Row 1: Volume Heatmaps */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <HeatmapCard
                title="Guest Flow Trends"
                subtitle="Daily arrival intensity anchored to ledger sales"
                data={guestData}
                view={view}
                rangeStart={range.start}
                rangeEnd={range.end}
                valueKey="guestCount"
                label="Guests"
                colorScale="indigo"
              />

              <HeatmapCard
                title="Sales Realization"
                subtitle="Daily revenue performance tracked in real-time"
                data={revenueData}
                view={view}
                rangeStart={range.start}
                rangeEnd={range.end}
                valueKey="revenue"
                label="Revenue"
                colorScale="emerald"
                isCurrency={true}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <HeatmapCard
                title="Labor Efficiency"
                subtitle="Staff cost vs. revenue realization targets"
                data={laborData}
                view={view}
                rangeStart={range.start}
                rangeEnd={range.end}
                valueKey="laborCost"
                label="Labor Cost"
                colorScale="rose"
                isCurrency={true}
                extraInfo={(item: LaborData) => (
                  <div className="mt-1 pt-1 border-t border-white/20 text-[10px] opacity-80 font-black">
                    {item.laborPercentage?.toFixed(1)}%
                  </div>
                )}
              />

              <HeatmapCard
                title="Prime Cost Ratio"
                subtitle="Combined COGS + Labor cost intensity"
                data={primeData}
                view={view}
                rangeStart={range.start}
                valueKey="primeCost"
                label="Prime Cost"
                colorScale="violet"
                isCurrency={true}
                extraInfo={(item: PrimeCostData) => (
                  <div className="mt-1 pt-1 border-t border-white/20 text-[10px] opacity-80 font-black">
                    {item.primeCostPercentage?.toFixed(1)}%
                  </div>
                )}
              />
            </div>

            {/* Row 3: Advanced Menu Engineering Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
              <div className="xl:col-span-3">
                <MenuEngineeringMatrix data={menuData} />
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-zinc-800 space-y-8 flex flex-col">
                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Strategic Insights</h4>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Actionable Opportunities</p>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <OpportunityItem
                    title="Promote Plowhorses"
                    desc={`${plowhorsesCount} high-volume items have low margins. Consider price adjustments.`}
                    type="warning"
                  />
                  <OpportunityItem
                    title="Maximize Stars"
                    desc={`${starsCount} items are your profit engines. Train staff for targeted upselling.`}
                    type="success"
                  />
                  <OpportunityItem
                    title="Review Dogs"
                    desc={`${menuData.filter(d => d.quadrant === 'DOG').length} items underperform. Consider removal or recipe rework.`}
                    type="danger"
                  />
                </div>

                <button className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 font-black rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center gap-2">
                  <Target className="w-5 h-5" /> Detailed Strategy
                </button>
              </div>
            </div>

            {/* Row 4: Table Turnaround & Performance */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 p-10 space-y-8 flex flex-col h-full">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3">
                    <Clock className="w-8 h-8 text-indigo-500" />
                    Table Turnaround Efficiency
                  </h3>
                  <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest opacity-80">Cycle times and Revenue per sitting</p>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {tableData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-400 font-black italic uppercase text-xs border-4 border-dashed border-gray-50 dark:border-zinc-800 rounded-[2rem]">No Turnaround Data Available</div>
                  ) : (
                    tableData.map((table, i) => (
                      <motion.div
                        key={table.tableId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 bg-gray-50 dark:bg-zinc-800/40 rounded-2xl border border-gray-100 dark:border-zinc-700 flex items-center justify-between group hover:bg-white dark:hover:bg-zinc-800 transition-all hover:shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner ${table.intensity > 0.6 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                            {table.tableName.replace(/[^0-9]/g, '') || table.tableName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 dark:text-white tracking-tight">{table.tableName}</div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{table.totalSessions} Total Turns</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-10">
                          <div className="text-right">
                            <div className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{Math.round(table.avgTurnaroundMinutes)} min</div>
                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Avg Turn</div>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <div className="text-lg font-black text-emerald-500 tracking-tight">${table.avgRevenuePerSession.toFixed(0)}</div>
                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Avg Rev / Party</div>
                          </div>
                          <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${table.intensity * 100}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 p-10 flex flex-col justify-center items-center text-center space-y-6">
                <div className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center relative shadow-2xl">
                  <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-[spin_3s_linear_infinite]" />
                  <BarChart3 className="w-12 h-12 text-indigo-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Real-Estate Optimization</h3>
                  <p className="text-lg text-zinc-500 font-semibold max-w-md">Your average turnover rate is <span className="text-indigo-600 font-black">{(tableData.reduce((sum, d) => sum + d.totalSessions, 0) / (tableData.length || 3)).toFixed(1)}x</span> per table. Increasing this by 15% through better pacing could add <span className="text-emerald-500 font-black">$42,000</span> to annual revenue.</p>
                </div>
                <button className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/30">
                  Launch Pacing Guide
                </button>
              </div>
            </div>

            {/* Overtime Audit Audit */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-zinc-800 p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                    Overtime Efficiency Audit
                  </h3>
                  <p className="text-base text-zinc-500 font-semibold italic">Precision payroll tracking and loss prevention</p>
                </div>
                <div className="px-6 py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-[1.5rem] text-lg font-black border border-rose-100 dark:border-rose-900/20">
                  Total Loss: ${totalOTCost.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overtimeData.filter(d => d.overtimeHours > 0).length === 0 ? (
                  <div className="col-span-full py-20 text-center text-zinc-400 font-black text-xl border-4 border-dashed border-zinc-50 dark:border-zinc-800 rounded-[3rem] italic uppercase tracking-tighter">
                    Excellent: No Overtime Leakage Detected
                  </div>
                ) : (
                  overtimeData.filter(d => d.overtimeHours > 0).map((staff, i) => (
                    <motion.div
                      key={staff.staffId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-6 bg-gray-50 dark:bg-zinc-800/40 rounded-[2rem] border border-gray-100 dark:border-zinc-700 flex flex-col gap-4 group hover:shadow-xl hover:border-rose-200 dark:hover:border-rose-900/30 transition-all cursor-default"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-black text-xl text-gray-900 dark:text-white block tracking-tighter">{staff.staffName}</span>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{staff.standardHours}h Cycle</span>
                        </div>
                        <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-black text-sm italic shadow-sm group-hover:scale-110 transition-transform">
                          +{staff.overtimeHours.toFixed(1)}h
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Drain</div>
                          <div className="text-3xl font-black text-rose-500 tracking-tight">${staff.overtimeCost.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Total</div>
                          <div className="text-lg font-black text-gray-700 dark:text-zinc-300">{staff.weeklyHours.toFixed(1)}h</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                          style={{ width: `${Math.min(100, (staff.weeklyHours / staff.standardHours) * 100)}%` }}
                        />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Row 5: Inventory Variance Analysis */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 p-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-rose-500" />
                    Inventory Shrinkage Analysis (AvT)
                  </h3>
                  <p className="text-base text-zinc-500 font-semibold italic">Actual Usage (Ledger) vs. Theoretical Consumption (Recipes)</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-6 py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl text-lg font-black border border-rose-100 dark:border-rose-900/20">
                    Total Leakage: ${varianceData.reduce((sum, d) => sum + (d.costImpact > 0 ? d.costImpact : 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ingredient</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Theo Usage</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actual Usage</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Variance</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {varianceData.slice(0, 10).map((v, i) => (
                      <motion.tr
                        key={v.ingredientId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all cursor-default"
                      >
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 dark:text-white text-lg tracking-tight">{v.ingredientName}</span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID: 0x{v.ingredientId}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right font-black text-gray-600 dark:text-zinc-400">
                          {v.theoreticalUsage.toFixed(2)}
                        </td>
                        <td className="px-8 py-6 text-right font-black text-gray-900 dark:text-white">
                          {v.actualUsage.toFixed(2)}
                        </td>
                        <td className={`px-8 py-6 text-right font-black ${v.variancePercentage > 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          <div className="flex flex-col items-end">
                            <span>{v.varianceQuantity.toFixed(2)}</span>
                            <span className="text-[10px] opacity-80">{v.variancePercentage > 0 ? '+' : ''}{v.variancePercentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`px-4 py-2 rounded-xl text-sm font-black italic shadow-sm transition-transform group-hover:scale-110 inline-block ${v.costImpact > 100 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}>
                            ${v.costImpact.toLocaleString()}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeatmapCard({ title, subtitle, data, view, rangeStart, valueKey, label, colorScale, isCurrency, extraInfo }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 p-10 space-y-8 h-full flex flex-col">
      <div className="space-y-1">
        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{title}</h3>
        <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest opacity-80">{subtitle}</p>
      </div>

      <div className="grid grid-cols-7 gap-4 flex-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] pb-2">
            {day}
          </div>
        ))}

        {view === 'month' && Array.from({ length: (rangeStart.getDay() + 6) % 7 }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {data.map((dayData: any, idx: number) => {
          const date = parseISO(dayData.date);
          const val = dayData[valueKey];
          return (
            <Tooltip
              key={dayData.date}
              content={
                <div className="text-center p-2">
                  <div className="font-black text-[10px] text-white/50 mb-1 uppercase tracking-widest">{format(date, 'EEEE, MMM d')}</div>
                  <div className="text-xl font-black text-white tracking-tighter">
                    {isCurrency ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${val.toLocaleString()} ${label}`}
                  </div>
                  {dayData.laborPercentage !== undefined && (
                    <div className="text-xs font-black text-rose-400 mt-2">Labor Efficiency: {dayData.laborPercentage.toFixed(1)}%</div>
                  )}
                  {dayData.primeCostPercentage !== undefined && (
                    <div className="text-xs font-black text-violet-400">Prime Efficiency: {dayData.primeCostPercentage.toFixed(1)}%</div>
                  )}
                </div>
              }
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.005 }}
                whileHover={{ scale: 1.15, zIndex: 10, rotate: 3 }}
                className="aspect-square rounded-2xl cursor-crosshair flex flex-col items-center justify-center transition-all relative border border-black/5 dark:border-white/5 group"
                style={{
                  backgroundColor: getScaleColor(colorScale, dayData.intensity),
                  boxShadow: dayData.intensity > 0.8 ? `0 15px 30px -5px ${getScaleColor(colorScale, 0.4)}` : 'none'
                }}
              >
                <span className={`text-xs font-black transition-transform group-hover:scale-125 ${dayData.intensity > 0.6 ? 'text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                  {format(date, 'd')}
                </span>
                {dayData.intensity > 0.1 && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shadow-sm ${dayData.intensity > 0.6 ? 'bg-white/60' : 'bg-zinc-400/40'}`} />
                )}
                {extraInfo && dayData.intensity > 0.5 && extraInfo(dayData)}
              </motion.div>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] font-black text-zinc-400 uppercase tracking-[0.1em] pt-8 border-t border-gray-100 dark:border-zinc-800 mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex gap-1.5">
            {[0, 0.25, 0.5, 0.75, 1].map(lvl => (
              <div key={lvl} className="w-4 h-4 rounded-md shadow-sm border border-black/5 dark:border-white/5" style={{ backgroundColor: getScaleColor(colorScale, lvl) }} />
            ))}
          </div>
          <span>Precision Intensity</span>
        </div>
        <span className="opacity-40 italic">Ledger Node: 0xRE800</span>
      </div>
    </div>
  );
}

function MenuEngineeringMatrix({ data }: { data: MenuEngineeringData[] }) {
  const quadrants = [
    { id: 'STAR', label: 'Stars', color: 'bg-emerald-500', desc: 'High Popularity / High Margin', pos: 'top-left' },
    { id: 'PUZZLE', label: 'Puzzles', color: 'bg-indigo-500', desc: 'Low Popularity / High Margin', pos: 'top-right' },
    { id: 'PLOWHORSE', label: 'Plowhorses', color: 'bg-amber-500', desc: 'High Popularity / Low Margin', pos: 'bottom-left' },
    { id: 'DOG', label: 'Dogs', color: 'bg-rose-500', desc: 'Low Popularity / Low Margin', pos: 'bottom-right' },
  ];

  const getItemsByQuadrant = (quad: string) => data.filter(d => d.quadrant === quad);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 p-10 space-y-8 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Strategic Menu Engineering</h3>
          <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest opacity-80">Popularity Index vs. Contribution Margin Matrix</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 aspect-video xl:aspect-auto xl:h-[500px]">
        {quadrants.map(q => {
          const items = getItemsByQuadrant(q.id);
          return (
            <div key={q.id} className="relative bg-gray-50/50 dark:bg-zinc-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-700 p-6 flex flex-col group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-20 transition-all duration-700 pointer-events-none">
                <div className={`w-32 h-32 rounded-full ${q.color} blur-3xl`} />
              </div>

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={`w-3 h-3 rounded-full ${q.color} animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                <span className="font-black text-xl text-gray-900 dark:text-white tracking-tighter">{q.label}</span>
                <span className="text-[10px] font-black text-zinc-400 tracking-widest">{items.length} Items</span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 space-y-3">
                {items.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600 font-black italic uppercase text-xs">No Data In Quadrant</div>
                ) : (
                  items.map(item => (
                    <div key={item.menuItemId} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:scale-[1.02] transition-transform cursor-help">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">{item.name}</span>
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Vol: {item.unitsSold} | Mix: {item.salesMixPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-500">${item.marginPerUnit.toFixed(2)}</div>
                        <div className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Margin</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle, warning }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };

  return (
    <div className={`group bg-white dark:bg-zinc-900 p-7 rounded-[2rem] shadow-sm border ${warning ? 'border-rose-500/50 shadow-rose-500/5' : 'border-gray-100 dark:border-zinc-800'} flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full ${colors[color].split(' ')[0]} opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-12 -translate-y-12 blur-3xl`} />

      {warning && (
        <div className="absolute top-4 right-4 animate-bounce">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
        </div>
      )}

      <div className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center shadow-lg relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
        {icon}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{value}</h4>
        {subtitle && <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold mt-3 opacity-60 italic">{subtitle}</p>}
      </div>
    </div>
  );
}

function OpportunityItem({ title, desc, type }: any) {
  const icons: any = {
    success: <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Star className="w-4 h-4" /></div>,
    warning: <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><Zap className="w-4 h-4" /></div>,
    danger: <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><Target className="w-4 h-4" /></div>
  };

  return (
    <div className="p-4 bg-gray-50/50 dark:bg-zinc-800/30 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-indigo-100 dark:hover:border-indigo-900/20 transition-all group">
      <div className="flex items-center gap-3 mb-2">
        {icons[type]}
        <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{title}</span>
      </div>
      <p className="text-xs text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
        {desc}
      </p>
    </div>
  );
}

function getScaleColor(scale: string, intensity: number) {
  if (intensity === 0) return 'transparent';

  const colors: any = {
    indigo: [
      'rgba(99, 102, 241, 0.1)',
      'rgba(99, 102, 241, 0.3)',
      'rgba(99, 102, 241, 0.5)',
      'rgba(99, 102, 241, 0.8)',
      'rgba(99, 102, 241, 1)'
    ],
    emerald: [
      'rgba(16, 185, 129, 0.1)',
      'rgba(16, 185, 129, 0.3)',
      'rgba(16, 185, 129, 0.5)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(16, 185, 129, 1)'
    ],
    rose: [
      'rgba(244, 63, 94, 0.1)',
      'rgba(244, 63, 94, 0.3)',
      'rgba(244, 63, 94, 0.5)',
      'rgba(244, 63, 94, 0.8)',
      'rgba(244, 63, 94, 1)'
    ],
    violet: [
      'rgba(139, 92, 246, 0.1)',
      'rgba(139, 92, 246, 0.3)',
      'rgba(139, 92, 246, 0.5)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(139, 92, 246, 1)'
    ]
  };

  const palette = colors[scale] || colors.indigo;
  if (intensity < 0.2) return palette[0];
  if (intensity < 0.4) return palette[1];
  if (intensity < 0.6) return palette[2];
  if (intensity < 0.8) return palette[3];
  return palette[4];
}
