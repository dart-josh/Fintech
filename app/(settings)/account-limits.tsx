import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { useToastStore } from "@/store/toast.store";

/** 👇 Tier order now starts from Tier 0 */
const tiers = ["Tier 0", "Tier 1", "Tier 2", "Tier 3", "Tier 4"];

const tierConfig: Record<string, any> = {
  "Tier 0": {
    title: "Account Not Verified",
    subtitle:
      "Your account has limited access. Complete BVN verification to unlock basic transaction features.",
    requirement: "BVN",
    route: "bvn-verification",
    limits: { single: 0, daily: 0 },
  },
  "Tier 1": {
    title: "BVN Verification",
    subtitle:
      "Verify your Bank Verification Number to enable basic transfers and comply with financial regulations.",
    requirement: "BVN",
    route: "bvn-verification",
    limits: { single: 50_000, daily: 200_000 },
  },
  "Tier 2": {
    title: "NIN Verification",
    subtitle:
      "Confirm your National Identification Number to increase your transaction limits securely.",
    requirement: "NIN",
    route: "nin-verification",
    limits: { single: 200_000, daily: 1_000_000 },
  },
  "Tier 3": {
    title: "Address Verification",
    subtitle:
      "Verify your residential address to unlock higher transaction limits and enhanced account trust.",
    requirement: "Address",
    route: "address-verification",
    limits: { single: 500_000, daily: 5_000_000 },
  },
  "Tier 4": {
    title: "Next of Kin Verification",
    subtitle:
      "Provide next of kin details for maximum account access and additional security assurance.",
    requirement: "Next of Kin",
    route: "nok-verification",
    limits: { single: 1_000_000, daily: "Unlimited" },
  },
};

export default function AccountLimits() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const toast = useToastStore();
  const { verificationDetails } = useUserStore();

  /** 👇 Default selection is user's tier or Tier 0 */
  const currentTier = verificationDetails?.tier ?? "Tier 0";
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const tierData = tierConfig[selectedTier];

  /** 🔐 Verification items mapping */
  const verificationItems = [
    { label: "BVN", route: "bvn-verification" },
    { label: "NIN", route: "nin-verification" },
    { label: "Address", route: "address-verification" },
    { label: "Next of Kin", route: "nok-verification" },
  ];

  /** 🔹 Safe helper to get item by route */
  const get_item = (route: string) => {
    return verificationItems.find((v) => v.route === route);
  };

  /** 🔐 Handles route access and toast for Submitted / Verified */
  const handleVerificationRoute = (item: (typeof verificationItems)[0]) => {
    if (!item) return; // safety check

    const { bvnStatus, ninStatus, addressStatus, nokStatus } =
      verificationDetails || {};

    const routeStatuses: Record<string, string | undefined> = {
      "bvn-verification": bvnStatus,
      "nin-verification": ninStatus,
      "address-verification": addressStatus,
      "nok-verification": nokStatus,
    };

    const status = routeStatuses[item.route];

    // Show toast if already submitted or verified
    if (status === "Submitted") {
      return toast.show({
        message: `${item.label} Awaiting verification`,
        type: "warning",
      });
    }

    if (status === "Verified") {
      return toast.show({
        message: `${item.label} Verified`,
        type: "success",
      });
    }

    // Tier dependency checks
    if (
      item.route === "nin-verification" &&
      !(bvnStatus === "Submitted" || bvnStatus === "Verified")
    ) {
      return toast.show({
        message: "Complete BVN verification first",
        type: "warning",
      });
    }

    if (
      item.route === "address-verification" &&
      !(
        (bvnStatus === "Submitted" || bvnStatus === "Verified") &&
        (ninStatus === "Submitted" || ninStatus === "Verified")
      )
    ) {
      return toast.show({
        message: "Complete BVN and NIN verification first",
        type: "warning",
      });
    }

    if (
      item.route === "nok-verification" &&
      !(
        (bvnStatus === "Submitted" || bvnStatus === "Verified") &&
        (ninStatus === "Submitted" || ninStatus === "Verified") &&
        (addressStatus === "Submitted" || addressStatus === "Verified")
      )
    ) {
      return toast.show({
        message: "Complete BVN, NIN, and Address verification first",
        type: "warning",
      });
    }

    // Otherwise navigate
    router.push(item.route);
  };

  /** 🔹 Handle action button safely */
  const handleActionPress = () => {
    if (!tierData) return; // safety: tierData must exist
    const item = get_item(tierData.route);
    if (!item) return; // safety: item must exist
    handleVerificationRoute(item);
  };

  /** Returns true if button should be shown */
  const shouldShowActionButton = (
    currentTier: string,
    selectedTier: string,
  ) => {
    const tierOrder = ["Tier 0", "Tier 1", "Tier 2", "Tier 3", "Tier 4"];
    const currentIndex = tierOrder.indexOf(currentTier);
    const selectedIndex = tierOrder.indexOf(selectedTier);

    // Only show button if selected tier is higher than current tier
    return selectedIndex > currentIndex;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* TOP BAR */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Account Limits
        </Text>
      </View>

      {/* TIER TABS */}
      <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
        {tiers.map((tier) => (
          <TouchableOpacity
            key={tier}
            style={[
              styles.tab,
              selectedTier === tier && { backgroundColor: colors.border },
            ]}
            onPress={() => setSelectedTier(tier)}
          >
            <Text
              style={{
                color: tier === currentTier ? colors.primary : colors.textMuted,
                fontWeight: selectedTier === tier ? "700" : "400",
              }}
            >
              {tier}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* TITLE + SUBTITLE */}
        {tierData && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {tierData.title}
            </Text>
            <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
              {tierData.subtitle}
            </Text>

            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Single Transfer</Text>
              <Text style={[styles.limitValue, { color: colors.textPrimary }]}>
                {typeof tierData.limits.single === "number"
                  ? `₦${tierData.limits.single.toLocaleString()}`
                  : tierData.limits.single}
              </Text>
            </View>

            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Daily Limit</Text>
              <Text style={[styles.limitValue, { color: colors.textPrimary }]}>
                {typeof tierData.limits.daily === "number"
                  ? `₦${tierData.limits.daily.toLocaleString()}`
                  : tierData.limits.daily}
              </Text>
            </View>
          </View>
        )}

        {/* CURRENT TIER */}
        <View
          style={[styles.card, { backgroundColor: colors.card, marginTop: 20 }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Current Tier
          </Text>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>
            {currentTier === "Tier 0"
              ? "Not Verified (Pending Verification)"
              : currentTier}
          </Text>
        </View>

        {/* ACTION BUTTON */}
        {shouldShowActionButton(currentTier, selectedTier) && tierData && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleActionPress}
          >
            <Text style={styles.buttonText}>
              Complete {tierData.requirement} Verification
            </Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 20 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "700", marginTop: 12 },
  tabBar: { flexDirection: "row", margin: 20, borderRadius: 30, padding: 6 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 30, alignItems: "center" },
  card: { borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  limitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  limitLabel: { color: "#888", fontSize: 14 },
  limitValue: { fontSize: 15, fontWeight: "700" },
  actionButton: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
