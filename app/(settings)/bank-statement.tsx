import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { getStatement } from "@/services/wallet.service";
import { useUserStore } from "@/store/user.store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// --- Helper to normalize type for filtering ---

export default function BankStatementPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState<null | "start" | "end">(null);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const { user } = useUserStore();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data: any = await getStatement({
        userId: user?.id ?? "",
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      // Normalize type for filtering
      const mapped = (data.transactions ?? []).map((tx: any) => ({
        ...tx,
        filterType: tx.type,
      }));

      const final = mapped.filter((t: any) => t.status !== "failed");

      setTransactions(final);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const totalBalance = transactions.reduce((acc, t) => {
    if (filter === "all" || filter === t.filterType) {
      return t.filterType === "credit"
        ? acc + Number(t.amount)
        : acc - Number(t.amount);
    }
    return acc;
  }, 0);

  const formatDate = (d: Date) =>
    `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;

  const formatTime = (d: Date) =>
    `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;

  const renderTransaction = ({ item }: { item: any }) => {
    if (filter !== "all" && filter !== item.filterType) return null;

    return (
      <View
        style={[
          styles.transactionItem,
          { backgroundColor: isDark ? "#2E2E3A" : "#fff" },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.transactionTitle, { color: colors.textPrimary }]}
          >
            {item.description}
          </Text>
          <Text
            style={[styles.transactionDate, { color: colors.textSecondary }]}
          >
            {formatDate(new Date(item.date))}, {formatTime(new Date(item.date))}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.filterType === "credit" ? "#10B981" : "#EF4444" },
          ]}
        >
          {item.filterType === "credit" ? "+" : "-"}₦
          {Number(item.amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    );
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(null);
    if (selectedDate) {
      if (showPicker === "start") setStartDate(selectedDate);
      else if (showPicker === "end") setEndDate(selectedDate);
    }
  };

  type TransactionItem = {
    id: string | number;
    type: string;
    amount: number;
    status: string;
    description: string;
    date: string;
    reference?: string;
  };

  async function downloadStatementPDF(params: {
    fullName: string;
    accountNumber: string;
    startDate: string;
    endDate: string;
    transactions: TransactionItem[];
  }) {
    const { fullName, accountNumber, startDate, endDate, transactions } =
      params;

    const rows = transactions
      .map(
        (tx) => `
      <tr>
        <td>${new Date(tx.date).toLocaleDateString()}</td>
        <td>${tx.description}</td>
        <td>${tx.reference ?? "-"}</td>
        <td style="text-align:right;">
          ${tx.type.toLowerCase().includes("debit") ? tx.amount : "-"}
        </td>
        <td style="text-align:right;">
          ${tx.type.toLowerCase().includes("credit") ? tx.amount : "-"}
        </td>
      </tr>
    `,
      )
      .join("");

    const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          padding: 24px;
        }
        h2 {
          margin-bottom: 4px;
        }
        .meta {
          margin-bottom: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 6px;
        }
        th {
          background-color: #f3f3f3;
          text-align: left;
        }
        .footer {
          margin-top: 20px;
          font-size: 9px;
          color: #666;
        }
      </style>
    </head>

    <body>
    <h2>Arigopay wallet</h2>
      <h2>Account Statement</h2>

      <div class="meta">
        <div><strong>Account Holder Name:</strong> ${fullName}</div>
        <div><strong>Account payment reference:</strong> ${accountNumber}</div>
        <div><strong>Period:</strong> ${startDate} – ${endDate}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Reference</th>
            <th>Debit (₦)</th>
            <th>Credit (₦)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="footer">
        This statement is system generated and does not require a signature.
      </div>
    </body>
  </html>
  `;

    const file = await Print.printToFileAsync({
      html,
      base64: false,
    });

    await Sharing.shareAsync(file.uri);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 30,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Bank Statement
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            View transactions, total balance, and download PDF
          </Text>
        </View>
      </View>

      {/* Balance */}
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
          Total Balance
        </Text>
        <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>
          ₦
          {Number(totalBalance).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Date Range */}
      <Text style={{textAlign: 'center', marginBottom: 2, color: colors.textSecondary}}>Select Date Range:</Text>
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={[styles.dateButton, { borderColor: colors.border }]}
          onPress={() => setShowPicker("start")}
        >
          <Text style={{ color: colors.textPrimary }}>
            {formatDate(startDate)}
          </Text>
        </TouchableOpacity>
        <Text style={{ marginHorizontal: 8, color: colors.textSecondary }}>
          to
        </Text>
        <TouchableOpacity
          style={[styles.dateButton, { borderColor: colors.border }]}
          onPress={() => setShowPicker("end")}
        >
          <Text style={{ color: colors.textPrimary }}>
            {formatDate(endDate)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        {["all", "credit", "debit"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              { borderColor: colors.border, opacity: filter === f ? 1 : 0.6 },
            ]}
            onPress={() => setFilter(f as any)}
          >
            <Text
              style={{ color: colors.textPrimary, textTransform: "capitalize" }}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => `${item.id}-${item.description}`}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Download PDF */}
      <View
        style={[
          styles.downloadContainer,
          { paddingBottom: insets.bottom + 10 },
        ]}
      >
        <TouchableOpacity
          style={[styles.downloadButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            downloadStatementPDF({
              fullName: user?.fullname ?? "",
              accountNumber: user?.payment_code ?? "",
              startDate: startDate.toDateString(),
              endDate: endDate.toDateString(),
              transactions,
            });
          }}
        >
          <Ionicons
            name="download-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: "#fff", fontWeight: "600" }}>Download PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={showPicker === "start" ? startDate : endDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  backButton: { marginRight: 12, padding: 6, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  headerSubtitle: { fontSize: 12, marginTop: 2 },

  balanceContainer: { padding: 16, alignItems: "center", marginBottom: 8 },
  balanceLabel: { fontSize: 14 },
  balanceAmount: { fontSize: 24, fontWeight: "700" },

  dateRangeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },

  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  transactionTitle: { fontSize: 14, fontWeight: "600" },
  transactionDate: { fontSize: 12, marginTop: 2 },
  transactionAmount: { fontSize: 14, fontWeight: "600" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  downloadContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 16,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
});
