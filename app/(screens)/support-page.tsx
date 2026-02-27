import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { copyToClipboard, sendEmail } from "@/hooks/generalFn";

export default function SupportPage() {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const cardBg = isDark ? "#1E1E1E" : colors.card;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* TOP BAR */}
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
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Contact Us</Text>

        {/* SECTION 1 - Address */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.row}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Feather name="map-pin" size={18} color={colors.primary} />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Address
            </Text>
          </View>

          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            123 Fintech Avenue, Lagos, Nigeria.
            {/* {"\n"} */}
          </Text>
        </View>

        {/* SECTION 2 - Contact Options */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {[
            { icon: "phone", label: "+234 800 000 0000", fn: () => {
              copyToClipboard("+234 800 000 0000");
            }},
            {
              icon: "mail",
              label: "support@yourapp.com",
              fn: () => {
                sendEmail("support@arigopay.com", "", "");
              },
            },
          ].map((item, index) => (
            <TouchableOpacity
              onPress={item.fn}
              key={index}
              style={[
                styles.contactItem,
                {
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderColor: colors.border + "80",
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.accent + "20" },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={18}
                  color={colors.accent}
                />
              </View>

              <Text style={[styles.contactText, { color: colors.text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Live Chat */}
          <TouchableOpacity
            onPress={() => {
              router.push("/chat-page");
            }}
            style={styles.contactItem}
          >
            <View style={[styles.iconWrap, { backgroundColor: "#22C55E20" }]}>
              <Feather name="message-circle" size={18} color="#22C55E" />
            </View>

            <View>
              <Text style={[styles.contactText, { color: colors.text }]}>
                Live Chat
              </Text>
              <Text style={[styles.subText, { color: colors.textSecondary }]}>
                Start a conversation
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {[
            { icon: "facebook", label: "Facebook", color: "#1877F2" },
            { icon: "instagram", label: "Instagram", color: "#E4405F" },
            { icon: "twitter", label: "Twitter", color: "#1DA1F2" },
          ].map((item, index) => (
            <View
              key={index}
              style={[
                styles.contactItem,
                {
                  paddingTop: 12,
                  borderTopWidth: index !== 0 ? 1 : 0,
                  borderColor: colors.border + "80",
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Feather name={item.icon as any} size={18} color={item.color} />
              </View>

              <Text style={[styles.contactText, { color: colors.text }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },

  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  contactText: {
    fontSize: 15,
    fontWeight: "600",
  },

  subText: {
    fontSize: 13,
    marginTop: 2,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
