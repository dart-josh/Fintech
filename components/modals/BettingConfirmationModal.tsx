import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BettingConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  amount: number;
  providerName: string;
  providerLogo?: any;
  userNumber: string;
  customerName: string;
  userBalance: string;
  onPay: () => void;
};

export default function BettingConfirmationModal({
  visible,
  onClose,
  amount,
  providerName,
  providerLogo,
  userNumber,
  customerName,
  userBalance,
  onPay,
}: BettingConfirmationModalProps) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  const numericBalance = Number(userBalance.replace(/,/g, ""));
  const isInsufficient = numericBalance < amount;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 10,
            },
          ]}
        >
          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Amount */}
          <Text style={[styles.amount, { color: colors.text }]}>
            ₦{amount.toLocaleString()}
          </Text>

          <Text style={[styles.confirmText, { color: colors.muted }]}>
            Confirm Betting Top Up
          </Text>

          {/* Details */}
          <View style={styles.section}>
            <InfoRow
              label="Provider"
              value={providerName}
              logo={providerLogo}
              colors={colors}
            />

            <InfoRow
              label="User/Account ID"
              value={userNumber}
              colors={colors}
            />

            <InfoRow
              label="Customer Name"
              value={customerName}
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

          {/* Payment Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>

          <View
            style={[
              styles.paymentBox,
              {
                backgroundColor: isDark ? "#2A2A2A" : "#F4F5F7",
                borderColor: isInsufficient ? "#EF4444" : "transparent",
                borderWidth: isInsufficient ? 1 : 0,
              },
            ]}
          >
            <View style={styles.paymentRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Available Balance
                </Text>

                <Text style={{ color: colors.muted, marginTop: 4 }}>
                  ₦{numericBalance.toLocaleString()}
                </Text>

                {isInsufficient && (
                  <Text style={styles.insufficientText}>
                    Insufficient balance
                  </Text>
                )}
              </View>

              <Feather
                name={isInsufficient ? "alert-circle" : "check-circle"}
                size={22}
                color={isInsufficient ? "#EF4444" : colors.primary}
              />
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            disabled={isInsufficient}
            style={[
              styles.payBtn,
              {
                backgroundColor: colors.primary,
                opacity: isInsufficient ? 0.5 : 1,
              },
            ]}
            onPress={onPay}
          >
            <Text style={styles.payText}>
              {isInsufficient ? "Insufficient Balance" : "Confirm & Pay"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- Info Row ---------------- */

const InfoRow = ({
  label,
  value,
  logo,
  colors,
}: {
  label: string;
  value: string;
  logo?: any;
  colors: any;
}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={{ color: colors.muted }}>{label}</Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {logo && (
          <View style={styles.logoWrapper}>
            <Image
              source={logo}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        )}

        <Text style={{ color: colors.text, fontWeight: "500" }}>
          {value}
        </Text>
      </View>
    </View>
  );
};

/* ---------------- Styles ---------------- */

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
    marginTop: 10,
  },
  confirmText: {
    textAlign: "center",
    marginTop: 4,
    fontSize: 13,
  },
  section: {
    gap: 14,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
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
  insufficientText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
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