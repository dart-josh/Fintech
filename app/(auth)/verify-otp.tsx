import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import PinPad from "@/components/PinPad";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { otpFlows } from "@/config/otpFlows";
import { Ionicons } from "@expo/vector-icons";
import { formatNGPhone } from "@/hooks/format.hook";
import { useToastStore } from "@/store/toast.store";

/* ================= Types ================= */
export type OTPFlowKey = "signup-email" | "change-pin" | "change-password" | "reset-email" | "login-2fa";

/* ================= Config ================= */
const OTP_LENGTH = 6;

/* ================= Screen ================= */
export default function VerifyOTPScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const { flow, target, mode } = useLocalSearchParams<{
    flow: OTPFlowKey;
    target: string;
    mode: string;
  }>();

  const config = flow ? otpFlows[flow] : null;

  const [otp, setOtp] = useState("");
  const [counter, setCounter] = useState(config.resendTime ?? 30);
  const [loading, setLoading] = useState(false);

  /* ================= Countdown ================= */
  useEffect(() => {
    if (counter === 0) return;
    const timer = setInterval(() => {
      setCounter((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [counter]);

  if (!config) return null;
  /* ================= Confirm ================= */
  const handleConfirm = async (value: string) => {
    const toast = useToastStore.getState();
    try {
      setLoading(true);
      const success = await config.verify({email: target, code: value});
      if (success) {
        router.replace({
          pathname: config.successRoute,
          params: { mode },
        });
      } else {
        toast.show({
          message: "Invalid OTP code",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= Resend ================= */
  const handleResend = async () => {
    await config.resend(target);
    setOtp("");
    setCounter(config.resendTime);
  };

  // Assuming formatNGPhone is your existing phone formatter
const formattedTarget =
  typeof target === "number" || /^\d+$/.test(target)
    ? formatNGPhone(target)
    : target;


  return (
    <SafeAreaProvider>
      <View
        style={[
          styles.screen,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <View style={styles.topRow}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
          </Pressable>

          <Pressable style={[styles.iconBtn, { backgroundColor: colors.card }]} onPress={() => router.push('/chat-page')}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={colors.textPrimary}
            />
          </Pressable>
        </View>

        {/* ================= Header ================= */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {config.title}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {config.subtitle}{" "}
            <Text style={{ color: colors.accent }}>
              {formattedTarget}
            </Text>
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Input here to continue
          </Text>
        </View>

        {/* ================= OTP ================= */}
        <View style={styles.otpRow}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.otpBox,
                {
                  borderColor: otp.length > i ? colors.accent : colors.border,
                },
              ]}
            >
              {otp.length > i && (
                <View
                  style={[styles.dot, { backgroundColor: colors.textPrimary }]}
                />
              )}
            </View>
          ))}
        </View>

        {/* ================= Resend ================= */}
        <View style={styles.resend}>
          {counter > 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              Resend in{" "}
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                {counter}s
              </Text>
            </Text>
          ) : (
            <Pressable onPress={handleResend}>
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                Resend OTP
              </Text>
            </Pressable>
          )}
        </View>

        {/* ================= PIN PAD ================= */}
        <View style={styles.padContainer}>
          <PinPad
            length={OTP_LENGTH}
            onChange={setOtp}
            disabled={loading}
            onConfirm={handleConfirm}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

/* ================= Styles ================= */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    // paddingHorizontal: 12,
  },

  iconBtn: {
    padding: 8,
    borderRadius: 999,
  },

  header: {
    marginBottom: 32,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  resend: {
    alignItems: "center",
    marginBottom: 16,
  },

  padContainer: {
    marginTop: "auto",
    paddingBottom: 16,
  },
});
