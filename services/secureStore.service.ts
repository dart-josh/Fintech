import * as SecureStore from "expo-secure-store";

export async function saveBiometricToken(token: string) {
  await SecureStore.setItemAsync("biometric_token", token, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function getBiometricToken() {
  return SecureStore.getItemAsync("biometric_token");
}

export async function clearBiometricToken() {
  await SecureStore.deleteItemAsync("biometric_token");
}
