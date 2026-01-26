import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getMessages, storeMessage } from "@/services/support.service";
import { useUserStore } from "@/store/user.store";

export default function ChatPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const [messages, setMessages] = useState([
    { id: "100", text: "Hello! How can I help you today?", sender: "agent" },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const {user} = useUserStore();

  const sendMessage = () => {
    if (!input.trim()) return;
    storeMessage({userId: user?.id ?? "", message: input, senderType: 'user'});
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input, sender: "user" },
    ]);
    setInput("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    const getM = async () => {
      const ms = await getMessages({userId: user?.id ?? ""});
      const newM = ms.map((m) => {return {id: m.id, text: m.message, sender: m.sender_type}});
      setMessages([...messages, ...newM]);
    }

    getM();
  }, [])

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          {
            alignSelf: isUser ? "flex-end" : "flex-start",
            backgroundColor: isUser
              ? colors.primary
              : isDark
              ? "#2E2E3A"
              : "#F3F4F6",
          },
        ]}
      >
        <Text
          style={{
            color: isUser ? "#fff" : colors.textPrimary,
            fontSize: 14,
          }}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card + "22" }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.supportTitleWrapper}>
          <View
            style={[
              styles.supportIcon,
              { backgroundColor: colors.primary + "33" },
            ]}
          >
            <Ionicons name="headset" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.supportTitle, { color: colors.textPrimary }]}>
            Support
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Message Input with KeyboardAvoidingView only */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom - 30} // very small offset
      >
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark ? "#1E1E1E" : "#fff",
              borderTopColor: colors.border,
              paddingBottom: insets.bottom || 8,
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.textPrimary }]}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

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

  supportTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  supportIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  supportTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  messageContainer: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "transparent",
  },

  sendButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 24,
    marginLeft: 8,
  },
});
