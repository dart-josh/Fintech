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
import { useUserStore } from "@/store/user.store";
import { markAsRead } from "@/services/notification.service";
import { formatCurrentDate } from "@/hooks/format.hook";
import { useConfirmStore } from "@/store/confirmation.store";

/* ======================================================
   NOTIFICATIONS PAGE
====================================================== */
export default function NotificationsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const { notifications, setNotification } = useUserStore();

  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const toggleRead = (id: string, is_read: boolean) => {
    const new_nots = notifications.map((n) =>
      n.id === id ? { ...n, is_read: true } : n,
    );
    setNotification(new_nots);

    if (!is_read) markAsRead(id);
  };

  const confirm = useConfirmStore((state) => state.confirm);

  const unread = notifications.filter((p) => !p.is_read);

  const readAll = async () => {
    const confirmed = await confirm({
      title: "Mark all as read",
      subtitle: "You're about to mark all notifications as read.",
      confirmText: "Confirm",
      icon: <Ionicons name="mail" size={28} color="#22c55e" />,
    });
    if (confirmed) {
      

      for (let index = 0; index < unread.length; index++) {
        const element = unread[index];
        toggleRead(element.id, element.is_read);
      }
    }
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.notificationCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedNotification(item);
        toggleRead(item.id, item.is_read);
      }}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: item.is_read ? "400" : "800",
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
          {item.message}
        </Text>
      </View>

      {!item.is_read && <TouchableOpacity
        onPress={() => toggleRead(item.id, item.is_read)}
        style={styles.readIconWrapper}
      >
        <Ionicons
          name={item.is_read ? "mail-open-outline" : "mail"}
          size={22}
          color={colors.primary}
        />
      </TouchableOpacity>}
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
        {unread.length !== 0 && <TouchableOpacity onPress={readAll} style={{marginLeft: "auto"}}>
          <Ionicons name="mail" size={25} color="#22c55e" />
        </TouchableOpacity>}
      </View>

      {/* Notifications List */}
      {!notifications || notifications.length === 0 ? (
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
            {selectedNotification?.message}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginTop: 10,
              fontWeight: "500",
            }}
          >
            {formatCurrentDate(selectedNotification?.created_at)}
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
