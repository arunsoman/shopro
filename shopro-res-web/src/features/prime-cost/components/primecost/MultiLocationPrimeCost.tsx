// // ─────────────────────────────────────────────────────────────
// // features/prime-cost/MultiLocationPage.tsx  — SS5.7
// // Corporate rollup — one row per location + combined aggregate
// // API: getMultiLocationSummary
// // ─────────────────────────────────────────────────────────────

// import React, { useState, type FC } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuthStore } from "@/store/auth.store";
// import { useMultiLocationSummary } from "@/hooks/usePrimeCost";
// import {
//   C, fmt, fmtPct, pcColor, pcBg, GlobalStyles,
//   Card, CardHeader, BtnGhost, WeekSelector, PageLoader, PageError,
//   StatusBadge, VarianceChip, Table, Th, Td,
// } from "@/components/shared/";
// import { getWeekStart, formatWeekLabel, weekOffset } from "@/lib/date";
// import { ROUTES } from "@/router/routes";

// // In production, the list of restaurant IDs the owner has access to
// // comes from the auth token / user profile. For now we read from the store.
// // You'd replace this with a real multi-restaurant user setup.
// const useOwnedRestaurantIds = (): number[] => {
//   const user = useAuthStore(s => s.user);
//   // Owner can see all locations. If user.role !== OWNER, just return their own.
//   // This hook would be extended as your multi-tenant model grows.
//   return user ? [user.restaurantId] : [];
// };

// const MultiLocationPage: FC = () => {
//   const navigate   = useNavigate();
//   const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
//   const restaurantIds = useOwnedRestaurantIds();

//   const query = useMultiLocationSummary({ weekStart, restaurantIds });

//   if (query.isLoading) return <PageLoader />;
//   if (query.isError)   return <PageError message="Failed to load multi-location summary" onRetry={() => query.refetch()} />;

//   const d = query.data!;

//   return (
//     <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
//       <GlobalStyles />

//       {/* ── Header ── */}
//       <div style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
//         <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.text }}>
//           Multi-Location Prime Cost
//         </h1>
//         <WeekSelector
//           weekStart={weekStart}
//           label={formatWeekLabel(weekStart)}
//           onPrev={() => setWeekStart(weekOffset(weekStart, -1))}
//           onNext={() => setWeekStart(weekOffset(weekStart, 1))}
//         />
//       </div>

//       {/* ── Combined rollup banner ── */}
//       <div style={{
//         margin: "0 32px 20px",
//         background: pcBg(d.combinedPrimeCostPct),
//         border: `1px solid ${pcColor(d.combinedPrimeCostPct)}40`,
//         borderRadius: 12, padding: "20px 24px",
//         display: "flex", gap: 40, flexWrap: "wrap", alignItems: "center",
//       }}>
//         <div>
//           <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>
//             Combined Prime Cost %
//           </div>
//           <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 48, color: pcColor(d.combinedPrimeCostPct), lineHeight: 1 }}>
//             {fmtPct(d.combinedPrimeCostPct)}
//           </div>
//         </div>
//         <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
//           {[
//             ["Combined Sales",      fmt(d.combinedGrossSales)],
//             ["Combined Prime Cost", fmt(d.combinedPrimeCostGross)],
//             ["Locations",           String(d.locations.length)],
//             ["Alerts",              String(d.locations.filter(l => l.alert).length)],
//           ].map(([label, value]) => (
//             <div key={label}>
//               <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{label}</div>
//               <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 18, color: C.text }}>{value}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Location table ── */}
//       <div style={{ padding: "0 32px 32px" }}>
//         <Card>
//           <Table>
//             <thead>
//               <tr>
//                 <Th>Location</Th>
//                 <Th right>Gross Sales</Th>
//                 <Th right>Prime Cost $</Th>
//                 <Th right>Prime Cost %</Th>
//                 <Th right>Budget %</Th>
//                 <Th right>Variance</Th>
//                 <Th>Status</Th>
//                 <Th />
//               </tr>
//             </thead>
//             <tbody>
//               {d.locations.map(loc => (
//                 <tr
//                   key={loc.restaurantId}
//                   style={{ background: loc.alert ? "#1a100a" : "transparent", cursor: "pointer" }}
//                   onClick={() => navigate(ROUTES.PRIME_COST_WEEKLY)}
//                 >
//                   <Td>
//                     <div style={{ fontWeight: 600, color: C.text }}>{loc.restaurantName}</div>
//                     {loc.alert && (
//                       <div style={{ fontSize: 11, color: C.red, marginTop: 2 }}>⚠ Over budget by 2+ pts</div>
//                     )}
//                   </Td>
//                   <Td right mono>{fmt(loc.grossSales)}</Td>
//                   <Td right mono>{fmt(loc.primeCostGross)}</Td>
//                   <Td right>
//                     <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, color: pcColor(loc.primeCostGrossPct), fontSize: 15 }}>
//                       {fmtPct(loc.primeCostGrossPct)}
//                     </span>
//                   </Td>
//                   <Td right mono style={{ color: C.textDim }}>
//                     {loc.budgetPrimeCostPct !== null ? fmtPct(loc.budgetPrimeCostPct) : "—"}
//                   </Td>
//                   <Td right>
//                     {loc.variancePts !== null
//                       ? <VarianceChip pts={loc.variancePts} favorable={loc.variancePts <= 0} />
//                       : <span style={{ color: C.textDim }}>—</span>
//                     }
//                   </Td>
//                   <Td><StatusBadge status={loc.status} /></Td>
//                   <Td right>
//                     <BtnGhost onClick={e => { e.stopPropagation(); navigate(ROUTES.PRIME_COST_WEEKLY); }}>
//                       View →
//                     </BtnGhost>
//                   </Td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default MultiLocationPage;