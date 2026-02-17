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
  ActivityIndicator,
  Pressable,
  ToastAndroid,
  Keyboard,
  LayoutAnimation,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getMessages, storeMessage } from "@/services/support.service";
import { useUserStore } from "@/store/user.store";
import * as Haptics from "expo-haptics";
import { useToastStore } from "@/store/toast.store";

export default function ChatPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const { user } = useUserStore();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  /** Fetch messages */
  const fetchMessages = async () => {
    if (!user?.id) return;
    setIsFetching(true);
    try {
      const ms = await getMessages({ userId: user.id });
      const formatted = ms.map((m: any) => ({
        id: m.id.toString(),
        text: m.message,
        sender: m.sender_type === "user" ? "user" : "agent",
      }));

      // If user is at bottom, auto-scroll
      if (isAtBottom) {
        setMessages([
          {
            id: "2323981287",
            text: "Hello,\nHow can we be of assistance to you?",
            sender: "support",
          },
          ...formatted,
        ]);
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          50,
        );
      } else {
        // User scrolled up, show indicator for new messages
        const newMsgs = formatted.length - messages.length;
        if (newMsgs > 0) setNewMessageCount(newMsgs);
      }
    } catch (err) {
      console.error(err);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAtBottom]);

  /** Send message */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      await storeMessage({
        userId: user?.id ?? "",
        message: input,
        senderType: "user",
      });
    } catch (err) {
      console.error("Failed to store message", err);
    }
  };

  /** Render each message */
  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === "user";
    return (
      <Pressable
        onLongPress={async () => {
          const toast = useToastStore.getState();
          await Clipboard.setStringAsync(item.text);

          if (Platform.OS === "android") {
            ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
          } else {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          toast.show({
            message: "Message copied",
            type: "success",
          });
        }}
        delayLongPress={350}
        style={({ pressed }) => [
          pressed && { opacity: 0.75, transform: [{ scale: 0.85 }] },
        ]}
      >
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
      </Pressable>
    );
  };

  /** Track if user is at bottom */
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const atBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    setIsAtBottom(atBottom);

    if (atBottom) setNewMessageCount(0);
  };

  if (messages.length === 0 && !isFetching)
    setMessages([
      {
        id: "2323981287",
        text: "Hello,\nHow can we be of assistance to you?",
        sender: "support",
      },
    ]);

  const [layoutResetKey, setLayoutResetKey] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      // Smoothly reset layout
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // Force re-render / recalculation
      setLayoutResetKey((prev) => prev + 1);

      // Optional: scroll FlatList to bottom
      // flatListRef.current?.scrollToEnd({ animated: true });
    });

    return () => {
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      key={layoutResetKey}
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
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
        onScroll={handleScroll}
        scrollEventThrottle={100}
      />

      {/* New Message Indicator */}
      {newMessageCount > 0 && (
        <TouchableOpacity
          style={styles.newMessageIndicator}
          onPress={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
            setNewMessageCount(0);
          }}
        >
          <Text style={{ color: "#fff" }}>
            {newMessageCount} New Message(s)
          </Text>
        </TouchableOpacity>
      )}

      {/* Fetching Spinner */}
      {isFetching && (
        <View style={styles.fetchingSpinner}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {/* Input */}
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
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  supportTitleWrapper: { flexDirection: "row", alignItems: "center" },
  supportIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  supportTitle: { fontSize: 20, fontWeight: "600" },
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

  newMessageIndicator: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 50,
  },

  fetchingSpinner: {
    position: "absolute",
    top: 70,
    right: 16,
    zIndex: 50,
  },
});
