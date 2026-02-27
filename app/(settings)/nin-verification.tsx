import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { submitNin } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";

type Step = "intro" | "form" | "success";

export default function NINVerificationFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState<Step>("intro");
  const [nin, setNin] = useState("");

  const { user } = useUserStore();

  const handleSubmit = async () => {
    const done = await submitNin({ userId: user?.id ?? "", nin });
    if (done) setStep("success");
  };

  return (
    <View
      style={[
        styles.page,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* TOP BAR */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: isDark ? colors.card : "rgba(0,0,0,0.05)" },
          ]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1 }}>
        {/* INTRO */}
        {step === "intro" && (
          <View style={styles.center}>
            <Image
              source={require("@/assets/images/nin.png")}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: colors.text }]}>
              NIN Verification
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Let’s get you started with your{"\n"}NIN Verification
            </Text>

            <View
              style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => setStep("form")}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FORM */}
        {step === "form" && (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                Enter your NIN
              </Text>

              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                We need your NIN so you can get verified on Arigo-Pay.
              </Text>

              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Enter NIN
                </Text>

                <TextInput
                  value={nin}
                  onChangeText={setNin}
                  placeholder="11-digit NIN"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={11}
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                />
              </View>

              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: `${colors.primary}12`,
                    borderColor: `${colors.primary}30`,
                  },
                ]}
              >
                <Feather name="info" size={18} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.textMuted }]}>
                  You can find your NIN on your{" "}
                  <Text style={{ fontWeight: "700", color: colors.primary }}>
                    NIN Slip
                  </Text>{" "}
                  or via the{" "}
                  <Text style={{ fontWeight: "700", color: colors.primary }}>
                    NIMC Mobile App
                  </Text>
                  .
                </Text>
              </View>
            </ScrollView>

            <View
              style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      nin.length === 11 ? colors.primary : colors.border,
                  },
                ]}
                disabled={nin.length !== 11}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <View style={styles.center}>
            <Feather name="check-circle" size={96} color={colors.success} />

            <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>
              NIN Submitted 🎉
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Your NIN has been submitted successfully and is being verified.
            </Text>

            <View
              style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  topBar: { paddingHorizontal: 20 },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  image: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },

  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  inputCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
  },

  input: {
    fontSize: 16,
    fontWeight: "600",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },

  infoText: {
    fontSize: 13,
    flex: 1,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
  },

  button: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
