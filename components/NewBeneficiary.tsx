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
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/theme/ThemeContext";
import {
  getUserByPaymentCode,
} from "@/services/wallet.service";
import QRCodeScannerModal from "@/components/QRCodeScannerModal";

interface Props {
  onSelectRecipient: (recipient: {
    name: string;
    paymentCode: string;
  }) => void;
}

export const NewBeneficiaryModal = ({ onSelectRecipient }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [paymentCode, setPaymentCode] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addError, setAddError] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);

  const cardBg = isDark ? "#1E1E1E" : "#fff";
  const textColor = isDark ? "#fff" : "#111";
  const inputBg = isDark ? "#2C2C2C" : "#F5F5F5";

  const fetchUserByCode = async (code?: string) => {
    const fullCode = code ?? `AGP-${paymentCode}`;
    if (!fullCode.trim()) return;

    setLoading(true);
    setError("");
    setVerifiedName(null);

    const name = await getUserByPaymentCode({
      payment_code: fullCode,
    });

    if (name) setVerifiedName(name);
    else setError("Payment code not found");

    setAddError("");
    setLoading(false);
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    const clean = text.startsWith("AGP-") ? text.slice(4) : text;
    setPaymentCode(clean);
    fetchUserByCode(text);
  };

  const handleQRCodeScanned = (text: string) => {
    const clean = text.startsWith("AGP-") ? text.slice(4) : text;
    setPaymentCode(clean);
    fetchUserByCode(text);
    setShowQRModal(false);
  };

  const clearRecipient = () => {
    setPaymentCode("");
    setVerifiedName(null);
    setError("");
    setAddError("");
  };

  const handleSelectRecipient = () => {
    if (!verifiedName) return;

    onSelectRecipient({
      name: verifiedName,
      paymentCode: `AGP-${paymentCode}`,
    });
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.container, { backgroundColor: cardBg }]}>
            <Text style={[styles.title, { color: textColor }]}>
              Recipient
            </Text>

            {/* Payment Code */}
            <Text style={[styles.label, { color: "#888" }]}>
              Payment Code
            </Text>

            <View style={styles.inputRow}>
              <View style={[styles.prefix, { backgroundColor: inputBg }]}>
                <Text style={styles.prefixText}>AGP-</Text>
              </View>

              <TextInput
                value={paymentCode}
                onChangeText={setPaymentCode}
                placeholder="Enter payment code"
                placeholderTextColor="#999"
                style={[
                  styles.input,
                  { color: textColor, backgroundColor: inputBg },
                ]}
              />

              <TouchableOpacity
                onPress={handlePaste}
                style={styles.iconButton}
              >
                <Feather name="clipboard" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Verified Name */}
            {verifiedName && (
              <View style={styles.verifiedRow}>
                <View>
                  <Text style={[styles.label, { color: "#888" }]}>
                    Recipient Name
                  </Text>
                  <Text
                    style={[
                      styles.verifiedName,
                      { color: textColor },
                    ]}
                  >
                    {verifiedName}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={clearRecipient}
                  style={styles.clearButton}
                >
                  <Feather name="x" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={
                  verifiedName
                    ? handleSelectRecipient
                    : () => fetchUserByCode()
                }
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {verifiedName ? "Select Recipient" : "Search"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowQRModal(true)}
                style={styles.iconButton}
              >
                <Feather name="maximize" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Verifying...</Text>
              </View>
            )}

            {(error || addError) && (
              <Text style={styles.errorText}>
                {error || addError}
              </Text>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* QR Scanner */}
      {showQRModal && (
        <QRCodeScannerModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          onScan={handleQRCodeScanned}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  prefix: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  prefixText: {
    color: "#007AFF",
    fontWeight: "700",
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  iconButton: {
    marginLeft: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  verifiedRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifiedName: {
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    padding: 6,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 8,
    color: "#888",
  },
  errorText: {
    color: "red",
    marginTop: 12,
    textAlign: "center",
  },
});
