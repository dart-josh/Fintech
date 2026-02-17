import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "@/theme/ThemeContext";
import UIProvider from "@/providers/UIProvider";
import Toast from "@/components/Toast";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useToastStore } from "@/store/toast.store";
import ConfirmModal from "@/components/ConfirmModal";
import { fetchUser } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";
import { fetchEscrows } from "@/services/escrow.service";
// import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const toast = useToastStore();

  const { user } = useUserStore();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const handleUserTap = (data: any) => {
    if (user) fetchUser(user.id);
    if (data.type.includes("escrow") && user) fetchEscrows({ userId: user.id });

    if (data?.type === "wallet_credit") {
      router.push("/transactions");
    }

    if (data?.type === "transfer") {
      router.push("/transactions");
    }

    if (data?.type.includes("escrow")) {
      router.push("/escrow-home");
    }
  };

  useEffect(() => {
    if (Platform.OS === "ios") {
      // 🔔 Foreground notifications
      const receivedSub = Notifications.addNotificationReceivedListener(
        (notification) => {
          const content = notification.request.content;
          const data: any = notification.request.content.data;

          if (user) fetchUser(user.id);
          if (data.type.includes("escrow") && user)
            fetchEscrows({ userId: user.id });

          // Show a simple in-app banner
          toast.show({
            type: "success",
            message: content.title ?? "",
          });
        },
      );

      // 👆 When user taps notification
      const responseSub = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data: any = response.notification.request.content.data;

          handleUserTap(data);
        },
      );

      return () => {
        receivedSub.remove();
        responseSub.remove();
      };
    }

    // Android
    // else {
    //   const receivedSub = messaging().onMessage(async (remoteMessage) => {
    //     const content = remoteMessage.notification;
    //     const data: any = remoteMessage.data;
    //     if (!content) return;
    //     if (user) fetchUser(user.id);
    //     if (data.type.includes("escrow") && user)
    //       fetchEscrows({ userId: user.id });
    //     // Show a simple in-app banner
    //     toast.show({
    //       type: "success",
    //       message: content.title ?? "",
    //     });
    //   });
    //   const responseSub = messaging().onNotificationOpenedApp(
    //     (remoteMessage) => {
    //       const data: any = remoteMessage.data;
    //       handleUserTap(data);
    //     },
    //   );
    //   return () => {
    //     receivedSub();
    //     responseSub();
    //   };
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <ConfirmModal />
        <Toast />
        {/* </SafeAreaView> */}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
