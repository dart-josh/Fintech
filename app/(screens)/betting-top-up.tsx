import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import ProviderBottomSheet, { Provider } from "@/components/ProviderSelector";
import { BETTING_PROVIDERS } from "@/utils/globalVariables";
import { useWalletStore } from "@/store/wallet.store";
import { useConfirmPinHook } from "@/hooks/pinVerification.hook";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import BettingConfirmationModal from "@/components/modals/BettingConfirmationModal";
import { purchaseBetting } from "@/services/wallet.service";
import { useUserStore } from "@/store/user.store";

export default function CableTvScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const { user } = useUserStore();
  const { wallet } = useWalletStore();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [userId, setUserId] = useState("");
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [loadingName, setLoadingName] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showProviderSheet, setShowProviderSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  /* Simulated Fetch */
  const fetchUserName = async (value: string) => {
    setUserId(value);
    setCustomerName(null);
    setError(null);

    if (value.length < 6) return;

    setLoadingName(true);

    setTimeout(() => {
      setLoadingName(false);

      if (value === "12345678") {
        setCustomerName(user?.fullname ?? "JOHN DOE");
      } else {
        setError("User ID not found");
      }
    }, 1500);
  };

  const canProceed = provider && customerName && Number(amount) >= 100;

  const handleProceed = () => {
    setShowConfirmModal(true);
  };

  const handlePay = () => {
    const { confirmPin } = useConfirmPinHook.getState();

    setShowConfirmModal(false);
    confirmPin(async () => {
      const res = await purchaseBetting({
        userId: user?.id ?? "",
        amount: Number(amount) ?? 0,
        provider: provider?.name ?? "",
        number: userId,
        customer: customerName ?? "",
      });

      if (!res) {
        router.push({
          pathname: "/betting-status",
          params: {
            amount: amount ?? "0",
            provider: provider?.name ?? "",
            bettingNumber: userId ?? "",
            customerName: customerName ?? "",
            reference: "",
            date: new Date().toISOString(),
            status: "failed",
          },
        });
        return;
      }

      router.push({
        pathname: "/betting-status",
        params: {
          ...res,
          bettingNumber: res.number,
          customerName: res.customer,
        },
      });
    });
  };

  useEffect(() => {
      setUserId("");
      setCustomerName("");
      setAmount("");
    }, [provider?.name]);

  return (
    <View
      style={[
        styles.page,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* TOP BAR */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 12,
            backgroundColor: isDark ? colors.background : "#F4F5F7",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE CONTENT */}
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Betting</Text>

        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Fund your betting account with ease
        </Text>

        {/* SERVICE PROVIDER */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Service Provider
          </Text>

          <TouchableOpacity
            style={[
              styles.selectBox,
              {
                borderColor: colors.border,
                backgroundColor: isDark ? colors.card : "#FFFFFF",
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setShowProviderSheet(true)}
          >
            <Text
              style={{
                color: provider ? colors.text : colors.textMuted,
              }}
            >
              {provider?.name || "Select a provider"}
            </Text>

            <Feather name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* USER ID */}
        {provider && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              User ID
            </Text>

            <TextInput
              placeholder={`Enter user/account ID`}
              placeholderTextColor={colors.textMuted}
              value={userId}
              onChangeText={fetchUserName}
              style={[
                styles.input,
                {
                  borderColor:
                    error && !customerName ? colors.danger : colors.border,
                  backgroundColor: isDark ? colors.card : "#FFFFFF",
                  color: colors.text,
                },
              ]}
            />

            {/* Loading State */}
            {loadingName && (
              <View style={{ marginTop: 8, maxWidth: 40 }}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            )}

            {/* Error */}
            {!loadingName && error && !customerName && (
              <Text
                style={{
                  color: colors.danger,
                  marginTop: 6,
                  fontSize: 12,
                }}
              >
                {error}
              </Text>
            )}

            {/* Success Name */}
            {customerName && !loadingName && (
              <Text
                style={{
                  color: colors.accent,
                  marginTop: 8,
                  fontWeight: "700",
                }}
              >
                {customerName}
              </Text>
            )}
          </View>
        )}

        {/* PACKAGE SELECT (ONLY IF NAME FOUND) */}
        {customerName && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Enter amount
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  paddingVertical: 20,
                },
              ]}
            >
              <TextInput
                placeholder="How much do want to buy?"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
                style={[
                  styles.textInput,
                  {
                    color: colors.textPrimary,
                    fontSize: amount ? 16 : 14,
                    fontWeight: amount ? "600" : "400",
                  },
                ]}
              />
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </KeyboardAwareScrollView>

      {/* FIXED PROCEED BUTTON */}
      <View
        style={[
          {
            paddingBottom: insets.bottom + 5,
            paddingHorizontal: 20,
          },
        ]}
      >
        <TouchableOpacity
          disabled={!canProceed}
          onPress={handleProceed}
          style={[
            styles.button,
            { backgroundColor: canProceed ? colors.accent : colors.muted },
          ]}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Proceed</Text>
        </TouchableOpacity>
      </View>

      <ProviderBottomSheet
        visible={showProviderSheet}
        onClose={() => setShowProviderSheet(false)}
        onSelect={(v) => {
          setProvider(v);
        }}
        providers={BETTING_PROVIDERS}
      />

      <BettingConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        amount={Number(amount)}
        providerName={provider?.name ?? ""}
        providerLogo={provider?.image ?? ""}
        userNumber={userId}
        customerName={customerName ?? ""}
        userBalance={wallet?.balance ?? ""}
        onPay={handlePay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  scrollContent: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 30,
  },

  fieldContainer: {
    marginBottom: 24,
  },

  label: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "500",
  },

  inputContainer: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
  },

  textInput: {
    flex: 1,
  },

  input: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },

  selectBox: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bottomContainer: {
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  button: {
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
