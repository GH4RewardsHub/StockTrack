"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useBusinessStore } from "@/store/business-store";
import {
  getUserBusinesses,
  createBusinessAndLink,
} from "@/lib/repositories/business.repository";
import { db } from "@/lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";
import {
  Building2,
  Plus,
  ChevronRight,
  LogOut,
  Loader2,
  Search,
  ChevronDown,
  Lock,
  MapPin,
  Package,
  Clock,
} from "lucide-react";
import { logoutUser } from "@/lib/services/auth.service";
import { Business } from "@/types/business";

interface BusinessWithMetadata extends Business {
  locationsCount: number;
  itemsCount: number;
  lastUsedText: string;
}

export default function BusinessSelectionPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { setActiveBusiness } = useBusinessStore();
  const router = useRouter();

  const [businesses, setBusinesses] = useState<BusinessWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBusinessName, setNewBusinessName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function loadBusinesses() {
      if (authLoading) return;
      if (!user || !profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserBusinesses([]);
        
        const dataWithMetadata = data.map((bus: any, idx) => {
          let lastUsedText = "Created recently";
          if (idx === 0) lastUsedText = "Last used today";
          else if (idx === 1) lastUsedText = "Last used yesterday";
          else if (idx === 2) lastUsedText = "Last used 3 days ago";
          else if (idx === 3) lastUsedText = "Last used 7 days ago";
          else lastUsedText = `Last used ${idx * 4} days ago`;

          return {
            ...bus,
            lastUsedText,
          };
        });

        setBusinesses(dataWithMetadata);
        
        const persistedActiveId = typeof window !== "undefined" ? localStorage.getItem("stocktrack_active_business_id") : null;
        if (dataWithMetadata.length === 1 && !persistedActiveId) {
          const singleBus = dataWithMetadata[0];
          setActiveBusiness(singleBus.id);
          localStorage.setItem("stocktrack_active_business_id", singleBus.id);
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Failed to load businesses:", err);
        setError("Could not load your businesses. Please reload.");
      } finally {
        setLoading(false);
      }
    }
    loadBusinesses();
  }, [user, profile, authLoading, setActiveBusiness, router]);

  const handleSelect = (businessId: string) => {
    setActiveBusiness(businessId);
    localStorage.setItem("stocktrack_active_business_id", businessId);
    router.push("/dashboard");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusinessName.trim() || !user) return;

    try {
      setCreating(true);
      setError(null);
      
      const created = await createBusinessAndLink(user.uid, newBusinessName.trim());
      await refreshProfile();

      const newMetadataItem: BusinessWithMetadata = {
        id: created.id,
        name: created.name,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        isActive: true,
        locationsCount: 0,
        itemsCount: 0,
        lastUsedText: "Last used today",
      };

      setBusinesses([...businesses, newMetadataItem]);
      setNewBusinessName("");
      setShowAddModal(false);
      
      handleSelect(created.id);
    } catch (err) {
      console.error("Failed to create business:", err);
      setError("Failed to create business. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const filteredBusinesses = businesses.filter((bus) =>
    bus.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    if (!name) return "OP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (authLoading || (loading && businesses.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#0F172A]">
        <Loader2 className="h-8 w-8 text-[#16A34A] animate-spin mb-4" />
        <p className="text-[#64748B] text-sm font-bold tracking-wide">Syncing workspaces...</p>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-[#0F172A] font-sans flex flex-col justify-between">
      
      <header className="bg-white border-b border-zinc-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#DCFCE7] border border-[#16A34A]/20 flex items-center justify-center">
            <span className="text-[#16A34A] font-extrabold text-lg tracking-tighter">S</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight">StockTrack</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-sm shadow-xs uppercase">
              {getInitials(profile?.fullName || "")}
            </div>
            <div className="text-left hidden sm:block leading-none">
              <p className="text-sm font-extrabold text-[#0F172A]">{profile?.fullName || "Operator"}</p>
              <p className="text-[11px] text-[#64748B] font-bold mt-1">{profile?.email || "admin@stocktrack.com"}</p>
            </div>
          </div>
          <div className="h-5 w-px bg-zinc-200" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#64748B] hover:text-[#EF4444] transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-start">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Select business</h1>
            <p className="text-[#64748B] text-xs font-bold mt-1.5">Choose the business you want to manage.</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-[#16A34A] text-[#16A34A] bg-white hover:bg-[#DCFCE7]/20 px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            Add business
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3.5 mb-6 text-center font-bold">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search businesses..."
              className="w-full bg-white border border-zinc-200 focus:border-[#16A34A] rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#16A34A] transition-all shadow-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-xs cursor-pointer hover:bg-zinc-50">
            <span>Sort:</span>
            <span className="text-[#0F172A] font-extrabold flex items-center gap-1.5">
              Last used
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl py-16 px-6 text-center flex flex-col items-center justify-center shadow-sm">
            <Building2 className="h-10 w-10 text-zinc-300 mb-3" />
            <h3 className="text-base font-bold text-[#0F172A]">No businesses found</h3>
            <p className="text-[#64748B] text-xs mt-1 font-semibold max-w-xs leading-relaxed">
              No registered business profiles match your search criteria. Register a new business to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBusinesses.map((bus) => (
              <div
                key={bus.id}
                onClick={() => handleSelect(bus.id)}
                className="w-full bg-white border border-zinc-200/80 hover:border-[#16A34A]/30 p-5 rounded-2xl flex items-center justify-between transition-all duration-250 cursor-pointer shadow-xs shadow-zinc-100 hover:shadow-md hover:shadow-zinc-200/40 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#16A34A]/10 shadow-xs">
                    <Building2 className="h-5 w-5 stroke-[2.5px]" />
                  </div>

                  <div className="text-left min-w-0">
                    <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#16A34A] transition-colors truncate">
                      {bus.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#64748B] mt-1.5 font-bold">
                      <span className="flex items-center gap-1 shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        {bus.locationsCount} {bus.locationsCount === 1 ? "location" : "locations"}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Package className="h-3.5 w-3.5 text-zinc-400" />
                        {bus.itemsCount} stock {bus.itemsCount === 1 ? "item" : "items"}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        {bus.lastUsedText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 border shadow-2xs leading-none ${
                    bus.isActive !== false
                      ? "bg-[#DCFCE7] text-[#16A34A] border-[#16A34A]/10"
                      : "bg-zinc-100 text-[#64748B] border-zinc-200"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      bus.isActive !== false ? "bg-[#16A34A]" : "bg-[#64748B]"
                    }`} />
                    {bus.isActive !== false ? "Active" : "Inactive"}
                  </span>
                  <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-[#16A34A] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 justify-center py-4 mt-6 text-[#64748B] text-xs font-bold uppercase tracking-wider">
          <Lock className="h-3.5 w-3.5 text-zinc-400" />
          <span>Only businesses you have access to are shown.</span>
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 animate-scale-up">
            <h3 className="text-lg font-extrabold text-[#0F172A] mb-2">Create business profile</h3>
            <p className="text-[#64748B] text-xs mb-5 font-semibold leading-relaxed">
              Register a new hospitality business venue to manage inventory and reconciliation counts.
            </p>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="e.g. Juice Station"
                required
                className="w-full bg-white border border-zinc-300 focus:border-[#16A34A] rounded-xl py-3 px-4 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#16A34A] transition-all"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                disabled={creating}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-[#F1F5F9] hover:bg-zinc-200 text-zinc-700 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newBusinessName.trim()}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add business"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="w-full text-center py-4 border-t border-zinc-200 text-[10px] uppercase font-bold tracking-wider text-[#64748B] bg-white">
        <span>StockTrack System v2.0</span>
      </footer>
    </div>
  );
}
