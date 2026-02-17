// pages/EscrowHome.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  StatusBar,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConfirmStore } from "@/store/confirmation.store";
import { Escrow, fetchEscrows } from "@/services/escrow.service";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { useEscrowStore } from "@/store/escrow.store";
import { useTheme } from "@/theme/ThemeContext";

export default function EscrowHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [activeTab, setActiveTab] = useState<"open" | "completed">("open");
  const [isLoading, setIsLoading] = useState(true);

  const { confirm } = useConfirmStore();

  const theme = {
    background: isDark ? "#0B0F14" : "#F4F6F8",
    card: isDark ? "#111827" : "#ffffff",
    textPrimary: isDark ? "#ffffff" : "#0f172a",
    textSecondary: isDark ? "#94a3b8" : "#475569",
    border: isDark ? "#1f2937" : "#e2e8f0",
    tabActive: "#2563eb",
  };

  const { user } = useUserStore();
  const { escrows } = useEscrowStore();

  useEffect(() => {
    const getMyEscrows = async () => {
      await fetchEscrows({ userId: user?.id ?? "" });
      setIsLoading(false);
    };

    getMyEscrows();
  }, [user]);

  const openEscrows = escrows
    ? escrows.filter(
        (e) =>
          e.status === "pending" ||
          e.status === "funded" ||
          e.status === "delivered",
      )
    : [];
  const completedEscrows = escrows
    ? escrows.filter(
        (e) =>
          e.status === "released" ||
          e.status === "refunded" ||
          e.status === "disputed" ||
          e.status === "cancelled",
      )
    : [];

  useEffect(() => {
    if (openEscrows.length === 0 && !isLoading) {
      setActiveTab("completed");
    }
  }, [escrows, openEscrows.length, isLoading]);

  const displayedEscrows =
    activeTab === "open" ? openEscrows : completedEscrows;

  const handleCreateEscrow = async () => {
    const confirmed = await confirm({
      title: "Create New Escrow",
      message:
        "Do you want to create a new escrow? This action cannot be undone.",
      confirmText: "Create",
      cancelText: "Cancel",
    });

    if (confirmed) {
      router.push("/create-escrow-screen");
    }
  };

  const renderItem = ({ item }: { item: Escrow }) => (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/escrow-detail-screen",
          params: {
            escrowRef: item.escrow_ref,
          },
        });
      }}
      style={[styles.card, { backgroundColor: theme.card }]}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.amount, { color: theme.textPrimary }]}>
            ₦{item.amount.toLocaleString()}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            Buyer: {item.payer.full_name}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            Seller: {item.payee.full_name}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* 🔝 Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={theme.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.topTitle, { color: theme.textPrimary }]}>
          Escrow
        </Text>

        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/history",
              params: { type: "escrow" },
            });
          }}
        >
          <Ionicons
            name="receipt-outline"
            size={22}
            color={theme.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* 📊 Info Section */}
      <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
        <Feather name="shield" size={28} color="#2563eb" />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>
            Secure Escrow Protection
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Funds are securely held until both parties fulfill agreed terms.
            Release only when satisfied. Dispute protection included.
          </Text>
        </View>
      </View>

      {/* 🧭 Tabs */}
      <View style={styles.tabs}>
        <TabButton
          label="Open Escrows"
          active={activeTab === "open"}
          onPress={() => setActiveTab("open")}
          theme={theme}
        />
        <TabButton
          label="Completed"
          active={activeTab === "completed"}
          onPress={() => setActiveTab("completed")}
          theme={theme}
        />
      </View>

      {/* 📋 Escrow List */}
      {(displayedEscrows.length > 0 && (
        <FlatList
          data={displayedEscrows}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )) || <NoEscrows activeTab={activeTab} />}

      {/* ➕ Floating Create Escrow */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { backgroundColor: theme.tabActive, bottom: insets.bottom + 20 },
        ]}
        onPress={handleCreateEscrow}
      >
        <Feather name="plus" size={22} color="#fff" />
        <Text style={styles.floatingText}>New Escrow</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ----------------- Status Badge ----------------- */
function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = () => {
    switch (status) {
      case "pending":
        return { bg: "#facc15", text: "#854d0e" };
      case "delivered":
        return { bg: "#38bdf8", text: "#075985" };
      case "released":
        return { bg: "#22c55e", text: "#14532d" };
      case "refunded":
        return { bg: "#f87171", text: "#7f1d1d" };
      case "disputed":
        return { bg: "#f97316", text: "#7c2d12" };
      case "cancelled":
        return { bg: "#ef4444", text: "#7f1d1d" };
      default:
        return { bg: "#e2e8f0", text: "#334155" };
    }
  };

  const style = getStatusStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: style.bg + "20",
          borderColor: style.bg,
        },
      ]}
    >
      <Text style={{ color: style.bg, fontSize: 12, fontWeight: "600" }}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

/* ----------------- Tab Button ----------------- */
function TabButton({ label, active, onPress, theme }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        {
          backgroundColor: active ? theme.tabActive : "transparent",
        },
      ]}
    >
      <Text
        style={{
          color: active ? "#fff" : theme.textSecondary,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function NoEscrows({ activeTab }: any) {
  const { colors } = useTheme();

  return (
    <View style={[noEscrowsStyles.container, { backgroundColor: colors.card }]}>
      <View style={[noEscrowsStyles.card, { borderColor: colors.border }]}>
        {/* Icon */}
        <View
          style={[
            noEscrowsStyles.iconWrapper,
            { backgroundColor: colors.primary + "22" },
          ]}
        >
          <Feather name="box" size={40} color={colors.primary} />
        </View>

        {/* Message */}
        <Text style={[noEscrowsStyles.title, { color: colors.text }]}>
          No Escrows
        </Text>
        <Text
          style={[noEscrowsStyles.subtitle, { color: colors.textSecondary }]}
        >
          You currently have no {activeTab === "open" ? "active" : "completed"}{" "}
          escrows. Start by creating a new one to manage payments securely.
        </Text>
      </View>
    </View>
  );
}

const noEscrowsStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
  },
  iconWrapper: {
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

/* ----------------- Styles ----------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    height: 60,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { fontSize: 18, fontWeight: "700" },
  infoCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  infoText: { fontSize: 13, lineHeight: 18 },
  tabs: { flexDirection: "row", marginHorizontal: 20, marginBottom: 10 },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  card: { borderRadius: 20, padding: 18, marginBottom: 15 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    elevation: 5,
  },
  floatingText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
});
