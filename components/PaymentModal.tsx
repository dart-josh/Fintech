import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { formatNumberSpace } from "@/hooks/format.hook";

type PaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  type: "airtime" | "data";
  amount: number;
  networkName: string;
  networkLogo?: React.ReactNode;
  recipient: string;
  dataBundle?: string;
  userBalance: string;
  onPay: () => void;
};

export default function PaymentModal({
  visible,
  onClose,
  type,
  amount,
  networkName,
  networkLogo,
  recipient,
  dataBundle,
  userBalance,
  onPay,
}: PaymentModalProps) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card }]}>
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Amount */}
          <Text style={[styles.amount, { color: colors.text }]}>
            ₦{amount.toLocaleString()}
          </Text>

          {/* Details */}
          <View style={styles.section}>
            <InfoRow
              label="Product"
              value={type === "airtime" ? "Airtime" : "Data"}
              icon={
                <View style={styles.networkLogo}>
                  <Text style={{fontSize: 12}}>{networkName[0]}</Text>
                </View>
              }
              colors={colors}
            />

            <InfoRow
              label="Recipient Mobile"
              value={recipient}
              colors={colors}
              isNumber={true}
            />

            {type === "data" && dataBundle && (
              <InfoRow label="Data Bundle" value={dataBundle} colors={colors} />
            )}

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

          {/* Payment method */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>

          <View
            style={[
              styles.paymentBox,
              {
                backgroundColor: isDark ? "#2A2A2A" : "#F4F5F7",
              },
            ]}
          >
            <View style={styles.paymentRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.balanceRow}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    Available Balance
                  </Text>

                  <TouchableOpacity>
                    <Feather name="info" size={14} color={colors.muted} />
                  </TouchableOpacity>
                </View>

                <Text style={{ color: colors.muted, marginTop: 4 }}>
                  ₦{userBalance.toLocaleString()}
                </Text>
              </View>

              <Feather name="check-circle" size={22} color={colors.primary} />
            </View>
          </View>

          {/* Pay button */}
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: colors.primary }]}
            onPress={onPay}
          >
            <Text style={styles.payText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}



const InfoRow = ({
  label,
  value,
  icon,
  colors,
  isNumber = false,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  colors: any;
  isNumber?: boolean;
}) => {
  const displayValue = isNumber ? formatNumberSpace(value) : value;

  return (
    <View style={styles.infoRow}>
      <Text style={{ color: colors.muted }}>{label}</Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {icon}
        <Text style={{ color: colors.text, fontWeight: "500" }}>
          {displayValue}
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modal: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeBtn: {
    alignSelf: "flex-end",
  },
  amount: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 12,
  },
  section: {
    gap: 14,
    marginVertical: 8,
  },
  networkLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  paymentBox: {
    borderRadius: 14,
    padding: 14,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  payBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  payText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
