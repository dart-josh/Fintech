import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
// import { transactions } from "@/utils/globalVariables";
import { useTheme } from "@/theme/ThemeContext";
import { Transaction, useWalletStore } from "@/store/wallet.store";
import { formatCurrentDate } from "@/hooks/format.hook";
import NoTransaction from "@/components/NoTransaction";

export default function TransactionsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const { wallet } = useWalletStore();
  const transactions = wallet?.transactions;

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "Payment Received";
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
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top + 20,
          paddingHorizontal: 16,
          paddingBottom: 20,
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
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: colors.accent,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 20 }}>💸</Text>
          </View>

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
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}
