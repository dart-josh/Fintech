import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { sendEmailCode } from "@/services/auth.service";
import { useUserStore } from "@/store/user.store";

export default function SetPinIntro() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: colors.text }]}>
          Set Transaction PIN
        </Text>

        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Secure your wallet by creating a transaction PIN.
          {"\n\n"}
          Your PIN will be required for transfers, withdrawals, escrow releases,
          and other sensitive actions.
          {"\n\n"}
          For your protection, a verification email will be sent to your
          registered email address before you proceed.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="mail-outline" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            A verification code will be sent to your email. Please check your
            inbox to continue.
          </Text>
        </View>
      </View>

      {/* 🔘 Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => {
            const { user } = useUserStore.getState();
            sendEmailCode(user?.email ?? "");
            // router.back();
            router.push({
              pathname: "/verify-otp",
              params: {
                flow: "change-pin",
                target: user?.email ?? "",
                mode: "transaction",
              },
            });
          }}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 30,
    opacity: 0.95,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.04)",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
