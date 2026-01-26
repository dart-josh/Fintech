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
//   onAdd: (b: Beneficiary) => void;
}

export const AddBeneficiaryModal: React.FC<Props> = ({
  visible,
  onClose,
//   onAdd,
}) => {
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

  const fetchUser = async () => {
    if (!paymentCode.trim()) return;
    setLoading(true);
    setError("");
    setVerifiedName(null);

    const name: string | null = await getUserByPaymentCode({
      payment_code: paymentCode,
    });

    if (name) setVerifiedName(name);
    else setError("Payment code not found");
    setAddError('');
    setNickname('');

    setLoading(false);
  };

  const handleAdd = async () => {
    const { user, setBeneficiaries, beneficiaries } = useUserStore.getState();
    if (!verifiedName || !nickname.trim()) return;

    const newB: Beneficiary | null | string = await addBeneficiary({
      payment_code: paymentCode,
      nickname,
      user_id: user?.id ?? "",
    });

    if (!newB) return;
    if (typeof(newB) === 'string') {
        setAddError(newB);
        return;
    }

    setAddError('');

    // onAdd(newB);
    setBeneficiaries([...beneficiaries, newB]);

    // reset
    setPaymentCode("");
    setNickname("");
    setVerifiedName(null);
    onClose();
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal} backdropOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        // style={styles.flex}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={styles.flex}
        >
          <View style={[styles.container, { backgroundColor: cardBg }]}>
            <Text style={[styles.title, { color: textColor }]}>
              Add Beneficiary
            </Text>

            {/* Payment Code Input */}
            <Text style={[styles.label, { color: "#888" }]}>Payment Code</Text>
            <View style={styles.row}>
              <TextInput
                value={paymentCode}
                onChangeText={setPaymentCode}
                placeholder="Payment code"
                placeholderTextColor="#999"
                returnKeyType="done"
                onSubmitEditing={fetchUser}
                style={[
                  styles.input,
                  {
                    color: textColor,
                    backgroundColor: isDark ? "#2C2C2C" : "#F5F5F5",
                  },
                ]}
              />

              {/* Paste Button */}
              <TouchableOpacity
                onPress={async () => {
                  const text = await Clipboard.getStringAsync(); // get text from clipboard
                  setPaymentCode(text);
                  fetchUser(); // optionally auto-verify after pasting
                }}
                style={[
                  styles.pasteButton,
                  { backgroundColor: isDark ? "#2C2C2C" : "#F5F5F5" },
                ]}
              >
                <Feather name="clipboard" size={20} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={fetchUser} style={styles.fetchButton}>
                <Text style={styles.fetchButtonText}>Fetch</Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={{ marginLeft: 8, color: "#888" }}>
                  Verifying...
                </Text>
              </View>
            )}

            {verifiedName && (
              <View style={{ marginTop: 12 }}>
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
                    {
                      color: textColor,
                      backgroundColor: isDark ? "#2C2C2C" : "#F5F5F5",
                    },
                  ]}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add Beneficiary</Text>
                </TouchableOpacity>
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {addError ? <Text style={styles.error}>{addError}</Text> : null}
            <View style={{ paddingBottom: 20 }} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modal: {
    margin: 0,
    justifyContent: "center",
  },
  container: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  input2: {
    // flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fetchButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  fetchButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  verifiedName: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 6,
  },
  addButton: {
    marginTop: 16,
    backgroundColor: "#007AFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginTop: 12,
    textAlign: "center",
  },
  pasteButton: {
    marginLeft: 8,
    padding: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
});
