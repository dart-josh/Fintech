import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Dimensions,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "@/theme/ThemeContext";
import { useUserStore } from "@/store/user.store";
import {
  lookUpNumber,
  purchaseAirtime,
  purchaseData,
} from "@/services/wallet.service";
import {
  airtel_bundles,
  glo_bundles,
  mtn_bundles,
  NETWORKS,
  tmobile_bundles,
} from "@/utils/globalVariables";
import ProviderBottomSheet, { Provider } from "@/components/ProviderSelector";
import { useConfirmPinHook } from "@/hooks/pinVerification.hook";
import PackageBottomSheet, { Package } from "@/components/PackageSelector";
import ContactPickerModal from "@/components/ContactPickerModal";
import { useToastStore } from "@/store/toast.store";
import MobileTopUpConfirmation from "@/components/modals/MobileTopUpConfirmation";
import { useWalletStore } from "@/store/wallet.store";

const getPlan = (network: string) => {
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
      return [];
  }
};

export default function MobileTopUpPage() {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToastStore();

  const { mode: initialMode } = useLocalSearchParams<{
    mode: "airtime" | "data";
  }>();

  const [mode, setMode] = useState<"airtime" | "data">(
    initialMode ?? "airtime",
  );
  const { user } = useUserStore.getState();
  const { wallet } = useWalletStore();
  const userBalance = wallet?.balance ?? "";

  const myPhone = user?.phone ? `0${user?.phone}` : "";

  const [phone, setPhone] = useState(myPhone);
  const [amount, setAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<Provider | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Package | null>(null);

  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [contactModalVisible, setContactModalVisible] = useState(false);

  useEffect(() => {
    const getNetwork = async () => {
      const _network = await lookUpNumber({ phone: phone });
      if (_network) {
        const net = NETWORKS.find((n) => n.key === _network);
        if (net) setSelectedNetwork(net);
      }
    };

    if (phone.length === 11) getNetwork();
  }, [phone]);

  const canProceed =
    phone.length === 11 &&
    selectedNetwork &&
    (mode === "airtime" ? Number(amount) >= 100 : selectedPlan);

  const handleProceed = () => {
    setShowConfirmModal(true);
  };

  const handlePay = () => {
    const { confirmPin } = useConfirmPinHook.getState();

    setShowConfirmModal(false);
    confirmPin(async () => {
      if (mode === "airtime") {
        const res = await purchaseAirtime({
          userId: user?.id ?? "",
          amount: Number(amount),
          phone: phone,
          network: selectedNetwork?.key ?? "",
        });

        if (!res) {
          router.push({
            pathname: "/top-up-status",
            params: {
              phone: phone,
              amount: amount,
              reference: "",
              date: Date().toString(),
              status: "failed",
              method: "Airtime Top-Up",
              // plan: params.plan ?? "",
            },
          });
          return;
        }

        router.push({
          pathname: "/top-up-status",
          params: { ...res },
        });
      } else if (mode === "data") {
        const res = await purchaseData({
          userId: user?.id ?? "",
          amount: Number(selectedPlan?.price) ?? 0,
          phone: phone,
          network: selectedNetwork?.key ?? "",
          plan: selectedPlan?.name ?? "",
        });

        if (!res) {
          router.push({
            pathname: "/top-up-status",
            params: {
              phone: phone,
              amount: selectedPlan?.price ?? 0,
              reference: "",
              date: Date().toString(),
              status: "failed",
              method: "Data Top-Up",
              plan: selectedPlan?.name ?? "",
            },
          });
          return;
        }

        router.push({
          pathname: "/top-up-status",
          params: { ...res },
        });
      } else {
        toast.show({ message: "No valid operation", type: "error" });
      }
    });
  };

  const plans = getPlan(selectedNetwork?.key ?? "");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Mobile Top Up
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Top up your airtime and data with ease
        </Text>

        {/* Mode Selector */}
        <View
          style={[
            styles.modeContainer,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          {["airtime", "data"].map((item) => {
            const active = mode === item;
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor: active ? colors.accent : "transparent",
                  },
                ]}
                onPress={() => setMode(item as any)}
              >
                <Text
                  style={{
                    color: active ? "#FFF" : colors.textPrimary,
                    fontWeight: "700",
                  }}
                >
                  {item === "airtime" ? "Airtime" : "Data"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 20 }]}
        >
          Enter number to top up
        </Text>

        {/* Phone Input */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Network Selector */}
          <TouchableOpacity
            style={styles.networkSelector}
            onPress={() => setShowNetworkModal(true)}
          >
            <View style={styles.networkImageWrap}>
              <Image
                source={selectedNetwork?.image}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Feather
              name="chevron-down"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <View
            style={[styles.verticalDivider, { backgroundColor: colors.border }]}
          />

          {/* Number Input */}
          <TextInput
            placeholder="081xxxxxxxx"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={phone}
            onChangeText={setPhone}
            style={[styles.textInput, { color: colors.textPrimary }]}
          />

          <TouchableOpacity
            style={{ padding: 6 }}
            onPress={() => setContactModalVisible(true)}
          >
            <Feather name="user" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {myPhone !== phone && (
          <TouchableOpacity
            style={{
              marginTop: 8,
              backgroundColor: colors.surface,
              maxWidth: 130,
              borderRadius: 25,
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
            onPress={() => {
              setPhone(myPhone);
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Use my number
            </Text>
          </TouchableOpacity>
        )}

        <Text
          style={[styles.label, { color: colors.textSecondary, marginTop: 30 }]}
        >
          {mode === "airtime" ? "Amount" : "Select Plan"}
        </Text>

        {/* Amount OR Package */}
        {mode === "airtime" ? (
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
              placeholder="Enter amount"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
              style={[styles.textInput, { color: colors.textPrimary }]}
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowPlanModal(true)}
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                paddingVertical: 20,
                justifyContent: "space-between",
              },
            ]}
          >
            <Text
              style={{
                color: selectedPlan ? colors.textPrimary : colors.textSecondary,
                fontWeight: selectedPlan ? "600" : "400",
              }}
            >
              {selectedPlan ? selectedPlan.name : "Select a plan"}
            </Text>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {((phone.length !== 11 || !selectedNetwork) && <></>) ||
          (mode === "airtime" && (
            <AmountSelector
              setAmount={setAmount}
              number={phone}
              handleProceed={handleProceed}
            />
          )) || (
            <DataSelector
              setSelectedPlan={setSelectedPlan}
              number={phone}
              handleProceed={handleProceed}
              bundles={plans.map((p) => ({
                key: p.title,
                name: p.title,
                price: p.amount.toString(),
              }))}
            />
          )}
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

      {/* CONTACT MODAL */}
      <ContactPickerModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSelect={(selectedPhone) => {
          setPhone(selectedPhone);
        }}
      />

      {/* NETWORK MODAL */}
      <ProviderBottomSheet
        visible={showNetworkModal}
        onClose={() => setShowNetworkModal(false)}
        onSelect={(v) => {
          setSelectedNetwork(v);
        }}
        providers={NETWORKS}
        title="Select Network"
        subtitle="Choose your preferred network."
      />

      <PackageBottomSheet
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelect={(v) => {
          setSelectedPlan(v);
        }}
        packages={plans.map((p) => ({
          key: p.title,
          name: p.title,
          price: p.amount.toString(),
        }))}
      />

      <MobileTopUpConfirmation
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        type={mode}
        dataBundle={mode === "data" ? (selectedPlan?.name ?? "") : undefined}
        amount={mode === "data" ? Number(selectedPlan?.price) : Number(amount)}
        networkLogo={selectedNetwork?.image ?? ""}
        recipient={phone}
        userBalance={userBalance}
        onPay={handlePay}
      />
    </View>
  );
}

const AmountSelector = ({
  setAmount,
  number,
  handleProceed,
}: {
  setAmount: any;
  number: string;
  handleProceed: () => void;
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        Quick Top up
      </Text>

      <View style={styles.amountGrid}>
        {[50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].map((amt) => (
          <TouchableOpacity
            key={amt}
            style={[
              styles.amountTile,
              { backgroundColor: isDark ? "#2A2A2A" : "#F1F2F4" },
            ]}
            onPress={() => {
              if (number.length === 11) {
                setAmount(String(amt));
                handleProceed();
              }
            }}
          >
            <Text style={{ fontWeight: "700", color: colors.text }}>
              ₦{amt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const DataSelector = ({
  setSelectedPlan,
  number,
  bundles,
  handleProceed,
}: {
  setSelectedPlan: any;
  number: string;
  bundles: Package[];
  handleProceed: () => void;
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const numColumns = 3;
  const ITEM_SPACING = 8;
  const screenWidth = Dimensions.get("window").width;

  // Calculate item width taking spacing into account
  const itemWidth =
    (screenWidth - 64 - ITEM_SPACING * (numColumns - 1)) / numColumns;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        Popular Data Plans
      </Text>

      {/* ================= BUNDLE CARDS ================= */}
      <FlatList
        data={bundles}
        keyExtractor={(item) => item.key}
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
                  handleProceed();
                }
              }}
            >
              <View style={styles.bundleDetails}>
                <Text
                  style={{
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  {item.name}
                </Text>
                {/* <Text
                  style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}
                >
                  {item.duration}
                </Text> */}
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  ₦{Number(item.price).toLocaleString()}
                </Text>
              </View>

              {/* {item.addons && (
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
              )} */}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
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

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  modeContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 40,
    padding: 6,
    marginTop: 20,
    marginBottom: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: "center",
  },

  label: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "500",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
  },

  networkSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  networkImageWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },

  verticalDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },

  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
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

  card: {
    marginVertical: 20,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 12 },

  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amountTile: {
    width: "30%",
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bundleCard: {
    // width: "30%",
    borderRadius: 12,
    // marginBottom: 12,
  },
  bundleDetails: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
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
});
