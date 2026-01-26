// src/store/ui.store.ts
import { create } from "zustand";

type UIState = {
  loading: boolean;
  loadingText?: string;
  showBalance: boolean;

  showLoading: (text?: string) => void;
  hideLoading: () => void;
  toggleShowBalance: () => void;
};

export const useUIStore = create<UIState>((set, get) => ({
  loading: false,
  loadingText: undefined,
  showBalance: true,

  showLoading: (text) =>
    set({
      loading: true,
      loadingText: text,
    }),

  hideLoading: () =>
    set({
      loading: false,
      loadingText: undefined,
    }),

  toggleShowBalance: () => {
    const { showBalance } = get();
    set({ showBalance: !showBalance });
  },
}));
