import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useUIStore } from "@/store/ui.store";
import { useTheme } from "@/theme/ThemeContext";

export default function LoadingOverlay() {
  const { loading, loadingText } = useUIStore();
  const { colors } = useTheme();

  if (!loading) return null;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.overlay,
          { backgroundColor: colors.background + "CC" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        {loadingText && (
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {loadingText}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // highest possible
    elevation: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
  },
});
