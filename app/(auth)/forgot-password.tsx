import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { resetPassword } from "@/services/auth.service";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const canReset = email.length > 3;

  const handleReset = async () => {
    const res = await resetPassword(email);

    if (res) {
      router.push({
        pathname: "/verify-otp",
        params: {
          flow: "reset-password",
          target: email,
        },
      });
    } 
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* ================= Top ================= */}
      <View style={styles.topRow}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </Pressable>

        <Pressable style={[styles.iconBtn, { backgroundColor: colors.card }]}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* ================= Center ================= */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.centerScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Label */}
            <Text style={[styles.forgotLabel, { color: colors.textSecondary }]}>
              Forgotten?
            </Text>

            {/* Title */}
            <Text
              style={[
                styles.welcomeName,
                { color: colors.textPrimary, marginBottom: 8 },
              ]}
            >
              Reset your password
            </Text>

            {/* Subtext */}
            <Text
              style={[
                styles.subText,
                { color: colors.textSecondary, marginBottom: 20 },
              ]}
            >
              {`We all make mistakes. Let's get your account back.${"\n"}Ensure you have access to the email`}
            </Text>

            {/* Email Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Email address
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card }]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={email}
                placeholder="Email address"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.textPrimary }]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setEmail}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ================= Bottom ================= */}
      <View style={styles.bottom}>
        <Pressable
          disabled={!canReset}
          onPress={handleReset}
          style={[
            styles.loginBtn,
            { backgroundColor: canReset ? colors.accent : colors.border },
          ]}
        >
          <Text style={styles.loginText}>Reset Password</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 12,
  },

  iconBtn: {
    padding: 8,
    borderRadius: 999,
  },

  centerScroll: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  forgotLabel: {
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: "300",
    marginBottom: 6,
  },

  welcomeName: {
    fontSize: 28,
    fontWeight: "800",
  },

  subText: {
    fontSize: 14,
    lineHeight: 20,
  },

  label: {
    fontSize: 13,
    marginBottom: 10,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 16,
    height: 55,
    marginBottom: 0,
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  loginBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
