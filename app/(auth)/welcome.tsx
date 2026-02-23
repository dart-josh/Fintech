import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const slides = [
  {
    image: require("@/assets/images/partial-react-logo.png"), // replace with your image
    header: "Super fast banking experience",
    text: "Enjoy instant access to your funds effortlessly anywhere, anytime.",
  },
  {
    image: require("@/assets/images/partial-react-logo.png"),
    header: "Secure and reliable",
    text: "Your money is always safe and transactions are protected.",
  },
  {
    image: require("@/assets/images/partial-react-logo.png"),
    header: "Track your spending",
    text: "Get insights and manage your finances like a pro.",
  },
];

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 5s per slide
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const renderProgressBars = () =>
    slides.map((_, i) => {
      const width = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCREEN_WIDTH / slides.length - 10],
      });
      return (
        <View key={i} style={[styles.progressWrapper]}>
          {currentIndex === i ? (
            <Animated.View
              style={[
                styles.progressBar,
                { backgroundColor: colors.accent, width },
              ]}
            />
          ) : (
            <View
              style={[
                styles.progressBar,
                { backgroundColor: colors.border, width: SCREEN_WIDTH / slides.length - 10 },
              ]}
            />
          )}
        </View>
      );
    });

  return (
    <View style={[styles.safe, { backgroundColor: colors.background, paddingBottom: 20 }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>{renderProgressBars()}</View>

      {/* Slides */}
      <View style={styles.slideContainer}>
        <Image
          source={slides[currentIndex].image}
          style={styles.slideImage}
          resizeMode="contain"
        />
        <Text style={[styles.slideHeader, { color: colors.textPrimary }]}>
          {slides[currentIndex].header}
        </Text>
        <Text style={[styles.slideText, { color: colors.textSecondary }]}>
          {slides[currentIndex].text}
        </Text>
      </View>

      {/* Persistent Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          onPress={() => router.push("/register")}
        >
          <Text style={[styles.primaryText]}>Create Account</Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryBtn,
            { backgroundColor: colors.accent + "60" },
          ]}
          onPress={() => router.push("/login")}
        >
          <Text style={[styles.secondaryText, {color: "#ffffff"}]}>
            Login to Account{" "}
            <Text style={{ fontSize: 16,  }}>→</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: "space-between",
  },

  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 40,
  },

  progressWrapper: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 5,
    backgroundColor: "#ccc",
    overflow: "hidden",
  },

  progressBar: {
    height: 3,
    borderRadius: 2,
  },

  slideContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  slideImage: {
    width: "100%",
    height: "50%",
    marginBottom: 30,
  },

  slideHeader: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  slideText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },

  primaryBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
