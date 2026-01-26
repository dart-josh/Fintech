import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";

export default function CardConfirmation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

//   const { user } = useUserStore();

  const { fullName, dob, address, phone, email } = useLocalSearchParams<{
    fullName: string;
    dob: string;
    address: string;
    phone: string;
    email: string;
  }>();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Application Submitted
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Success Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? colors.card : "#FFF" },
          ]}
        >
          <Feather
            name="check-circle"
            size={48}
            color={colors.primary}
            style={{ alignSelf: "center", marginBottom: 16 }}
          />
          <Text
            style={[
              styles.header,
              { color: colors.text, textAlign: "center", marginBottom: 8 },
            ]}
          >
            Your Card Application is Submitted!
          </Text>
          <Text
            style={[
              styles.subHeader,
              { color: isDark ? "#ccc" : "#555", textAlign: "center" },
            ]}
          >
            We are reviewing your application. You will be notified via email
            and SMS once your Arigo Pay card is approved.
          </Text>

          {/* Submitted Details */}
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.detailTitle, { color: colors.text }]}>
              Submitted Details
            </Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                Full Name
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {fullName || "John Doe"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                Email
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {email || "john@example.com"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                Phone
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {phone || "+234 800 000 0000"}
              </Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go to Dashboard</Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  title: { fontSize: 22, fontWeight: "700" },

  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 24,
  },

  header: { fontSize: 20, fontWeight: "700" },
  subHeader: { fontSize: 14, marginTop: 4 },

  detailTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: "600" },

  button: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
  },

  buttonText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
