// store/escrow.store.ts
import { Escrow } from "@/services/escrow.service";
import { create } from "zustand";

type EscrowStore = {
  escrows: Escrow[];
  loading: boolean;

  // Fetch all escrows and replace store
  setEscrows: (data: Escrow[]) => void;

  // Update a single escrow by escrow_ref
  updateEscrow: (escrowRef: string, updatedData: Partial<Escrow>) => void;

  // Add a new escrow
  addEscrow: (newEscrow: Escrow) => void;

  // Optional: remove escrow
  removeEscrow: (escrowRef: string) => void;

  // Loading toggle
  setLoading: (val: boolean) => void;
};

export const useEscrowStore = create<EscrowStore>((set, get) => ({
  escrows: [],
  loading: false,

  setEscrows: (data) => set({ escrows: data }),

  addEscrow: (newEscrow) =>
    set((state) => ({ escrows: [newEscrow, ...state.escrows] })),

  updateEscrow: (escrowRef, updatedData) =>
    set((state) => ({
      escrows: state.escrows.map((e) =>
        e.escrow_ref === escrowRef ? { ...e, ...updatedData } : e
      ),
    })),

  removeEscrow: (escrowRef) =>
    set((state) => ({
      escrows: state.escrows.filter((e) => e.escrow_ref !== escrowRef),
    })),

  setLoading: (val) => set({ loading: val }),
}));
