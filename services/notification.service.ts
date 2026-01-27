import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { notificationApi } from '@/api/notification.api';
import { useUserStore } from '@/store/user.store';

export async function registerForPushNotifications() {
    const {user} = useUserStore.getState();

  if (!Device.isDevice) return null;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } =
      await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  notificationApi.saveDeviceToken({userId: user?.id ?? "", token})
  return token;
}
