import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { useToastStore } from "@/store/toast.store";
import { sendEmailCode } from "@/services/auth.service";
import { useUserStore } from "@/store/user.store";

/* ======================================================
   EMAIL VERIFICATION PAGE
====================================================== */
export default function EmailVerificationPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const {user} = useUserStore();

  const userEmail = user?.email ?? "";

  const handleVerify = async () => {
    const toast = useToastStore.getState();

    if (!userEmail) return;

    const success = await sendEmailCode(userEmail);

    if (success) {
      router.back();
      router.push({
        pathname: "/verify-otp",
        params: {
          flow: "verify-email",
          target: userEmail,
        },
      });
    } else {
      toast.show({
        message: "Error verifying email",
        type: "error",
      });
    }

    // router.push('/verify-otp')
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top,
            backgroundColor: colors.background,
            borderBottomColor: isDark ? "#cccccc5b" : "#cccccce0",
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card + "22" }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Verify Your Email
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Email Box */}
        <View style={[styles.inputGroup]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Email Address
          </Text>
          <View
            style={[
              styles.emailBox,
              {
                backgroundColor: colors.card,
                shadowColor: isDark ? "#000" : "#999",
              },
            ]}
          >
            <MaterialIcons
              name="email"
              size={20}
              color={colors.primary}
              style={{ marginRight: 12 }}
            />
            <Text style={[styles.emailText, { color: colors.textPrimary }]}>
              {userEmail}
            </Text>
          </View>
        </View>

        {/* Instruction Text */}
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          Please confirm your email address to continue using your account
          securely. This ensures that you receive important notifications and
          updates related to your account activity.
        </Text>
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View
        style={[
          styles.bottomSection,
          {
            paddingBottom: insets.bottom || 16,
            borderTopColor: isDark ? "#cccccc5b" : "#cccccc8c",
          },
        ]}
      >
        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: isDark ? "#2E2E3A" : "#E0F2FF" },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                lineHeight: 20,
              }}
            >
              If this is not your email address, or if you would like to update
              your email before continuing, please send a message to:
            </Text>
            <Text
              style={{
                color: isDark ? "#F1F5F9" : "#1E293B",
                fontWeight: "bold",
                marginTop: 4,
              }}
            >
              support@arigopay.com
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleVerify}
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ======================================================
   STYLES
====================================================== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  inputGroup: {
    marginTop: 32,
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },

  emailBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  emailText: {
    fontSize: 16,
    fontWeight: "600",
  },

  instructionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
  },

  bottomSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },

  infoBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "flex-start",
  },

  continueButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
