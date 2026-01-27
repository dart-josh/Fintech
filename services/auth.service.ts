// services/auth.service.ts
import { authApi } from "@/api/auth.api";
import { useRegisterStore } from "@/store/register.store";
import { useToastStore } from "@/store/toast.store";
import { useUIStore } from "@/store/ui.store";
import { User, useUserStore } from "@/store/user.store";
import * as SecureStore from "expo-secure-store";
import { getWalletDetails, listBeneficiaries } from "./wallet.service";
import { getUserVerifications } from "./user.service";

type RegisterDetailsPayload = {
  username: string;
  referral: string | undefined;
  password: string;
};

const toast = useToastStore.getState();

const mapUser = (data: any): User => ({
  id: data.id,
  email: data.email,
  phone: data.phone,
  username: data.username,
  fullname: data.full_name,
  emailVerified: data.verified_email === "1" || data.verified_email === 1,
  payment_code: data.payment_code,
  login_pin: data.login_pin,
  transaction_pin: data.transaction_pin,
});

export async function login(data: {
  email: string;
  password: string;
}): Promise<User | null> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    const { setUser } = useUserStore.getState();
    const { setUserId } = useRegisterStore.getState();
    showLoading("");

    const res = await authApi.login(data);

    if (!res["user"]) return null;

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
    showLoading("");

    const res = await authApi.pinLogin(data);

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
    showLoading("");

    const res = await authApi.verifyTxPin(data);
    if (!res.status) return false;
    return true;
  } catch (error) {
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

// fetch user
export async function fetchUser(userId: string): Promise<User | null> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    const { setUser } = useUserStore.getState();
    const { setUserId } = useRegisterStore.getState();
    showLoading("");

    const res = await authApi.fetchUser({ userId });

    if (!res["user"]) return null;
    getWalletDetails({userId});
    listBeneficiaries({ userId });
    getUserVerifications({userId});
    
    const user: User = mapUser(res.user);
    setUser(user);
    setUserId(user.id);

    return user;
  } catch (error) {
    console.error(":", error.message);
    return null;
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

    const res = await authApi.registerUser(data);

    if (!res["status"]) return false;

    setUserId(res["user_id"] ?? "");
    await SecureStore.setItemAsync("userId", res["user_id"]);

    return true;
  } catch (error) {
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

// send sign up code
export async function sendSignupCode(email: string): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Verifying details");

    const res = await authApi.sendSignUpCode({ email });

    if (!res["status"]) return false;

    return true;
  } catch (error) {
    // console.error(":", error);
    return false;
  } finally {
    hideLoading();
  }
}

// verify sign up code
export async function verifySignupCode(data: {
  email: string;
  code: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Verifying code");

    const res = await authApi.verifySignUpCode(data);

    if (!res["status"]) return false;

    return true;
  } catch (error) {
    // console.error("Signup verification failed:", error);
    return false;
  } finally {
    hideLoading();
  }
}

export async function resetPassword(email: string): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Sending code");

    const res = await authApi.resetPassword({ email });

    if (!res.status) return false;

    const {setUserId} = useRegisterStore.getState();
    setUserId(res.userId ?? "");

    return true;
  } catch (error) {
    // console.error(":", error);
    toast.show({
      type: 'error',
      message: error.message,
    })
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

    if (!res["status"]) return false;

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

    if (!res["status"]) return false;

    return true;
  } catch (error) {
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
  } catch (error) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}

export async function resendSignupCode(): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Resending OTP");

    // emulate API call
    await delay(3000);

    // Example: later replace with real call
    // await authApi.verifyPhoneOTP(payload);

    console.log("OTP resent");

    return true;
  } catch (error) {
    console.error("Resending OTP failed:", error);
    return false;
  } finally {
    hideLoading();
  }
}

export async function saveUserDetails(
  payload: RegisterDetailsPayload,
): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Registering user");

    // emulate API call
    await delay(3000);

    // Example: later replace with real call
    // await authApi.verifyPhoneOTP(payload);

    console.log("Register payload:", payload);

    return true;
  } catch (error) {
    console.error("Register failed:", error);
    return false;
  } finally {
    hideLoading();
  }
}

export async function createPin(pin: string): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Validating Pin");

    // emulate API call
    await delay(3000);

    // Example: later replace with real call
    // await authApi.verifyPhoneOTP(payload);

    if (pin !== "555555") return false;

    console.log("Pin valid", pin);

    return true;
  } catch (error) {
    console.error("Signup verification failed:", error);
    return false;
  } finally {
    hideLoading();
  }
}

export async function verifyEmail(email: string): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Verifying Email");

    // emulate API call
    await delay(1000);

    // Example: later replace with real call
    // await authApi.verifyPhoneOTP(payload);

    // return false;

    console.log("Email Sent");

    return true;
  } catch (error) {
    console.error("Email verification failed:", error);
    return false;
  } finally {
    hideLoading();
  }
}

export async function verifyEmailCode(otp: string): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Verifying OTP");

    // emulate API call
    await delay(3000);

    // Example: later replace with real call
    // await authApi.verifyPhoneOTP(payload);

    if (otp !== "555555") return false;

    console.log("OTP verified", otp);

    return true;
  } catch (error) {
    console.error("Signup verification failed:", error);
    return false;
  } finally {
    hideLoading();
  }
}

export async function resendEmailCode(): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Resending OTP");

    // emulate API call
    await delay(3000);

    // Example: later replace with real call
    // await authApi.verifyPhoneOTP(payload);

    console.log("OTP resent");

    return true;
  } catch (error) {
    console.error("Resending OTP failed:", error);
    return false;
  } finally {
    hideLoading();
  }
}

export async function logout() {
  
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
