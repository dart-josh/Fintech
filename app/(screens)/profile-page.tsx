import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { formatNGPhone, getInitials } from "@/hooks/format.hook";

/* ======================================================
   PROFILE PAGE
====================================================== */
export default function ProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const { user, verificationDetails } = useUserStore();

  const verified = verificationDetails?.userVerified;

  const infoBg = isDark ? "#2E2E3A" : "#E0F2FF"; // info box background
  const copyIconColor = isDark ? colors.primary : "#4B5563";

  const copyToClipboard = (text: string) => {
    Clipboard.setStringAsync(text);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 16 },
      ]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: colors.card + "22" }, // almost invisible
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 32,
        }}
      >
        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Profile
        </Text>

        {/* Profile Summary Box */}
        <View
          style={[
            styles.profileBox,
            {
              backgroundColor: colors.card,
              shadowColor: isDark ? "#000" : "#999",
            },
          ]}
        >
          <View style={styles.profileIconWrapper}>
            <View
              style={[styles.profileIcon, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.profileInitials}>
                {getInitials(user?.fullname ?? "-")}
              </Text>
              {verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#4ADE80"
                  style={styles.verificationIcon}
                />
              )}
            </View>
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.accountTag, { color: colors.textPrimary }]}>
              @{user?.username ?? ""}
            </Text>
            <Text style={[styles.username, { color: colors.textSecondary }]}>
              {user?.fullname ?? ""}
            </Text>
          </View>
        </View>

        {/* User Details Box */}
        <View
          style={[
            styles.detailsBox,
            {
              backgroundColor: colors.card,
              shadowColor: isDark ? "#000" : "#999",
            },
          ]}
        >
          <DetailRow
            label="First Name"
            value={user?.fullname.split(" ")![0] ?? ""}
          />
          <DetailRow
            label="Last Name"
            value={user?.fullname.split(" ")![1] ?? ""}
          />
          <DetailRow
            label="Phone Number"
            value={formatNGPhone(user?.phone ?? "")}
            copyable
            onCopy={() => copyToClipboard(formatNGPhone(user?.phone ?? ""))}
          />
          <DetailRow
            label="Email"
            value={user?.email ?? ""}
            copyable
            onCopy={() => copyToClipboard(user?.email ?? "")}
          />
          <DetailRow
            label="Username"
            value={`@${user?.username ?? ""}`}
            copyable
            onCopy={() => copyToClipboard(`@${user?.username ?? ""}`)}
          />
        </View>

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: infoBg }]}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.primary}
            style={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, lineHeight: 20 }}>
              If you have any issues with your information or will like to
              change any, please send a message to
            </Text>
            <Text
              style={{
                color: isDark ? "#F1F5F9" : "#1E293B",
                fontWeight: "bold",
                marginTop: 4,
              }}
            >
              support@aririgopay.com
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ======================================================
   DETAIL ROW COMPONENT
====================================================== */
function DetailRow({
  label,
  value,
  copyable = false,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
}) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.detailRow,
        { borderBottomColor: isDark ? "#dddddd2f" : "#dddddda0" },
      ]}
    >
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.detailValueWrapper}>
        <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
        {copyable && onCopy && (
          <TouchableOpacity onPress={onCopy} style={{ marginLeft: 8 }}>
            <MaterialIcons
              name="content-copy"
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ======================================================
   STYLES
====================================================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  profileIconWrapper: {
    marginRight: 16,
  },

  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  profileInitials: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 24,
  },

  verificationIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
  },

  profileText: {
    flex: 1,
  },

  accountTag: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },

  username: {
    fontSize: 14,
    fontWeight: "400",
  },

  detailsBox: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 0.5,
  },

  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  detailValueWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },

  infoBox: {
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    alignItems: "flex-start",
  },
});
