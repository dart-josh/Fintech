// src/store/ui.store.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import {
  authenticateBiometric,
  isBiometricSupported,
} from "@/services/biometric.service";
import { getDeviceId } from "@/services/device.service";
import { saveBiometricTokenToDB } from "@/services/auth.service";
import {
  clearBiometricToken,
  saveBiometricToken,
} from "@/services/secureStore.service";
import { useUserStore } from "./user.store";

type UIState = {
  loading: boolean;
  loadingText?: string;
  showBalance: boolean;
  useBiometrics: boolean;

  showLoading: (text?: string) => void;
  hideLoading: () => void;
  toggleShowBalance: (showBalance: boolean) => void;
  toggleUseBiometrics: (useBiometrics: boolean) => void;
};

export const useUIStore = create<UIState>((set, get) => ({
  loading: false,
  loadingText: undefined,
  showBalance: true,
  useBiometrics: false,

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

  toggleUseBiometrics: async (useBiometrics) => {
    set({ useBiometrics: useBiometrics });
    setUseBiometrics(useBiometrics);
  },
}));

const setShowBalance = async (showBalance: boolean) => {
  await SecureStore.setItemAsync("showBalance", showBalance ? "true" : "false");
};

const setUseBiometrics = async (useBiometrics: boolean) => {
  await SecureStore.setItemAsync(
    "useBiometrics",
    useBiometrics ? "true" : "false",
  );
};

export const enableBiometrics = async (enabled: boolean): Promise<boolean> => {
  const { user } = useUserStore.getState();
  const { showLoading, hideLoading } = useUIStore.getState();
  if (enabled) {
    const supported = await isBiometricSupported();
    if (!supported) {
      Alert.alert("Biometrics not available");
      // toggleUseBiometrics(false);
      return false;
    }

    const auth = await authenticateBiometric();
    if (!auth.success) {
      // toggleUseBiometrics(false);
      return false;
    }

    showLoading();

    const deviceId = await getDeviceId();

    // save
    const session_token = await saveBiometricTokenToDB({
      userId: user?.id ?? "",
      deviceId,
    });

    hideLoading();

    if (!session_token) {
      // toggleUseBiometrics(false);
      return false;
    }

    await saveBiometricToken(session_token);
    // toggleUseBiometrics(true);
    return true;
  } else {
    // clear token
    await clearBiometricToken();
    // toggleUseBiometrics(false);
    return false;
  }
};
