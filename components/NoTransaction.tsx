import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

type NoTransactionProps = {
  title?: string;
  description?: string;
  icon?: keyof typeof Feather.glyphMap;
  actionLabel?: string;
  onActionPress?: () => void;
};

export default function NoTransaction({
  title = "No transactions yet",
  description = "Your transactions will appear here once you start making payments.",
  icon = "credit-card",
  actionLabel,
  onActionPress,
}: NoTransactionProps) {
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={styles.container}>
      {/* ICON */}
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: `${colors.primary}15` },
        ]}
      >
        <Feather name={icon} size={34} color={colors.primary} />
      </View>

      {/* TITLE */}
      <Text
        style={[
          styles.title,
          { color: isDark ? colors.text : "#111" },
        ]}
      >
        {title}
      </Text>

      {/* DESCRIPTION */}
      <Text
        style={[
          styles.description,
          { color: colors.textMuted },
        ]}
      >
        {description}
      </Text>

      {/* OPTIONAL ACTION */}
      {actionLabel && onActionPress && (
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
          ]}
          activeOpacity={0.85}
          onPress={onActionPress}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },

  button: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
