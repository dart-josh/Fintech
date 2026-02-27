import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  FlatList,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
export interface Provider {
  key: string;
  name: string;
  desc?: string;
  image: any;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  providers: Provider[];
  onSelect: (provider: Provider) => void;
  title?: string;
  subtitle?: string;
}

const getInitials = (name: string) => {
  if (!name) return "";

  const words = name.trim().split(" ");
  return words
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
};

export default function ProviderBottomSheet({
  visible,
  onClose,
  providers,
  onSelect,
  title = "Select Service Provider",
  subtitle = "Select your preferred service provider",
}: Props) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(400)).current;
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5, // only downward drag
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          slideAnim.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100) {
          // threshold to close
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const filtered =
    providers.length > 10
      ? providers.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) || (p.desc?.toLowerCase().includes(search.toLowerCase())),
        )
      : providers;

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalContainer}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? colors.card : "#FFFFFF",
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top bar */}
          <View
            style={styles.gestureArea}
            {...panResponder.panHandlers} // Attach PanResponder here
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {title}
                </Text>

                {subtitle ? (
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (search) {
                    setSearch("");
                  } else onClose();
                }}
              >
                <Feather name="x" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search (if >10) */}
          {providers.length > 10 && (
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: isDark
                    ? colors.background
                    : colors.backgroundOff,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="search" size={16} color={colors.textMuted} />
              <TextInput
                placeholder="Search provider"
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
          )}

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tile,
                  {
                    backgroundColor: colors.background,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                {/* Image OR Initials */}
                <View style={styles.imageWrapper}>
                  {item.image ? (
                    <Image source={item.image} style={styles.image} />
                  ) : (
                    <View
                      style={[
                        styles.initialContainer,
                        { backgroundColor: colors.accent },
                      ]}
                    >
                      <Text style={styles.initialText}>
                        {getInitials(item.name)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Text Content */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.providerName, { color: colors.text }]}
                    numberOfLines={2} // allows wrapping up to 2 lines
                  >
                    {item.name}
                  </Text>

                  {item.desc && (
                    <Text
                      style={[
                        styles.providerDesc,
                        { color: colors.textSecondary, marginTop: 3 },
                      ]}
                    >
                      {item.desc}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  gestureArea: {
    paddingVertical: 12,
    paddingBottom: 10,
    // backgroundColor: "transparent",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: "85%",
  },

  dragHandle: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CCC",
    alignSelf: "center",
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  tile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  imageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  providerName: {
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  providerDesc: {
    fontSize: 12,
    fontWeight: "400",
  },

  initialContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  initialText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
