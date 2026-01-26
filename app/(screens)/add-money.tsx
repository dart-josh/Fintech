import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/theme/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  AccountDetails,
  checkTransactionStatus,
  fundAccount,
  getDedicatedAccount,
  isDedicatedNubanEnabled,
  TransactionDetails,
} from "@/services/wallet.service";
import { useUserStore } from "@/store/user.store";
import { useToastStore } from "@/store/toast.store";

/* -------------------- Utils -------------------- */
const copy = async (value: string, label: string) => {
  await Clipboard.setStringAsync(value);
  Alert.alert("Copied", `${label} copied`);
};

/* -------------------- Component 1 -------------------- */
const DedicatedAccountView = ({
  accountName,
  accountNumber,
  bankName,
}: any) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Your Account Details
      </Text>

      {[
        { label: "Account Name", value: accountName },
        { label: "Account Number", value: accountNumber },
        { label: "Bank", value: bankName, copyable: false },
      ].map((item, i) => (
        <View key={i} style={{ marginTop: 14 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {item.label}
          </Text>

          <View
            style={[
              styles.row,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.value, { color: colors.text }]}>
              {item.value}
            </Text>

            {item.copyable !== false && (
              <TouchableOpacity onPress={() => copy(item.value, item.label)}>
                <Feather name="copy" size={18} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

/* -------------------- Component 2 -------------------- */
const TempFundingInitView = ({ onInitiate }: any) => {
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Fund Wallet
      </Text>

      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Amount
      </Text>

      <TextInput
        placeholder="Enter amount"
        placeholderTextColor={colors.muted}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
      />

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
        onPress={() => onInitiate(amount)}
      >
        <Text style={styles.primaryText}>Generate Transfer Account</Text>
      </TouchableOpacity>
    </View>
  );
};

/* -------------------- Component 3 -------------------- */
const TempAccountDetailsView = ({
  accountNumber,
  bankName,
  reference,
  expiresAt,
  onVerify,
  onCancel,
}: any) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Make Transfer
      </Text>

      {[
        { label: "Account Number", value: accountNumber },
        { label: "Bank", value: bankName, copyable: false },
        { label: "Reference", value: reference },
        // { label: "Expires At", value: expiresAt ?? "N/A", copyable: false },
      ].map((item, i) => (
        <View key={i} style={{ marginTop: 14 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {item.label}
          </Text>

          <View
            style={[
              styles.row,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.value, { color: colors.text }]}>
              {item.value}
            </Text>

            {item.copyable !== false && (
              <TouchableOpacity onPress={() => copy(item.value, item.label)}>
                <Feather name="copy" size={18} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
          {item.label === "Reference" && (
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary, marginTop: 6 },
              ]}
            >
              Add this reference to the transfer description/narration.
            </Text>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          { backgroundColor: colors.accent, marginTop: 20 },
        ]}
        onPress={onVerify}
      >
        <Text style={styles.primaryText}>Verify Transaction</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          { backgroundColor: colors.danger, marginTop: 20 },
        ]}
        onPress={onCancel}
      >
        <Text style={styles.primaryText}>Cancel Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

/* -------------------- Success -------------------- */
const FundingSuccessView = ({ onClose }: any) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, alignItems: "center" },
      ]}
    >
      <Feather name="check-circle" size={56} color={colors.success} />
      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}
      >
        Wallet Funded Successfully
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
        Your balance has been updated.
      </Text>

      <TouchableOpacity
        style={[
          styles.successBtn,
          { backgroundColor: colors.accent, marginTop: 30 },
        ]}
        onPress={onClose}
      >
        <Text style={styles.primaryText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

/* -------------------- Parent Modal -------------------- */
export default function ReceiveMoneyModal({ visible, onClose }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [hasDedicated, setHasDedicated] = useState(false);
  const [stage, setStage] = useState<"init" | "tempAccount" | "success">(
    "init",
  );

  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(
    null,
  );
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null);

  const { user } = useUserStore();
  const toast = useToastStore.getState();

  useEffect(() => {
    if (!visible) return;

    const checkNubanStatus = async () => {
      setLoading(true);
      const enabled = await isDedicatedNubanEnabled();

      if (enabled) {
        const acctDetails = await getDedicatedAccount({
          userId: user?.id ?? "",
        });
        if (acctDetails) {
          setAccountDetails(acctDetails);
        }
      }

      setLoading(false);

      setHasDedicated(enabled);
    };

    checkNubanStatus();
  }, [visible, user]);

  if (!visible) return null;

  const checkTxStatus = async ({ showLoading = false }) => {
    if (!txDetails?.reference) return;
    if (showLoading) setLoading(true);
    // const status = await checkTransactionStatus({
    //   reference: txDetails?.reference ?? "",
    // });
    if (showLoading) setLoading(false);

    // if (status === "success") {
    //   setStage("success");
    // }
  };

  const initiateTx = async (amount: string) => {
    function generateWalletReference(userId: string): string {
      const timestamp = Math.floor(Date.now() / 1000); // current Unix timestamp in seconds
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase(); // 6-char random string
      return `WALLET_${userId}_${timestamp}_${randomStr}`;
    }

    setLoading(true);
    // const tx = await fundAccount({ userId: user?.id ?? "", amount });
    const ref = generateWalletReference(user?.id ?? "");
    const tx = {
      reference: ref,
      bank_name: "Arigo Temporary Account",
      account_number: "1234567890",
      expires_at: null,
      amount: Number(amount),
    };
    setLoading(false);

    if (!tx) {
      toast.show({ message: "Failed to initiate transaction", type: "error" });
      return;
    }

    setTxDetails(tx);
    setStage("tempAccount");
  };

  // disable close button while in tempAccount stage
  const disableClose = false; //stage === "tempAccount";

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <BlurView intensity={40} style={StyleSheet.absoluteFill}>
        {/* removed outside touch to close */}
        <KeyboardAwareScrollView
          contentContainerStyle={[
            styles.modal,
            {
              backgroundColor: "transparent",
            },
          ]}
          extraScrollHeight={Platform.OS === "ios" ? 20 : 0}
        >
          <View
            style={[
              styles.mainContent,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.min(insets.bottom, 20) + 30,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Receive Money
              </Text>
              <TouchableOpacity
                onPress={disableClose ? undefined : onClose}
                disabled={disableClose}
              >
                <Feather
                  name="x"
                  size={24}
                  color={disableClose ? colors.muted : colors.text}
                />
              </TouchableOpacity>
            </View>

            {loading && (
              <ActivityIndicator size="large" color={colors.accent} />
            )}

            {!loading && hasDedicated && (
              <DedicatedAccountView
                accountName={accountDetails?.account_name ?? ""}
                accountNumber={accountDetails?.account_number ?? ""}
                bankName={accountDetails?.bank_name ?? ""}
              />
            )}

            {!loading && !hasDedicated && stage === "init" && (
              <TempFundingInitView
                onInitiate={(amount: string) => initiateTx(amount)}
              />
            )}

            {!loading && stage === "tempAccount" && (
              <TempAccountDetailsView
                accountNumber={txDetails?.account_number}
                bankName={txDetails?.bank_name}
                reference={txDetails?.reference}
                expiresAt={txDetails?.expires_at}
                onVerify={() => checkTxStatus({ showLoading: true })}
                onCancel={() => {
                  setStage("init");
                  onClose();
                }}
              />
            )}

            {stage === "success" && (
              <FundingSuccessView
                onClose={() => {
                  setStage("init");
                  onClose();
                }}
              />
            )}
          </View>
        </KeyboardAwareScrollView>
      </BlurView>
    </Modal>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  modal: {
    flexGrow: 1,
    justifyContent: "flex-end",
    maxHeight: "100%",
  },
  mainContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },
  successBtn: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
