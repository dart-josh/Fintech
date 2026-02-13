import * as SecureStore from "expo-secure-store";
import * as Application from "expo-application";
import { Platform } from "react-native";
import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "arigopay_device_id";

export async function getDeviceId(): Promise<string> {
  // 1. Check stored ID
  const existingId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existingId) return existingId;

  // 2. Fallback system ID (best-effort)
  let baseId =
    Platform.OS === "android"
      ? Application.getAndroidId()
      : Application.getIosIdForVendorAsync
      ? await Application.getIosIdForVendorAsync()
      : null;

  // 3. Generate unique ID
  const deviceId = `${baseId ?? "device"}-${uuidv4()}`;

  // 4. Persist securely
  await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });

  return deviceId;
}
