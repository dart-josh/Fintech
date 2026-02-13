import { authApi } from "@/api/auth.api";
import { useRegisterStore } from "@/store/register.store";
import { useToastStore } from "@/store/toast.store";
import { useUIStore } from "@/store/ui.store";
import { mapUser, User, useUserStore } from "@/store/user.store";
import * as SecureStore from "expo-secure-store";
import { fetchUser } from "./user.service";
import { useWalletStore } from "@/store/wallet.store";
import { getDeviceId } from "./device.service";
import { clearBiometricToken, saveBiometricToken } from "./secureStore.service";

const toast = useToastStore.getState();

export async function login(data: {
  identifier: string;
  password: string;
  mode: "email" | "phone";
}): Promise<User | null> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    const { setUser } = useUserStore.getState();
    const { setUserId } = useRegisterStore.getState();
    showLoading("Secure login");

    const res: any = await authApi.login(data);

    if (!res.user) return null;

    const user: User = mapUser(res.user);

    setUser(user);
    setUserId(user.id);
    // Save userId
    await SecureStore.setItemAsync("userId", user.id);

    return user;
  } catch (error) {
    // console.error(":", error);
    return null;
  } finally {
    hideLoading();
  }
}

export async function pinLogin(data: {
  userId: string;
  pin: string;
}): Promise<User | null> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    const { setUser } = useUserStore.getState();
    const { setUserId } = useRegisterStore.getState();
    showLoading("Secure login");

    const res: any = await authApi.pinLogin(data);

    if (!res.user) return null;

    const user: User = mapUser(res.user);

    setUser(user);
    setUserId(user.id);
    // Save userId
    await SecureStore.setItemAsync("userId", user.id);

    return user;
  } catch (error) {
    // console.error(":", error.message);
    return null;
  } finally {
    hideLoading();
  }
}

export async function verifyTxPin(data: {
  userId: string;
  pin: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Verifying PIN");

    const res = await authApi.verifyTxPin(data);
    if (!res.status) return false;
    return true;
  } catch (error: any) {
    // console.error(":", error.message);
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}

// register user
export async function registerUser(data: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  username: string;
  referral_id: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();
  const { setUserId } = useRegisterStore.getState();

  try {
    showLoading("Saving user details");

    const res: any = await authApi.registerUser(data);

    if (!res.status) return false;

    setUserId(res.user_id ?? "");
    await SecureStore.setItemAsync("userId", res.user_id);

    return true;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    // console.error(":", error.message);
    return false;
  } finally {
    hideLoading();
  }
}

// send email code
export async function sendEmailCode(email: string): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Sending code");

    const res = await authApi.sendEmailCode({ email });

    if (!res.status) return false;

    return true;
  } catch (error) {
    // console.error(":", error);
    return false;
  } finally {
    hideLoading();
  }
}

// verify sign up code
export async function verifyEmailCode(data: {
  email: string;
  code: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Verifying code");

    const res = await authApi.verifyEmailCode(data);

    if (!res.status) return false;

    return true;
  } catch (error) {
    return false;
  } finally {
    hideLoading();
  }
}

export async function resetPassword(email: string): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Sending code");

    const res: any = await authApi.resetPassword({ email });

    if (!res.status) return false;

    const { setUserId } = useRegisterStore.getState();
    setUserId(res.userId ?? "");

    return true;
  } catch (error: any) {
    toast.show({
      type: "error",
      message: error.message,
    });
    return false;
  } finally {
    hideLoading();
  }
}

// update login pin
export async function createLoginPin(data: {
  userId: string;
  pin: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Creating PIN");

    const res = await authApi.createLoginPin(data);

    if (!res.status) return false;

    return true;
  } catch (error) {
    // console.error(":", error.message);
    return false;
  } finally {
    hideLoading();
  }
}

export async function updatePin(data: {
  userId: string;
  password: string;
  mode: string;
  pin: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Setting PIN");

    const res = await authApi.updatePin(data);

    if (!res.status) return false;
    fetchUser(data.userId);

    return true;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}

export async function changePassword(data: {
  userId: string;
  password: string;
  mode: string;
  new_password: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Setting Password");

    const res = await authApi.changePassword(data);

    if (!res["status"]) return false;

    return true;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}

export async function logout(): Promise<boolean> {
  try {
    const { logout, user, deviceToken } = useUserStore.getState();
    const { clearWallet } = useWalletStore.getState();

    logout();
    clearWallet();

    const device_id = await getDeviceId();

    await authApi.logoutDevice({
      userId: user?.id ?? "",
      token: deviceToken ?? "",
      device_id,
    });

    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("showBalance");
    await SecureStore.deleteItemAsync("useBiometrics");
    clearBiometricToken();
    return true;
  } catch (error) {
    return false;
  }
}

export async function saveBiometricTokenToDB(data: {
  userId: string;
  deviceId: string;
}): Promise<string | null> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Saving Biometric");

    const res: any = await authApi.saveBiometricToken(data);

    if (!res.status) return null;

    return res.session_token;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return null;
  } finally {
    hideLoading();
  }
}

export async function validateSessionToken(data: {
  token: string;
  deviceId: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Validating Biometric");

    const res: any = await authApi.validateSessionToken(data);

    if (!res.status) return false;
    if (!res.newToken) return false;

    await saveBiometricToken(res.newToken);

    return true;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}
