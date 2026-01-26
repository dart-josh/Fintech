import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/theme/ThemeContext";
import QRCodeView from "./QRCodeView";

export default function ReceiveDetailsCard({
  amount,
  onSelectAmount,
  onRandomAmount,
}: any) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tag = "@joshua.adelooye";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? "#020617" : "#FFFFFF" },
      ]}
    >
      <Text style={[styles.amount, { color: isDark ? "#F8FAFC" : "#020617" }]}>
        ₦{amount?.toLocaleString() || "0"}
      </Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onSelectAmount}>
          <Text style={styles.actionText}>Select Amount</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.randomBtn} onPress={onRandomAmount}>
          <Text style={styles.randomText}>Random</Text>
        </TouchableOpacity>
      </View>

      {/* User Tag */}
      <TouchableOpacity
        style={styles.tagRow}
        onPress={() => Clipboard.setStringAsync(tag)}
      >
        <Text style={styles.tag}>{tag}</Text>
        <Feather name="copy" size={16} color="#2563EB" />
      </TouchableOpacity>

      {/* QR */}
      <QRCodeView value="@joshua.adelooye" />

      <TouchableOpacity style={{paddingTop: 20}}>
        <Text style={styles.shareQr}>Share QR Code</Text>
      </TouchableOpacity>

      {/* Security Info */}
      <View style={styles.securityBox}>
        <Feather name="shield" size={16} color="#16A34A" />
        <Text style={styles.securityText}>
          Payments are encrypted & secured
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  amount: {
    fontSize: 40,
    fontWeight: "800",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 14,
    marginRight: 8,
  },
  randomBtn: {
    backgroundColor: "#E0F2FE",
    padding: 14,
    borderRadius: 14,
  },
  actionText: { color: "#FFFFFF", fontWeight: "700" },
  randomText: { color: "#2563EB", fontWeight: "700" },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  tag: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginRight: 8,
  },
  qr: {
    width: 180,
    height: 180,
    borderRadius: 20,
    marginBottom: 12,
  },
  shareQr: {
    color: "#2563EB",
    fontWeight: "700",
    marginBottom: 16,
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  securityText: {
    fontSize: 13,
    color: "#64748B",
  },
});
