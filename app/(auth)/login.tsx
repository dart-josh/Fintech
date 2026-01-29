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
import { useToastStore } from "@/store/toast.store";
import { login } from "@/services/auth.service";

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<"phone" | "email">("email");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputKey = mode === "phone" ? "phone-input" : "email-input";
  const canLogin =
    (mode === "phone" ? phone.length === 10 : email.length > 3) &&
    password.length > 5;

  const handleSubmit = async () => {
    const toast = useToastStore.getState();

    if (!canLogin) return;

    const identifier = mode === "phone" ? phone : email.trim();
    try {
      const success = await login({
        identifier,
        password,
        mode,
      });
      if (success) {
        router.replace("/home");
      } else {
        toast.show({
          message: "Invalid credentials",
          type: "error",
        });
      }
    } finally {
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* ================= Top (Fixed) ================= */}
      <View style={styles.topRow}>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
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

      {/* ================= Center (Scrollable + Keyboard-Aware) ================= */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.centerScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Welcome */}
            <View style={styles.welcome}>
              <Text
                style={[styles.welcomeLabel, { color: colors.textSecondary }]}
              >
                Welcome back,
              </Text>
              <Text style={[styles.welcomeName, { color: colors.textPrimary }]}>
                Chief.
              </Text>
            </View>

            {/* Mode Tabs */}
            <View
              style={[styles.modeContainer, { backgroundColor: colors.card }]}
            >
              {["phone", "email"].map((item) => {
                const active = mode === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setPhone("");
                      setEmail("");
                      setPassword("");
                      setMode(item as any);
                    }}
                    style={[
                      styles.modeTab,
                      active && { backgroundColor: colors.accent },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modeText,
                        { color: active ? "#fff" : colors.textSecondary },
                      ]}
                    >
                      {item === "phone" ? "Phone" : "Email"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Inputs */}
            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                {mode === "phone" ? "Phone number" : "Email address"}
              </Text>

              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
                {mode === "phone" ? (
                  <>
                    <View style={styles.prefix}>
                      <Text style={styles.flag}>🇳🇬</Text>
                      <Text style={{ color: colors.textPrimary }}>+234</Text>
                    </View>

                    <TextInput
                      key={inputKey}
                      value={phone}
                      placeholder="Phone number"
                      placeholderTextColor={colors.textSecondary}
                      style={[styles.input, { color: colors.textPrimary }]}
                      keyboardType="number-pad"
                      autoCorrect={false}
                      textContentType="telephoneNumber"
                      autoComplete="tel"
                      maxLength={10}
                      onChangeText={(text) =>
                        setPhone(text.replace(/[^0-9]/g, ""))
                      }
                    />
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={colors.textSecondary}
                      style={{ marginRight: 10 }}
                    />

                    <TextInput
                      key={inputKey}
                      value={email}
                      placeholder="Email address"
                      placeholderTextColor={colors.textSecondary}
                      style={[styles.input, { color: colors.textPrimary }]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                      onChangeText={setEmail}
                    />
                  </>
                )}
              </View>

              {/* Password */}
              <View style={styles.passwordHeader}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Password
                </Text>
                <Pressable onPress={() => router.push("/forgot-password")}>
                  <Text style={[styles.forgot, { color: colors.accent }]}>
                    Forgot Password
                  </Text>
                </Pressable>
              </View>

              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
                <TextInput
                  value={password}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.textPrimary }]}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ================= Bottom ================= */}
      <View style={styles.bottom}>
        <Pressable
          disabled={!canLogin}
          onPress={handleSubmit}
          style={[
            styles.loginBtn,
            {
              backgroundColor: canLogin ? colors.accent : colors.border,
            },
          ]}
        >
          <Text style={styles.loginText}>Login</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/register")}
          style={styles.createRow}
        >
          <Text style={[styles.createText, { color: colors.accent }]}>
            Create Account
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.accent} />
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

  welcome: {
    marginTop: 50,
    marginBottom: 30,
  },

  welcomeLabel: {
    fontSize: 16,
  },

  welcomeName: {
    fontSize: 30,
    fontWeight: "800",
  },

  modeContainer: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 4,
    marginBottom: 24,
  },

  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },

  modeText: {
    fontSize: 14,
    fontWeight: "600",
  },

  form: {
    gap: 16,
  },

  label: {
    fontSize: 13,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    // paddingVertical: 14,
    borderRadius: 16,
    height: 55,
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  prefix: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 10,
  },

  flag: {
    fontSize: 18,
  },

  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  forgot: {
    fontSize: 13,
    fontWeight: "600",
  },

  centerScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  loginBtn: {
    marginTop: 30,
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

  createRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  createText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
