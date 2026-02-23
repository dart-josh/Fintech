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
import { sendEmailCode } from "@/services/auth.service";
import { useToastStore } from "@/store/toast.store";
import { useRegisterStore } from "@/store/register.store";
import { isValidEmail } from "@/hooks/format.hook";

export default function SignupScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const canContinue = phone.length === 10 && isValidEmail(email);

  const handleRegister = async () => {
    const toast = useToastStore.getState();
    const register_store = useRegisterStore.getState();
    const success = await sendEmailCode(email);

    if (success) {
      register_store.setContact({email, phone});
      router.push({
        pathname: "/verify-otp",
        params: {
          flow: "signup-email",
          target: email,
        },
      });
    } else {
      toast.show({
        message: "Error registering user",
        type: "error",
      });
    }

    // router.push('/verify-otp')
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background, paddingBottom: 20 }]}>
      {/* ================= Top ================= */}
      <View style={styles.topRow}>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </Pressable>

        {/* <Pressable style={[styles.iconBtn, { backgroundColor: colors.card }]}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={colors.textPrimary}
          />
        </Pressable> */}
      </View>

      {/* ================= Center (Keyboard-Aware Scroll) ================= */}
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
            {/* Step */}
            <View
              style={[
                styles.stepPill,
                { backgroundColor: colors.accent + "22" },
              ]}
            >
              <Text style={[styles.stepText, { color: colors.accent }]}>
                Step 1/2
              </Text>
            </View>

            {/* Welcome */}
            <View style={styles.welcome}>
              <Text
                style={[styles.welcomeLabel, { color: colors.textSecondary }]}
              >
                Welcome to,
              </Text>
              <Text style={[styles.welcomeName, { color: colors.textPrimary }]}>
                Arigo Pay
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Phone */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Phone number
              </Text>
              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
                <View style={styles.prefix}>
                  <Text style={styles.flag}>🇳🇬</Text>
                  <Text style={{ color: colors.textPrimary }}>+234</Text>
                </View>
                <TextInput
                  value={phone}
                  placeholder="Phone number"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.textPrimary }]}
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
                />
              </View>

              {/* Email */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Email address
              </Text>
              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
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
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ================= Bottom ================= */}
      <View style={styles.bottom}>
        <Pressable
          disabled={!canContinue}
          onPress={handleRegister}
          style={[
            styles.loginBtn,
            {
              backgroundColor: canContinue ? colors.accent : colors.border,
            },
          ]}
        >
          <Text style={styles.loginText}>Create an Account</Text>
        </Pressable>

        <View style={styles.createRow}>
          <Text style={{ color: colors.textSecondary }}>Got an Account?</Text>
          <Pressable onPress={() => router.replace("/login")}>
            <Text style={[styles.createText, { color: colors.accent }]}>
              Login
            </Text>
          </Pressable>
        </View>
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
    justifyContent: "flex-end", // bottom-aligned
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  stepPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },

  stepText: {
    fontSize: 12,
    fontWeight: "600",
  },

  welcome: {
    marginBottom: 28,
  },

  welcomeLabel: {
    fontSize: 16,
  },

  welcomeName: {
    fontSize: 28,
    fontWeight: "800",
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

  createRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  createText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
