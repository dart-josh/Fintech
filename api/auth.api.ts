// api/auth.api.ts

import client from "./client";

export const authApi = {
  fetchUser: (data: { userId: string }) =>
    client.post("/api/user/me", data),

  login: (data: { email: string, password: string }) =>
    client.post("/api/auth/login", data),

  pinLogin: (data: { userId: string, pin: string }) =>
    client.post("/api/auth/login/pin", data),

  sendSignUpCode: (data: { email: string }) =>
    client.post("/api/auth/send_sign_up_code", data),

  verifySignUpCode: (data: { email: string, code: string }) =>
    client.post("/api/auth/verify_sign_up_code", data),

  registerUser: (data: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    username: string;
    referral_id: string;
  }) => client.post("/api/auth/register", data),

  createLoginPin: (data: { userId: string, pin: string }) =>
    client.post("/api/auth/create_login_pin", data),

  updatePin: (data: { userId: string, password: string, mode: string, pin: string }) =>
    client.post("/api/auth/update_pin", data),

  changePassword: (data: { userId: string, password: string, mode: string, new_password: string }) =>
    client.post("/api/auth/change_password", data),

  verifyTxPin: (data: { userId: string, pin: string }) =>
    client.post("/api/auth/verifyTxPin", data),

  resetPassword: (data: { email: string }) =>
    client.post("/api/auth/send_reset_code", data),

  // !

  verifyPhoneOTP: (otp: string) => client.post("/auth/verify-phone", { otp }),

  resendPhoneOTP: () => client.post("/auth/resend-phone"),

  verifyResetOTP: (otp: string) => client.post("/auth/verify-reset", { otp }),

  resendResetOTP: (otp: string) => client.post("/auth/verify-reset", { otp }),
};
