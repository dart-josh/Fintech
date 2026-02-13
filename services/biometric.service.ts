import * as LocalAuthentication from "expo-local-authentication";

export async function isBiometricSupported() {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

export async function authenticateBiometric() {
  return await LocalAuthentication.authenticateAsync({
    promptMessage: "Confirm your identity",
    fallbackLabel: "Use PIN",
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });
}
