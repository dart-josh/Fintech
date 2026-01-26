import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";

export default function PreferencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [transactionSound, setTransactionSound] = useState(true);
  const [themeExpanded, setThemeExpanded] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >(theme); // Light/Dark/System

  const preferencesItems = [
    { label: "Transaction Sound", icon: "volume-2", switch: true },
    { label: "Change Theme", icon: "sun", list: true },
  ];

  const handleSelectTheme = (value: "light" | "dark" | "system") => {
    setSelectedTheme(value);
    if (toggleTheme) toggleTheme(value); // Update app theme
  };

  return (
    <View
      style={[
        styles.page,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* FIXED TOP BAR */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 12,
            backgroundColor: isDark ? colors.background : "#F4F5F7",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Preferences</Text>
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? colors.card : "#FFFFFF" },
          ]}
        >
          {preferencesItems.map((item, index) => {
            return (
              <View key={item.label}>
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={item.switch || item.list ? 1 : 0.7}
                  onPress={() => item.list && setThemeExpanded(!themeExpanded)}
                >
                  {/* ICON */}
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Feather
                      name={item.icon as any}
                      size={18}
                      color={colors.primary}
                    />
                  </View>

                  {/* LABEL */}
                  <Text
                    style={[
                      styles.label,
                      { color: isDark ? colors.text : "#111" },
                    ]}
                  >
                    {item.label}
                  </Text>

                  {/* SWITCH OR ARROW */}
                  {item.switch ? (
                    <Switch
                      value={transactionSound}
                      onValueChange={setTransactionSound}
                      trackColor={{
                        true: colors.primary,
                        false: isDark ? "#555" : "#ccc",
                      }}
                      thumbColor={isDark ? "#fff" : "#fff"}
                    />
                  ) : item.list ? (
                    <Feather
                      name={themeExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.textMuted}
                      style={{ marginLeft: 6 }}
                    />
                  ) : null}
                </TouchableOpacity>

                {/* EXPANDED LIST */}
                {item.list && themeExpanded && (
                  <ThemeSelector
                    selected={selectedTheme}
                    onSelect={handleSelectTheme}
                    isDark={isDark}
                    colors={colors}
                  />
                )}

                {/* DIVIDER */}
                {index < preferencesItems.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/* ======================================================
   THEME SELECTOR COMPONENT
====================================================== */
function ThemeSelector({
  selected,
  onSelect,
  isDark,
  colors,
}: {
  selected: string;
  onSelect: (value: "light" | "dark" | "system") => void;
  isDark: boolean;
  colors: any;
}) {
  const options = ["Light", "Dark", "System"];

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
      {options.map((opt) => {
        const selectedOpt = selected === opt.toLocaleLowerCase();
        return (
          <TouchableOpacity
            key={opt}
            style={[
              themeStyles.optionRow,
              {
                backgroundColor: selectedOpt
                  ? colors.primary + "15"
                  : "transparent",
              },
            ]}
            onPress={() => onSelect(opt.toLowerCase())}
          >
            {/* Radio Circle */}
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: selectedOpt
                  ? colors.primary
                  : isDark
                    ? colors.text
                    : "#111",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              {selectedOpt && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </View>

            <Text
              style={[
                themeStyles.optionLabel,
                {
                  color: selectedOpt
                    ? colors.primary
                    : isDark
                      ? colors.text
                      : "#111",
                },
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ======================================================
   STYLES (reuse previous styles)
====================================================== */
const styles = StyleSheet.create({
  page: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingBottom: 12 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700" },
  scrollContent: { padding: 20 },
  card: {
    borderRadius: 20,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: { flex: 1, fontSize: 15, fontWeight: "500" },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 68, opacity: 0.6 },
});

const themeStyles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  optionLabel: { fontSize: 14, fontWeight: "500" },
});
