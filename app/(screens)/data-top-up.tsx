import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  airtel_bundles,
  glo_bundles,
  mtn_bundles,
  NETWORKS,
  tmobile_bundles,
} from "@/utils/globalVariables";
import NetworkSelector from "@/components/NetworkSelector";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PaymentModal from "@/components/PaymentModal";
import { formatNumberSpace } from "@/hooks/format.hook";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { useWalletStore } from "@/store/wallet.store";
import { useToastStore } from "@/store/toast.store";
import { verifyTxPin } from "@/services/auth.service";
import { fetchUser } from "@/services/user.service";
import { lookUpNumber, purchaseData } from "@/services/wallet.service";
import PinModal from "@/components/PinModal";
import { Image } from "react-native";
import ContactPickerModal from "@/components/ContactPickerModal";

export default function DataTopUp() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const { user } = useUserStore.getState();

  const myPhone = user?.phone ? `0${user?.phone}` : "";

  const [network, setNetwork] = useState(NETWORKS[0]);
  const [networkModal, setNetworkModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Bundle | null>(null);
  const [number, setNumber] = useState(myPhone);

  const [payModal, setPayModal] = useState(false);

  const [contactModalVisible, setContactModalVisible] = useState(false);

  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  const { wallet } = useWalletStore();
  const userBalance = wallet?.balance ?? "";

  const toast = useToastStore.getState();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getNetwork = async () => {
      const _network = await lookUpNumber({ phone: number });
      if (_network) {
        const net = NETWORKS.find((n) => n.key === _network);
        if (net) setNetwork(net);
      }
    };

    if (number.length === 11) getNetwork();
  }, [number]);

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
        network: network.key,
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

        <Text style={[styles.title, { color: colors.text }]}>Mobile Data</Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/history",
              params: { type: "data" },
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
        {/* ================= EVENT / REWARD ================= */}
        <LinearGradient
          colors={["#6D5FFD", "#8E7CFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rewardBox}
        >
          <Text style={styles.rewardTitle}>Instant Mobile Data Rewards 🎉</Text>
          <Text style={styles.rewardText}>
            Get bonus airtime when you top up Mobile Data of ₦1,000 and above.
          </Text>
        </LinearGradient>

        {/* ================= NUMBER SELECTOR ================= */}
        <View style={[styles.numberBox, { backgroundColor: colors.card }]}>
          {/* Network selector */}
          <TouchableOpacity
            style={styles.networkSelector}
            onPress={() => setNetworkModal(true)}
          >
            <View style={styles.networkLogo}>
              <Image
                source={network.image}
                style={styles.networkLogo}
                resizeMode="contain"
              />
            </View>
            <Feather name="chevron-down" size={18} color={colors.text} />
          </TouchableOpacity>

          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#333" : "#EEE" },
            ]}
          />

          {/* Phone input */}
          <TextInput
            value={formatNumberSpace(number)}
            onChangeText={(t) => setNumber(t.replace(/[^0-9]/g, ""))}
            placeholder="Phone number"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            maxLength={13}
            style={[styles.numberInput, { color: colors.text }]}
          />

          {/* Contacts */}
          <TouchableOpacity onPress={() => setContactModalVisible(true)}>
            <Feather name="user" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ================= AMOUNT SELECTOR ================= */}
        <AmountSelector
          isDark={isDark}
          setSelectedPlan={setSelectedPlan}
          number={number}
          network={network.key}
          setPayModal={() => setPayModal(true)}
        />

        {/* ================= SERVICE ================= */}
        <Service />
      </KeyboardAwareScrollView>

      <ContactPickerModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSelect={(selectedPhone) => {
          setNumber(selectedPhone);
        }}
      />

      {/* ================= NETWORK MODAL ================= */}
      <NetworkSelector
        networkModal={networkModal}
        setNetworkModal={setNetworkModal}
        network={network}
        setNetwork={setNetwork}
      />

      {/* ================= PAYMENT MODAL ================= */}
      <PaymentModal
        visible={payModal}
        onClose={() => setPayModal(false)}
        type="data"
        dataBundle={selectedPlan?.title}
        amount={Number(selectedPlan?.amount)}
        networkLogo={network.image}
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
  number: string;
  network: string;
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
  number,
  network,
  setSelectedPlan,
  setPayModal,
}: AmountSelectorProps) => {
  const { colors } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("HOT");

  const filteredBundles = getBundles(network).filter(
    (b) => b.category === selectedCategory,
  );

  const numColumns = 3;
  const ITEM_SPACING = 8;
  const screenWidth = Dimensions.get("window").width;

  // Calculate item width taking spacing into account
  const itemWidth =
    (screenWidth - 64 - ITEM_SPACING * (numColumns - 1)) / numColumns;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Data Plans</Text>

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
                if (number.length === 11) {
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
        Mobile Data Service
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
    height: 60,
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
