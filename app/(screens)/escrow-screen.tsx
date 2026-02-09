import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import PinModal from "@/components/PinModal";
import { useUserStore } from "@/store/user.store";
import { useToastStore } from "@/store/toast.store";

export default function EscrowScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToastStore.getState();
  const { user } = useUserStore.getState();

  const [amount, setAmount] = useState("");
  const [payee, setPayee] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState("");

  const canCreate =
    Number(amount) >= 100 && payee.trim().length > 0;

  const handleCreateEscrow = () => {
    if (!user?.transaction_pin) {
      toast.show({ type: "warning", message: "Transaction PIN not set" });
      return;
    }
    setPinVisible(true);
  };

  const handlePinComplete = async (pin: string) => {
    setLoading(true);
    setPinError("");

    try {
      // 🔐 Verify pin (hook into your service)
      // await verifyTxPin(...)

      // 📦 Create escrow API
      // await createEscrow({ payerId, payeeId, amount, expiresAt })

      toast.show({ type: "success", message: "Escrow created successfully" });
      setPinVisible(false);
      router.back();
    } catch (e) {
      setPinError("Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ---------------- HEADER ---------------- */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 0.5,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 12,
            fontSize: 18,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          Create Escrow
        </Text>
      </View>

      {/* ---------------- CONTENT ---------------- */}
      <View style={{ padding: 16 }}>
        {/* Summary Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 18,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Escrow Protection
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              marginTop: 6,
              color: colors.textPrimary,
            }}
          >
            Funds are locked until conditions are met
          </Text>

          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Feather name="lock" size={16} color={colors.accent} />
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Secure • Transparent • Reversible
            </Text>
          </View>
        </View>

        {/* Amount */}
        <Text style={{ fontWeight: "600", color: colors.textPrimary }}>
          Escrow Amount
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
            marginBottom: 16,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 18 }}>₦</Text>
          <TextInput
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            placeholder="1000"
            placeholderTextColor={colors.textSecondary}
            style={{
              flex: 1,
              fontSize: 16,
              marginLeft: 8,
              color: colors.textPrimary,
            }}
          />
        </View>

        {/* Payee */}
        <Text style={{ fontWeight: "600", color: colors.textPrimary }}>
          Payee (User ID / Username)
        </Text>
        <TextInput
          value={payee}
          onChangeText={setPayee}
          placeholder="Enter recipient"
          placeholderTextColor={colors.textSecondary}
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 52,
            marginTop: 8,
            marginBottom: 16,
            color: colors.textPrimary,
          }}
        />

        {/* Description */}
        <Text style={{ fontWeight: "600", color: colors.textPrimary }}>
          Description (optional)
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What is this escrow for?"
          placeholderTextColor={colors.textSecondary}
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            height: 80,
            marginTop: 8,
            color: colors.textPrimary,
          }}
          multiline
        />
      </View>

      {/* ---------------- ACTION BUTTON ---------------- */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 16,
          right: 16,
        }}
      >
        <TouchableOpacity
          disabled={!canCreate || loading}
          onPress={handleCreateEscrow}
          style={{
            height: 56,
            borderRadius: 28,
            backgroundColor: canCreate ? colors.accent : colors.muted,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text
              style={{
                color: colors.background,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Create Escrow
            </Text>
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
    </KeyboardAvoidingView>
  );
}
