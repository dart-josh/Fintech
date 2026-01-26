import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { formatNumberSpace } from "@/hooks/format.hook";

type WithdrawalModalProps = {
  visible: boolean;
  onClose: () => void;
  amount: number;
  accountNumber: string;
  bankName: string;
  accountName: string;
  userBalance: number;
  onConfirm: () => void;
};

export default function WithdrawalModal({
  visible,
  onClose,
  amount,
  accountNumber,
  bankName,
  accountName,
  userBalance,
  onConfirm,
}: WithdrawalModalProps) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const isInsufficient = amount > userBalance;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Confirm Withdrawal
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <Text style={[styles.amount, { color: colors.text }]}>
            ₦{amount.toLocaleString()}
          </Text>

          {/* Destination */}
          <View style={styles.section}>
            <InfoRow
              label="Bank"
              value={bankName}
              icon={<Feather name="credit-card" size={16} color={colors.muted} />}
              colors={colors}
            />

            <InfoRow
              label="Account Number"
              value={formatNumberSpace(accountNumber)}
              colors={colors}
              isMono
            />

            <InfoRow
              label="Account Name"
              value={accountName}
              colors={colors}
            />

            <InfoRow
              label="Amount"
              value={`₦${amount.toLocaleString()}`}
              colors={colors}
            />
          </View>

          {/* Divider */}
          <View
            style={[styles.dashedDivider, { borderColor: colors.border }]}
          />

          {/* Balance */}
          <View
            style={[
              styles.balanceBox,
              {
                backgroundColor: isDark ? "#2A2A2A" : "#F4F5F7",
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                Available Balance
              </Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>
                ₦{userBalance.toLocaleString()}
              </Text>
            </View>

            {!isInsufficient ? (
              <Feather name="shield" size={22} color={colors.primary} />
            ) : (
              <Feather name="alert-triangle" size={22} color={colors.error} />
            )}
          </View>

          {/* Warning */}
          <View style={styles.warningBox}>
            <Feather name="lock" size={14} color={colors.muted} />
            <Text style={[styles.warningText, { color: colors.muted }]}>
              Withdrawals are irreversible. Please confirm bank details carefully.
            </Text>
          </View>

          {/* Action */}
          <TouchableOpacity
            disabled={isInsufficient}
            style={[
              styles.confirmBtn,
              {
                backgroundColor: isInsufficient
                  ? colors.border
                  : colors.primary,
              },
            ]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>
              {isInsufficient ? "Insufficient Balance" : "Confirm Withdrawal"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Info Row ---------- */
const InfoRow = ({
  label,
  value,
  icon,
  colors,
  isMono = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  colors: any;
  isMono?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={{ color: colors.muted }}>{label}</Text>

    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {icon}
      <Text
        style={{
          color: colors.text,
          fontWeight: "600",
          fontFamily: isMono ? "monospace" : undefined,
        }}
      >
        {value}
      </Text>
    </View>
  </View>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  amount: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 16,
  },
  section: {
    gap: 14,
    marginVertical: 6,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dashedDivider: {
    borderWidth: 1,
    borderStyle: "dashed",
    marginVertical: 20,
  },
  balanceBox: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  warningBox: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    alignItems: "flex-start",
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  confirmBtn: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  confirmText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
