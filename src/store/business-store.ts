import { create } from "zustand";

interface BusinessStore {
  activeBusinessId: string | null;

  setActiveBusiness: (
    id: string
  ) => void;
}

export const useBusinessStore =
  create<BusinessStore>((set) => ({
    activeBusinessId: null,

    setActiveBusiness: (id) =>
      set({
        activeBusinessId: id,
      }),
  }));