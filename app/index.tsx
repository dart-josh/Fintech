// app/index.tsx
import { Redirect } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useUIStore } from "@/store/ui.store";

export default function Index() {
  const {toggleShowBalance} = useUIStore();
  useEffect(() => {
    const getAppPreference = async () => {
      const value = await SecureStore.getItemAsync("showBalance");
      const showBalance = value === "false";
      toggleShowBalance(!showBalance);
    };

    getAppPreference();
  }, [toggleShowBalance]);

  // Show splash first
  return <Redirect href="/splash" />;
}

// eas build --platform android --profile production

// eas build -p android --profile preview

// eas build --platform android --profile preview --local

// "usesCleartextTraffic": true
