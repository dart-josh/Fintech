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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";

export interface Package {
  key: string;
  name: string;
  price?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  packages: Package[];
  onSelect: (packages: Package) => void;
  title?: string;
  subtitle?: string;
}

export default function PackageBottomSheet({
  visible,
  onClose,
  packages,
  onSelect,
  title = "Select a Package",
  subtitle,
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
    packages.length > 10
      ? packages.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase()),
        )
      : packages;

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
          {packages.length > 10 && (
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
                placeholder="Search Here..."
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
                <View>
                  <Text
                    style={[
                      styles.packageName,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.price && (
                    <Text
                      style={[
                        styles.packagePrice,
                        { color: colors.accent, marginTop: 8 },
                      ]}
                    >
                      ₦{Number(item.price).toLocaleString()}
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
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  imageWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  packageName: {
    fontSize: 14,
    fontWeight: "400",
  },

  packagePrice: {
    fontSize: 15,
    fontWeight: "700",
  },
});
