// components/ConfirmModal.tsx
import { useConfirmStore } from "@/store/confirmation.store";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ConfirmModal() {
  const { visible, options, handleClose } = useConfirmStore();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  if (!options) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? "#111827" : "#ffffff" },
          ]}
        >
          {/* Icon */}
          {options.icon && (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isDark ? "#1f2937" : "#f1f5f9" },
              ]}
            >
              {options.icon}
            </View>
          )}

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: isDark ? "#ffffff" : "#0f172a" },
            ]}
          >
            {options.title}
          </Text>

          {/* Subtitle */}
          {options.subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#94a3b8" : "#475569" },
              ]}
            >
              {options.subtitle}
            </Text>
          )}

          {/* Main Message */}
          {options.message && (
            <Text
              style={[
                styles.message,
                { color: isDark ? "#cbd5e1" : "#334155" },
              ]}
            >
              {options.message}
            </Text>
          )}

          {/* Warning Box */}
          {options.warning && (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: isDark ? "#3f1d1d" : "#fee2e2",
                },
              ]}
            >
              <MaterialIcons
                name="warning-amber"
                size={18}
                color={isDark ? "#fca5a5" : "#dc2626"}
              />
              <Text
                style={[
                  styles.warningText,
                  { color: isDark ? "#fca5a5" : "#b91c1c" },
                ]}
              >
                {options.warning}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: isDark ? "#1f2937" : "#f1f5f9",
                },
              ]}
              onPress={() => handleClose(false)}
            >
              <Text
                style={{
                  color: isDark ? "#e2e8f0" : "#1e293b",
                  fontWeight: "600",
                }}
              >
                {options.cancelText || "Cancel"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: options.danger
                    ? "#dc2626"
                    : "#2563eb",
                },
              ]}
              onPress={() => handleClose(true)}
            >
              <Text style={styles.confirmText}>
                {options.confirmText || "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
  },
  iconContainer: {
    alignSelf: "center",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
  },
  warningText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 5,
  },
  confirmText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

