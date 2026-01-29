import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

export type Bank = {
  name: string;
  code: string;
  slug: string;
};

type Props = {
  visible: boolean;
  banks: Bank[];
  onClose: () => void;
  onSelect: (bank: Bank) => void;
};

const FREQUENT_BANK_CODES = ["044", "058", "033", "011", "057", "070"];

export function BankSelectorModal({
  visible,
  banks,
  onClose,
  onSelect,
}: Props) {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const listRef = useRef<FlatList<any>>(null);

  // Filter banks by search
  const filteredBanks = useMemo(() => {
    if (!search) return banks;
    return banks.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, banks]);

  // Group banks alphabetically
  const groupedBanks = useMemo(() => {
    const groups: Record<string, Bank[]> = {};
    filteredBanks.forEach((bank) => {
      const letter = bank.name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(bank);
    });
    return Object.keys(groups)
      .sort()
      .map((key) => ({ letter: key, data: groups[key] }));
  }, [filteredBanks]);

  const frequentBanks = banks.filter((b) =>
    FREQUENT_BANK_CODES.includes(b.code),
  );

  // Close keyboard if open
  const closeKeyboard = () => {
    Keyboard.dismiss();
    setSearch("");
    setInputFocused(false);
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade">
      <BlurView intensity={30} style={StyleSheet.absoluteFill}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            if (inputFocused) closeKeyboard();
            else onClose();
          }}
        />

        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Select Bank
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (inputFocused || search) {
                    closeKeyboard();
                  } else onClose();
                }}
              >
                <Feather name="x" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={[styles.searchBox, { backgroundColor: colors.background }]}
            >
              <Feather name="search" size={18} color={colors.muted} />
              <TextInput
                placeholder="Search bank"
                placeholderTextColor={colors.muted}
                style={{ flex: 1, color: colors.text }}
                value={search}
                onChangeText={setSearch}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </View>

            {/* Frequent */}
            {!search && !inputFocused && frequentBanks.length > 0 && (
              <>
                <Text
                  style={[styles.sectionLabel, { color: colors.textSecondary }]}
                >
                  Frequently Used Banks
                </Text>

                <View style={styles.grid}>
                  {frequentBanks.slice(0, 6).map((bank) => (
                    <TouchableOpacity
                      key={bank.code}
                      style={styles.gridItem}
                      onPress={() => {
                        onSelect(bank);
                        onClose();
                      }}
                    >
                      <BankLogo slug={bank.slug} size={36} />
                      <Text
                        style={[styles.bankName, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {bank.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Alphabetical List */}
            <View style={{ flex: 1 }}>
              <FlatList
                ref={listRef}
                data={groupedBanks}
                keyExtractor={(item) => item.letter}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => (
                  <View>
                    <Text style={[styles.alphaLabel, { color: colors.muted }]}>
                      {item.letter}
                    </Text>

                    {item.data.map((bank) => (
                      <TouchableOpacity
                        key={bank.code}
                        style={styles.bankRow}
                        onPress={() => {
                          onSelect(bank);
                          onClose();
                        }}
                      >
                        <BankLogo slug={bank.slug} size={28} />
                        <Text style={[styles.rowText, { color: colors.text }]}>
                          {bank.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </BlurView>
    </Modal>
  );
}

function BankLogo({ slug, size = 32 }: { slug: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primaryContainer,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name="credit-card" size={size * 0.55} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "90%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 12,
  },
  bankName: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  alphaLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  rowText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
