// src/components/LoadingOverlay.tsx
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useUIStore } from "@/store/ui.store";
import { useTheme } from "@/theme/ThemeContext";

export default function LoadingOverlay() {
  const { loading, loadingText } = useUIStore();
  const { colors } = useTheme();

  if (!loading) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background + "CC" }]}>
      <ActivityIndicator size="large" color={colors.accent} />
      {loadingText && (
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {loadingText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
  },
});
