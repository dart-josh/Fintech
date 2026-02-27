import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

type StatusType = "success" | "failed" | "waitlist";

export default function CardApplicationStatusDialog({
  visible,
  status,
  error,
  onClose,
}: {
  visible: boolean;
  status: StatusType;
  error?: string;
  onClose: () => void;
}) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const config = {
    success: {
      icon: "check",
      title: "Application Successful",
      message: "Your card application was approved successfully.",
      color: "#22C55E",
    },
    failed: {
      icon: "x",
      title: "Application Failed",
      message: error ? error : "We couldn’t process your card request at this time.",
      color: "#EF4444",
    },
    waitlist: {
      icon: "clock",
      title: "Joined Waitlist",
      message: "You’ve been added to the priority waitlist.",
      color: "#F59E0B",
    },
  };

  const current = config[status];

  return (
    <Modal transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.dialog,
            {
              backgroundColor: isDark
                ? "rgba(25,25,25,0.9)"
                : "rgba(255,255,255,0.85)",
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Glowing Icon */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: current.color + "20",
                shadowColor: current.color,
              },
            ]}
          >
            <Feather
              name={current.icon as any}
              size={28}
              color={current.color}
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {current.title}
          </Text>

          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {current.message}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.button,
              { backgroundColor: current.color },
            ]}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "85%",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    backdropFilter: "blur(20px)",
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});