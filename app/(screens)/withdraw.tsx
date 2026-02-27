import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { Bank, BankSelectorModal } from "@/components/BankSelector";
import { getBanks, resolveAccount } from "@/api/bank.api";
import { useUserStore } from "@/store/user.store";
import { Transaction, useWalletStore } from "@/store/wallet.store";
import { useToastStore } from "@/store/toast.store";
import { verifyTxPin } from "@/services/auth.service";
import { fetchUser } from "@/services/user.service";
import { withdraw } from "@/services/wallet.service";
import PinModal from "@/components/PinModal";
import WithdrawalModal from "@/components/WithdrawalModal";
import { parseFormattedAmount } from "@/hooks/format.hook";

/* -------------------- MAIN SCREEN -------------------- */
export default function WithdrawScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [banks, setBanks] = useState<Bank[]>();

  const [fetchingName, setFetchingName] = useState(false);

  useEffect(() => {
    getBanks()
      .then((banks: any) => {
        setBanks(banks);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const getAccountName = async () => {
      setAccountName("");
      if (
        selectedBank === null ||
        !selectedBank?.code ||
        accountNumber.length !== 10
      )
        return;
      setFetchingName(true);

      try {
        const res : any = await resolveAccount({
          account_number: accountNumber,
          bank_code: selectedBank?.code ?? "",
        });
        setFetchingName(false);
        if (res["account_name"]) {
          setAccountName(res["account_name"]);
        }
      } catch (error) {
        setFetchingName(false);
        setAccountName("invalid");
      }
    };

    getAccountName();
  }, [accountNumber, selectedBank]);

  const canWithdraw =
    accountName !== "" && accountName !== "invalid" && Number(amount) >= 100;

  const [withdrawModal, setWithdrawModal] = useState(false);

  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useUserStore.getState();

  const { wallet } = useWalletStore();
  const userBalance = wallet?.balance ?? "";

  const toast = useToastStore.getState();

  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = () => {
    setWithdrawModal(false);
    if (user?.transaction_pin) {
      setPinVisible(true);
    } else {
      toast.show({ type: "warning", message: "Transaction PIN Not set" });
      router.push("/set-pin-intro");
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const valid = await verifyTxPin({ userId: user?.id ?? "", pin });
    return valid;
  };

  const handlePinComplete = async (pin: string) => {
    setIsLoading(true);
    setPinError("");
    const pinValid = await verifyPin(pin);

    if (!pinValid) {
      setIsLoading(false);
      setPinError("Invalid PIN");
      Vibration.vibrate(200);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await withdraw({
        userId: user?.id ?? "",
        amount: Number(amount),
        account_number: accountNumber,
        bank_name: selectedBank?.name ?? "",
        bank_code: selectedBank?.code ?? "",
        account_name: accountName,
      });

      setIsLoading(false);
      setPinVisible(false);
      setPinError("");

      if (!res) {
        router.push({
          pathname: "/withdrawal-status",
          params: {
            amount: amount ?? "0.00",
            account_number: accountNumber ?? "",
            bank_name: selectedBank?.name ?? "",
            account_name: accountName ?? "",
            reference: "",
            date: new Date().toISOString(),
            status: "failed",
            method: "Bank Withdrawal",
          },
        });
        return;
      }

      fetchUser(user?.id ?? "");
      router.back();
      router.push({
        pathname: "/withdrawal-status",
        params: { ...res },
      });
    } catch (e) {
      setPinError("Invalid PIN");
      Vibration.vibrate(200);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const countCurrentMonthWithdrawals = (withdrawals: Transaction[]): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return withdrawals.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    }).length;
  };

  const withdrawThisMonth = countCurrentMonthWithdrawals(
    wallet?.withdrawTransactions ?? [],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* ---------------- TOP BAR ---------------- */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 0.5,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/history",
              params: { type: "withdraw" },
            })
          }
        >
          <Text style={{ color: colors.accent, fontWeight: "600" }}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- SCROLLABLE CONTENT ---------------- */}
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: 6,
          }}
        >
          Withdraw
        </Text>

        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          Withdraw from Arigo Pay wallet to your personal bank account
        </Text>

        {/* ---------------- STATS ---------------- */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              title: `₦${userBalance}`,
              label: "Current Balance",
              icon: "credit-card",
              color: "#4CAF50",
            },
            {
              title: withdrawThisMonth,
              label: "Withdrawals This Month",
              icon: "trending-down",
              color: "#FF9800",
            },
          ].map((item, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 14,
                paddingRight: 50,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                {item.label}
              </Text>

              <View
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: [{ translateY: -16 }],
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: item.color + "22",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather name={item.icon as any} size={18} color={item.color} />
              </View>
            </View>
          ))}
        </View>

        {/* Dots */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 18, color: colors.textSecondary }}>•••</Text>
        </View>

        {/* ---------------- AMOUNT INPUT ---------------- */}
        <Text style={{ fontWeight: "600", color: colors.textPrimary }}>
          Amount to withdraw (minimum ₦100)
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 52,
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: 18,
              color: colors.textPrimary,
            }}
          >
            ₦
          </Text>
          <TextInput
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            placeholder="100"
            placeholderTextColor={colors.textSecondary}
            style={{
              flex: 1,
              fontSize: 16,
              marginLeft: 8,
              color: colors.textPrimary,
            }}
          />
        </View>

        {/* ---------------- DESTINATION ---------------- */}
        <Text
          style={{
            fontWeight: "700",
            marginBottom: 8,
            color: colors.textPrimary,
          }}
        >
          Destination of Funds
        </Text>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 14,
          }}
        >
          {/* Account Number */}
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 6,
              color: colors.textPrimary,
            }}
          >
            Account Number
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.background,
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 48,
              marginBottom: 10,
            }}
          >
            <Feather name="hash" size={18} color={colors.textSecondary} />
            <TextInput
              placeholder="10-digit account"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={10}
              value={accountNumber}
              onChangeText={setAccountNumber}
              style={{
                flex: 1,
                marginLeft: 8,
                color: colors.textPrimary,
              }}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            {fetchingName ? (
              <ActivityIndicator
                size="small"
                color={colors.accent}
                style={{ height: 20, alignSelf: "flex-start", marginLeft: 35 }}
              />
            ) : (
              <Text
                style={{
                  fontWeight: "700",
                  color:
                    accountName === "invalid" ? "#FF4D4D" : colors.textPrimary,
                }}
              >
                {accountName === "invalid" ? "Invalid account" : accountName}
              </Text>
            )}
          </View>

          {/* Bank Selector */}
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 6,
              color: colors.textPrimary,
            }}
          >
            Bank Name
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (banks?.length > 0) {
                setBankModalVisible(true);
              }
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.background,
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 48,
            }}
          >
            <Feather name="layers" size={18} color={colors.textSecondary} />
            <Text
              style={{
                marginLeft: 8,
                color: selectedBank ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {selectedBank?.name && accountNumber.length !== 10
                ? "Enter account number"
                : selectedBank?.name || "Select bank"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* ---------------- FIXED BUTTON ---------------- */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 16,
          right: 16,
        }}
      >
        <TouchableOpacity
          disabled={!canWithdraw}
          onPress={() => setWithdrawModal(true)}
          style={{
            height: 56,
            borderRadius: 28,
            backgroundColor: canWithdraw ? colors.accent : colors.muted,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.background,
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            Withdraw
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------- BANK MODAL ---------------- */}
      <BankSelectorModal
        visible={bankModalVisible}
        banks={banks ?? []}
        onClose={() => setBankModalVisible(false)}
        onSelect={(bank) => {
          setSelectedBank(bank);
        }}
      />

      <WithdrawalModal
        visible={withdrawModal}
        onClose={() => setWithdrawModal(false)}
        amount={Number(amount)}
        accountNumber={accountNumber}
        bankName={selectedBank?.name ?? ""}
        accountName={accountName}
        userBalance={parseFormattedAmount(userBalance)}
        onConfirm={handleWithdraw}
      />

      <PinModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onComplete={handlePinComplete}
        error={pinError}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  );
}
