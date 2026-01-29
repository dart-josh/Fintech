import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { Feather } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import ViewShot, { captureRef } from "react-native-view-shot";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { capitalizeFirst } from "@/hooks/format.hook";

type ReceiptParams = {
  id: string;
  type: string;
  amount: string;
  status: "pending" | "success" | "failed";
  reference: string;
  description: string;
  date: string;
};

export default function TransactionReceiptPage() {
  // get query params from URL
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // map params to typed receipt object
  const receipt: ReceiptParams = {
    id: params.id || "",
    type: params.type || "",
    amount: params.amount || "0",
    status: (params.status as "pending" | "success" | "failed") || "pending",
    reference: params.reference || "",
    description: params.description || "",
    date: params.date || new Date().toISOString(),
  };

  const { colors } = useTheme();
  const receiptRef = useRef<ViewShot>(null);

  const statusColor = {
    success: "#16a34a",
    pending: "#f59e0b",
    failed: "#dc2626",
  }[receipt.status];

  const shareAsImage = async () => {
    try {
      const uri = await receiptRef.current?.capture?.();

      if (!uri) return;

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share Receipt",
      });
    } catch (err) {
      Alert.alert("Error", "Unable to share receipt");
    }
  };

  const shareAsPDF = async () => {
    const html = `
      <html>
  <body style="font-family: 'Arial', sans-serif; background-color: #f4f5f7; padding: 24px; display: flex; justify-content: center;">
    <div style="background-color: #ffffff; padding: 24px; border-radius: 16px; max-width: 500px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 20px; color: #111;">Arigopay</h2>
        <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Transaction Receipt</span>
      </div>

      <!-- Amount -->
      <div style="text-align: center; margin-bottom: 12px;">
        <p style="font-size: 32px; font-weight: 800; margin: 0; color: #111;">
          ₦${Number(receipt.amount).toLocaleString()}
        </p>

        <!-- Status Badge -->
        <span style="
          display: inline-block;
          background-color: ${statusColor}33;
          color: ${statusColor};
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          margin-top: 6px;
        ">
          ${receipt.status.toUpperCase()}
        </span>

        <!-- Date -->
        <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">${receipt.date}</p>
      </div>

      <!-- Divider -->
      <hr style="border-top: 1px dashed #d1d5db; margin: 24px 0;" />

      <!-- Details -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #6b7280;">Transaction Type</span>
          <span style="color: #111; font-weight: 600;">${capitalizeFirst(receipt.type)}</span>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap;">
          <span style="color: #6b7280;">Reference</span>
          <span style="color: #111; font-weight: 600; max-width: 70%; text-align: right;">${receipt.reference}</span>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap;">
          <span style="color: #6b7280;">Description</span>
          <span style="color: #111; font-weight: 600; max-width: 70%; text-align: right;">${receipt.description}</span>
        </div>
      </div>

      <!-- Divider -->
      <hr style="border-top: 1px dashed #d1d5db; margin: 24px 0;" />

      <!-- Footer -->
      <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
        Experience a better financial life with Arigopay. Enjoy seamless and secure services including free transfers, instant withdrawals, convenient bill payments, and fast top-ups. Gain full access to all our features and manage your money effortlessly, anytime, anywhere.
      </p>

    </div>
  </body>
</html>

    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          backgroundColor: colors.background,
        }}
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 30 }}
        >
          <Text
            style={{
              color: colors.accent,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={{ flex: 1 }}>
            <ViewShot
              ref={receiptRef}
              style={[styles.card, { backgroundColor: colors.surface }]}
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.text }]}>
                  Arigopay
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  Transaction Receipt
                </Text>
              </View>

              {/* Amount */}
              <Text style={[styles.amount, { color: colors.text }]}>
                ₦{Number(receipt.amount).toLocaleString()}
              </Text>

              {/* Status */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + "20" },
                ]}
              >
                <Text style={{ color: statusColor, fontWeight: "600" }}>
                  {receipt.status.toUpperCase()}
                </Text>
              </View>

              {/* Date */}
              <Text style={[styles.date, { color: colors.textSecondary }]}>
                {receipt.date}
              </Text>

              {/* Divider */}
              <View
                style={[styles.divider, { borderColor: colors.textSecondary }]}
              />

              {/* Details */}
              <Detail
                label="Transaction Type"
                value={capitalizeFirst(receipt.type)}
              />
              <Detail label="Reference" value={receipt.reference} />
              <Detail label="Description" value={receipt.description} />

              {/* Divider */}
              <View
                style={[styles.divider, { borderColor: colors.textSecondary }]}
              />

              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Experience a better financial life with Arigopay. Enjoy seamless
                and secure services including free transfers, instant
                withdrawals, convenient bill payments, and fast top-ups. Gain
                full access to all our features and manage your money
                effortlessly, anytime, anywhere.
              </Text>
            </ViewShot>
          </View>
          {/* Actions */}
          <View
            style={[
              styles.actions,
              {
                marginBottom: insets.bottom + 12,
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.border }]}
              onPress={shareAsImage}
            >
              <Feather name="image" size={18} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Share Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.border }]}
              onPress={shareAsPDF}
            >
              <Feather name="file-text" size={18} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Share PDF
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, opacity: 0.6, color: colors.textSecondary }}>
        {label}
      </Text>
      <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text }}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  card: {
    borderRadius: 18,
    padding: 20,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 14,
  },

  amount: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 24,
    textAlign: "center",
  },

  statusBadge: {
    alignSelf: "center",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },

  date: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },

  divider: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    marginVertical: 20,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  actionBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
