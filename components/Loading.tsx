import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { lightColors, darkColors } from "@/theme/colors";

const { width, height } = Dimensions.get("window");

export default function FuturisticLoading({ onFinish }: { onFinish?: () => void }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme === "light" ? lightColors : darkColors;

  // Animated spinner rotation
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    // Optional: Auto-finish after 3 seconds
    if (onFinish) {
      const timer = setTimeout(onFinish, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Neon glowing background lines */}
        <View style={styles.backgroundLines}>
          <Animated.View
            style={[
              styles.line,
              { backgroundColor: colors.accent + "33", top: 50, left: 30, transform: [{ rotate: "25deg" }] },
            ]}
          />
          <Animated.View
            style={[
              styles.line,
              { backgroundColor: colors.accent + "22", top: 150, left: 100, transform: [{ rotate: "-20deg" }] },
            ]}
          />
          <Animated.View
            style={[
              styles.line,
              { backgroundColor: colors.accent + "11", top: 300, left: 50, transform: [{ rotate: "10deg" }] },
            ]}
          />
        </View>

        {/* Neon Spinner */}
        <Animated.View style={[styles.spinner, { borderColor: colors.accent, transform: [{ rotate: spin }] }]} />

        {/* App Name */}
        <Text style={[styles.appName, { color: colors.accent }]}>Arigo Finance</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundLines: {
    position: "absolute",
    width,
    height,
  },
  line: {
    position: "absolute",
    width: 200,
    height: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
  spinner: {
    width: 80,
    height: 80,
    borderWidth: 4,
    borderRadius: 40,
    borderTopColor: "transparent",
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
  },
});
