import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Text,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "@/theme/ThemeContext";
import { useToastStore } from "@/store/toast.store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@/store/user.store";
import { DedicatedAccountModal } from "@/components/DedicatedAccountModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const tabWidth = SCREEN_WIDTH / 5; // 5 slots, middle one is empty

  const bottomPadding =
    Platform.OS === "ios" ? Math.min(insets.bottom, 20) : insets.bottom;

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            height: 64 + bottomPadding, // dynamic tab bar height
            paddingBottom: bottomPadding, // content stays above safe area
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        {/* LEFT TABS */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            tabBarItemStyle: { width: tabWidth },
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="swap-horizontal" size={size} color={color} />
            ),
            tabBarItemStyle: { width: tabWidth },
          }}
        />

        {/* RIGHT TABS */}
        <Tabs.Screen
          name="cards"
          options={{
            title: "Cards",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card" size={size} color={color} />
            ),
            tabBarItemStyle: { width: tabWidth },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
            tabBarItemStyle: { width: tabWidth },
          }}
        />
      </Tabs>

      <DedicatedAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* CENTER FAB */}
      <QuickActionFAB open={open} onPress={() => setOpen(!open)} />

      {/* QUICK ACTION MODAL */}
      <QuickActionModal
        open={open}
        onClose={() => setOpen(false)}
        setModalVisible={setModalVisible}
      />
    </>
  );
}

/* ======================================================
   CENTER FAB
====================================================== */
function QuickActionFAB({
  open,
  onPress,
}: {
  open: boolean;
  onPress: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const fabBottom =
    Platform.OS === "ios"
      ? 32 + Math.min(insets.bottom, 20)
      : 32 + insets.bottom;

  return (
    <View style={[fabStyles.wrapper, { bottom: fabBottom }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          fabStyles.button,
          {
            backgroundColor: colors.primary,
            borderColor: colors.border, // border inside tab only
          },
        ]}
      >
        <Ionicons name={open ? "close" : "add"} size={30} color={colors.card} />
      </TouchableOpacity>

      {/* subtle border only inside tab bar */}
      <View
        style={[fabStyles.bottomBorder, { backgroundColor: colors.border }]}
      />
    </View>
  );
}

/* ======================================================
   QUICK ACTION MODAL
====================================================== */
function QuickActionModal({
  open,
  onClose,
  setModalVisible,
}: {
  open: boolean;
  onClose: () => void;
  setModalVisible: any;
}) {
  const { colors } = useTheme();

  if (!open) return null;

  const actions = [
    { icon: "send", label: "Send", route: "send" },
    { icon: "download", label: "Receive", route: "receive" },
    { icon: "phone", label: "Airtime", route: "airtime-top-up" },
    { icon: "wifi", label: "Data", route: "data-top-up" },
    { icon: "credit-card", label: "Withdraw", route: "withdraw" },
    { icon: "download", label: "Top Up", route: "modal" },
  ];

  return (
    <Modal transparent animationType="fade">
      <BlurView intensity={35} style={StyleSheet.absoluteFill}>
        <Pressable style={modalStyles.overlay} onPress={onClose} />
        <View style={[modalStyles.sheet, { backgroundColor: colors.card }]}>
          {actions.map((item) => (
            <ActionItem
              key={item.label}
              {...item}
              onClose={onClose}
              setModalVisible={setModalVisible}
            />
          ))}
        </View>
      </BlurView>
    </Modal>
  );
}



/* ======================================================
   GRID ITEM
====================================================== */
function ActionItem({
  icon,
  label,
  route,
  onClose,
  setModalVisible,
}: {
  icon: any;
  label: string;
  route: string;
  onClose: any;
  setModalVisible: any;
}) {
  const { colors } = useTheme();
  const toast = useToastStore.getState();
  const router = useRouter();

  const { user } = useUserStore.getState();

  return (
    <TouchableOpacity
      style={modalStyles.item}
      onPress={async () => {
        if (route) {
          if (
            route === "send" ||
            route === "airtime-top-up" ||
            route === "data-top-up" ||
            route === "withdraw" ||
            label === "Top Up"
          ) {
            if (!user?.transaction_pin) {
              toast.show({
                type: "warning",
                message: "Transaction PIN Not set",
              });
              Alert.alert(
                "Set Transaction PIN",
                `To set transaction PIN\nGo to Profile -> Security -> Set Transaction PIN`,
              );
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
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[modalStyles.label, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ======================================================
   FAB STYLES
====================================================== */
const fabStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 100,
    alignItems: "center",
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 4,
  },
  bottomBorder: {
    position: "absolute",
    bottom: 0,
    width: 64,
    height: 4,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
});

/* ======================================================
   MODAL STYLES
====================================================== */
const modalStyles = StyleSheet.create({
  overlay: { flex: 1 },

  sheet: {
    position: "absolute",
    bottom: 110,
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
