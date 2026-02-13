
import client from "./client";

export const authApi = {

  login: (data: { identifier: string, password: string, mode: 'email' | 'phone' }) =>
    client.post("/api/auth/login", data),

  pinLogin: (data: { userId: string, pin: string }) =>
    client.post("/api/auth/login/pin", data),

  sendEmailCode: (data: { email: string }) =>
    client.post("/api/auth/send_email_code", data),

  verifyEmailCode: (data: { email: string, code: string }) =>
    client.post("/api/auth/verify_email_code", data),

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

  logoutDevice: (data: { userId: string, token: string, device_id: string }) =>
    client.post("/api/auth/logout", data),

  saveBiometricToken: (data: { userId: string, deviceId: string }) =>
    client.post("/api/auth/saveBiometricToken", data),

  validateSessionToken: (data: { token: string, deviceId: string }) =>
    client.post("/api/auth/validateSessionToken", data),

};
