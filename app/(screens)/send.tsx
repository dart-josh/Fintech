import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Vibration,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import AmountSelectorSheet from "@/components/AmountSelectorSheet";
import TransferConfirmModal from "@/components/TransferConfirmModal";
import PinModal from "@/components/PinModal";
import { useUserStore } from "@/store/user.store";
import { BeneficiaryModal } from "@/components/BeneficiaryModal";
import { transferMoney } from "@/services/wallet.service";
import { fetchUser, verifyTxPin } from "@/services/auth.service";
import { useToastStore } from "@/store/toast.store";
import { formatCurrentDate } from "@/hooks/format.hook";

interface Beneficiary {
  id: string;
  name: string;
  paymentCode: string;
  nickname: string;
}

export default function SendPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [amount, setAmount] = useState<number | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null);

  const [showAmountSheet, setShowAmountSheet] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const canTransfer = selectedBeneficiary !== null && (amount ?? 0) >= 100;

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setModalVisible(false);
  };

  const { user } = useUserStore.getState();
  const toast = useToastStore.getState();

  const handleConfirmTransfer = () => {
    setConfirmVisible(false);
    if (user?.transaction_pin) {
      setPinVisible(true);
    } else {
      toast.show({ type: "warning", message: "Transaction PIN Not set" });
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const valid = await verifyTxPin({ userId: user?.id ?? "", pin });
    return valid;
  };

  const handlePinComplete = async (pin: string) => {
    setPinError("");
    const pinValid = await verifyPin(pin);

    if (!pinValid) {
      setPinError("Invalid PIN");
      Vibration.vibrate(200);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await transferMoney({
        sender_id: user?.id ?? "",
        amount: Number(amount),
        payment_code: selectedBeneficiary?.paymentCode ?? "",
        // pin,
      });

      setPinVisible(false);
      setPinError("");

      if (!res) {
        router.push({
          pathname: "/payment-status",
          params: {
            recipientName: selectedBeneficiary?.name,
            paymentCode: selectedBeneficiary?.paymentCode,
            amount,
            date: formatCurrentDate(),
            reference: "",
            method: "Peer-Peer Transfer",
            status: "failed",
          },
        });
        return;
      }
      fetchUser(user?.id ?? "");
      router.back();
      router.push({
        pathname: "/payment-status",
        params: { ...res },
      });
    } catch (e) {
      setPinError("Invalid PIN");
      Vibration.vibrate(200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Bar */}
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
          Send Money
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Amount Card --- */}
        <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
            Amount
          </Text>
          <TouchableOpacity
            onPress={() => setShowAmountSheet(true)}
            style={[styles.amountDisplay, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.amountText, { color: colors.textPrimary }]}>
              ₦{amount ? amount.toLocaleString() : "0"}
            </Text>
            <Feather name="edit-3" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* --- Beneficiary Selection Box --- */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[
            styles.beneficiaryCard,
            {
              backgroundColor: colors.card,
              borderWidth: selectedBeneficiary ? 0 : 1,
              borderColor: colors.border,
            },
          ]}
        >
          {selectedBeneficiary ? (
            <View style={styles.row}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.accent + "22" },
                ]}
              >
                <Feather name="user" size={22} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>
                  {selectedBeneficiary.nickname}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  {selectedBeneficiary.paymentCode}
                </Text>
              </View>
              <Text style={{ color: colors.accent, fontWeight: "700" }}>
                Change
              </Text>
            </View>
          ) : (
            <Text style={{ color: colors.textSecondary }}>
              Select beneficiary
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* --- Bottom Actions --- */}
      <View
        style={[
          styles.bottomActions,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <TouchableOpacity
          disabled={loading}
          style={[styles.cancelBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!canTransfer}
          style={[
            styles.sendBtn,
            { backgroundColor: canTransfer ? colors.accent : colors.muted },
          ]}
          onPress={() => setConfirmVisible(true)}
        >
          <Text style={{ color: "#FFF", fontWeight: "800" }}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Amount Selector Sheet */}
      {showAmountSheet && (
        <AmountSelectorSheet
          onClose={() => setShowAmountSheet(false)}
          onConfirm={(val) => {
            setAmount(val);
            setShowAmountSheet(false);
          }}
        />
      )}

      {/* Beneficiary Modal */}
      <BeneficiaryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelectBeneficiary}
      />

      {/* Confirm & PIN Modals */}
      {confirmVisible && (
        <TransferConfirmModal
          visible={confirmVisible}
          onClose={() => setConfirmVisible(false)}
          amount={amount || 0}
          recipientName={selectedBeneficiary?.name ?? ""}
          paymentCode={selectedBeneficiary?.paymentCode ?? ""}
          userBalance={45000}
          onConfirm={handleConfirmTransfer}
        />
      )}

      {pinVisible && (
        <PinModal
          visible={pinVisible}
          onClose={() => setPinVisible(false)}
          onComplete={handlePinComplete}
          error={pinError}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  amountCard: {
    margin: 16,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  amountDisplay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  amountText: { fontSize: 34, fontWeight: "800", marginRight: 8 },

  beneficiaryCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  bottomActions: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 0.5,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    marginRight: 8,
  },
  sendBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    marginLeft: 8,
  },
});
