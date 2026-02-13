import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useToastStore } from "@/store/toast.store";
import { useUserStore } from "@/store/user.store";
import { getInitials } from "@/hooks/format.hook";
import { BeneficiaryModal } from "@/components/BeneficiaryModal";
import { logout } from "@/services/auth.service";
import * as WebBrowser from "expo-web-browser";

const openWebsite = async (url: string) => {
  await WebBrowser.openBrowserAsync(url);
};

/* ======================================================
   PROFILE SCREEN
====================================================== */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          screenStyles.container,
          { backgroundColor: colors.background, paddingTop: insets.top + 12 },
        ]}
      >
        <ProfileSummary />
        <ActionSection
          title="SETTINGS"
          items={[
            {
              label: "Profile Verification",
              icon: "check-circle",
              route: "profile-verification",
            },
            { label: "Security", icon: "lock", route: "security" },
            {
              label: "Account Limits",
              icon: "bar-chart-2",
              route: "account-limits",
            },
            {
              label: "Transaction Fees",
              icon: "percent",
              route: "transaction-fees",
            },
            {
              label: "App Preferences",
              icon: "settings",
              route: "preferences",
            },
            {
              label: "Notification Settings",
              icon: "bell",
              route: "notification-settings",
            },
          ]}
        />
        <ActionSection
          title="MORE"
          items={[
            {
              label: "Manage Beneficiaries",
              icon: "users",
              route: "beneficiaries",
            },
            {
              label: "Bank Statement",
              icon: "file-text",
              route: "bank-statement",
            },
            // { label: "Device Management", icon: "smartphone", route: "" },
            { label: "How to Use", icon: "info", route: "how-to-use-screen" },
            { label: "Contact Us", icon: "help-circle", route: "chat-page" },
            { label: "Terms & Conditions", icon: "file", route: "terms" },
            { label: "Visit Our Website", icon: "globe", route: "site" },
            { label: "Logout", icon: "log-out", danger: true, route: "logout" },
          ]}
          setModalVisible={setModalVisible}
        />
        <View style={{ paddingBottom: 60 }}></View>
      </ScrollView>

      <BeneficiaryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={() => {}}
      />
    </>
  );
}

/* ======================================================
   PROFILE SUMMARY
====================================================== */
function ProfileSummary() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, verificationDetails } = useUserStore();

  const verified = verificationDetails?.userVerified;

  /**
   * Returns progress as a number between 0 and 1 based on tier
   * @param tier - the current tier as string, e.g., "Tier 0", "Tier 1", ..., "Tier 4"
   */
  const getTierProgress = (tier: string | null) => {
    const tierOrder = ["Tier 0", "Tier 1", "Tier 2", "Tier 3", "Tier 4"];

    if (!tier) return 0; // null or undefined = 0 progress

    const index = tierOrder.indexOf(tier);

    if (index === -1) return 0; // unknown tier = 0 progress

    return index / (tierOrder.length - 1); // normalize 0-1
  };

  const progress = getTierProgress(verificationDetails?.tier ?? "");

  return (
    <View style={[summaryStyles.card, { backgroundColor: colors.card }]}>
      <View style={summaryStyles.header}>
        <TouchableOpacity
          onPress={() => router.push("/profile-page")}
          style={[
            summaryStyles.avatar,
            { backgroundColor: colors.primaryContainer },
          ]}
        >
          <Text style={[summaryStyles.initials, { color: colors.primary }]}>
            {getInitials(user?.fullname ?? "-")}
          </Text>

          {verified && (
            <View
              style={[summaryStyles.badge, { backgroundColor: colors.card }]}
            >
              <Feather name="check-circle" size={15} color={colors.success} />
            </View>
          )}
        </TouchableOpacity>

        <View style={summaryStyles.textWrap}>
          <View>
            <Text style={[summaryStyles.accountTag, { color: colors.text }]}>
              {user?.fullname ?? ""}
            </Text>
            <Text style={[summaryStyles.username, { color: colors.textMuted }]}>
              @{user?.username ?? ""}
            </Text>
            {!verified && (
              <View
                style={[
                  summaryStyles.pendingBox,
                  { backgroundColor: `${colors.warning}30` },
                ]}
              >
                <Text
                  style={{
                    color: colors.warning,
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  Pending verification
                </Text>
              </View>
            )}
          </View>
          <TierProgress progress={progress} />
        </View>
      </View>

      <View style={summaryStyles.tierRow}>
        <View>
          <Text style={[summaryStyles.tierText, { color: colors.text }]}>
            You are currently on {verificationDetails?.tier}
          </Text>
          <Text style={[summaryStyles.tierHint, { color: colors.primary }]}>
            {verificationDetails?.tier !== "Tier 4" ? "Upgrade your limit" : "You have access to all features"}
          </Text>
        </View>

        {verificationDetails?.tier !== "Tier 4" && <TouchableOpacity
          onPress={() => router.push("/account-limits")}
          style={[
            summaryStyles.upgradeBtn,
            { backgroundColor: colors.primaryContainer },
          ]}
        >
          <Text style={[summaryStyles.upgradeText, { color: colors.primary }]}>
            Upgrade
          </Text>
        </TouchableOpacity>}
      </View>
    </View>
  );
}

/* ======================================================
   TIER PROGRESS
====================================================== */
type Props = {
  progress?: number; // 0 - 1
};

function TierProgress({ progress = 0.75 }: Props) {
  const { colors } = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false, // width & left require false
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const fillWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const thumbLeft = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={progressStyles.container}>
      {/* Track */}
      <View
        style={[progressStyles.track, { backgroundColor: colors.border }]}
      />

      {/* Fill */}
      <Animated.View
        style={[
          progressStyles.fill,
          {
            backgroundColor: colors.primary,
            width: fillWidth,
          },
        ]}
      />

      {/* Dots */}
      <View style={progressStyles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              progressStyles.dot,
              {
                backgroundColor:
                  progress >= i / 3 ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Thumb */}
      <Animated.View
        style={[
          progressStyles.thumb,
          {
            backgroundColor: colors.primary,
            left: thumbLeft,
          },
        ]}
      />
    </View>
  );
}

/* ======================================================
   ACTION SECTION
====================================================== */
function ActionSection({ title, items, setModalVisible }: any) {
  const { colors } = useTheme();

  return (
    <View style={sectionStyles.section}>
      <Text style={[sectionStyles.title, { color: colors.textMuted }]}>
        {title}
      </Text>

      <View style={[sectionStyles.box, { backgroundColor: colors.card }]}>
        {items.map((item: any, index: number) => (
          <ActionItem
            key={item.label}
            {...item}
            showDivider={index !== items.length - 1}
            setModalVisible={setModalVisible}
          />
        ))}
      </View>
    </View>
  );
}

/* ======================================================
   ACTION ITEM
====================================================== */
function ActionItem({
  label,
  icon,
  danger,
  showDivider,
  route,
  setModalVisible,
}: any) {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToastStore.getState();

  const iconColor = danger ? colors.error : colors.primary;
  const bgColor = danger ? colors.errorContainer : colors.primaryContainer;

  return (
    <>
      <TouchableOpacity
        style={itemStyles.row}
        onPress={async () => {
          if (route) {
            if (route === "site") {
              openWebsite("https://arigopay.com");
            } else if (route === "terms") {
              openWebsite("https://arigopay.com/terms-and-conditions");
            } else if (route === "beneficiaries") {
              setModalVisible(true);
            } else if (route === "logout") {
              logout();
              router.replace("/welcome");
            } else {
              router.push(route);
            }
          } else {
            toast.show({
              message: "This feature is not yet available.",
              type: "warning",
            });
          }
        }}
      >
        <View style={[itemStyles.iconWrap, { backgroundColor: bgColor }]}>
          <Feather name={icon} size={18} color={iconColor} />
        </View>

        <Text
          style={[
            itemStyles.label,
            { color: danger ? colors.error : colors.text },
          ]}
        >
          {label}
        </Text>

        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {showDivider && (
        <View
          style={[itemStyles.divider, { backgroundColor: colors.border }]}
        />
      )}
    </>
  );
}

/* ======================================================
   STYLES — SCREEN
====================================================== */
const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

/* ======================================================
   STYLES — PROFILE SUMMARY
====================================================== */
const summaryStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    // alignItems: "top-center",
    marginBottom: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 18,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderRadius: 10,
    padding: 2,
  },
  textWrap: {
    marginLeft: 14,
    width: "75%",
  },
  accountTag: {
    fontSize: 16,
    fontWeight: "600",
  },
  username: {
    fontSize: 13,
    marginTop: 2,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tierText: {
    fontSize: 13,
    fontWeight: "500",
  },
  tierHint: {
    fontSize: 12,
    marginTop: 2,
  },
  upgradeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingBox: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 6,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

/* ======================================================
   STYLES — TIER PROGRESS
====================================================== */
const progressStyles = StyleSheet.create({
  container: {
    height: 36,
    justifyContent: "center",
  },

  track: {
    height: 4,
    borderRadius: 2,
    width: "100%",
  },

  fill: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
    left: 0,
  },

  dots: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  thumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    top: "50%",
    transform: [{ translateX: -7 }, { translateY: -7 }],
    elevation: 4,
  },
});

/* ======================================================
   STYLES — ACTION SECTION
====================================================== */
const sectionStyles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  box: {
    borderRadius: 16,
    overflow: "hidden",
  },
});

/* ======================================================
   STYLES — ACTION ITEM
====================================================== */
const itemStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
  },
});
