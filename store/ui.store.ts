// src/store/ui.store.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

type UIState = {
  loading: boolean;
  loadingText?: string;
  showBalance: boolean;

  showLoading: (text?: string) => void;
  hideLoading: () => void;
  toggleShowBalance: (showBalance: boolean) => void;
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

  toggleShowBalance: (showBalance) => {
    set({ showBalance: showBalance });
    setShowBalance(showBalance);
  },
}));

const setShowBalance = async (showBalance: boolean) => {
  await SecureStore.setItemAsync("showBalance", showBalance ? "true" : "false");

}
