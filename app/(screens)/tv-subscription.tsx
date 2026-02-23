import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Dimensions,
  Vibration,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  airtel_bundles,
  glo_bundles,
  mtn_bundles,
  tmobile_bundles,
  TV_PROVIDERS,
} from "@/utils/globalVariables";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PaymentModal from "@/components/PaymentModal";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { useWalletStore } from "@/store/wallet.store";
import { useToastStore } from "@/store/toast.store";
import { verifyTxPin } from "@/services/auth.service";
import { fetchUser } from "@/services/user.service";
import { lookUpNumber, purchaseData } from "@/services/wallet.service";
import PinModal from "@/components/PinModal";
import ProviderSelector from "@/components/ProviderSelector";

export default function TvSubscription() {
  const { providerKey } = useLocalSearchParams<{
    providerKey: string;
  }>();

  const getProvider = () => {
    const index = TV_PROVIDERS.findIndex((p) => p.key === providerKey);
    return index ?? 0;
  };

  const router = useRouter();
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const { user } = useUserStore.getState();

  const [provider, setProvider] = useState(TV_PROVIDERS[getProvider()]);
  const [providerModal, setProviderModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Bundle | null>(null);
  const [number, setNumber] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [accountError, setAccountError] = useState("");

  const [payModal, setPayModal] = useState(false);

  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  const { wallet } = useWalletStore();
  const userBalance = wallet?.balance ?? "";

  const toast = useToastStore.getState();

  const [isLoading, setIsLoading] = useState(false);

  const getAccountDetails = async () => {
    setLoading(true);
    setAccountError("");
    const account = await lookUpNumber({ phone: number });
    setLoading(false);
    if (account) {
      setAccountDetails(account);
    } else {
      setAccountError("Account does not exist. Please check and re-enter");
    }
  };

  const handleConfirmPayment = () => {
    setPayModal(false);
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

  //!
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
      const res = await purchaseData({
        userId: user?.id ?? "",
        amount: selectedPlan?.amount ?? 0,
        phone: number,
        network: provider.key,
        plan: selectedPlan?.title ?? "",
      });

      setIsLoading(false);
      setPinVisible(false);
      setPinError("");

      if (!res) {
        router.push({
          pathname: "/top-up-status",
          params: {
            phone: number,
            amount: selectedPlan?.amount ?? 0,
            reference: "",
            date: Date().toString(),
            status: "failed",
            method: "Data Top-Up",
            plan: selectedPlan?.title ?? "",
          },
        });
        return;
      }

      fetchUser(user?.id ?? "");
      router.back();
      router.push({
        pathname: "/top-up-status",
        params: { ...res },
      });
    } catch (e) {
      setPinError("Invalid PIN");
      Vibration.vibrate(200);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.page,
        { backgroundColor: isDark ? colors.background : "#F6F7F9" },
      ]}
    >
      {/* ================= TOP BAR ================= */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 12,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>TV</Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/history",
              params: { type: "tv" },
            })
          }
        >
          <Text style={[styles.history, { color: colors.primary }]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={120} // 👈 THIS controls how much it scrolls
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 220,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* =============== PROVIDER SELECTOR ================*/}
        {/* Network selector */}
        <View
          style={{
            padding: 12,
            backgroundColor: colors.card,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            style={[
              styles.networkSelector,
              {
                paddingBottom: 5,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]} // isDark ? "#333" : "#EEE"
            onPress={() => setProviderModal(true)}
          >
            <View style={styles.networkLogo}>
              <Image
                source={provider.image}
                style={styles.networkLogo}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>
                {provider.name}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/*  */}
        </View>

        {/* ================= NUMBER SELECTOR ================= */}
        <View
          style={[
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text style={{ color: colors.textSecondary, marginBottom: 15 }}>
            Smartcard Number
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 30,
              paddingBottom: 10,
              marginBottom: 10,
              borderBottomWidth: 1,
              paddingLeft: 8,
              borderBottomColor:
                !loading && accountError
                  ? colors.danger
                  : isDark
                    ? "#333"
                    : "#EEE",
            }}
          >
            {/* Phone input */}
            <TextInput
              value={number}
              onChangeText={(t) => setNumber(t.replace(/[^0-9]/g, ""))}
              placeholder="Enter Your Smartcard Number"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              // maxLength={13}
              style={[styles.numberInput, { color: colors.text }]}
            />

            {/* clear number */}
            {number && (
              <TouchableOpacity
                onPress={() => setNumber("")}
                style={{
                  height: 22,
                  width: 22,
                  borderRadius: "50%",
                  backgroundColor: colors.textSecondary,
                  alignContent: "center",
                }}
              >
                <Feather name="x" size={20} color="transparent" />
              </TouchableOpacity>
            )}

            {/* find account */}
            {number.length >= 5 && (
              <TouchableOpacity
                onPress={() => getAccountDetails()}
                style={{
                  height: 28,
                  borderRadius: "25",
                  backgroundColor: colors.primary,
                  alignContent: "center",
                  paddingHorizontal: 10,
                }}
              >
                <Text style={{ color: isDark ? "#000" : "#fff" }}>Proceed</Text>
              </TouchableOpacity>
            )}
          </View>

          {accountError && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  height: 16,
                  width: 16,
                  borderRadius: "50%",
                  backgroundColor: colors.danger,
                  alignContent: "center",
                }}
              >
                <Feather name="x" size={14} color="#fff" />
              </View>
              <Text style={{ color: colors.danger }}>{accountError}</Text>
            </View>
          )}
        </View>

        {/* ================= AMOUNT SELECTOR ================= */}
        <AmountSelector
          isDark={isDark}
          setSelectedPlan={setSelectedPlan}
          accountDetails={accountDetails}
          provider={provider.key}
          setPayModal={() => setPayModal(true)}
        />

        {/* ================= EVENT / REWARD ================= */}
        <LinearGradient
          colors={["#6D5FFD", "#8E7CFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rewardBox}
        >
          <Text style={styles.rewardTitle}>Power Your Internet Life</Text>
          <Text style={styles.rewardText}>
            Recharge your data now and get massive rewards
          </Text>
        </LinearGradient>

        {/* ================= SERVICE ================= */}
        {/* <Service /> */}
      </KeyboardAwareScrollView>

      {/* ================= NETWORK MODAL ================= */}
      <ProviderSelector
        providerModal={providerModal}
        setProviderModal={setProviderModal}
        provider={provider}
        setProvider={setProvider}
      />

      {/* ================= PAYMENT MODAL ================= */}
      <PaymentModal
        visible={payModal}
        onClose={() => setPayModal(false)}
        type="data"
        dataBundle={selectedPlan?.title}
        amount={Number(selectedPlan?.amount)}
        networkLogo={provider.image}
        recipient={number}
        userBalance={userBalance}
        onPay={handleConfirmPayment}
      />

      <PinModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onComplete={handlePinComplete}
        error={pinError}
        isLoading={isLoading}
      />
    </View>
  );
}

type Bundle = {
  bundle: number;
  size: string;
  duration: string;
  amount: number;
  title: string;
  category: string;
  addons?: string;
};

const categories = [
  "HOT",
  "Daily",
  "Weekly",
  "Monthly",
  "3 Months+",
  "Social",
  "ROUTER",
  "WIFI",
  "Other",
];

interface AmountSelectorProps {
  isDark: boolean;
  accountDetails: string;
  provider: string;
  setSelectedPlan: (plan: Bundle | null) => void;
  setPayModal: () => void;
}

export const getBundles = (network: string): Bundle[] => {
  switch (network.toLowerCase()) {
    case "mtn":
      return mtn_bundles;
    case "airtel":
      return airtel_bundles;
    case "glo":
      return glo_bundles;
    case "9mobile":
    case "tmobile":
      return tmobile_bundles;
    default:
      console.warn(`No bundles found for network: ${network}`);
      return [];
  }
};

export const AmountSelector = ({
  isDark,
  accountDetails,
  provider,
  setSelectedPlan,
  setPayModal,
}: AmountSelectorProps) => {
  const { colors } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("HOT");

  const filteredBundles = getBundles(provider).filter(
    (b) => b.category === selectedCategory,
  );

  const numColumns = 2;
  const ITEM_SPACING = 8;
  const screenWidth = Dimensions.get("window").width;

  // Calculate item width taking spacing into account
  const itemWidth =
    (screenWidth - 64 - ITEM_SPACING * (numColumns - 1)) / numColumns;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>TV Plans</Text>

      {/* ================= CATEGORY TABS ================= */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8, marginBottom: 15 }}
      >
        {categories.map((cat) => {
          const isSelected = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                setSelectedCategory(cat);
                setSelectedPlan(null);
              }}
              style={{ marginRight: 16 }}
            >
              <Text
                style={{
                  fontWeight: isSelected ? "600" : "400",
                  color: isSelected ? colors.primary : colors.text,
                  textDecorationLine: isSelected ? "underline" : "none",
                  textDecorationStyle: "solid",
                  textDecorationColor: colors.primary,
                  textAlign: "center",
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ================= BUNDLE CARDS ================= */}
      <FlatList
        data={filteredBundles}
        keyExtractor={(item) => item.title}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={{
          justifyContent: "flex-start", // use flex-start for spacing via margin
          marginBottom: ITEM_SPACING,
        }}
        renderItem={({ item, index }) => {
          // Add right margin for all but the last column
          const isLastColumn = (index + 1) % numColumns === 0;
          return (
            <TouchableOpacity
              style={[
                styles.bundleCard,
                {
                  width: itemWidth,
                  marginRight: isLastColumn ? 0 : ITEM_SPACING,
                  backgroundColor: isDark ? "#2A2A2A" : "#F1F2F4",
                },
              ]}
              onPress={() => {
                if (accountDetails) {
                  setSelectedPlan(item);
                  setPayModal();
                }
              }}
            >
              <View style={styles.bundleDetails}>
                <Text
                  style={{
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 6,
                    textAlign: "center",
                  }}
                >
                  {item.size}
                </Text>
                <Text
                  style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}
                >
                  {item.duration}
                </Text>
                <Text
                  style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}
                >
                  ₦{item.amount}
                </Text>
              </View>

              {item.addons && (
                <View
                  style={[
                    styles.addonsContainer,
                    { backgroundColor: "#f7a02e32" },
                  ]}
                >
                  <Text
                    style={{ fontSize: 12, color: "#f7a02e" }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.addons}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const Service = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        More Events
      </Text>

      <TouchableOpacity style={styles.serviceRow}>
        <View style={[styles.serviceIcon, { borderColor: colors.muted }]}>
          <Feather name="phone" size={18} color={colors.muted} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600", color: colors.text }}>
            USSD enquiry
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Coming soon</Text>
        </View>

        <Feather name="chevron-right" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1 },
  topBar: {
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: "600" },
  history: { fontSize: 14, fontWeight: "500" },

  rewardBox: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  rewardTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  rewardText: { color: "#EDEBFF", marginTop: 4 },

  numberBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  networkSelector: { flexDirection: "row", alignItems: "center", gap: 6 },
  networkLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { width: 1, height: 24, marginHorizontal: 12 },
  numberInput: { flex: 1, fontSize: 16, fontWeight: "bold" },

  card: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  bundleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  bundleCard: {
    // width: "30%",
    borderRadius: 12,
    // marginBottom: 12,
  },
  bundleDetails: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
  },
  addonsContainer: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  payBtn: {
    borderRadius: 999,
    paddingVertical: 12,
  },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  networkModal: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  networkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
});
