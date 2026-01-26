import { create } from "zustand";

export type ToastType = "success" | "error" | "warning";

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;

  show: (opts: {
    message: string;
    type?: ToastType;
    duration?: number;
  }) => void;

  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: "",
  type: "success",
  duration: 2500,

  show: ({ message, type = "success", duration = 2500 }) =>
    set({
      visible: true,
      message,
      type,
      duration,
    }),

  hide: () =>
    set({
      visible: false,
    }),
}));
