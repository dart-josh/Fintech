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

export default function TransactionFeesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const feeItems = [
    { label: "Airtime", value: "Free", icon: "smartphone" },
    { label: "Data", value: "Free", icon: "wifi" },
    { label: "Other Bills", value: "Free", icon: "file-text" },
    { label: "Internal Transfers", value: "Free", icon: "repeat" },
    { label: "ArigoPay to other banks", value: "Free", icon: "credit-card" },
  ];

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

        <Text style={[styles.title, { color: colors.text }]}>
          Transaction Fees
        </Text>
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
          {feeItems.map((item, index) => (
            <View key={item.label}>
              <View style={styles.row}>
                {/* ICON */}
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Feather name={item.icon as any} size={18} color={colors.primary} />
                </View>

                {/* LABEL */}
                <Text
                  style={[styles.label, { color: isDark ? colors.text : "#111" }]}
                >
                  {item.label}
                </Text>

                {/* VALUE */}
                <View
                  style={[
                    styles.valueBox,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Text style={[styles.valueText, { color: colors.primary }]}>
                    {item.value}
                  </Text>
                </View>
              </View>

              {/* DIVIDER */}
              {index < feeItems.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  /* TOP BAR */
  topBar: { paddingHorizontal: 20, paddingBottom: 12 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700" },

  /* CONTENT */
  scrollContent: { padding: 20 },
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

  valueBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  valueText: {
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
    opacity: 0.6,
  },
});
