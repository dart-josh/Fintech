import { resendEmailCode, sendSignupCode, verifyEmailCode, verifySignupCode } from "@/services/auth.service";
import { otpService } from "@/services/otp.service";


export const otpFlows = {
  "signup-email": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 30,
    verify: verifySignupCode,
    resend: sendSignupCode,
    successRoute: "/onboarding",
  },

  "change-pin": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 30,
    verify: verifySignupCode,
    resend: sendSignupCode,
    successRoute: "/change-pin",
  },

  "change-password": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 30,
    verify: verifySignupCode,
    resend: sendSignupCode,
    successRoute: "/change-password",
  },

  "verify-email": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 60,
    verify: verifySignupCode,
    resend: sendSignupCode,
    successRoute: "/verify-email-success",
  },

  "reset-email": {
    title: "Verify email address",
    subtitle: "We sent a code to",
    resendTime: 60,
    verify: otpService.verifyResetEmail,
    resend: otpService.resendResetEmail,
    successRoute: "/new-password",
  },
} as const;
