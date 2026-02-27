import { verifyTxPin } from "@/services/auth.service";
import { useUIStore } from "@/store/ui.store";
import { useUserStore } from "@/store/user.store";
import { Vibration } from "react-native";
import { create } from "zustand";

type ConfirmPinStore = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
  confirmPin: (onComplete: () => Promise<void>) => void;
  onComplete: (() => Promise<void>) | null;
  error: string | null;
  isLoading: boolean;
};

const verifyPin = async (pin: string): Promise<boolean> => {
  const { user } = useUserStore.getState();
  const valid = await verifyTxPin({ userId: user?.id ?? "", pin });
  return valid;
};

export const useConfirmPinHook = create<ConfirmPinStore>((set, get) => ({
  visible: false,
  error: null,
  isLoading: false,
  onComplete: null,

  onConfirm: async (pin: string) => {
    const { showLoading, hideLoading } = useUIStore.getState();

    set({
      isLoading: true,
      error: null,
    });
    showLoading();

    const pinValid = await verifyPin(pin);

    if (!pinValid) {
      set({
        isLoading: false,
        error: "Invalid PIN",
      });
      hideLoading();
      Vibration.vibrate(200);
      return;
    }

    showLoading();

    try {
      const onComplete = get().onComplete;
      if (onComplete) await onComplete();

      hideLoading();
      get().onClose();
    } catch (e: any) {
      hideLoading();
      set({ error: e.toString() });
      Vibration.vibrate(200);
    }
  },

  confirmPin: (onComplete) => {
    set({
      visible: true,
      error: null,
      isLoading: false,
      onComplete,
    });
  },

  onClose: () => {
    set({
      visible: false,
      error: null,
      isLoading: false,
    });
  },
}));
