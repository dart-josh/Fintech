import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/theme/ThemeContext";
import { formatCurrentDate } from "@/hooks/format.hook";

const statusConfig = {
  success: {
    label: "SUCCESS",
    color: "#16A34A",
    bg: "#16A34A22",
  },
  pending: {
    label: "PENDING",
    color: "#F59E0B",
    bg: "#F59E0B22",
  },
  failed: {
    label: "FAILED",
    color: "#DC2626",
    bg: "#DC262622",
  },
};

export default function TransactionDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const { id, type, amount, status, reference, description, date } =
    useLocalSearchParams<{
      id: string;
      type: "credit" | "debit" | "transfer";
      amount: string;
      status: "pending" | "success" | "failed";
      reference: string;
      description: string;
      date: string;
    }>();

  const isCredit = type === "credit";
  const statusStyle = statusConfig[status];

  const formattedAmount = Number(amount).toLocaleString();

  const handleCopy = async () => {
    await Clipboard.setStringAsync(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          style={{ marginBottom: 20 }}
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

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Amount Header */}
          <View style={{ alignItems: "center", marginVertical: 32 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "800",
                color: isCredit ? "#16A34A" : colors.textPrimary,
                marginBottom: 8,
              }}
            >
              {isCredit ? "+" : "-"}₦{formattedAmount}
            </Text>

            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: statusStyle.bg,
              }}
            >
              <Text
                style={{
                  color: statusStyle.color,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {statusStyle.label}
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 18,
              padding: 20,
              borderWidth: 0.5,
              borderColor: colors.border,
              marginBottom: 28,
            }}
          >
            <DetailRow
              label="Description"
              value={description}
              colors={colors}
            />
            <DetailRow
              label="Date"
              value={formatCurrentDate(date)}
              colors={colors}
            />

            {/* Copyable Reference */}
            <TouchableOpacity onPress={handleCopy}>
              <DetailRow
                label="Reference"
                value={reference}
                mono
                colors={colors}
              />
              {copied && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#16A34A",
                    marginTop: -6,
                    textAlign: "right",
                  }}
                >
                  Copied ✓
                </Text>
              )}
            </TouchableOpacity>

            <DetailRow
              label="Type"
              value={isCredit ? "Credit" : "Debit"}
              colors={colors}
            />

            {!isCredit && (
              <DetailRow label="Fees" value="₦0.00" colors={colors} />
            )}

            <DetailRow
              label={isCredit ? "Total Received" : "Total Paid"}
              value={`₦${formattedAmount}`}
              bold
              colors={colors}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaProvider>
  );
}

/* ------------------ Components ------------------ */

const DetailRow = ({
  label,
  value,
  bold,
  mono,
  colors,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
  colors: any;
}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 14,
      gap: 12,
    }}
  >
    <Text
      style={{ color: colors.textSecondary, fontSize: 14}}
    >
      {label}
    </Text>
    <Text
      style={{
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: bold ? "700" : "500",
        fontFamily: mono ? "monospace" : undefined,
        flex: 1,
        textAlign: 'right'
      }}
      numberOfLines={4}
      ellipsizeMode="tail"
    >
      {value}
    </Text>
  </View>
);
