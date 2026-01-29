import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import {
  deactivateDevice,
  registerForPushNotifications,
} from "@/services/notification.service";
import { useUserStore } from "@/store/user.store";
import * as SecureStore from "expo-secure-store";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const { deviceToken, devices } = useUserStore();

  const [emailNotif, setEmailNotif] = useState(true);
  const [appNotif, setAppNotif] = useState(!!deviceToken);
  const [smsNotif, setSmsNotif] = useState(false);

  const getToken = async () => {
    setAppNotif(true);
    const token = await registerForPushNotifications();
    if (!token) {
      setAppNotif(false);
      return;
    }

    await SecureStore.setItemAsync("showAppNotif", "true");
  };

  const disableToken = async () => {
    setAppNotif(false);
    const valid = await deactivateDevice();
    if (!valid) {
      setAppNotif(true);
      return;
    }

    await SecureStore.setItemAsync("showAppNotif", "false");
  };

  useEffect(() => {
    const checkNotificationStatus = () => {
      const myDevice = devices.find((d) => d.device_token === deviceToken);
      if (!myDevice || !myDevice.is_active) setAppNotif(false);
      else setAppNotif(true);
    };

    checkNotificationStatus();
  }, [deviceToken, devices]);

  const notificationItems = [
    {
      label: "Email",
      subtitle: "Receive transaction notification & receipts via email.",
      switchValue: emailNotif,
      onToggle: setEmailNotif,
      icon: "mail",
    },
    {
      label: "App Notification",
      subtitle: "Receive transaction notification alerts in app.",
      switchValue: appNotif,
      onToggle: (val: boolean) => {
        if (val) {
          getToken();
        } else {
          disableToken();
        }
      },
      icon: "bell",
    },
    {
      label: "SMS",
      subtitle: "Receive transaction notification via SMS. Charges may apply.",
      switchValue: smsNotif,
      onToggle: setSmsNotif,
      icon: "message-circle",
    },
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
          Notification Settings
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
          {notificationItems.map((item, index) => (
            <View key={item.label}>
              <View style={styles.row}>
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

                {/* LABEL + SUBTITLE */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.label,
                      { color: isDark ? colors.text : "#111" },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      { color: isDark ? colors.textMuted : "#555" },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                {/* SWITCH */}
                <Switch
                  disabled={item.label === "Email"}
                  value={item.switchValue}
                  onValueChange={item.onToggle}
                  trackColor={{
                    true: colors.primary,
                    false: isDark ? "#555" : "#ccc",
                  }}
                  thumbColor={isDark ? "#fff" : "#fff"}
                />
              </View>

              {/* DIVIDER */}
              {index < notificationItems.length - 1 && (
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
    alignItems: "flex-start",
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
    marginTop: 4,
  },

  label: {
    fontSize: 15,
    fontWeight: "500",
  },

  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
    opacity: 0.6,
  },
});
