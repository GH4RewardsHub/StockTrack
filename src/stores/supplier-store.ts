import { create } from "zustand";
import { Supplier } from "@/types/inventory";
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
} from "@/lib/repositories/supplier.repository";

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  fetchSuppliers: (businessId: string) => Promise<void>;
  addSupplier: (
    businessId: string,
    data: Omit<Supplier, "id" | "createdAt">,
  ) => Promise<void>;
  updateSupplier: (
    businessId: string,
    supplierId: string,
    data: Partial<Omit<Supplier, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteSupplier: (businessId: string, supplierId: string) => Promise<void>;
}

export const useSupplierStore = create<SupplierState>((set) => ({
  suppliers: [],
  loading: false,
  error: null,
  fetchSuppliers: async (businessId) => {
    set({ loading: true, error: null });
    try {
      const data = await getSuppliers(businessId);
      set({ suppliers: data, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to load suppliers",
        loading: false,
      });
    }
  },
  addSupplier: async (businessId, data) => {
    set({ loading: true, error: null });
    try {
      await createSupplier(businessId, data);
      const updated = await getSuppliers(businessId);
      set({ suppliers: updated, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to add supplier",
        loading: false,
      });
      throw err;
    }
  },
  updateSupplier: async (businessId, supplierId, data) => {
    set({ loading: true, error: null });
    try {
      await updateSupplier(businessId, supplierId, data);
      const updated = await getSuppliers(businessId);
      set({ suppliers: updated, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to update supplier",
        loading: false,
      });
      throw err;
    }
  },
  deleteSupplier: async (businessId, supplierId) => {
    set({ loading: true, error: null });
    try {
      await deleteSupplier(businessId, supplierId);
      const updated = await getSuppliers(businessId);
      set({ suppliers: updated, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error).message || "Failed to delete supplier",
        loading: false,
      });
      throw err;
    }
  },
}));
