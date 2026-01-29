import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import PinPad from "@/components/PinPad";
import { PinDots } from "@/components/PinDots";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useToastStore } from "@/store/toast.store";
import { createLoginPin } from "@/services/auth.service";
import { useRouter } from "expo-router";
import { useRegisterStore } from "@/store/register.store";

const PIN_LENGTH = 6;

export default function CreatePinScreen() {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [active, setActive] = useState<"pin" | "confirm" | "">("");

  const isDark = theme === "dark";

  const isComplete =
    pin.length === PIN_LENGTH &&
    confirmPin.length === PIN_LENGTH &&
    pin === confirmPin;

  const handleSubmit = async () => {
    const { userId } = useRegisterStore.getState();
    const toast = useToastStore.getState();

    if (!isComplete) return;
    try {
      const success = await createLoginPin({ userId, pin });
      if (success) {
        router.replace("/home");
      } else {
        toast.show({
          message: "Error creating pin",
          type: "error",
        });
      }
    } finally {
    }
  };

  const { userId } = useRegisterStore.getState();

  return (
    <SafeAreaProvider>
      <View
        style={[
          styles.screen,
          { backgroundColor: colors.background, paddingTop: insets.top + 12, paddingBottom: insets.bottom },
        ]}
      >
        {/* ================= Header ================= */}
        <Pressable>
          <Text style={[styles.back, { color: colors.textPrimary }]}>←</Text>
        </Pressable>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Create your PIN
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          This is the pin used to login and confirm transactions. Be sure to
          keep it safe.
        </Text>

        {/* ================= PIN ================= */}
        <Pressable onPress={() => setActive("pin")} style={styles.pinSection}>
          <PinDots
            PIN_LENGTH={6}
            value={pin}
            active={active === "pin"}
            colors={colors}
          />
        </Pressable>

        {/* ================= Confirm PIN ================= */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Confirm PIN
        </Text>

        <Pressable
          onPress={() => setActive("confirm")}
          style={styles.pinSection}
        >
          <PinDots
            PIN_LENGTH={6}
            value={confirmPin}
            active={active === "confirm"}
            colors={colors}
          />
        </Pressable>

        {/* ================= PIN PAD ================= */}
        <View style={styles.pad}>
          {active === "pin" && (
            <PinPad
              length={PIN_LENGTH}
              onChange={(val) => {
                setPin(val);
              }}
            />
          )}

          {active === "confirm" && (
            <PinPad
              length={PIN_LENGTH}
              onChange={(val) => {
                setConfirmPin(val);
              }}
            />
          )}
        </View>

        {/* ================= Continue ================= */}
        <Pressable
          onPress={handleSubmit}
          disabled={!isComplete}
          style={[
            styles.button,
            {
              backgroundColor: isComplete ? colors.accent : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: isComplete
                  ? isDark
                    ? "#000"
                    : "#FFF"
                  : colors.textSecondary,
              },
            ]}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  back: {
    fontSize: 22,
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },

  label: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "500",
  },

  pinSection: {
    paddingVertical: 8,
  },

  pad: {
    marginTop: "auto",
  },

  button: {
    marginTop: 16,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 26,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,

    // 👇 NOT full width
    alignSelf: "flex-start",
  },

  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,

    // 👇 small spacing only
    marginRight: 10,
  },
});
