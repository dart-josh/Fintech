import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

type Props = {
  length?: number;
  onChange?: (value: string) => void;
  onConfirm?: (value: string) => void;
  disabled?: boolean;
};

export default function PinPad({
  length = 6,
  onChange,
  onConfirm,
  disabled = false,
}: Props) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const [value, setValue] = useState("");

  const press = (digit: string) => {
    if (disabled) return;
    if (value.length >= length) return;

    const next = value + digit;
    setValue(next);
    onChange?.(next);

    if (next.length === length) {
      onConfirm?.(next);
    }
  };

  const backspace = () => {
    if (disabled) return;
    if (value.length === length) {
      setValue("");
      onChange?.("");
    } else {
      const next = value.slice(0, -1);
      setValue(next);
      onChange?.(next);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Key
          label="1"
          onPress={() => press("1")}
          colors={colors}
          isDark={isDark}
        />
        <Key
          label="2"
          onPress={() => press("2")}
          colors={colors}
          isDark={isDark}
        />
        <Key
          label="3"
          onPress={() => press("3")}
          colors={colors}
          isDark={isDark}
        />
      </View>

      <View style={styles.row}>
        <Key
          label="4"
          onPress={() => press("4")}
          colors={colors}
          isDark={isDark}
        />
        <Key
          label="5"
          onPress={() => press("5")}
          colors={colors}
          isDark={isDark}
        />
        <Key
          label="6"
          onPress={() => press("6")}
          colors={colors}
          isDark={isDark}
        />
      </View>

      <View style={styles.row}>
        <Key
          label="7"
          onPress={() => press("7")}
          colors={colors}
          isDark={isDark}
        />
        <Key
          label="8"
          onPress={() => press("8")}
          colors={colors}
          isDark={isDark}
        />
        <Key
          label="9"
          onPress={() => press("9")}
          colors={colors}
          isDark={isDark}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.empty} />
        <Key
          label="0"
          onPress={() => press("0")}
          colors={colors}
          isDark={isDark}
        />
        <Key label="⌫" onPress={backspace} colors={colors} isDark={isDark} />
      </View>
    </View>
  );
}

/* ================= KEY ================= */

function Key({
  label,
  onPress,
  colors,
  isDark,
  danger,
}: {
  label: string;
  onPress: () => void;
  colors: any;
  isDark: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.key,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.04)",
        },
      ]}
    >
      <Text
        style={[
          styles.keyText,
          {
            color: danger ? colors.danger : colors.textPrimary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const KEY_SIZE = 60;

const styles = StyleSheet.create({
  container: {
    padding: 12, // 👈 reusable padding
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },

  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2, // 👈 perfectly round
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
  },

  keyText: {
    fontSize: 20,
    fontWeight: "600",
  },

  empty: {
    width: KEY_SIZE,
    height: KEY_SIZE,
  },
});
