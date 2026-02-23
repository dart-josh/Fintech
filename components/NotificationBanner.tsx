import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function NotificationBanner({
  title,
  message,
  type = "success", // success | error | info
  onClose,
}: any) {
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 60,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose && onClose());
  };

  const accent =
    type === "success"
      ? ["#00FFA3", "#00C6FF"]
      : type === "error"
      ? ["#FF4E50", "#F00000"]
      : ["#4FACFE", "#00F2FE"];

  const icon =
    type === "success"
      ? "checkmark-circle"
      : type === "error"
      ? "close-circle"
      : "information-circle";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient colors={accent} style={styles.glow}>
        <BlurView intensity={40} tint="dark" style={styles.blur}>
          <View style={styles.row}>
            <Ionicons name={icon} size={26} color="#fff" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    width: width - 30,
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 9999,
  },
  glow: {
    padding: 1.5,
    borderRadius: 20,
  },
  blur: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(20,20,30,0.6)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  message: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 2,
  },
});