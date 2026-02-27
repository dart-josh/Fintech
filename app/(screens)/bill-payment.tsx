import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";

export default function BillPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const billItems = [
    {
      title: "Airtime",
      subtitle: "Recharge your mobile line instantly",
      icon: <Feather name="phone" size={18} color={colors.accent} />,
      route: "/mobile-top-up",
      mode: "airtime",
    },
    {
      title: "Data",
      subtitle: "Purchase mobile data bundles",
      icon: <Feather name="wifi" size={18} color={colors.accent} />,
      route: "/mobile-top-up",
      mode: "data",
    },
    {
      title: "Cable TV",
      subtitle: "Pay for DSTV, GOTV and more",
      icon: (
        <MaterialCommunityIcons
          name="television-classic"
          size={18}
          color={colors.accent}
        />
      ),
      route: "/tv-subscription",
    },
    {
      title: "Electricity",
      subtitle: "Pay electricity bills seamlessly",
      icon: (
        <MaterialCommunityIcons name="flash" size={18} color={colors.accent} />
      ),
      route: "/electricity-top-up",
    },
    {
      title: "Betting",
      subtitle: "Fund your betting wallet",
      icon: (
        <MaterialCommunityIcons
          name="ticket-confirmation-outline"
          size={18}
          color={colors.accent}
        />
      ),
      route: "/betting-top-up",
    },
    {
      title: "Flights",
      subtitle: "Book local & international flights",
      icon: <Feather name="send" size={18} color={colors.accent} />,
      comingSoon: true,
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
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Bill Payment</Text>

        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Select how you want to manage your bills for yourself and a third
          party.
        </Text>

        {/* CARD */}
        <View style={[styles.card, { backgroundColor: colors.backgroundOff }]}>
          {billItems.map((item, index) => (
            <View key={item.title}>
              <TouchableOpacity
                onPress={() => {
                  if (item.route) {
                    router.push({
                      pathname: item.route,
                      params: { mode: item.mode },
                    });
                  }
                }}
                style={styles.row}
                activeOpacity={0.8}
              >
                {/* LEFT TEXT CONTENT */}
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>

                    {item.comingSoon && (
                      <View
                        style={[
                          styles.comingSoonBadge,
                          { backgroundColor: `${colors.warning}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.comingSoonText,
                            { color: colors.warning },
                          ]}
                        >
                          COMING SOON
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[styles.itemSubtitle, { color: colors.textMuted }]}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                {/* RIGHT ICON */}
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${colors.accent}15` },
                  ]}
                >
                  {item.icon}
                </View>
              </TouchableOpacity>

              {/* SUBTLE DIVIDER */}
              {index < billItems.length - 1 && (
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
  page: {
    flex: 1,
  },

  /* TOP BAR */
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  /* CONTENT */
  scrollContent: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },

  card: {
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 14,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  itemSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  comingSoonText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 14,
    marginRight: 14,
    opacity: 0.3,
  },
});
