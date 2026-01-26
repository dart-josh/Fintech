import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/store/user.store";

export default function ReceivePaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const { user } = useUserStore();

  const tag = user?.payment_code ?? "";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#020617" : "#F8FAFC",
          paddingTop: insets.top + 12,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Receive Money
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={28} color={isDark ? "#CBD5F5" : "#020617"} />
        </TouchableOpacity>
      </View>

      {/* Centered QR Code Section */}
      <View style={styles.centerContainer}>
        {/* Tag */}
        <TouchableOpacity
          style={styles.tagRow}
          onPress={() => Clipboard.setStringAsync(tag)}
        >
          <Text style={[styles.tag, { color: colors.accent }]}>{tag}</Text>
          <Feather name="copy" size={16} color={colors.accent} />
        </TouchableOpacity>

        {/* QR Code */}
        <View
          style={[
            styles.qrWrapper,
            { borderColor: isDark ? "#4B5563" : "#CBD5E1" },
          ]}
        >
          <QRCode
            value={tag}
            size={180}
            color={isDark ? "#F8FAFC" : "#020617"}
            backgroundColor={isDark ? "#020617" : "#FFFFFF"}
          />
        </View>

        {/* Share QR */}
        <TouchableOpacity
          style={{ paddingTop: 20 }}
          onPress={() => {
            Clipboard.setStringAsync(tag);
            Alert.alert("Copied", `Payment code copied`);
          }}
        >
          <Text style={[styles.shareQr, { color: colors.accent }]}>
            Copy QR Code
          </Text>
        </TouchableOpacity>

        {/* Security Info */}
        <View style={styles.securityBox}>
          <Feather name="shield" size={16} color="#16A34A" />
          <Text
            style={[
              styles.securityText,
              { color: isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            Payments are encrypted & secured
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  tag: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  qrWrapper: {
    padding: 24,
    borderWidth: 2,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  shareQr: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 16,
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  securityText: {
    fontSize: 13,
  },
});
