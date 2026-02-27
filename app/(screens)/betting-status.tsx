import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";

export default function BettingStatusPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const params = useLocalSearchParams<{
    amount: string;
    provider: string;
    bettingNumber: string;
    customerName: string;
    reference: string;
    date: string;
    status: "success" | "failed" | "pending";
  }>();

  const receipt = {
    amount: params.amount ?? "0",
    provider: params.provider ?? "",
    bettingNumber: params.bettingNumber ?? "",
    customerName: params.customerName ?? "",
    reference: params.reference ?? "",
    date: params.date ?? new Date().toISOString(),
    status: params.status ?? "pending",
  };

  const handleShareReceipt = () => {
    router.push({
      pathname: "/receipt",
      params: {
        id: `betting-${receipt.date}`,
        type: "Betting Top up",
        amount: receipt.amount,
        status: receipt.status,
        reference: receipt.reference,
        description: `${receipt.provider} top up for ${receipt.customerName}`,
        date: receipt.date,
      },
    });
  };

  const statusConfig = {
    success: {
      icon: "check-circle",
      title: "Top up Successful",
      subtitle: "Your Betting top up was successful",
      color: "#16A34A",
    },
    failed: {
      icon: "x-circle",
      title: "Top Up Failed",
      subtitle: "Something went wrong with this transaction",
      color: "#DC2626",
    },
    pending: {
      icon: "clock",
      title: "Top up Pending",
      subtitle: "Your Betting top up is being processed",
      color: "#F59E0B",
    },
  };

  const current = statusConfig[receipt.status];

  return (
    <SafeAreaProvider>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Betting Top Up Status
        </Text>

        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 10 }]}
          onPress={() => router.back()}
        >
          <Feather name="x" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background}}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View
            style={[
              styles.statusIconWrap,
              { backgroundColor: current.color + "22" },
            ]}
          >
            <Feather
              name={current.icon as any}
              size={48}
              color={current.color}
            />
          </View>

          <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
            {current.title}
          </Text>

          <Text
            style={[styles.statusSubtitle, { color: colors.textSecondary }]}
          >
            {current.subtitle}
          </Text>

          <Text style={[styles.amountText, { color: colors.textPrimary }]}>
            ₦{Number(receipt.amount).toLocaleString()}
          </Text>

          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
            {receipt.provider}
          </Text>
        </View>

        {/* Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Subscription Details
          </Text>

          {detail("Provider", receipt.provider, colors)}
          {detail("Account ID", receipt.bettingNumber, colors)}
          {detail("Customer Name", receipt.customerName, colors)}
          {detail(
            "Amount",
            `₦${Number(receipt.amount).toLocaleString()}`,
            colors,
          )}
          {detail("Reference", receipt.reference, colors)}
          {detail("Date", receipt.date, colors)}
          {detail("Status", receipt.status.toUpperCase(), colors)}
        </View>

        {/* Actions */}
        {receipt.status === "failed" ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.surface }]}
              onPress={() => {
                router.back();
                router.back();
              }}
            >
              <Text style={[styles.secondaryText, { color: colors.error }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.surface }]}
              onPress={handleShareReceipt}
            >
              <Text style={[styles.secondaryText, { color: colors.accent }]}>
                Share Receipt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              onPress={() => {
                router.back();
                router.back();
              }}
            >
              <Text style={styles.primaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{height: insets.bottom + 20 }}></View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

/* ---------- Helpers ---------- */
const detail = (label: string, value: string, colors: any) => (
  <View style={styles.detailRow}>
    <Text style={{ color: colors.textSecondary }}>{label}</Text>
    <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
      {value}
    </Text>
  </View>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 0.5,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  closeBtn: { position: "absolute", left: 16 },

  statusCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
  },
  statusIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  statusSubtitle: { fontSize: 14, marginBottom: 16, textAlign: "center" },
  amountText: { fontSize: 36, fontWeight: "900", marginBottom: 8 },

  detailsCard: { borderRadius: 18, padding: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  actions: { flexDirection: "row", gap: 12 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  secondaryText: { fontWeight: "700", fontSize: 16 },
});
