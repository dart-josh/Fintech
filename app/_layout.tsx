import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/theme/ThemeContext";
import UIProvider from "@/providers/UIProvider";
import Toast from "@/components/Toast";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

export default function RootLayout() {
  const router = useRouter();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  useEffect(() => {
    // 🔔 Foreground notifications
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification.request.content);
      },
    );

    // 👆 When user taps notification
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.type === "wallet_credit") {
          router.push("/history");
        }

        if (data?.type === "transfer") {
          router.push("/transactions");
        }
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

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
