import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingOverlay from "./LoadingOverlay";

type PinModalProps = {
  visible: boolean;
  onClose: () => void;
  onComplete: (pin: string) => void;
  error?: string;
  isLoading: boolean
};

const PIN_LENGTH = 6;

export default function PinModal({
  visible,
  onClose,
  onComplete,
  error,
  isLoading,
}: PinModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [pin, setPin] = useState("");

  const handlePress = (num: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + num;
    setPin(next);

    if (next.length === PIN_LENGTH) {
      onComplete(next);
      setPin("");
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.card, paddingBottom: insets.bottom + 12  }]}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={22} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>
            Enter Transaction PIN
          </Text>

          <Text style={[styles.subtitle, { color: colors.muted }]}>
            To authorize this transfer
          </Text>

          {/* PIN Dots */}
          <View style={styles.pinRow}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  {
                    backgroundColor:
                      i < pin.length ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
          </View>

          {/* Error */}
          {!!error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {["1","2","3","4","5","6","7","8","9","", "0", "del"].map((key) => {
              if (key === "") return <View key="empty" style={styles.key} />;

              if (key === "del") {
                return (
                  <TouchableOpacity
                    key="del"
                    style={styles.key}
                    onPress={handleDelete}
                  >
                    <Feather name="delete" size={20} color={colors.text} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handlePress(key)}
                >
                  <Text style={[styles.keyText, { color: colors.text }]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isLoading && <LoadingOverlay/>}
      </View>
    </Modal>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: 12,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
  subtitle: {
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  pinRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  errorText: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 8,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
  },
  key: {
    width: "33.33%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 22,
    fontWeight: "600",
  },
});
