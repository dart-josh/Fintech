import React, { useEffect, useState } from "react";
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
import { registerUser } from "@/services/auth.service";
import { useRegisterStore } from "@/store/register.store";
import { capitalizeFirst } from "@/hooks/format.hook";

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [f_name, setFName] = useState("");
  const [l_name, setLName] = useState("");
  const [username, setUsername] = useState("");
  const [referral, setReferral] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { email, phone, setEmailVerified, setDetails } = useRegisterStore();

  const canContinue = f_name.length > 3 && l_name.length > 3 && username.length > 3 && password.length > 5;

  useEffect(() => {
    setEmailVerified(true);
  }, [setEmailVerified]);

  const handleSubmit = async () => {
    if (!canContinue) return;
    try {
      setLoading(true);
      const fullname = `${capitalizeFirst(f_name.trim())} ${capitalizeFirst(l_name.trim())}`;
      setDetails({ full_name: fullname, username, password });
      const success = await registerUser({
        email,
        phone,
        full_name: fullname,
        username,
        password,
        referral_id: referral,
      });
      if (success) {
        router.replace("/create-pin");
      } else {
        // toast.show({
        //   message: "Error saving details",
        //   type: "error",
        // });
      }
    } finally {
      setLoading(false);
    }
  };

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
                { backgroundColor: colors.accent + "22", marginTop: 60 },
              ]}
            >
              <Text style={[styles.stepText, { color: colors.accent }]}>
                Step 2/2
              </Text>
            </View>

            {/* Welcome */}
            <View style={styles.welcome}>
              <Text
                style={[styles.welcomeLabel, { color: colors.textSecondary }]}
              >
                Awesome!
              </Text>
              <Text style={[styles.welcomeName, { color: colors.textPrimary }]}>
                {"Let's personalize your account"}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* First name */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                First name
              </Text>
              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={f_name}
                  placeholder="Enter first name"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.textPrimary }]}
                  autoCapitalize="none"
                  onChangeText={setFName}
                />
              </View>

              {/* Last name */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Last name
              </Text>
              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={l_name}
                  placeholder="Enter last name"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.textPrimary }]}
                  autoCapitalize="none"
                  onChangeText={setLName}
                />
              </View>


              {/* Username */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Username
              </Text>
              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={username}
                  placeholder="Choose a username"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.textPrimary }]}
                  autoCapitalize="none"
                  onChangeText={setUsername}
                />
              </View>

              {/* Referral ID */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Referral ID (optional)
              </Text>
              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color={colors.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={referral}
                  placeholder="Enter referral ID"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { color: colors.textPrimary }]}
                  autoCapitalize="characters"
                  onChangeText={setReferral}
                />
              </View>

              {/* Password */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Password
              </Text>
              <View
                style={[styles.inputWrap, { backgroundColor: colors.card }]}
              >
                <TextInput
                  value={password}
                  placeholder="Create a password"
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
          disabled={!canContinue || loading}
          onPress={handleSubmit}
          style={[
            styles.loginBtn,
            { backgroundColor: canContinue ? colors.accent : colors.border },
          ]}
        >
          <Text style={styles.loginText}>Continue</Text>
        </Pressable>

        <View style={styles.termsRow}>
          <Text style={{ color: colors.textSecondary }}>
            By clicking Continue, you agree to our{" "}
          </Text>
          <Pressable onPress={() => {}}>
            <Text style={[styles.termsText, { color: colors.accent }]}>
              Privacy Policy and Terms
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

  termsRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  termsText: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
