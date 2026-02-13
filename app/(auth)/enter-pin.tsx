import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import PinPad from "@/components/PinPad";
import { PinDots } from "@/components/PinDots";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { useToastStore } from "@/store/toast.store";
import { pinLogin, validateSessionToken } from "@/services/auth.service";
import { useRegisterStore } from "@/store/register.store";
import { useUserStore } from "@/store/user.store";
import { getInitials } from "@/hooks/format.hook";
import { useUIStore } from "@/store/ui.store";
import { getBiometricToken } from "@/services/secureStore.service";
import { authenticateBiometric } from "@/services/biometric.service";
import { getDeviceId } from "@/services/device.service";

const PIN_LENGTH = 6;

export default function EnterPinScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [pin, setPin] = useState("");
  const [active, setActive] = useState<"pin" | "">("");
  const [error, setError] = useState(false);

  const isComplete = pin.length === PIN_LENGTH;

  useEffect(() => {
    const handleSubmit = async () => {
      const toast = useToastStore.getState();
      const { userId } = useRegisterStore.getState();

      try {
        const success = await pinLogin({ userId, pin });
        if (success) {
          router.replace("/home");
        } else {
          setError(true);
          toast.show({
            message: "Invalid Pin",
            type: "error",
          });
        }
      } finally {
      }
    };

    if (isComplete) {
      handleSubmit();
    } else {
      setError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  const { user } = useUserStore();
  const { useBiometrics } = useUIStore();

  useEffect(() => {
    const tryBiometricLogin = async () => {
      const token = await getBiometricToken();
      if (!token) return;

      const auth = await authenticateBiometric();
      if (!auth.success) return;

      const deviceId = await getDeviceId();

      const tokenValid = await validateSessionToken({ token, deviceId });
      if (!tokenValid) return;

      // login
      router.replace("/home");
    };

    if (useBiometrics) tryBiometricLogin();
  }, [useBiometrics]);

  return (
    <SafeAreaProvider>
      <View
        style={[
          styles.screen,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* ================= Avatar ================= */}
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatar, { backgroundColor: colors.card }]}>
            <Text style={[styles.avatarText, { color: colors.textPrimary }]}>
              {getInitials(user?.fullname ?? "")}
            </Text>
          </View>
        </View>

        {/* ================= Title ================= */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Login with PIN
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          @{user?.username ?? ""}
        </Text>

        {/* ================= PIN ================= */}
        <Pressable onPress={() => setActive("pin")} style={styles.pinSection}>
          <PinDots
            PIN_LENGTH={PIN_LENGTH}
            value={pin}
            active={active === "pin"}
            colors={colors}
            error={error}
          />
        </Pressable>

        {/* ================= PIN PAD ================= */}
        <View style={styles.pad}>
          {active === "pin" && <PinPad length={PIN_LENGTH} onChange={setPin} />}
        </View>

        {/* ================= Switch Account ================= */}
        <View style={styles.switchRow}>
          <Text style={{ color: colors.textSecondary }}>Not you? </Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={[styles.switchText, { color: colors.accent }]}>
              Switch account
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },

  avatarWrapper: {
    marginTop: 20,
    // alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    // textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    // textAlign: "center",
    marginBottom: 24,
  },

  pinSection: {
    alignItems: "center",
    marginBottom: 16,
  },

  pad: {
    marginTop: "auto",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 34,
  },

  switchText: {
    fontWeight: "600",
  },
});
