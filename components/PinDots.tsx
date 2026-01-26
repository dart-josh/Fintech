import { useTheme } from "@/theme/ThemeContext";
import { StyleSheet, View } from "react-native";

export function PinDots({
  PIN_LENGTH = 6,
  value,
  active,
  error = false,
  colors,
}: {
  PIN_LENGTH: number;
  value: string;
  active: boolean;
  error?: boolean;
  colors: any;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.pinContainer,
        {
          backgroundColor: error
            ? isDark
              ? "rgba(239,68,68,0.12)" // subtle red tint (dark)
              : "rgba(239,68,68,0.08)" // subtle red tint (light)
            : colors.card,
          opacity: active ? 1 : 0.6,
        },
      ]}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => {
        const filled = value.length > i;

        return (
          <View
            key={i}
            style={[
              styles.pinDot,
              {
                backgroundColor: error && filled
                  ? "#EF4444" // error red
                  : filled
                    ? isDark
                      ? "#FFFFFF"
                      : "#000000"
                    : isDark
                      ? "#5758589f"
                      : "#afb3bac3",
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    alignSelf: "flex-start",
  },

  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});
