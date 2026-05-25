"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useBusinessStore } from "@/store/business-store";
import { getUserBusinesses } from "@/lib/repositories/business.repository";
import { logoutUser } from "@/lib/services/auth.service";
import { Business } from "@/types/business";
import {
  LayoutDashboard,
  MapPin,
  Layers,
  Package,
  Truck,
  ChefHat,
  ClipboardList,
  FileText,
  PackageOpen,
  TrendingUp,
  Scale,
  BarChart3,
  Users,
  LogOut,
  Building2,
  ChevronDown,
  Menu,
  X,
  Loader2,
} from "lucide-react";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading: authLoading } = useAuth();
  const { activeBusinessId, setActiveBusiness } = useBusinessStore();
  const router = useRouter();
  const pathname = usePathname();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusinessDoc] = useState<Business | null>(null);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    let currentId = activeBusinessId;
    if (!currentId && typeof window !== "undefined") {
      const persisted = localStorage.getItem("stocktrack_active_business_id");
      if (persisted) {
        setActiveBusiness(persisted);
        currentId = persisted;
      }
    }

    if (!currentId && !authLoading) {
      router.push("/business");
      return;
    }

    async function loadBusinesses() {
      try {
        if (profile?.businessIds) {
          const list = await getUserBusinesses(profile.businessIds);
          setBusinesses(list);
          const activeDoc = list.find((b) => b.id === currentId) || null;
          setActiveBusinessDoc(activeDoc);
        }
      } catch (err) {
        console.error("Error loading businesses switcher:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBusinesses();
  }, [user, profile, authLoading, activeBusinessId, setActiveBusiness, router]);

  useEffect(() => {
    if (businesses.length > 0 && activeBusinessId) {
      const activeDoc = businesses.find((b) => b.id === activeBusinessId) || null;
      setActiveBusinessDoc(activeDoc);
    }
  }, [businesses, activeBusinessId]);

  const handleBusinessChange = (id: string) => {
    setActiveBusiness(id);
    localStorage.setItem("stocktrack_active_business_id", id);
    setShowBusinessDropdown(false);
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const masterDataLinks: SidebarLink[] = [
    { name: "Locations", href: "/dashboard/locations", icon: MapPin },
    { name: "Categories", href: "/dashboard/categories", icon: Layers },
    { name: "Stock Items", href: "/dashboard/stock-items", icon: Package },
    { name: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
    { name: "Recipes", href: "/dashboard/recipes", icon: ChefHat },
  ];

  const operationsLinks: SidebarLink[] = [
    { name: "Refill Planner", href: "/dashboard/refill-planner", icon: ClipboardList },
    { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: FileText },
    { name: "Deliveries", href: "/dashboard/deliveries", icon: PackageOpen },
    { name: "Sales & CSV Import", href: "/dashboard/sales", icon: TrendingUp },
  ];

  const analysisLinks: SidebarLink[] = [
    { name: "Variance Reconciliation", href: "/dashboard/reconciliation", icon: Scale },
    { name: "Printable Reports", href: "/dashboard/reports", icon: BarChart3 },
  ];

  const adminLinks: SidebarLink[] = [
    { name: "Staff Roster", href: "/dashboard/users", icon: Users },
  ];

  const isActive = (href: string) => pathname === href;

  const renderLink = (link: SidebarLink) => {
    const active = isActive(link.href);
    return (
      <a
        key={link.href}
        href={link.href}
        onClick={(e) => {
          e.preventDefault();
          router.push(link.href);
          setMobileSidebarOpen(false);
        }}
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
          active
            ? "bg-[#DCFCE7] border border-[#16A34A]/25 text-[#16A34A] font-extrabold"
            : "text-zinc-600 hover:text-[#0F172A] hover:bg-zinc-200/50 border border-transparent"
        }`}
      >
        <link.icon className={`h-4.5 w-4.5 transition-colors ${active ? "text-[#16A34A]" : "text-zinc-400"}`} />
        {link.name}
      </a>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F5F9] text-[#0F172A]">
        <Loader2 className="h-8 w-8 text-[#16A34A] animate-spin mb-4" />
        <p className="text-[#64748B] text-sm font-semibold uppercase tracking-wider">
          Syncing dashboard workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex bg-white text-[#0F172A] font-sans overflow-x-hidden">
      
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 bg-[#F1F5F9] shrink-0 sticky top-0 h-screen p-5 z-20">
        
        <div className="flex items-center gap-2 mb-6">
          <div className="h-7 w-7 rounded-lg bg-[#DCFCE7] border border-[#16A34A]/20 flex items-center justify-center shadow-sm">
            <span className="text-[#16A34A] font-extrabold text-base tracking-tighter">S</span>
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#0F172A]">StockTrack</span>
          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-white text-[#64748B] border border-zinc-200 shadow-sm ml-auto">
            V2
          </span>
        </div>

        <div className="relative mb-6">
          <button
            onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
            className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex justify-between items-center text-left transition-all duration-200 cursor-pointer focus:outline-none focus:border-[#16A34A]/30 group shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/10 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider leading-none">Venue</p>
                <p className="text-xs font-extrabold text-[#0F172A] truncate mt-1">
                  {activeBusiness?.name || "Select Business"}
                </p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-[#64748B] shrink-0 group-hover:text-[#0F172A] transition-colors" />
          </button>

          {showBusinessDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-30">
              <div className="max-h-48 overflow-y-auto py-1">
                {businesses
                  .filter((b) => b.id !== activeBusinessId)
                  .map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleBusinessChange(b.id)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-[#0F172A] transition-colors truncate block cursor-pointer"
                    >
                      {b.name}
                    </button>
                  ))}
              </div>
              <div className="border-t border-zinc-200 p-1.5 bg-zinc-50">
                <a
                  href="/business"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/business");
                  }}
                  className="w-full text-center py-2 text-[10px] uppercase font-bold tracking-wider text-[#16A34A] hover:text-[#16A34A] block hover:bg-[#DCFCE7] rounded-lg transition-colors cursor-pointer"
                >
                  Manage/Switch Business
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1 custom-scrollbar">
          <div>
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                router.push("/dashboard");
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive("/dashboard")
                  ? "bg-[#DCFCE7] border border-[#16A34A]/25 text-[#16A34A] font-extrabold"
                  : "text-zinc-600 hover:text-[#0F172A] hover:bg-zinc-200/50 border border-transparent"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
              Overview Dashboard
            </a>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#64748B] px-3.5 block">
              Master Data
            </span>
            <div className="space-y-1">{masterDataLinks.map(renderLink)}</div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#64748B] px-3.5 block">
              Operations
            </span>
            <div className="space-y-1">{operationsLinks.map(renderLink)}</div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#64748B] px-3.5 block">
              Analytics
            </span>
            <div className="space-y-1">{analysisLinks.map(renderLink)}</div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#64748B] px-3.5 block">
              Roster & Admin
            </span>
            <div className="space-y-1">{adminLinks.map(renderLink)}</div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-200 flex flex-col gap-3">
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8.5 w-8.5 rounded-full bg-white border border-zinc-200 flex items-center justify-center shrink-0 text-[#0F172A] font-extrabold text-xs shadow-sm">
                {profile?.fullName?.substring(0, 2).toUpperCase() || "OP"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0F172A] truncate leading-none">
                  {profile?.fullName || "Admin User"}
                </p>
                <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wide truncate mt-1">
                  {profile?.role || "Administrator"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-[#64748B] hover:text-[#EF4444] hover:bg-rose-50 hover:border-rose-200 bg-white border border-zinc-200 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout System
          </button>
        </div>
      </aside>

      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-30 flex">
          <aside className="w-64 bg-[#F1F5F9] border-r border-zinc-200 p-5 flex flex-col h-full z-45 relative">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="h-7 w-7 rounded-lg bg-[#DCFCE7] border border-[#16A34A]/20 flex items-center justify-center">
                <span className="text-[#16A34A] font-extrabold text-base tracking-tighter">S</span>
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#0F172A]">StockTrack</span>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-3.5 mb-6 shadow-sm">
              <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider leading-none">Selected Venue</p>
              <p className="text-sm font-extrabold text-[#0F172A] truncate mt-1">{activeBusiness?.name || "None Selected"}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1 custom-scrollbar">
              <div>
                <a
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/dashboard");
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive("/dashboard")
                      ? "bg-[#DCFCE7] border border-[#16A34A]/25 text-[#16A34A] font-extrabold"
                      : "text-zinc-600 hover:text-[#0F172A] hover:bg-zinc-200/50 border border-transparent"
                  }`}
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  Overview Dashboard
                </a>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#64748B] px-3.5 block">
                  Master Data
                </span>
                <div className="space-y-1">{masterDataLinks.map(renderLink)}</div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#64748B] px-3.5 block">
                  Operations
                </span>
                <div className="space-y-1">{operationsLinks.map(renderLink)}</div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#64748B] px-3.5 block">
                  Analytics
                </span>
                <div className="space-y-1">{analysisLinks.map(renderLink)}</div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#64748B] px-3.5 block">
                  Roster & Admin
                </span>
                <div className="space-y-1">{adminLinks.map(renderLink)}</div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-zinc-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-[#64748B] hover:text-[#EF4444] bg-white border border-zinc-200 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout System
              </button>
            </div>
          </aside>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative bg-white">
        <header className="sticky top-0 z-15 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:text-[#0F172A] border border-zinc-200 transition-colors cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-[#16A34A] bg-[#DCFCE7] border border-[#16A34A]/10 px-2 py-0.5 rounded-full tracking-wider leading-none shadow-sm">
                {activeBusiness?.name || "Active Session"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs font-semibold text-[#64748B]">
              Session Ref: <span className="font-mono text-[#0F172A] font-extrabold">#{activeBusinessId?.substring(0, 6) || "none"}</span>
            </span>
            <div className="h-4.5 w-px bg-zinc-200" />
            <a
              href="/business"
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#16A34A] transition-colors font-bold"
            >
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
              Switch Venue
            </a>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto relative z-10 select-none bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
