import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Vibration,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NETWORKS } from "@/utils/globalVariables";
import NetworkSelector from "@/components/NetworkSelector";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import PaymentModal from "@/components/PaymentModal";
import { formatNumberSpace } from "@/hooks/format.hook";
import { useRouter } from "expo-router";
import PinModal from "@/components/PinModal";
import { verifyTxPin } from "@/services/auth.service";
import { fetchUser } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";
import { useToastStore } from "@/store/toast.store";
import { lookUpNumber, purchaseAirtime } from "@/services/wallet.service";
import { useWalletStore } from "@/store/wallet.store";

export default function AirtimeTopUp() {
  const router = useRouter();
  const { theme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const { user } = useUserStore.getState();

  const myPhone = user?.phone ? `0${user?.phone}` : "";

  const [network, setNetwork] = useState(NETWORKS[0]);
  const [networkModal, setNetworkModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [number, setNumber] = useState(myPhone);

  const [payModal, setPayModal] = useState(false);

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
      const res = await purchaseAirtime({
        userId: user?.id ?? "",
        amount: Number(amount),
        phone: number,
        network: network.key,
      });

      setIsLoading(false);
      setPinVisible(false);
      setPinError("");

      if (!res) {
        router.push({
          pathname: "/top-up-status",
          params: {
            phone: number,
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

        <Text style={[styles.title, { color: colors.text }]}>Airtime</Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/history",
              params: { type: "airtime" },
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
          <Text style={styles.rewardTitle}>Instant Airtime Rewards 🎉</Text>
          <Text style={styles.rewardText}>
            Get bonus airtime when you top up ₦1,000 and above.
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
          <TouchableOpacity>
            <Feather name="user" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ================= AMOUNT SELECTOR ================= */}
        <AmountSelector
          isDark={isDark}
          setAmount={setAmount}
          amount={amount}
          number={number}
          setPayModal={() => setPayModal(true)}
        />

        {/* ================= SERVICE ================= */}
        <Service />
      </KeyboardAwareScrollView>

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
        type="airtime"
        amount={Number(amount)}
        networkLogo={network.image}
        recipient={number}
        userBalance={userBalance}
        onPay={handleConfirmPayment}
      />

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

const AmountSelector = ({
  isDark,
  setAmount,
  amount,
  number,
  setPayModal,
}: {
  isDark: boolean;
  setAmount: any;
  amount: string;
  number: string;
  setPayModal: () => void;
}) => {
  const { colors } = useTheme();
  const canPay = number.length === 11 && Number(amount) !== 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Top up</Text>

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
                setPayModal();
              }
            }}
          >
            <Text style={{ fontWeight: "700", color: colors.text }}>
              ₦{amt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.customAmountRow}>
        <View style={styles.nairaWrap}>
          <Text
            style={{
              fontWeight: "700",
              color: colors.text,
              fontSize: 16,
            }}
          >
            ₦
          </Text>
        </View>

        <TextInput
          value={amount}
          onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ""))}
          placeholder="Enter amount"
          keyboardType="number-pad"
          placeholderTextColor={colors.muted}
          style={[
            styles.amountInput,
            {
              color: colors.text,
              borderBottomColor: colors.border,
            },
          ]}
        />

        <TouchableOpacity
          disabled={number.length !== 11}
          style={[
            styles.payBtn,
            { backgroundColor: canPay ? colors.primary : colors.muted },
          ]}
          onPress={() => {
            // open payModal
            if (number.length === 11) {
              setPayModal();
            }
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Service = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        Airtime Service
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

  customAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  nairaWrap: { paddingHorizontal: 4 },
  amountInput: {
    flex: 1,
    borderBottomWidth: 0.5,
    paddingVertical: 6,
  },
  payBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
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
