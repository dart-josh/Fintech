import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

export default function AmountSelectorSheet({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (value: number) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [value, setValue] = useState("");

  const handlePress = (num: string) => {
    if (value.length < 9) setValue(value + num);
  };

  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.sheet,
          { backgroundColor: isDark ? "#020617" : "#FFFFFF" },
        ]}
      >
        <Text style={[styles.title, { color: isDark ? "#F8FAFC" : "#020617" }]}>
          Enter Amount
        </Text>

        <Text style={[styles.amount, { color: "#2563EB" }]}>
          ₦{value || "0"}
        </Text>

        <View style={styles.keypad}>
          {[1,2,3,4,5,6,7,8,9,"←",0,"✓"].map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => {
                if (key === "←") setValue(value.slice(0, -1));
                else if (key === "✓") onConfirm(Number(value));
                else handlePress(String(key));
              }}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: "#64748B", marginTop: 10 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  amount: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 16,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  key: {
    width: "30%",
    paddingVertical: 18,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
  },
  keyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563EB",
  },
});
