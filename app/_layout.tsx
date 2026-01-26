import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/theme/ThemeContext";
import UIProvider from "@/providers/UIProvider";
import Toast from "@/components/Toast";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" translucent />
        {/* <SafeAreaView style={{ flex: 1 }} edges={["top"]}> */}
        <UIProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="splash" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </UIProvider>
        <Toast />
        {/* </SafeAreaView> */}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
