import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/theme/ThemeContext";
import { useUserStore } from "@/store/user.store";
import { AccountDetails, getDedicatedAccount } from "@/services/wallet.service";
import QRCode from "react-native-qrcode-svg";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const DedicatedAccountModal = ({ visible, onClose }: Props) => {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async () => {
    if (!accountDetails?.account_number) return;
    await Clipboard.setStringAsync(accountDetails?.account_number);
    Alert.alert("Copied", "Account number copied to clipboard");
  };

  const { user } = useUserStore();

  const getAccountDetails = async () => {
    setIsLoading(true);
    const acctDetails = await getDedicatedAccount({
      userId: user?.id ?? "",
    });
    setAccountDetails(acctDetails);
    setIsLoading(false);
  };

  useEffect(() => {
    if (visible) getAccountDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable>
          {(isLoading && <LoadingState isDark={isDark} />) ||
            (!isLoading && !accountDetails && (
              <NoAccount
                isDark={isDark}
                getAccountDetails={getAccountDetails}
              />
            )) || (
              <>
                <QRCodeCard
                  isDark={isDark}
                  colors={colors}
                  accountDetails={accountDetails}
                  handleCopy={handleCopy}
                />
              </>
            )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const QRCodeCard = ({ isDark, colors, accountDetails, handleCopy }: any) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleCopy}>
      <LinearGradient
        colors={isDark ? ["#1F2937", "#111827"] : ["#EEF2FF", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.accountHint,
                {
                  color: isDark ? colors.textMuted : "#94A3B8",
                  marginBottom: 3,
                },
              ]}
            >
              Personal Bank
            </Text>

            <Text
              style={[styles.bank, { color: isDark ? "#E5E7EB" : "#1F2937" }]}
            >
              {accountDetails?.bank_name}
            </Text>
          </View>

          <View style={styles.copyBadge}>
            <Feather
              name="copy"
              size={14}
              color={isDark ? "#9CA3AF" : "#4F46E5"}
            />
          </View>
        </View>

        {/* CArd */}
        <View
          style={[
            styles.qrCard,
            {
              backgroundColor: isDark ? colors.card : "#FFFFFF",
              borderColor: isDark ? "#1F2937" : "#E2E8F0",
            },
          ]}
        >
          {/* QR Wrapper */}
          <View
            style={[
              styles.qrWrapper,
              {
                backgroundColor: isDark ? "#020617" : "#F8FAFC",
                borderColor: isDark ? "#4B5563" : "#CBD5E1",
              },
            ]}
          >
            <QRCode
              value={accountDetails.account_number}
              size={180}
              color={isDark ? "#F8FAFC" : "#020617"}
              backgroundColor={isDark ? "#020617" : "#F8FAFC"}
            />
          </View>

          {/* Account Info */}
          <View style={styles.accountInfo}>
            <Text
              style={[
                styles.accountLabel,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              Account Number
            </Text>

            <Text
              style={[
                styles.accountNumber,
                { color: isDark ? colors.text : "#020617" },
              ]}
            >
              {accountDetails?.account_number}
            </Text>

            {/* Account Name */}
            <Text
              style={[
                styles.accountName,
                { color: isDark ? "#9CA3AF" : "#6B7280" },
              ]}
            >
              {accountDetails?.account_name}
            </Text>

            <Text
              style={[
                styles.tapHint,
                { color: isDark ? "#6B7280" : "#9CA3AF" },
              ]}
            >
              Scan QR or tap card to copy account number to receive money
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const LoadingState = ({ isDark }: any) => {
  return (
    <LinearGradient
      colors={isDark ? ["#1F2937", "#111827"] : ["#EEF2FF", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { justifyContent: "center" }]}
    >
      <View style={{ gap: 12 }}>
        <View
          style={{
            height: 14,
            width: 120,
            borderRadius: 6,
            backgroundColor: isDark ? "#374151" : "#E5E7EB",
          }}
        />

        <View
          style={{
            height: 28,
            width: 180,
            borderRadius: 8,
            backgroundColor: isDark ? "#4B5563" : "#D1D5DB",
          }}
        />

        <View
          style={{
            height: 14,
            width: 160,
            borderRadius: 6,
            backgroundColor: isDark ? "#374151" : "#E5E7EB",
          }}
        />
      </View>
    </LinearGradient>
  );
};

const NoAccount = ({ isDark, getAccountDetails }: any) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={getAccountDetails}>
      <LinearGradient
        colors={isDark ? ["#111827", "#020617"] : ["#FFFFFF", "#EEF2FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          },
        ]}
      >
        <Feather
          name="credit-card"
          size={28}
          color={isDark ? "#9CA3AF" : "#4F46E5"}
        />

        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: isDark ? "#E5E7EB" : "#111827",
          }}
        >
          No Virtual Account Yet
        </Text>

        <Text
          style={{
            fontSize: 13,
            textAlign: "center",
            color: isDark ? "#9CA3AF" : "#6B7280",
          }}
        >
          Tap to generate your personal bank account
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: 300, // not full width → allows multiple cards later
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  bank: {
    fontSize: 14,
    fontWeight: "600",
  },

  copyBadge: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(99,102,241,0.1)",
  },

  accountNumber: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  accountName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "500",
  },

  tapHint: {
    marginTop: 14,
    fontSize: 12,
    textAlign: "center",
  },

  qrCard: {
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  qrWrapper: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  accountInfo: {
    marginTop: 18,
    alignItems: "center",
  },

  accountLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },

  // accountNumber: {
  //   fontSize: 20,
  //   fontWeight: "700",
  //   letterSpacing: 1.2,
  //   marginBottom: 6,
  // },

  accountHint: {
    fontSize: 12,
    maxWidth: 220,
  },
});
