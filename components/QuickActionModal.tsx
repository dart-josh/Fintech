import { useToastStore } from "@/store/toast.store";
import { useUserStore } from "@/store/user.store";
import { useTheme } from "@/theme/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

  const handleItem = (item: any) => {
    const toast = useToastStore.getState();
    const { user } = useUserStore.getState();
    const route = item.route;

    if (route) {
      if (item.requirePin) {
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
        setModalVisible(true);
      } else {
        router.push(route);
      }
    } else {
      toast.show({
        message: "This feature is not yet available.",
        type: "warning",
      });
    }
  };

  const actions = [
    {
      icon: "smartphone",
      label: "Top Up",
      route: "mobile-top-up",
      color: "#2563EB",
      requirePin: true,
    },
    {
      icon: "activity",
      label: "Pay Bills",
      route: "bill-payment",
      color: "#16A34A",
      requirePin: true,
    },
    {
      icon: "lock",
      label: "Escrow",
      route: "escrow-home",
      color: "#0F766E",
      requirePin: true,
    },
    {
      icon: "plus-circle",
      label: "Add Money",
      route: "modal",
      color: "#7C3AED",
    },
    {
      icon: "send",
      label: "Send",
      route: "send",
      color: "#EA580C",
      requirePin: true,
    },
    {
      icon: "arrow-down-left",
      label: "Receive",
      route: "receive",
      color: "#0891B2",
    },
    {
      icon: "arrow-up-right",
      label: "Withdraw",
      route: "withdraw",
      color: "#DC2626",
      requirePin: true,
    },
    {
      icon: "tv",
      label: "TV",
      route: "tv-subscription",
      color: "#9333EA",
      requirePin: true,
    },
    {
      icon: "zap",
      label: "Electricity",
      route: "electricity-top-up",
      color: "#16A34A",
      requirePin: true,
    },
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
          {/* Modern Header */}
          <View style={modalStyles.headerRow}>
            <View
              style={[
                modalStyles.headerIconWrap,
                { backgroundColor: colors.primaryContainer },
              ]}
            >
              <Feather name="grid" size={18} color={colors.primary} />
            </View>

            <Text style={[modalStyles.headerTitle, { color: colors.text }]}>
              All Services
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={modalStyles.listArea}
            showsVerticalScrollIndicator={false}
          >
            {actions.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  modalStyles.itemCard,
                  { backgroundColor: colors.background + "90" },
                ]}
                onPress={() => {
                  onClose();
                  handleItem(item);
                }}
              >
                <View
                  style={[
                    modalStyles.iconWrapNew,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Feather
                    name={item.icon as any}
                    size={18}
                    color={item.color}
                  />
                </View>

                <Text style={[modalStyles.labelNew, { color: colors.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    borderRadius: 28,
    padding: 20,
    maxHeight: "60%",
  },

  listArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    overflowY: "auto",
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  /* Grid */
  itemCard: {
    width: "30%",
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  iconWrapNew: {
    width: 42,
    height: 42,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  labelNew: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
