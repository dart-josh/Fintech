import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
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
import { verifyTxPin } from "@/services/auth.service";
import { fetchUser } from "@/services/user.service";
import { useToastStore } from "@/store/toast.store";
import { formatCurrentDate } from "@/hooks/format.hook";
import { useWalletStore } from "@/store/wallet.store";
import { NewBeneficiaryModal } from "@/components/NewBeneficiary";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const canTransfer = selectedBeneficiary !== null && (amount ?? 0) >= 100;

  const { user } = useUserStore.getState();
  const { wallet } = useWalletStore.getState();
  const toast = useToastStore.getState();

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardOpen(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOpen(false)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setModalVisible(false);
  };

  const handleConfirmTransfer = () => {
    setConfirmVisible(false);
    if (user?.transaction_pin) {
      setPinVisible(true);
    } else {
      toast.show({ type: "warning", message: "Transaction PIN Not set" });
    }
  };

  const handlePinComplete = async (pin: string) => {
    setIsLoading(true);
    setPinError("");

    const valid = await verifyTxPin({ userId: user?.id ?? "", pin });
    if (!valid) {
      setPinError("Invalid PIN");
      setIsLoading(false);
      return;
    }

    try {
      const res = await transferMoney({
        sender_id: user?.id ?? "",
        amount: Number(amount),
        payment_code: selectedBeneficiary?.paymentCode ?? "",
      });

      setPinVisible(false);
      fetchUser(user?.id ?? "");

      router.back();
      router.push({
        pathname: "/payment-status",
        params:
          res ??
          {
            recipientName: selectedBeneficiary?.name,
            paymentCode: selectedBeneficiary?.paymentCode,
            amount,
            date: formatCurrentDate(""),
            reference: "",
            method: "Wallet-to-Wallet Transfer",
            status: "failed",
          },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ================= HEADER ================= */}
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

      {/* ================= CONTENT ================= */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={10}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: keyboardOpen
              ? 40
              : insets.bottom + 140,
          }}
        >
          {/* Amount */}
          <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>
              Amount
            </Text>

            <TouchableOpacity
              onPress={() => setShowAmountSheet(true)}
              style={[
                styles.amountDisplay,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.amountText, { color: colors.textPrimary }]}>
                ₦{amount ? amount.toLocaleString() : "0"}
              </Text>
              <Feather name="edit-3" size={18} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {/* Beneficiary */}
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
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontWeight: "700",
                    }}
                  >
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

          <View style={{ marginTop: 10 }}>
            <NewBeneficiaryModal
              onSelectRecipient={(data) => {
                if (data.paymentCode === user?.payment_code) {
                  toast.show({
                    message: "You cannot send money to yourself",
                    type: "error",
                  });
                } else {
                  setSelectedBeneficiary({
                    name: data.name,
                    paymentCode: data.paymentCode,
                    nickname: data.name,
                    id: "",
                  });
                }
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>

      {/* ================= BOTTOM ACTIONS ================= */}
      {!keyboardOpen && (
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
              {
                backgroundColor: canTransfer
                  ? colors.accent
                  : colors.muted,
              },
            ]}
            onPress={() => setConfirmVisible(true)}
          >
            <Text style={{ color: "#FFF", fontWeight: "800" }}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= MODALS ================= */}
      {showAmountSheet && (
        <AmountSelectorSheet
          onClose={() => setShowAmountSheet(false)}
          onConfirm={(val) => {
            setAmount(val);
            setShowAmountSheet(false);
          }}
        />
      )}

      <BeneficiaryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelectBeneficiary}
      />

      {confirmVisible && (
        <TransferConfirmModal
          visible={confirmVisible}
          onClose={() => setConfirmVisible(false)}
          amount={amount || 0}
          recipientName={selectedBeneficiary?.name ?? ""}
          paymentCode={selectedBeneficiary?.paymentCode ?? ""}
          userBalance={wallet?.balance ?? ""}
          onConfirm={handleConfirmTransfer}
        />
      )}

      {pinVisible && (
        <PinModal
          visible={pinVisible}
          onClose={() => setPinVisible(false)}
          onComplete={handlePinComplete}
          error={pinError}
          isLoading={isLoading}
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
  headerTitle: { fontSize: 24, fontWeight: "800" },

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
    // marginTop: 16,
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
