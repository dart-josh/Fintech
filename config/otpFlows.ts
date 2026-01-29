import { resetPassword, sendEmailCode, verifyEmailCode } from "@/services/auth.service";


export const otpFlows = {
  "signup-email": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 30,
    verify: verifyEmailCode,
    resend: sendEmailCode,
    successRoute: "/onboarding",
  },

  "change-pin": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 30,
    verify: verifyEmailCode,
    resend: sendEmailCode,
    successRoute: "/change-pin",
  },

  "change-password": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 30,
    verify: verifyEmailCode,
    resend: sendEmailCode,
    successRoute: "/change-password",
  },

  "verify-email": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 60,
    verify: verifyEmailCode,
    resend: sendEmailCode,
    successRoute: "/verify-email-success",  
  },

  "reset-password": {
    title: "Verify email address",
    subtitle: "A 6 digit OTP was sent to",
    resendTime: 60,
    verify: verifyEmailCode,
    resend: resetPassword,
    successRoute: "/new-password",
  },
} as const;
