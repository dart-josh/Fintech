import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { submitNok } from "@/services/user.service";

type Step = "intro" | "form" | "success";

export default function NextOfKinVerificationFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState<Step>("intro");
  const [kin, setKin] = useState({
    fullName: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
  });

  const { user } = useUserStore();

  const handleSubmit = async () => {
    const done = await submitNok({
      userId: user?.id ?? "",
      fullName: kin.fullName,
      relationship: kin.relationship,
      phone: kin.phone,
      email: kin.email,
      address: kin.address,
    });
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
              source={require("@/assets/images/nok.png")}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: colors.text }]}>
              Next of Kin Verification
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Let’s get you started with your{"\n"}Next of Kin Details
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
                Enter Next of Kin Details
              </Text>

              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Provide your next of kin details for verification.
              </Text>

              {/* FULL NAME */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Full Name
                </Text>
                <TextInput
                  value={kin.fullName}
                  onChangeText={(val) =>
                    setKin((prev) => ({ ...prev, fullName: val }))
                  }
                  placeholder="Full Name"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              {/* RELATIONSHIP */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Relationship
                </Text>
                <TextInput
                  value={kin.relationship}
                  onChangeText={(val) =>
                    setKin((prev) => ({ ...prev, relationship: val }))
                  }
                  placeholder="Relationship"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              {/* PHONE */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Phone Number
                </Text>
                <TextInput
                  value={kin.phone}
                  onChangeText={(val) =>
                    setKin((prev) => ({ ...prev, phone: val }))
                  }
                  placeholder="Phone Number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={11}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              {/* EMAIL */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Email (Optional)
                </Text>
                <TextInput
                  value={kin.email}
                  onChangeText={(val) =>
                    setKin((prev) => ({ ...prev, email: val }))
                  }
                  placeholder="Email Address"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              {/* ADDRESS */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Address (Optional)
                </Text>
                <TextInput
                  value={kin.address}
                  onChangeText={(val) =>
                    setKin((prev) => ({ ...prev, address: val }))
                  }
                  placeholder="Address"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>
            </ScrollView>

            {/* BUTTON */}
            <View
              style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      kin.fullName && kin.relationship && kin.phone
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                disabled={!(kin.fullName && kin.relationship && kin.phone)}
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
              Next of Kin Submitted 🎉
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Your next of kin details have been submitted successfully.
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
    padding: 12,
    marginBottom: 12,
    elevation: 3,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
  },

  input: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
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
