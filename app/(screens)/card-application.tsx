import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { requestCard } from "@/services/card.service";
import { useToastStore } from "@/store/toast.store";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function CardApplication() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const { user } = useUserStore();

  const [fullName, setFullName] = useState(user?.fullname ?? "");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const isNotValid = !fullName || !dob || !address || !phone || !email;
  const toast = useToastStore.getState();

  const handleSubmit = async () => {
    // Here you can handle form validation and submission
    if (isNotValid) return;

    const res = await requestCard({
      full_name: fullName,
      dob,
      address,
      phone,
      email,
      userId: user?.id ?? "",
    });

    if (!res) return;

    router.back();
    toast.show({ message: "Card request submitted", type: "success" });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Card Application
        </Text>
      </View>

      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={130}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? colors.card : "#FFF" },
          ]}
        >
          <Text style={[styles.header, { color: colors.text }]}>
            Apply for your Arigo Pay Card
          </Text>
          <Text style={[styles.subHeader, { color: isDark ? "#ccc" : "#555" }]}>
            Fill out the details below to pre-apply for your card. Ensure all
            information is accurate for smooth processing.
          </Text>

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Full Name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1E1E1E" : "#F4F5F7",
                  color: colors.text,
                },
              ]}
              placeholder="John Doe"
              placeholderTextColor={isDark ? "#888" : "#AAA"}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Date of Birth
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1E1E1E" : "#F4F5F7",
                  color: colors.text,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? "#888" : "#AAA"}
              value={dob}
              onChangeText={setDob}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Residential Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1E1E1E" : "#F4F5F7",
                  color: colors.text,
                },
              ]}
              placeholder="123 Street, City"
              placeholderTextColor={isDark ? "#888" : "#AAA"}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Phone Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1E1E1E" : "#F4F5F7",
                  color: colors.text,
                },
              ]}
              placeholder="+234 800 000 0000"
              placeholderTextColor={isDark ? "#888" : "#AAA"}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Email Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1E1E1E" : "#F4F5F7",
                  color: colors.text,
                },
              ]}
              placeholder="john@example.com"
              placeholderTextColor={isDark ? "#888" : "#AAA"}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              readOnly={true}
            />
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            disabled={isNotValid}
            style={[
              styles.submitButton,
              { backgroundColor: !isNotValid ? colors.primary : colors.muted },
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>Submit Application</Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  title: { fontSize: 22, fontWeight: "700" },

  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  header: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  subHeader: { fontSize: 14, marginBottom: 20 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  submitButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  submitText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
