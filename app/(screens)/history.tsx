import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Transaction, useWalletStore } from "@/store/wallet.store";
import { formatCurrentDate } from "@/hooks/format.hook";
import NoTransaction from "@/components/NoTransaction";

export default function TransactionsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const { type } = useLocalSearchParams<{
    type: string;
  }>();

  const { wallet } = useWalletStore();
  const transactions =
    type === "airtime"
      ? wallet?.airtimeTransactions
      : type === "data"
        ? wallet?.dataTransactions
        : type === "withdraw"
          ? wallet?.withdrawTransactions
          : wallet?.transactions;

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "Payment Received"  || item.type === "Top-up";
    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 14,
          marginBottom: 12,
          borderWidth: 0.5,
          borderColor: colors.border,
        }}
        onPress={() =>
          router.push({
            pathname: "/transaction-details",
            params: { ...item },
          })
        }
        activeOpacity={0.8}
      >
        {/* Top Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: colors.textPrimary,
              fontWeight: "600",
              fontSize: 16,
              flex: 1, // 👈 REQUIRED
              marginRight: 12,
            }}
          >
            {item.description}
          </Text>

          <Text
            style={{
              color: isCredit ? "#22C55E" : "#EF4444",
              fontWeight: "700",
              fontSize: 16,
            }}
          >
            ₦{item.amount.toLocaleString()}
          </Text>
        </View>

        {/* Bottom Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
            }}
          >
            {formatCurrentDate(item.date)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: colors.background,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.card,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            Transactions
          </Text>
        </View>

        {!transactions || (transactions.length === 0 && <NoTransaction />) || (
          <FlatList
            data={transactions}
            keyExtractor={(item) => `${item.id}-${item.description}`}
            renderItem={renderTransaction}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </View>
  );
}
