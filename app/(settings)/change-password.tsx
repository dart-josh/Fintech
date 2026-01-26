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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/store/user.store";
import { changePassword } from "@/services/auth.service";

const ChangePassword = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Checklist validation
  const isLengthValid = newPassword.length >= 6;
  const hasAlphabet = /[A-Za-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  const passwordMatch = isLengthValid && newPassword === newPassword2;
  const isValid = isLengthValid && hasAlphabet && hasNumber && oldPassword.length > 5 && passwordMatch;

  const { user } = useUserStore();
  
    const handleSubmit = async () => {
      if (!isValid) return;
  
      const valid = await changePassword({
        userId: user?.id ?? "",
        password: oldPassword,
        mode: 'change',
        new_password: newPassword,
      });
      if (!valid) {
        return;
      }
  
      router.back();
      router.replace("/password-success");
    };

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

  return (
    <View
      style={[styles.safeArea, { backgroundColor: isDark ? colors.background : "#F4F5F7" }]}
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

        <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
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
          {/* Old Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Old Password
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

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>
              New Password
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
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Feather
                  name={showNew ? "eye" : "eye-off"}
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </View>

            {/* Password Checklist */}
            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <Feather
                  name="check-circle"
                  size={18}
                  color={isLengthValid ? colors.success : colors.gray}
                />
                <Text style={[styles.checkText, { color: colors.text }]}>
                  Must be at least 8 characters
                </Text>
              </View>
              <View style={styles.checkItem}>
                <Feather
                  name="check-circle"
                  size={18}
                  color={hasAlphabet ? colors.success : colors.gray}
                />
                <Text style={[styles.checkText, { color: colors.text }]}>
                  Must include an alphabet (Aa-Zz)
                </Text>
              </View>
              <View style={styles.checkItem}>
                <Feather
                  name="check-circle"
                  size={18}
                  color={hasNumber ? colors.success : colors.gray}
                />
                <Text style={[styles.checkText, { color: colors.text }]}>
                  Must include a number (0-9)
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.inputWrapper,
                { borderColor: colors.border, backgroundColor: colors.card, marginTop: 30 },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showNew}
                value={newPassword2}
                onChangeText={setNewPassword2}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <Feather
                  name={showNew ? "eye" : "eye-off"}
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.checklist}>
              <View style={styles.checkItem}>
                <Feather
                  name="check-circle"
                  size={18}
                  color={passwordMatch ? colors.success : colors.gray}
                />
                <Text style={[styles.checkText, { color: colors.text }]}>
                  Password match
                </Text>
              </View>
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
          style={[styles.button, { backgroundColor: !isValid ? colors.gray : colors.primary }]}
        >
          <Text style={styles.buttonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePassword;

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
