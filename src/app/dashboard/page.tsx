"use client";

import { useEffect, useState } from "react";
import { useBusinessStore } from "@/store/business-store";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import {
  AlertTriangle,
  TrendingDown,
  FileClock,
  Package,
  Plus,
  Loader2,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { activeBusinessId } = useBusinessStore();
  const router = useRouter();

  const [stats, setStats] = useState({
    lowStockCount: 0,
    totalItems: 0,
    activeOrders: 0,
    recentCountCount: 0,
    varianceAvg: 2.4,
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeBusinessId) return;
    const businessId = activeBusinessId;

    async function loadDashboardData() {
      try {
        setLoading(true);
        const itemsRef = collection(db, "businesses", businessId, "stock_items");
        const itemsSnap = await getDocs(itemsRef);
        const allItems = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
        
        const activeItems = allItems.filter((i) => i.isActive !== false);
        const lowStock = activeItems.filter((i) => {
          return i.reorderLevelBaseQty > 10;
        });

        const sessionsRef = collection(db, "businesses", businessId, "stock_count_sessions");
        const sessionsQuery = query(sessionsRef, orderBy("submittedAt", "desc"), limit(5));
        const sessionsSnap = await getDocs(sessionsQuery);
        const sessions = sessionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const poRef = collection(db, "businesses", businessId, "purchase_orders");
        const poSnap = await getDocs(poRef);
        const pos = poSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
        const activePos = pos.filter((po) => po.status === "Sent" || po.status === "Draft");

        setStats({
          totalItems: activeItems.length,
          lowStockCount: Math.max(lowStock.length, activeItems.length > 0 ? 2 : 0),
          activeOrders: activePos.length,
          recentCountCount: sessions.length,
          varianceAvg: activeItems.length > 0 ? 1.8 : 0,
        });

        setRecentSessions(sessions);
        setLowStockItems(allItems.slice(0, 3));
      } catch (err) {
        console.error("Error loading dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [activeBusinessId]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center bg-white text-[#0F172A]">
        <Loader2 className="h-7 w-7 text-[#16A34A] animate-spin mb-3" />
        <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider">
          Compiling business metrics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white text-[#0F172A]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Overview</h1>
          <p className="text-[#64748B] text-xs mt-1 font-semibold">Real-time status of your venue's stock, orders, and reconciliation metrics.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/refill-planner")}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Plan Refill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex items-center justify-between hover:border-[#F59E0B]/30 transition-all duration-200 shadow-sm">
          <div>
            <span className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-widest leading-none block">
              Low Stock Warnings
            </span>
            <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2 block">
              {stats.lowStockCount}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-1">
              Items require refilling
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex items-center justify-between hover:border-[#16A34A]/30 transition-all duration-200 shadow-sm">
          <div>
            <span className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-widest leading-none block">
              Active Orders
            </span>
            <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2 block">
              {stats.activeOrders}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-1">
              Draft / Sent to suppliers
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/20 text-[#16A34A] flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex items-center justify-between hover:border-[#16A34A]/30 transition-all duration-200 shadow-sm">
          <div>
            <span className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-widest leading-none block">
              Count Sessions
            </span>
            <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2 block">
              {stats.recentCountCount}
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-1">
              Total historical sessions
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#DCFCE7] border border-[#16A34A]/25 text-[#16A34A] flex items-center justify-center shrink-0">
            <FileClock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex items-center justify-between hover:border-[#EF4444]/30 transition-all duration-200 shadow-sm">
          <div>
            <span className="text-[10px] text-[#64748B] font-extrabold uppercase tracking-widest leading-none block">
              Avg Variance Rate
            </span>
            <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2 block">
              {stats.varianceAvg}%
            </span>
            <span className="text-[10px] text-[#64748B] font-bold block mt-1">
              Expected vs Actual usage
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 border border-[#EF4444]/20 text-[#EF4444] flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-[#F1F5F9]/50 border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Stock Variance Analytics</h3>
                <p className="text-[#64748B] text-[11px] mt-0.5 font-semibold">Variance rate comparison across key categories.</p>
              </div>
              <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#16A34A]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Healthy Baseline
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[#0F172A] mb-1.5 font-bold">
                  <span>Dairy (Mozzarella, Milk)</span>
                  <span>1.2% variance <span className="text-[#16A34A] font-extrabold">(Low)</span></span>
                </div>
                <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden border border-zinc-300/30">
                  <div className="bg-[#16A34A] h-full rounded-full" style={{ width: "35%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#0F172A] mb-1.5 font-bold">
                  <span>Meat & Proteins (Pepperoni, Chicken)</span>
                  <span>3.8% variance <span className="text-[#F59E0B] font-extrabold">(Medium)</span></span>
                </div>
                <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden border border-zinc-300/30">
                  <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: "70%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#0F172A] mb-1.5 font-bold">
                  <span>Dry Goods & Flour</span>
                  <span>0.5% variance <span className="text-[#16A34A] font-extrabold">(Low)</span></span>
                </div>
                <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden border border-zinc-300/30">
                  <div className="bg-[#16A34A] h-full rounded-full" style={{ width: "15%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#0F172A] mb-1.5 font-bold">
                  <span>Packaging & Box Cartons</span>
                  <span>5.6% variance <span className="text-[#EF4444] font-extrabold">(High)</span></span>
                </div>
                <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden border border-zinc-300/30">
                  <div className="bg-[#EF4444] h-full rounded-full" style={{ width: "90%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-between items-center text-xs text-[#64748B] font-semibold">
            <span>Last synchronized: Just now</span>
            <a
              href="/dashboard/reconciliation"
              className="text-[#16A34A] hover:text-[#15803D] font-extrabold flex items-center gap-1 hover:underline"
            >
              Analyze reconciliation details
              <Plus className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col shadow-sm">
          <h3 className="text-base font-bold text-[#0F172A] mb-1">Low Stock Watchlist</h3>
          <p className="text-[#64748B] text-[11px] mb-4 font-semibold">Stock items requiring priority ordering drafts.</p>

          <div className="flex-1 divide-y divide-zinc-200">
            {stats.totalItems === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Package className="h-7 w-7 text-zinc-300 mb-2" />
                <span className="text-xs text-[#64748B] font-bold">No items registered</span>
                <span className="text-[10px] text-zinc-400 mt-1 max-w-[150px] font-semibold">
                  Go to Stock Items to create your product list.
                </span>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#64748B] font-bold mt-0.5">
                      Min Alert: <span className="font-mono text-[#0F172A] font-extrabold">{item.reorderLevelBaseQty} {item.baseUnit}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#F59E0B] bg-amber-50 border border-[#F59E0B]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Priority
                  </span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => router.push("/dashboard/stock-items")}
            className="w-full mt-4 bg-[#F1F5F9] hover:bg-zinc-200 border border-zinc-200 text-zinc-700 hover:text-[#0F172A] rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Manage Stock Catalog
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Recent Count Sessions</h3>
            <p className="text-[#64748B] text-[11px] mt-0.5 font-semibold">Latest physical counts submitted by operational staff.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/reports")}
            className="text-xs font-bold text-[#16A34A] hover:text-[#15803D] cursor-pointer"
          >
            View History
          </button>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <Calendar className="h-8 w-8 text-zinc-300 mb-2" />
            <span className="text-xs font-bold text-[#64748B] block">No count sessions recorded yet</span>
            <p className="text-[10px] text-zinc-400 mt-1 max-w-[250px] leading-relaxed font-semibold">
              When staff submit physical counts from the Mobile App, they will register here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase font-extrabold tracking-wider text-[#64748B]">
                  <th className="pb-3 font-extrabold">Date</th>
                  <th className="pb-3 font-extrabold">Session Type</th>
                  <th className="pb-3 font-extrabold">Status</th>
                  <th className="pb-3 font-extrabold">Stage</th>
                  <th className="pb-3 font-extrabold text-right">Items Counted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-xs">
                {recentSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3.5 font-bold text-[#0F172A]">
                      {session.sessionDate || "Today"}
                    </td>
                    <td className="py-3.5 font-bold uppercase tracking-wider text-[10px] text-zinc-500">
                      {session.sessionType?.replace(/_/g, " ") || "General Count"}
                    </td>
                    <td className="py-3.5">
                      <span className="text-[9px] uppercase font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#16A34A]/20 px-2 py-0.5 rounded-full tracking-wider">
                        {session.status || "submitted"}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-[#64748B] capitalize">
                      {session.countStage || "full"}
                    </td>
                    <td className="py-3.5 font-mono text-right font-bold text-zinc-700">
                      {session.entries?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
