import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  Vibration,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useTheme } from "@/theme/ThemeContext";
import PinModal from "@/components/PinModal";
import { useUserStore } from "@/store/user.store";
import { useToastStore } from "@/store/toast.store";
import { SelectUserModal } from "@/components/SelectUserModal";
import QRCodeScannerModal from "@/components/QRCodeScannerModal";
import { fetchUserByDetails } from "@/services/user.service";
import { createEscrow, getEscrow } from "@/services/escrow.service";
import { verifyTxPin } from "@/services/auth.service";
import { useEscrowStore } from "@/store/escrow.store";

export default function EscrowScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToastStore.getState();
  const { user } = useUserStore.getState();

  const [amount, setAmount] = useState("");
  const [payee, setPayee] = useState<{
    id: string;
    full_name: string;
    username: string;
  } | null>(null);

  const [payer, setPayer] = useState<{
    id: string;
    full_name: string;
    username: string;
  } | null>({
    id: user?.id ?? "",
    full_name: user?.fullname ?? "",
    username: user?.username ?? "",
  });

  const [otherUser, setOtherUser] = useState<{
    id: string;
    full_name: string;
    username: string;
  } | null>(null);

  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const [loading, setLoading] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState("");
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [userError, setUserError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [showQRModal, setShowQRModal] = useState(false);

  const canCreate = Number(amount) >= 100 && payee !== null && payer !== null;

  // Detect keyboard open/close
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        payerId: payer?.id ?? "",
        payeeId: payee?.id ?? "",
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

  const handleSelectPayee = (userData: {
    id: string;
    full_name: string;
    username: string;
  }) => {
    setOtherUser(userData);
    setPayee(userData);
    setUserError("");
    setUserModalVisible(false);
  };

  const handleQRCodeScanned = async (text: string) => {
    setShowQRModal(false);

    try {
      const fetchedUser = await fetchUserByDetails({ userDetail: text });
      if (fetchedUser) {
        if (user?.id === fetchedUser.id) {
          setUserError("You cannot select yourself");
          return;
        }

        handleSelectPayee(fetchedUser);
      } else {
        setUserError("User not found");
      }
    } catch (e) {
      setUserError("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const handleSwapUsers = () => {
    if (!payee) return;
    if (!payer) return;
    const temp_payee = { ...payee };
    const temp_payer = { ...payer };
    setPayee(temp_payer);
    setPayer(temp_payee);
  };

  const scrollRef = useRef(null);

  function showAndroidDateTimePicker(
    currentDate: Date,
    onChange: (date: Date) => void,
  ) {
    // Step 1: Open Date Picker
    DateTimePickerAndroid.open({
      value: currentDate,
      mode: "date",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type !== "set" || !selectedDate) return;

        // Keep selected date
        const pickedDate = selectedDate;

        // Step 2: Open Time Picker after date is selected
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: "time",
          is24Hour: true,
          onChange: (timeEvent, selectedTime) => {
            if (timeEvent.type !== "set" || !selectedTime) {
              onChange(pickedDate);
              return;
            }

            // Merge date + time
            const finalDate = new Date(pickedDate);
            finalDate.setHours(selectedTime.getHours());
            finalDate.setMinutes(selectedTime.getMinutes());
            finalDate.setSeconds(0);

            onChange(finalDate);
          },
        });
      },
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ---------------- HEADER ---------------- */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Create Escrow
        </Text>
      </View>

      {/* ---------------- SCROLLABLE CONTENT ---------------- */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
      >
        {/* ---------------- SUMMARY CARD ---------------- */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Escrow Protection
          </Text>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Funds are locked until conditions are met
          </Text>
          <View style={styles.cardRow}>
            <Feather name="lock" size={16} color={colors.accent} />
            <Text style={[styles.cardRowText, { color: colors.textSecondary }]}>
              Secure • Transparent • Reversible
            </Text>
          </View>
        </View>

        {/* ---------------- AMOUNT INPUT ---------------- */}
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          Escrow Amount
        </Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <Text
            style={[
              styles.currency,
              { marginRight: 3, color: colors.textSecondary },
            ]}
          >
            ₦
          </Text>
          <TextInput
            value={amount && Number(amount).toLocaleString("en-US")}
            onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            placeholder="1,000"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.textPrimary }]}
          />
        </View>

        {/* ---------------- PAYEE SELECTION ---------------- */}
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          2nd Party
        </Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <TextInput
            value={otherUser?.username ?? ""}
            placeholder="Select user"
            placeholderTextColor={colors.textSecondary}
            editable={false}
            style={[styles.input, { color: colors.textPrimary }]}
          />
          <TouchableOpacity
            onPress={() => setUserModalVisible(true)}
            style={styles.iconButton}
          >
            <Feather name="user" size={20} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowQRModal(true)}
            style={styles.iconButton}
          >
            <Feather name="camera" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>
        {userError ? <Text style={styles.errorText}>{userError}</Text> : null}

        {/* ---------------- PAYER & PAYEE ---------------- */}
        <Text
          style={[
            styles.label,
            { color: colors.textPrimary, marginBottom: 12 },
          ]}
        >
          Assign Parties
        </Text>

        <View style={styles.partyRow}>
          {/* Buyer / Payer */}
          <View style={[styles.partyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.partyLabel, { color: colors.textSecondary }]}>
              Buyer
            </Text>
            <Text style={[styles.partyName, { color: colors.textPrimary }]}>
              {payer?.full_name ?? "Select user"}
            </Text>
            {payer?.id === user?.id && (
              <View style={styles.youIndicator}>
                <Text style={styles.youText}>You</Text>
              </View>
            )}
          </View>

          {/* Swap Button */}
          <TouchableOpacity onPress={handleSwapUsers} style={styles.swapButton}>
            <MaterialIcons name="swap-horiz" size={32} color={colors.accent} />
          </TouchableOpacity>

          {/* Seller / Payee */}
          <View style={[styles.partyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.partyLabel, { color: colors.textSecondary }]}>
              Seller
            </Text>
            <Text style={[styles.partyName, { color: colors.textPrimary }]}>
              {payee?.full_name ?? "Select user"}
            </Text>
            {payee?.id === user?.id && (
              <View style={styles.youIndicator}>
                <Text style={styles.youText}>You</Text>
              </View>
            )}
          </View>
        </View>

        {/* ---------------- DESCRIPTION ---------------- */}
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          Description (optional)
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What is this escrow for?"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          onFocus={() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }}
          style={[
            styles.textArea,
            {
              backgroundColor: colors.card,
              color: colors.textPrimary,
              height: 120,
            },
          ]}
        />

        {/* ---------------- EXPIRY ---------------- */}
        <Text
          style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}
        >
          Expiry Date & Time
        </Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === "android") {
                showAndroidDateTimePicker(
                  expiresAt || new Date(),
                  setExpiresAt,
                );
              } else {
                setShowDatePicker(true); // iOS still uses inline picker
              }
            }}
            style={{ flex: 1 }}
          >
            <Text
              style={{
                color: expiresAt ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {expiresAt ? expiresAt.toLocaleString() : "Select date & time"}
            </Text>
          </TouchableOpacity>

          {expiresAt && (
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(false);
                setExpiresAt(null);
              }}
              style={styles.iconButton}
            >
              <Feather name="x" size={20} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={expiresAt || new Date()}
            mode="datetime"
            display="default"
            onChange={(e: any, date?: Date) => {
              if (date) setExpiresAt(date);
            }}
          />
        )}
      </KeyboardAwareScrollView>

      {/* ---------------- CTA BUTTON ---------------- */}
      {!keyboardVisible && (
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 10,
            left: 16,
            right: 16,
          }}
        >
          <TouchableOpacity
            disabled={!canCreate || loading}
            onPress={handleCreateEscrow}
            style={[
              styles.ctaButton,
              { backgroundColor: canCreate ? colors.accent : colors.muted },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.ctaText}>Create Escrow</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ---------------- PIN MODAL ---------------- */}
      <PinModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onComplete={handlePinComplete}
        error={pinError}
        isLoading={loading}
      />

      {/* ---------------- SELECT USER MODAL ---------------- */}
      <SelectUserModal
        visible={userModalVisible}
        onSelectUser={handleSelectPayee}
        onClose={() => setUserModalVisible(false)}
      />

      {/* QR Scanner */}
      {showQRModal && (
        <QRCodeScannerModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          onScan={handleQRCodeScanned}
        />
      )}
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
  cardSubtitle: { fontSize: 12 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginTop: 6 },
  cardRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardRowText: { fontSize: 13 },
  label: { fontWeight: "600", marginBottom: 4 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginTop: 8,
    marginBottom: 16,
  },
  currency: { fontWeight: "700", fontSize: 18 },
  input: { flex: 1, fontSize: 16 },

  partyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  partyCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.3)", // neon border
    shadowColor: "#00E5FF",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.05)", // glass effect
  },

  partyLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  partyName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  youIndicator: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "rgba(0,229,255,0.15)", // subtle neon tag
  },

  youText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00E5FF",
  },

  swapButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,229,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#00E5FF",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  iconButton: { marginLeft: 10, padding: 10 },
  errorText: { color: "#FF4D4D", marginBottom: 12 },
  textArea: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    height: 80,
    marginTop: 8,
  },
  dateInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
    marginTop: 8,
  },
  ctaButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
