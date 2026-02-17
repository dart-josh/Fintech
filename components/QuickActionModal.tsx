import { sendEmailCode } from "@/services/auth.service";
import { useToastStore } from "@/store/toast.store";
import { useUserStore } from "@/store/user.store";
import { useTheme } from "@/theme/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QuickActionModal({
  open,
  onClose,
  setModalVisible,
}: {
  open: boolean;
  onClose: () => void;
  setModalVisible: any;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const TAB_HEIGHT = 64;

  const bottomOffset =
    Platform.OS === "ios"
      ? TAB_HEIGHT + Math.min(insets.bottom, 20) + 20
      : TAB_HEIGHT + insets.bottom + 20;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const actions = [
  { icon: "send", label: "Send", route: "send" },
  { icon: "arrow-down-left", label: "Receive", route: "receive" },
  { icon: "plus-circle", label: "Add Money", route: "modal" },
  { icon: "phone", label: "Airtime", route: "airtime-top-up" },
  { icon: "wifi", label: "Data", route: "data-top-up" },
  { icon: "arrow-up-right", label: "Withdraw", route: "withdraw" },
  { icon: "lock", label: "Escrow", route: "/escrow-home" },
];


  return (
    <Modal transparent animationType="none">
      <View style={{ flex: 1 }}>
        {/* Animated Blur */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <BlurView
            intensity={60}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Pressable style={{ flex: 1 }} onPress={onClose} />

        {/* Animated Sheet */}
        <Animated.View
          style={[
            modalStyles.sheet,
            {
              backgroundColor: colors.card,
              bottom: bottomOffset,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {actions.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={modalStyles.item}
              onPress={() => {
                onClose();
                const toast = useToastStore.getState();
                const {user} = useUserStore.getState();
                const route = item.route;
                if (route) {
                  if (
                    route === "send" ||
                    route === "airtime-top-up" ||
                    route === "data-top-up" ||
                    route === "withdraw" ||
                    item.label === "Top Up"
                  ) {
                    if (!user?.transaction_pin) {
                      toast.show({
                        type: "warning",
                        message: "Transaction PIN Not set",
                      });
                      router.push("/set-pin-intro");
                      return;
                    }
                  }

                  if (route === "modal") {
                    onClose();
                    setModalVisible(true);
                  } else {
                    requestAnimationFrame(() => onClose());
                    router.push(route);
                  }
                } else {
                  onClose();
                  toast.show({
                    message: "This feature is not yet available.",
                    type: "warning",
                  });
                }
              }}
            >
              <View
                style={[
                  modalStyles.iconWrap,
                  { backgroundColor: colors.primaryContainer },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <Text style={[modalStyles.label, { color: colors.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Close Button */}
        <View
          style={{
            position: "absolute",
            bottom: 20 + insets.bottom,
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: { width: "30%", alignItems: "center", marginBottom: 20 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  label: { fontSize: 12, fontWeight: "600", textAlign: "center" },
});