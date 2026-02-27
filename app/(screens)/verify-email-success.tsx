import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { verifyUserEmail } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ======================================================
   SUCCESS PAGE
====================================================== */
export default function SuccessPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const { user } = useUserStore.getState();
    verifyUserEmail({ userId: user?.id ?? "" });
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#121212" : "#F5F5F5",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => router.push("/chat-page")}
          style={[
            styles.messageButton,
            { backgroundColor: colors.card + "22" },
          ]}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Background Image */}
        <ImageBackground
          source={require("@/assets/images/email-success.png")} // Replace with your image path
          style={styles.imageBackground}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={[styles.title, { color: colors.primary }]}>Success</Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your E-mail has been verified successfully.
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.dashboardButton, { backgroundColor: "#fff" }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={[styles.dashboardButtonText, { color: colors.primary }]}>
            Back to Dashboard
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
  container: {
    flex: 1,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },

  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  imageBackground: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    marginBottom: 32,
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  bottom: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  dashboardButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  dashboardButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
