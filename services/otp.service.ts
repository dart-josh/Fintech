// services/otp.service.ts

import { authApi } from "@/api/auth.api";

export const otpService = {
  verifySignupPhone: authApi.verifyPhoneOTP,
  resendSignupPhone: authApi.resendPhoneOTP,

  verifyResetEmail: authApi.verifyResetOTP,
  resendResetEmail: authApi.resendResetOTP,
};
