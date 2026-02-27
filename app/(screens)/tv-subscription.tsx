import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import ProviderBottomSheet, { Provider } from "@/components/ProviderSelector";
import {
  airtel_bundles,
  mtn_bundles,
  TV_PROVIDERS,
} from "@/utils/globalVariables";
import PackageBottomSheet, { Package } from "@/components/PackageSelector";
import CableTvConfirmationModal from "@/components/modals/CableTvConfirmationModal";
import { useWalletStore } from "@/store/wallet.store";
import { useConfirmPinHook } from "@/hooks/pinVerification.hook";
import { purchaseCableTv } from "@/services/wallet.service";
import { useUserStore } from "@/store/user.store";

const getPlan = (provider: string) => {
  switch (provider.toLowerCase()) {
    case "mtn":
      return mtn_bundles;
    case "airtel":
      return airtel_bundles;
    default:
      return mtn_bundles;
  }
};

export default function CableTvScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const { user } = useUserStore();
  const { wallet } = useWalletStore();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [smartcard, setSmartcard] = useState("");
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const [showProviderSheet, setShowProviderSheet] = useState(false);
  const [showPackageSheet, setShowPackageSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  /* Simulated Fetch */
  const fetchSmartcardName = async (value: string) => {
    setSmartcard(value);
    setCustomerName(null);
    setError(null);

    if (value.length < 6) return;

    setLoadingName(true);

    setTimeout(() => {
      setLoadingName(false);

      if (value === "12345678") {
        setCustomerName(user?.fullname ?? "JOHN DOE");
      } else {
        setError(provider?.key === "showmax" ? "Recipient number not found" : "Smartcard number not found");
      }
    }, 1500);
  };

  const canProceed = provider && customerName && selectedPackage;

  const handleProceed = () => {
    setShowConfirmModal(true);
  };
  const handlePay = async () => {
    const { confirmPin } = useConfirmPinHook.getState();

    setShowConfirmModal(false);
    confirmPin(async () => {
      const res = await purchaseCableTv({
        userId: user?.id ?? "",
        amount: Number(selectedPackage?.price) ?? 0,
        provider: provider?.name ?? "",
        number: smartcard,
        customer: customerName ?? "",
        package: selectedPackage?.name ?? "",
      });

      if (!res) {
        router.push({
          pathname: "/tv-sub-status",
          params: {
            amount: selectedPackage?.price ?? "0",
            provider: provider?.name ?? "",
            smartcard: smartcard ?? "",
            customerName: customerName ?? "",
            package: selectedPackage?.name ?? "",
            reference: "",
            date: new Date().toISOString(),
            status: "failed",
          },
        });
        return;
      }

      router.push({
        pathname: "/tv-sub-status",
        params: { ...res, smartcard: res.number, customerName: res.customer },
      });
    });
  };

  useEffect(() => {
    setSmartcard("");
    setCustomerName("");
    setSelectedPackage(null);
  }, [provider?.name]);

  const packages = getPlan(provider?.key ?? "");

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Cable TV</Text>

        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Purchase cable TV subscriptions
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
              {provider?.name || "Choose Service Provider"}
            </Text>

            <Feather name="chevron-down" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* SMARTCARD NUMBER */}
        {provider && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              {provider.key === "showmax" ? "Phone Number" : "Smartcard Number"}
            </Text>

            <TextInput
              placeholder={
                provider.key === "showmax"
                  ? "Enter recipient phone number"
                  : `Enter ${provider.name || "Cable TV"} smartcard number`
              }
              placeholderTextColor={colors.textMuted}
              value={smartcard}
              keyboardType="number-pad"
              onChangeText={fetchSmartcardName}
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
              Select Package
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
              onPress={() => setShowPackageSheet(true)}
            >
              <Text
                style={{
                  color: selectedPackage ? colors.text : colors.textMuted,
                }}
              >
                {selectedPackage?.name || "Choose your preferred package"}
              </Text>

              <Feather name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

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
        providers={TV_PROVIDERS}
      />

      <PackageBottomSheet
        visible={showPackageSheet}
        onClose={() => setShowPackageSheet(false)}
        onSelect={(v) => {
          setSelectedPackage(v);
        }}
        packages={packages.map((p) => ({
          key: p.title,
          name: p.title,
          price: p.amount.toString(),
        }))}
      />

      <CableTvConfirmationModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        amount={Number(selectedPackage?.price)}
        providerName={provider?.name ?? ""}
        providerLogo={provider?.image ?? ""}
        smartcardNumber={smartcard}
        customerName={customerName ?? ""}
        packageName={selectedPackage?.name ?? ""}
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
