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
import { useUserStore } from "@/store/user.store";
import { useToastStore } from "@/store/toast.store";

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const { verificationDetails } = useUserStore();
  const toast = useToastStore();

  const verificationItems = [
    {
      label: "BVN",
      icon: "credit-card",
      status: verificationDetails?.bvnStatus ?? "Pending",
      route: "bvn-verification",
    },
    {
      label: "NIN",
      icon: "user",
      status: verificationDetails?.ninStatus ?? "Pending",
      route: "nin-verification",
    },
    {
      label: "Address Verification",
      icon: "map-pin",
      status: verificationDetails?.addressStatus ?? "Pending",
      route: "address-verification",
    },
    {
      label: "Next of Kin Details",
      icon: "users",
      status: verificationDetails?.nokStatus ?? "Pending",
      route: "nok-verification",
    },
    // { label: "Wealth Declaration", icon: "file-text", status: "Pending", route: ""},
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return colors.success;
      case "Rejected":
        return colors.danger; // red
      case "Submitted":
        return colors.primary; // blue
      default:
        return colors.warning; // Pending or unknown
    }
  };

  const handleVerificationRoute = (item: typeof verificationItems[0]) => {
  const bvnStatus = verificationDetails?.bvnStatus;
  const ninStatus = verificationDetails?.ninStatus;
  const addressStatus = verificationDetails?.addressStatus;
  // const nokStatus = verificationDetails?.nokStatus;

  // BVN can always be accessed
  if (item.route === "bvn-verification") {
    router.push(item.route);
    return;
  }

  // NIN requires BVN to be Submitted or Verified
  if (item.route === "nin-verification") {
    if (bvnStatus !== "Submitted" && bvnStatus !== "Verified") {
      return toast.show({
        message: "Complete BVN verification first",
        type: "warning",
      });
    }
    router.push(item.route);
    return;
  }

  // Address requires BVN and NIN to be Submitted or Verified
  if (item.route === "address-verification") {
    if (
      (bvnStatus !== "Submitted" && bvnStatus !== "Verified") ||
      (ninStatus !== "Submitted" && ninStatus !== "Verified")
    ) {
      return toast.show({
        message: "Complete BVN and NIN verification first",
        type: "warning",
      });
    }
    router.push(item.route);
    return;
  }

  // NOK requires BVN, NIN, and Address to be Submitted or Verified
  if (item.route === "nok-verification") {
    if (
      (bvnStatus !== "Submitted" && bvnStatus !== "Verified") ||
      (ninStatus !== "Submitted" && ninStatus !== "Verified") ||
      (addressStatus !== "Submitted" && addressStatus !== "Verified")
    ) {
      return toast.show({
        message: "Complete BVN, NIN, and Address verification first",
        type: "warning",
      });
    }
    router.push(item.route);
    return;
  }

  // Default: push if no conditions
  router.push(item.route);
};


  return (
    <View
      style={[
        styles.page,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* FIXED TOP BAR */}
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

        <Text style={[styles.title, { color: colors.text }]}>Verification</Text>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? colors.card : "#FFFFFF" },
          ]}
        >
          {verificationItems.map((item, index) => {
            const statusColor = getStatusColor(item.status || "Pending");

            return (
              <View key={item.label}>
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.status === "Submitted") {
                      return toast.show({
                        message: `${item.label} Awaiting verification`,
                        type: "warning",
                      });
                    }

                    if (item.status === "Verified") {
                      return toast.show({
                        message: `${item.label} Verified`,
                        type: "success",
                      });
                    }

                    handleVerificationRoute(item);
                  }}
                >
                  {/* ICON */}
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: `${statusColor}20` },
                    ]}
                  >
                    <Feather
                      name={item.icon as any}
                      size={18}
                      color={statusColor}
                    />
                  </View>

                  {/* LABEL */}
                  <Text
                    style={[
                      styles.label,
                      { color: isDark ? colors.text : "#111" },
                    ]}
                  >
                    {item.label}
                  </Text>

                  {/* STATUS */}
                  <View
                    style={[
                      styles.statusBox,
                      { backgroundColor: `${statusColor}15` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status}
                    </Text>
                  </View>

                  {/* ARROW */}
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.textMuted}
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>

                {/* DIVIDER */}
                {index < verificationItems.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  /* TOP BAR */
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

  /* CONTENT */
  scrollContent: {
    padding: 20,
  },

  card: {
    borderRadius: 20,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  statusBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
    opacity: 0.6,
  },
});
