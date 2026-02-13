import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ConfirmEscrowFundingModalProps = {
  visible: boolean;
  onClose: () => void;
  amount: number;
  escrowTitle: string;
  sellerName: string;
  userBalance: string;
  onConfirm: () => void;
};

export default function ConfirmEscrowFundingModal({
  visible,
  onClose,
  amount,
  escrowTitle,
  sellerName,
  userBalance,
  onConfirm,
}: ConfirmEscrowFundingModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const numericBalance = Number(userBalance.replace(/,/g, ""));
  const isInsufficient = amount > numericBalance;

  const initials = sellerName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handle} />

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <Text style={[styles.label, { color: colors.muted }]}>
            {"You're funding"}
          </Text>

          <Text style={[styles.amount, { color: colors.text }]}>
            ₦{amount.toLocaleString()}
          </Text>

          {/* Escrow Card */}
          <View
            style={[
              styles.recipientCard,
              { backgroundColor: isDark ? "#2A2A2A" : "#F4F5F7" },
            ]}
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary + "22" },
              ]}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {initials}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                {sellerName}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 2 }}>
                {escrowTitle}
              </Text>
            </View>

            <Feather name="shield" size={20} color={colors.primary} />
          </View>

          {/* Details */}
          <View style={styles.section}>
            <InfoRow
              label="Escrow Amount"
              value={`₦${amount.toLocaleString()}`}
              colors={colors}
            />

            <InfoRow
              label="Available Balance"
              value={`₦${userBalance}`}
              colors={colors}
              highlight={isInsufficient}
            />
          </View>

          {/* Insufficient Warning */}
          {isInsufficient && (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: colors.error + "15",
                  borderColor: colors.error,
                },
              ]}
            >
              <Feather name="alert-triangle" size={16} color={colors.error} />
              <Text style={[styles.warningText, { color: colors.error }]}>
                Insufficient balance to fund this escrow
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { borderColor: colors.border }]} />

          {/* Confirm */}
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
            <Feather
              name={isInsufficient ? "alert-triangle" : "lock"}
              size={16}
              color="#fff"
            />
            <Text style={styles.confirmText}>
              {isInsufficient
                ? "Insufficient Balance"
                : "Confirm Funding"}
            </Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 14 }}>
            <Text style={{ textAlign: "center", color: colors.muted }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- SUB COMPONENT ---------------- */

const InfoRow = ({
  label,
  value,
  colors,
  highlight = false,
}: {
  label: string;
  value: string;
  colors: any;
  highlight?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={{ color: colors.muted }}>{label}</Text>
    <Text
      style={{
        color: highlight ? colors.error : colors.text,
        fontWeight: "600",
      }}
    >
      {value}
    </Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modal: {
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 12,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  label: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 16,
  },
  amount: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 10,
  },
  recipientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 12,
    marginVertical: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: 14,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  warningText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  divider: {
    borderWidth: 1,
    borderStyle: "dashed",
    marginVertical: 20,
  },
  confirmBtn: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
