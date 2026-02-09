import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { notificationApi } from "@/api/notification.api";
import { useUserStore } from "@/store/user.store";
// import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";

async function getFcmToken() {
  // await messaging().requestPermission();
  // const token = await messaging().getToken();
  // return token;
  return null;
}

async function getExpoToken() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

async function getPushRegistration() {
  if (Platform.OS === "ios") {
    const token = await getExpoToken();
    if (!token) return null;
    return {
      token,
      platform: "ios",
      token_type: "expo",
    };
  }

  if (Platform.OS === "android") {
    const token = await getFcmToken();
    if (!token) return null;
    return {
      token,
      platform: "android",
      token_type: "fcm",
    };
  }

  return null;
}

export async function registerForPushNotifications() {
  const { user, setDeviceToken } = useUserStore.getState();

  const data = await getPushRegistration();

  if (!data) return null;

  notificationApi.saveDeviceToken({
    userId: user?.id ?? "",
    token: data.token,
    platform: data.platform,
    token_type: data.token_type,
  });
  setDeviceToken(data.token);

  return data.token;
}

export async function deactivateDevice(): Promise<boolean> {
  const { user, deviceToken } = useUserStore.getState();

  try {
    await notificationApi.deactivateDevice({
      userId: user?.id ?? "",
      token: deviceToken ?? "",
    });

    return true;
  } catch (error) {
    return false;
  }
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  const { user } = useUserStore.getState();

  try {
    await notificationApi.markAsRead({
      userId: user?.id ?? "",
      notificationId,
    });

    return true;
  } catch (error) {
    return false;
  }
}
