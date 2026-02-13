import { formatToMonthDay } from "@/hooks/format.hook";
import { useWalletStore } from "@/store/wallet.store";
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface Props {
  isDark: boolean;
}

const screenWidth = Dimensions.get("window").width;

export default function SpendingInsights({ isDark }: Props) {
  const { wallet } = useWalletStore();

  const transactions = wallet?.transactions.filter(
    (t) =>
      t.type !== "Top-up" &&
      t.type !== "Payment Received" &&
      t.status !== "failed",
  );
  const data = transactions?.slice(0, 7).reverse() ?? [];

  if (!data || data.length === 0) {
    return <NoTransaction />;
  }

  const amounts = data.map((t) => Number(t.amount));
  const labels = data.map((t) => formatToMonthDay(t.date));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#FFF" : "#000" }]}>
        Spending Insights
      </Text>

      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: amounts,
            },
          ],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: isDark ? "#1E1E1E" : "#FFFFFF",
          backgroundGradientTo: isDark ? "#1E1E1E" : "#FFFFFF",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(59,130,246, ${opacity})`,
          labelColor: () => (isDark ? "#AAA" : "#666"),
          propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#3B82F6",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      <View style={styles.legend}>
        <LegendItem color="#3B82F6" label="Transaction Amount" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function NoTransaction() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No transaction data available</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },

  legend: {
    flexDirection: "row",
    marginTop: 12,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },

  legendText: {
    fontSize: 12,
    color: "#888",
  },

  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#888",
  },
});
