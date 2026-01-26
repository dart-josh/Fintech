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
import { TransferReceipt } from "@/services/wallet.service";

export default function PaymentStatusPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const {
    recipientName,
    paymentCode,
    amount,
    date,
    reference,
    method,
    status,
  } = useLocalSearchParams<{
    recipientName: string;
    paymentCode: string;
    amount: string;
    date: string;
    reference: string;
    method: string;
    status: string;
  }>();

  const payment: TransferReceipt = {
    recipientName,
    paymentCode,
    amount,
    date,
    reference,
    method,
    status,
  };

  const statusConfig = {
    success: {
      icon: "check-circle",
      title: "Payment Successful",
      subtitle: "Your money was sent successfully",
      color: "#16A34A",
    },
    failed: {
      icon: "x-circle",
      title: "Payment Failed",
      subtitle: "Something went wrong with this transaction",
      color: "#DC2626",
    },
    pending: {
      icon: "clock",
      title: "Payment Pending",
      subtitle: "This transaction is being processed",
      color: "#F59E0B",
    },
  };

  const current = statusConfig[payment.status];

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
          Payment Status
        </Text>

        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 10 }]}
          onPress={() => router.back()}
        >
          <Feather name="x" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
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
            ₦{payment.amount.toLocaleString()}
          </Text>

          <Text style={{ color: colors.textSecondary }}>
            To {payment.recipientName} ({payment.paymentCode})
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Transaction Details
          </Text>

          {detail("Date", payment.date, colors)}
          {detail("Reference", payment.reference, colors)}
          {detail("Amount", `₦${payment.amount.toLocaleString()}`, colors)}
          {detail("Method", payment.method, colors)}
          {detail("Status", payment.status.toUpperCase(), colors)}
        </View>

        {/* Actions */}
        {payment.status === "failed" ? (
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
              onPress={() => console.log("Share receipt")}
            >
              <Text style={[styles.secondaryText, { color: colors.accent }]}>
                Share Receipt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  closeBtn: {
    position: "absolute",
    left: 16,
  },

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
  statusTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  amountText: {
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 8,
  },

  detailsCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  secondaryText: {
    fontWeight: "700",
    fontSize: 16,
  },
});
