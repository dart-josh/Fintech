// store/confirm.store.ts
import { create } from "zustand";

// store/confirmation.store.ts

type ConfirmOptions = {
  title: string;
  message?: string;
  subtitle?: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  danger?: boolean;
};

type ConfirmStore = {
  visible: boolean;
  options: ConfirmOptions | null;
  resolver: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleClose: (value: boolean) => void;
};


export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  visible: false,
  options: null,
  resolver: null,

  confirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        visible: true,
        options,
        resolver: resolve,
      });
    });
  },

  handleClose: (value) => {
    const resolver = get().resolver;
    if (resolver) resolver(value);

    set({
      visible: false,
      options: null,
      resolver: null,
    });
  },
}));
