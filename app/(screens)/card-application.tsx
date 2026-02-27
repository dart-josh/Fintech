import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { requestCard } from "@/services/card.service";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CardApplicationStatusDialog from "@/components/CardApplicationStatusDialog";

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

  const [error, setError] = useState("");

  const isNotValid =
    !fullName || !dob || !address || !phone || !email || error !== "";

  const [showStatus, setShowStatus] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<
    "success" | "failed" | "waitlist"
  >("waitlist");
  const [cardError, setCardError] = useState("");

  const formatAndValidateDOB = (value: string) => {
    // Remove non-numbers & limit to 8 digits (YYYYMMDD)
    const cleaned = value.replace(/\D/g, "").slice(0, 8);

    let year = cleaned.slice(0, 4);
    let month = cleaned.slice(4, 6);
    let day = cleaned.slice(6, 8);

    const currentYear = new Date().getFullYear();

    // Partial validation while typing

    if (year.length === 4) {
      const yearNum = parseInt(year, 10);
      if (yearNum > currentYear) year = String(currentYear);
      if (yearNum < 1900) year = "1900";
    }

    if (month.length === 2) {
      const monthNum = parseInt(month, 10);
      if (monthNum > 12) month = "12";
      if (monthNum === 0) month = "01";
    }

    if (day.length === 2) {
      const dayNum = parseInt(day, 10);
      if (dayNum > 31) day = "31";
      if (dayNum === 0) day = "01";
    }

    // Build formatted string
    let formatted = year;
    if (month) formatted += "-" + month;
    if (day) formatted += "-" + day;

    // Full validation only when complete
    if (cleaned.length === 8) {
      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);

      const date = new Date(yearNum, monthNum - 1, dayNum);

      const isValidDate =
        date.getFullYear() === yearNum &&
        date.getMonth() === monthNum - 1 &&
        date.getDate() === dayNum;

      if (!isValidDate) {
        setError("Invalid date");
      } else if (date > new Date()) {
        setError("Date cannot be in the future");
      } else {
        setError("");
      }
    } else {
      setError("");
    }

    return formatted;
  };

  const handleSubmit = async () => {
    // Here you can handle form validation and submission
    if (isNotValid) return;

    const { success: res, error } = await requestCard({
      full_name: fullName,
      dob,
      address,
      phone,
      email,
      userId: user?.id ?? "",
    });

    setApplicationStatus(!res ? "failed" : "waitlist");
    if (error) setCardError(error);
    setShowStatus(true);

    // toast.show({ message: "Card request submitted", type: "success" });
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
                  borderColor: error ? "#DC2626" : "transparent",
                  borderWidth: error ? 1 : 0,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? "#888" : "#AAA"}
              keyboardType="number-pad"
              value={dob}
              maxLength={10}
              onChangeText={(text) => {
                const formatted = formatAndValidateDOB(text);
                setDob(formatted);
              }}
            />
            {error ? (
              <Text style={{ color: "#DC2626", marginTop: 6, fontSize: 12 }}>
                {error}
              </Text>
            ) : null}
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

      <CardApplicationStatusDialog
        visible={showStatus}
        status={applicationStatus}
        error={cardError}
        onClose={() => {
          setShowStatus(false);
          router.back();
        }}
      />
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
