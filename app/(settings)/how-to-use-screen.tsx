import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";

export default function HowToUseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const sections = [
    {
      title: "Send Money (Wallet-to-Wallet)",
      icon: "send",
      steps: [
        "Go to the dashboard and tap “Send Money”.",
        "Enter the recipient’s wallet ID or phone number.",
        "Input the amount you want to send.",
        "Confirm the recipient details.",
        "Enter your transaction PIN to complete the transfer.",
        "Funds are sent instantly to the recipient’s wallet.",
      ],
    },
    {
      title: "Receive Money",
      icon: "download",
      steps: [
        "Open your dashboard.",
        "Tap on “Receive Money”.",
        "Share your wallet ID or QR code with the sender.",
        "Once payment is sent, your wallet balance updates instantly.",
      ],
    },
    {
      title: "Add Money to Wallet",
      icon: "plus-circle",
      steps: [
        "Tap “Add Money” on the dashboard.",
        "Choose your preferred funding method (Bank transfer or Card).",
        "Enter the amount you want to add.",
        "Complete payment using the provided instructions.",
        "Your wallet is credited once payment is confirmed.",
      ],
    },
    {
      title: "Withdraw to Bank",
      icon: "credit-card",
      steps: [
        "Go to “Withdraw”.",
        "Select or add a bank account.",
        "Enter the withdrawal amount.",
        "Confirm transaction details.",
        "Enter your transaction PIN.",
        "Funds are sent to your bank account.",
      ],
    },
    {
      title: "Buy Airtime & Data",
      icon: "smartphone",
      steps: [
        "Tap “Airtime & Data” from the dashboard.",
        "Select Airtime or Data.",
        "Choose a network provider.",
        "Enter the phone number.",
        "Select amount or data bundle.",
        "Confirm payment to complete purchase.",
      ],
    },
    {
      title: "User & Security Settings",
      icon: "shield",
      steps: [
        "Open the Settings tab.",
        "Change your login password or PIN.",
        "Set or update your transaction PIN.",
        "Enable or disable balance visibility.",
        "Secure your account to prevent unauthorized access.",
      ],
    },
  ];

  return (
    <View
      style={[
        styles.page,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* TOP BAR */}
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
          How to Use ArigoPay
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View
            key={section.title}
            style={[
              styles.card,
              { backgroundColor: isDark ? colors.card : "#FFF" },
            ]}
          >
            {/* HEADER */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Feather
                  name={section.icon as any}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDark ? colors.text : "#111" },
                ]}
              >
                {section.title}
              </Text>
            </View>

            {/* STEPS */}
            {section.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <Text style={[styles.stepIndex, { color: colors.primary }]}>
                  {index + 1}.
                </Text>
                <Text
                  style={[
                    styles.stepText,
                    { color: isDark ? colors.textMuted : "#444" },
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
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

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  stepIndex: {
    fontWeight: "600",
    marginRight: 6,
  },

  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
