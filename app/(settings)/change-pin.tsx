import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext"; // your theme context
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/store/user.store";
import { updatePin } from "@/services/auth.service";

const ChangePin = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [oldPassword, setOldPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const isValid =
    newPin.length === 6 && newPin === newPin2 && oldPassword.length > 5;

  const colors = {
    background: isDark ? "#121212" : "#fff",
    card: isDark ? "#1E1E1E" : "#F5F5F5",
    text: isDark ? "#fff" : "#000",
    placeholder: isDark ? "#888" : "#AAA",
    border: isDark ? "#333" : "#CCC",
    primary: "#1E90FF",
    success: "#4CAF50",
    gray: isDark ? "#555" : "#AAA",
  };

  type PinMode = "login" | "transaction";

  const { mode } = useLocalSearchParams<{ mode: PinMode }>();

  const { user } = useUserStore();

  const transaction_pin = user?.transaction_pin ?? false;

  const handleSubmit = async () => {
    if (!isValid) return;

    const valid = await updatePin({
      userId: user?.id ?? "",
      password: oldPassword,
      mode,
      pin: newPin,
    });
    if (!valid) {
      return;
    }

    router.back();
    router.replace("/pin-success");
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: isDark ? colors.background : "#F4F5F7",
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 12,
            backgroundColor: isDark ? colors.background : "#F4F5F7",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>
          {mode === "login"
            ? "Change Login PIN"
            : transaction_pin
              ? "Change Transaction PIN"
              : "Set Transaction PIN"}
        </Text>
      </View>

      {/* Scrollable content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={70} // reduce space between input and keyboard
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Account Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Account Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                <Feather
                  name={showOld ? "eye" : "eye-off"}
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New PIN */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>New PIN</Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter 6-digit PIN"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showNew}
                value={newPin}
                onChangeText={(text) => {
                  // Only allow numbers
                  const filtered = text.replace(/[^0-9]/g, "");
                  setNewPin(filtered);
                }}
                keyboardType="numeric"
                maxLength={6}
              />

              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Feather
                  name={showNew ? "eye" : "eye-off"}
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New PIN 2 */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>New PIN</Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm 6-digit PIN"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showNew}
                value={newPin2}
                onChangeText={(text) => {
                  // Only allow numbers
                  const filtered = text.replace(/[^0-9]/g, "");
                  setNewPin2(filtered);
                }}
                keyboardType="numeric"
                maxLength={6}
              />

              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Feather
                  name={showNew ? "eye" : "eye-off"}
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Button */}
      <View
        style={[
          styles.bottomButtonContainer,
          { backgroundColor: isDark ? colors.background : "#F4F5F7" },
        ]}
      >
        <TouchableOpacity
          disabled={!isValid}
          onPress={handleSubmit}
          style={[
            styles.button,
            {
              backgroundColor: isValid ? colors.primary : "#555", // gray when disabled
            },
          ]}
        >
          <Text
            style={[styles.buttonText, { color: isValid ? "#fff" : "#ccc" }]}
          >
            Proceed
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePin;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
  },
  input: {
    flex: 1,
    height: "100%",
  },
  checklist: {
    marginTop: 10,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  checkText: {
    marginLeft: 8,
  },
  bottomButtonContainer: {
    padding: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
