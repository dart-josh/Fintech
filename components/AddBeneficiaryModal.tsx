import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Modal from "react-native-modal";
import { useTheme } from "@/theme/ThemeContext";
import {
  addBeneficiary,
  getUserByPaymentCode,
} from "@/services/wallet.service";
import { useUserStore } from "@/store/user.store";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

interface Beneficiary {
  id: string;
  name: string;
  paymentCode: string;
  nickname: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AddBeneficiaryModal: React.FC<Props> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [paymentCode, setPaymentCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addError, setAddError] = useState("");

  const cardBg = isDark ? "#1E1E1E" : "#fff";
  const textColor = isDark ? "#fff" : "#111";

  const fetchUserByCode = async (code?: string) => {
    const fullCode = code ?? `AGP-${paymentCode}`;
    if (!fullCode.trim()) return;

    setLoading(true);
    setError("");
    setVerifiedName(null);

    const name: string | null = await getUserByPaymentCode({
      payment_code: fullCode,
    });

    if (name) setVerifiedName(name);
    else setError("Payment code not found");

    setAddError("");
    setNickname("");
    setLoading(false);
  };

  const handleAdd = async () => {
    const { user, setBeneficiaries, beneficiaries } = useUserStore.getState();
    if (!verifiedName) return;

    if (!nickname.trim()) {
      setNickname(verifiedName.split(' ')[0]);
    }

    const newB: Beneficiary | null | string = await addBeneficiary({
      payment_code: `AGP-${paymentCode}`,
      nickname: !nickname.trim() ? verifiedName.split(' ')[0] : nickname.trim(),
      user_id: user?.id ?? "",
    });

    if (!newB) return;
    if (typeof newB === "string") {
      setAddError(newB);
      return;
    }

    setAddError("");
    setBeneficiaries([...beneficiaries, newB]);

    // reset
    setPaymentCode("");
    setNickname("");
    setVerifiedName(null);
    onClose();
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    let clean = text.startsWith("AGP-") ? text.slice(4) : text;
    setPaymentCode(clean);
    fetchUserByCode(text); // auto-fetch
  };

  return (
    <>
      <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        style={styles.modal}
        backdropOpacity={0.5}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: cardBg }]}>
              <Text style={[styles.title, { color: textColor }]}>Add Beneficiary</Text>

              {/* Payment Code Input Row */}
              <Text style={[styles.label, { color: "#888" }]}>Payment Code</Text>
              <View style={styles.inputRow}>
                <View
                  style={[
                    styles.prefix,
                    { backgroundColor: isDark ? "#2C2C2C" : "#F5F5F5" },
                  ]}
                >
                  <Text style={{ color: "#007AFF", fontWeight: "700" }}>AGP-</Text>
                </View>
                <TextInput
                  value={paymentCode}
                  onChangeText={setPaymentCode}
                  placeholder="Enter payment code"
                  placeholderTextColor="#999"
                  style={[
                    styles.input,
                    { color: textColor, backgroundColor: isDark ? "#2C2C2C" : "#F5F5F5" },
                  ]}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={handlePaste} style={styles.iconButton}>
                  <Feather name="clipboard" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>

              {/* Fetch button below input */}
              <TouchableOpacity onPress={() => fetchUserByCode()} style={styles.fetchButton}>
                <Text style={styles.fetchButtonText}>Search</Text>
              </TouchableOpacity>

              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={{ marginLeft: 8, color: "#888" }}>Verifying...</Text>
                </View>
              )}

              {verifiedName && (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.label, { color: "#888" }]}>Name</Text>
                  <Text style={[styles.verifiedName, { color: textColor }]}>
                    {verifiedName}
                  </Text>

                  <Text style={[styles.label, { color: "#888", marginTop: 12 }]}>
                    Nickname
                  </Text>
                  <TextInput
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="Enter nickname"
                    placeholderTextColor="#999"
                    style={[
                      styles.input2,
                      { color: textColor, backgroundColor: isDark ? "#2C2C2C" : "#F5F5F5" },
                    ]}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />

                  <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add Beneficiary</Text>
                  </TouchableOpacity>
                </View>
              )}

              {(error || addError) && (
                <Text style={styles.error}>{error || addError}</Text>
              )}

              <View style={{ paddingBottom: 20 }} />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: { margin: 0, justifyContent: "center" },
  container: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  label: { fontSize: 14, marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  prefix: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  input2: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  iconButton: {
    marginLeft: 8,
    padding: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  fetchButton: {
    marginTop: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  fetchButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  loadingRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  verifiedName: { fontSize: 16, fontWeight: "600", paddingVertical: 6 },
  addButton: {
    marginTop: 16,
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: "red", marginTop: 12, textAlign: "center" },
});
