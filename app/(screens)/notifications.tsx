import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import NoNotifications from "@/components/NoNotification";

/* ======================================================
   NOTIFICATIONS PAGE
====================================================== */
export default function NotificationsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Payment Received",
      subtitle: "You have received $250",
      content: "Your payment of $250 from John Doe has been received.",
      read: false,
    },
    {
      id: "2",
      title: "Account Upgrade",
      subtitle: "You are now on Tier 1",
      content:
        "Congratulations! You have successfully upgraded your account to Tier 1.",
      read: true,
    },
    {
      id: "3",
      title: "Security Alert",
      subtitle: "New login from Chrome",
      content: "A new login was detected from Chrome on Windows at 10:23 AM.",
      read: false,
    },
  ]);

  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.notificationCard, { backgroundColor: colors.card }]}
      onPress={() => setSelectedNotification(item)}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: item.read ? "400" : "700",
            color: colors.textPrimary,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 2,
          }}
        >
          {item.subtitle}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => toggleRead(item.id)}
        style={styles.readIconWrapper}
      >
        <Ionicons
          name={item.read ? "mail-open-outline" : "mail-outline"}
          size={22}
          color={colors.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top,
            backgroundColor: colors.background,
            borderBottomColor: isDark ? "#cccccc53" : "#cccccc91",
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card + "22" }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Notifications
        </Text>
      </View>

      {/* Notifications List */}
      {true ? (
        <NoNotifications />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Notification Modal */}
      <Modal visible={!!selectedNotification} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedNotification(null)}
        />
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.textPrimary,
              marginBottom: 12,
            }}
          >
            {selectedNotification?.title}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {selectedNotification?.content}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

/* ======================================================
   STYLES
====================================================== */
const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
  },

  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },

  readIconWrapper: {
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000066",
  },

  modalContent: {
    position: "absolute",
    top: "30%",
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
});
