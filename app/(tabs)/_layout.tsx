import { Tabs} from "expo-router";
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DedicatedAccountModal } from "@/components/DedicatedAccountModal";
import QuickActionModal from "@/components/QuickActionModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const tabWidth = SCREEN_WIDTH / 5;
  const bottomPadding =
    Platform.OS === "ios" ? Math.min(insets.bottom, 20) : insets.bottom;

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
            height: 64 + bottomPadding,
            paddingBottom: bottomPadding,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
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

      <QuickActionFAB open={open} onPress={() => setOpen(!open)} />

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
          { backgroundColor: colors.primary, borderColor: colors.border },
        ]}
      >
        <Ionicons name={open ? "close" : "add"} size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}


/* ====================================================== */

const fabStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 100,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
  },
});


