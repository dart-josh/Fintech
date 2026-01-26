import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useTheme } from "@/theme/ThemeContext";

/* ---------- Helpers ---------- */

const handleUnavailable = () => {
  Toast.show({
    type: "info",
    text1: "Not available at this moment",
    position: "bottom",
    visibilityTime: 2000,
    autoHide: true,
    bottomOffset: 60,
  });
};

/* ---------- Screen ---------- */

const DashboardScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [showBalance, setShowBalance] = useState(false);

  const colors = themeColors[theme];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.muted }]}>
          Good morning 👋
        </Text>
        <Text style={[styles.name, { color: colors.textPrimary }]}>Joshua</Text>
      </View>

      {/* Balance Card */}
      <View style={[styles.balanceCard, { backgroundColor: colors.cardDark }]}>
        <View style={styles.balanceHeader}>
          <Text style={[styles.balanceLabel, { color: colors.muted }]}>
            Available Balance
          </Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
            <Feather
              name={showBalance ? "eye" : "eye-off"}
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.balance, { color: colors.white }]}>
          {showBalance ? "₦245,800.50" : "•••••••"}
        </Text>

        <View style={styles.balanceActions}>
          <ActionButton label="Add Money" />
          <ActionButton label="Withdraw" />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Quick Actions
        </Text>

        <View style={styles.actionsRow}>
          <QuickAction title="Send" icon="arrow-up-circle" route="/send" />
          <QuickAction
            title="Receive"
            icon="arrow-down-circle"
            route="/receive"
          />
          <QuickAction title="Bills" icon="file-text" route="" />
          <QuickAction title="Cards" icon="credit-card" route="/(tabs)/cards" />
        </View>
      </View>

      {/* Cards Overview */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Cards Overview
        </Text>

        <View style={[styles.cardsOverview, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardsText, { color: colors.textPrimary }]}>
            You have 3 active cards
          </Text>

          <TouchableOpacity
            style={[styles.cardsButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/cards")}
          >
            <Text style={styles.cardsButtonText}>View Cards</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transactions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Recent Transactions
        </Text>

        <TransactionItem
          title="Transfer to John"
          date="Today"
          amount="- ₦12,500"
          negative
        />
        <TransactionItem title="Salary" date="Yesterday" amount="+ ₦180,000" />
        <TransactionItem
          title="Airtime Purchase"
          date="Mon, Jan 12"
          amount="- ₦2,000"
          negative
        />
      </View>
    </ScrollView>
  );
};

/* ---------- Reusable Components ---------- */

const ActionButton = ({ label }: { label: string }) => (
  <TouchableOpacity style={styles.actionButton} onPress={handleUnavailable}>
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const QuickAction = ({
  title,
  icon,
  route,
}: {
  title: string;
  icon: any;
  route?: string;
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={() => {
        if (route) {
          router.push(route); // navigate to the passed route
        } else {
          handleUnavailable();
        }
      }}
    >
      <Feather
        name={icon}
        size={28}
        color={colors.primary}
        style={{ marginBottom: 6 }}
      />
      <Text style={[styles.quickText, { color: colors.textSecondary }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const TransactionItem = ({
  title,
  date,
  amount,
  negative,
}: {
  title: string;
  date: string;
  amount: string;
  negative?: boolean;
}) => {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <View style={[styles.transaction, { backgroundColor: colors.card }]}>
      <View>
        <Text style={[styles.transactionTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.muted }]}>
          {date}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: negative ? colors.danger : colors.success },
        ]}
      >
        {amount}
      </Text>
    </View>
  );
};

/* ---------- Theme Colors ---------- */

const themeColors = {
  light: {
    background: "#F6F7FB",
    card: "#FFFFFF",
    cardDark: "#0F172A",
    textPrimary: "#111827",
    textSecondary: "#374151",
    muted: "#6B7280",
    primary: "#2563EB",
    success: "#16A34A",
    danger: "#DC2626",
    white: "#FFFFFF",
  },
  dark: {
    background: "#020617",
    card: "#020617",
    cardDark: "#020617",
    textPrimary: "#E5E7EB",
    textSecondary: "#9CA3AF",
    muted: "#6B7280",
    primary: "#3B82F6",
    success: "#22C55E",
    danger: "#EF4444",
    white: "#FFFFFF",
  },
};

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 50,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
  },
  balanceCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 13,
  },
  balance: {
    fontSize: 30,
    fontWeight: "700",
    marginVertical: 10,
  },
  balanceActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    backgroundColor: "#1E293B",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
    width: "22%",
  },
  quickText: {
    fontSize: 12,
  },
  cardsOverview: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cardsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  transaction: {
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DashboardScreen;
