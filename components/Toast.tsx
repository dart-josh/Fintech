import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { useToastStore } from "@/store/toast.store";
import { Ionicons } from "@expo/vector-icons";

const ICONS = {
  success: "checkmark-circle",
  error: "close-circle",
  warning: "alert-circle",
} as const;

const COLORS = {
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
};

export default function Toast() {
  const { visible, message, type, duration, hide } = useToastStore();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(hide);
    }, duration);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          transform: [{ translateY }],
          opacity,
          borderLeftColor: COLORS[type],
        },
      ]}
    >
      <Ionicons
        name={ICONS[type]}
        size={22}
        color={COLORS[type]}
        style={{ marginRight: 10 }}
      />

      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(15,15,20,0.95)",
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },

  text: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
});
