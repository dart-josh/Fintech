import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { createEscrow, getEscrow } from "@/services/escrow.service";
import { useToastStore } from "@/store/toast.store";
import PinModal from "@/components/PinModal";
import { verifyTxPin } from "@/services/auth.service";
import { useEscrowStore } from "@/store/escrow.store";
import { useUserStore } from "@/store/user.store";

export default function ConfirmEscrowScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToastStore();
    const { user } = useUserStore.getState();

  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState("");

  const {
    payer_id,
    payee_id,
    payer_full_name,
    payer_username,
    payee_full_name,
    payee_username,
    amount,
    description,
    expiresAt,
  } = useLocalSearchParams<{
    payer_id: string;
    payee_id: string;
    payer_full_name: string;
    payer_username: string;
    payee_full_name: string;
    payee_username: string;
    amount: string;
    description: string;
    expiresAt: string;
  }>();

  const [loading, setLoading] = useState(false);

  const handleCreateEscrow = () => {
    if (!user?.transaction_pin) {
      toast.show({ type: "warning", message: "Transaction PIN not set" });
      router.push("/set-pin-intro");
      return;
    }
    setPinVisible(true);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const valid = await verifyTxPin({ userId: user?.id ?? "", pin });
    return valid;
  };

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    setPinError("");

    try {
      // 🔐 Verify pin
      const pinValid = await verifyPin(pin);

      if (!pinValid) {
        setLoading(false);
        setPinError("Invalid PIN");
        Vibration.vibrate(200);
        return;
      }

      setPinVisible(false);
      if (loading) return;
      setLoading(true);

      // 📦 Create escrow API
      const escrow = await createEscrow({
        payerId: payer_id ?? "",
        payeeId: payee_id ?? "",
        amount,
        description,
        expiresAt: expiresAt?.toString() ?? "",
      });

      if (!escrow) {
        return;
      }

      const newEscrow = await getEscrow({ escrowRef: escrow });
      if (newEscrow) useEscrowStore.getState().addEscrow(newEscrow);

      toast.show({ type: "success", message: "Escrow created successfully" });
      router.back();
      router.back();
      router.push({
        pathname: "/escrow-detail-screen",
        params: {
          escrowRef: escrow,
        },
      });
    } catch (e) {
      setPinError("Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ---------------- HEADER ---------------- */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Confirm Escrow
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
        }}
      >
        {/* ---------------- SUMMARY CARD ---------------- */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Verify Escrow Details
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Review all the information before creating the escrow
          </Text>
        </View>

        {/* ---------------- DETAILS ---------------- */}
        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Amount
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            ₦{Number(amount).toLocaleString()}
          </Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Buyer
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {payer_full_name} ({payer_username})
          </Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Seller
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {payee_full_name} ({payee_username})
          </Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Description
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {description || "No description provided"}
          </Text>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            Expiry
          </Text>
          <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
            {expiresAt ? new Date(expiresAt).toLocaleString() : "No expiry set"}
          </Text>
        </View>
      </ScrollView>

      {/* ---------------- CTA BUTTON ---------------- */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 16,
          right: 16,
        }}
      >
        <TouchableOpacity
          disabled={loading}
          onPress={handleCreateEscrow}
          style={[styles.ctaButton, { backgroundColor: colors.accent }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.ctaText}>Create Escrow</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ---------------- PIN MODAL ---------------- */}
      <PinModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onComplete={handlePinComplete}
        error={pinError}
        isLoading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: { marginLeft: 12, fontSize: 18, fontWeight: "700" },
  card: { borderRadius: 18, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  cardSubtitle: { fontSize: 12 },

  detailCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.2)",
    shadowColor: "#00E5FF",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    backgroundColor: "rgba(255,255,255,0.05)", // futuristic glass
  },
  detailLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: "700" },

  ctaButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00E5FF",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
