import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { sendSignupCode } from "@/services/auth.service";
import { useUIStore } from "@/store/ui.store";

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const {showBalance, toggleShowBalance} = useUIStore();

  const [useBiometrics, setUseBiometrics] = useState(false);

  const { user } = useUserStore();

  const transaction_pin = user?.transaction_pin ?? false;

  const securityItems = [
    {
      label: "Change Password",
      icon: "shield",
      route: "/change-password",
      mode: "change",
    },
    {
      label: "Change Login PIN",
      icon: "lock",
      route: "/change-pin",
      mode: "login",
    },
    {
      label: transaction_pin ? "Change Transaction PIN" : "Set Transaction PIN",
      icon: "key",
      route: "/change-pin",
      mode: "transaction",
    },
    {
      label: "Use Face ID / Fingerprint",
      icon: "smartphone",
      route: "",
      switch: true,
    },
    { label: "Show Balance", icon: "eye", route: "", switch: true },
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

        <Text style={[styles.title, { color: colors.text }]}>Security</Text>
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
          {securityItems.map((item, index) => (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={item.switch ? 1 : 0.7}
                onPress={() => {
                  if (item.route) {
                    if (item.route === "/change-password") {
                      sendSignupCode(user?.email ?? "");
                      router.push({
                        pathname: "/verify-otp",
                        params: {
                          flow: "change-password",
                          target: user?.email ?? "",
                          mode: item.mode,
                        },
                      });
                    } else if (item.route === "/change-pin") {
                      sendSignupCode(user?.email ?? "");
                      router.push({
                        pathname: "/verify-otp",
                        params: {
                          flow: "change-pin",
                          target: user?.email ?? "",
                          mode: item.mode,
                        },
                      });
                    } else router.push(item.route);
                  }
                }}
              >
                {/* ICON */}
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Feather
                    name={item.icon as any}
                    size={18}
                    color={colors.primary}
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

                {/* SWITCH OR ARROW */}
                {item.switch ? (
                  <Switch
                    value={
                      item.label === "Use Face ID / Fingerprint"
                        ? useBiometrics
                        : showBalance
                    }
                    onValueChange={(val) =>
                      item.label === "Use Face ID / Fingerprint"
                        ? setUseBiometrics(val)
                        : toggleShowBalance()
                    }
                    trackColor={{
                      true: colors.primary,
                      false: isDark ? "#555" : "#ccc",
                    }}
                    thumbColor={isDark ? "#fff" : "#fff"}
                  />
                ) : (
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.textMuted}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </TouchableOpacity>

              {/* DIVIDER */}
              {index < securityItems.length - 1 && (
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

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
    opacity: 0.6,
  },
});
