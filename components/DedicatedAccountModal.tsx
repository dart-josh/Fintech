import React from "react";
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

type Props = {
  visible: boolean;
  onClose: () => void;
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export const DedicatedAccountModal = ({
  visible,
  onClose,
  accountName,
  accountNumber,
  bankName,
}: Props) => {
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(accountNumber);
    Alert.alert("Copied", "Account number copied to clipboard");
  };

  const {user} = useUserStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable>
          <TouchableOpacity activeOpacity={0.9} onPress={handleCopy}>
            <LinearGradient
              colors={
                isDark
                  ? ["#1F2937", "#111827"]
                  : ["#EEF2FF", "#FFFFFF"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text
                  style={[
                    styles.bank,
                    { color: isDark ? "#E5E7EB" : "#1F2937" },
                  ]}
                >
                  {bankName}
                </Text>

                <View style={styles.copyBadge}>
                  <Feather
                    name="copy"
                    size={14}
                    color={isDark ? "#9CA3AF" : "#4F46E5"}
                  />
                </View>
              </View>

              {/* Account Number */}
              <Text
                style={[
                  styles.accountNumber,
                  { color: isDark ? "#FFFFFF" : "#111827" },
                ]}
              >
                {accountNumber}
              </Text>

              {/* Account Name */}
              <Text
                style={[
                  styles.accountName,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                {user?.fullname ?? ""}
              </Text>

              <Text
                style={[
                  styles.tapHint,
                  { color: isDark ? "#6B7280" : "#9CA3AF" },
                ]}
              >
                Tap card to copy
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
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
    fontSize: 14,
    fontWeight: "500",
  },

  tapHint: {
    marginTop: 14,
    fontSize: 12,
    textAlign: "center",
  },
});

