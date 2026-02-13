import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useUserStore } from "@/store/user.store";
import {
  cancelEscrow,
  deliverEscrow,
  disputeEscrow,
  Escrow,
  EscrowTransaction,
  fundEscrow,
  getEscrow,
  refundEscrow,
  releaseEscrow,
} from "@/services/escrow.service";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function EscrowDetailScreen() {
  const insets = useSafeAreaInsets();
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useUserStore();
  const { colors } = useTheme();

  const isBuyer = escrow?.payer?.id === Number(user?.id);
  const isSeller = escrow?.payee?.id === Number(user?.id);

  async function reFetchEscrow() {
    try {
      setLoading(true);
      const response = await getEscrow({ escrowId: "2" });
      if (!response) {
        setError("Failed to refresh escrow");
      } else setEscrow(response);
    } catch {
      setError("Failed to refresh escrow");
    } finally {
      setLoading(false);
    }
  }

  const onFund = async () => {
    if (!escrow || !user) return;
    const escrowRef = await fundEscrow({
      escrowRef: escrow.escrow_ref,
      payerId: user.id,
    });

    if (escrowRef) {
      reFetchEscrow();
    }
  };

  const onRelease = async () => {
    if (!escrow || !user) return;
    const escrowRef = await releaseEscrow({
      escrowRef: escrow.escrow_ref,
      actorId: user.id,
    });

    if (escrowRef) {
      reFetchEscrow();
    }
  };

  const onApprove = async () => {
    if (!escrow || !user) return;
    const escrowRef = await deliverEscrow({
      escrowRef: escrow.escrow_ref,
      actorId: user.id,
    });

    if (escrowRef) {
      reFetchEscrow();
    }
  };

  const onRefund = async () => {
    if (!escrow || !user) return;
    const escrowRef = await refundEscrow({
      escrowRef: escrow.escrow_ref,
      actorId: user.id,
    });

    if (escrowRef) {
      reFetchEscrow();
    }
  };

  const onCancel = async () => {
    if (!escrow || !user) return;
    const escrowRef = await cancelEscrow({
      escrowRef: escrow.escrow_ref,
      actorId: user.id,
    });

    if (escrowRef) {
      reFetchEscrow();
    }
  };

  const onDispute = async () => {
    if (!escrow || !user) return;
    const escrowRef = await disputeEscrow({
      escrowRef: escrow.escrow_ref,
      actorId: user.id,
    });

    if (escrowRef) {
      reFetchEscrow();
    }
  };

  // Fetch escrow
  useEffect(() => {
    async function fetchEscrow() {
      try {
        setLoading(true);
        const response = await getEscrow({ escrowId: "2" }); // 1= seller; 2= buyer
        // console.log(response)
        if (!response) setError("Escrow not found");
        else setEscrow(response);
      } catch {
        setError("Failed to fetch escrow");
      } finally {
        setLoading(false);
      }
    }
    fetchEscrow();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          mainStyles.loaderContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          mainStyles.loaderContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <EscrowTopBar escrow={escrow} />
      </View>
    );
  }

  return (
    <View
      style={[
        mainStyles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <EscrowTopBar escrow={escrow} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      >
        {/* <CountdownTimer escrow={escrow} /> */}

        <EscrowAmountCard escrow={escrow} />
        <EscrowParties escrow={escrow} isBuyer={isBuyer} isSeller={isSeller} />
        <EscrowDescription escrow={escrow} />
        <EscrowTimeline escrow={escrow} />
      </ScrollView>

      <EscrowActions
        escrow={escrow}
        isBuyer={isBuyer}
        isSeller={isSeller}
        onRelease={onRelease}
        onApprove={onApprove}
        onFund={onFund}
        onRefund={onRefund}
        onCancel={onCancel}
        onDispute={onDispute}
      />
    </View>
  );
}

const mainStyles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

interface Props {
  escrow: Escrow | null;
}

function EscrowTopBar({ escrow }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const statusColors: Record<string, string> = {
    pending: "#FFA500",
    funded: "#00E5FF",
    released: "#0BF78B",
    refunded: "#FF4D4F",
    disputed: "#FF00FF",
    cancelled: "#888",
  };

  return (
    <View style={[topStyles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text
        style={[
          topStyles.title,
          { color: statusColors[escrow?.status || "pending"] },
        ]}
      >
        {escrow?.status.toUpperCase()}
      </Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

const topStyles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: { fontWeight: "600", fontSize: 16 },
});

function EscrowAmountCard({ escrow }: Props) {
  const { colors } = useTheme();
  const networkFee =
    escrow?.transactions
      ?.reduce((sum, tx) => sum + tx.amount, 0)
      .toLocaleString() || 0;

  return (
    <View style={[amountStyles.card, { backgroundColor: colors.card }]}>
      <Text style={{ color: colors.textSecondary }}>Locked Amount</Text>
      <Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>
        ₦{escrow?.amount.toLocaleString() || 0}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
        Network Fee: ₦{networkFee}
      </Text>
    </View>
  );
}

const amountStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    alignItems: "center",
  },
});

interface PartiesProps {
  escrow: Escrow | null;
  isBuyer: boolean;
  isSeller: boolean;
}

function EscrowParties({ escrow, isBuyer, isSeller }: PartiesProps) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[partiesStyles.title, { color: colors.textSecondary }]}>
        Parties
      </Text>

      <View style={[partiesStyles.card, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Buyer</Text>
        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
          {escrow?.payer?.full_name || "-"}
        </Text>
        {isBuyer && (
          <Text style={{ color: colors.primary, marginTop: 4 }}>You</Text>
        )}
      </View>

      <View style={[partiesStyles.card, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Seller
        </Text>
        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
          {escrow?.payee?.full_name || "-"}
        </Text>
        {isSeller && (
          <Text style={{ color: colors.primary, marginTop: 4 }}>You</Text>
        )}
      </View>
    </View>
  );
}

const partiesStyles = StyleSheet.create({
  title: { marginBottom: 8, fontSize: 13, letterSpacing: 1 },
  card: { padding: 16, borderRadius: 12, marginBottom: 10 },
});

function EscrowDescription({ escrow }: Props) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[descStyles.title, { color: colors.textSecondary }]}>
        Description
      </Text>
      <View style={[descStyles.card, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
          {escrow?.description || "No description provided."}
        </Text>
      </View>
    </View>
  );
}

const descStyles = StyleSheet.create({
  title: { marginBottom: 8, fontSize: 13, letterSpacing: 1 },
  card: { padding: 16, borderRadius: 12 },
});

function EscrowTimeline({ escrow }: Props) {
  const { colors } = useTheme();

  // Dummy timeline for preview
  const timeline: EscrowTransaction[] = escrow?.transactions?.length
    ? escrow.transactions
    : [
        {
          id: 1,
          escrow_id: 1,
          action: "fund",
          actor: escrow?.payer || {
            id: 1,
            full_name: "John Doe",
            username: "john",
          },
          amount: 50000,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          escrow_id: 1,
          action: "release",
          actor: escrow?.payee || {
            id: 2,
            full_name: "Jane Smith",
            username: "jane",
          },
          amount: 50000,
          created_at: new Date().toISOString(),
        },
      ];

  const isBuyer = (id: number) => id === escrow?.payer.id;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[timelineStyles.title, { color: colors.textSecondary }]}>
        Activity Timeline
      </Text>

      {timeline.map((item) => {
        const isActorBuyer = isBuyer(item.actor.id);
        const bubbleColor =
          item.action === "release" ? colors.success : colors.primary;

        return (
          <View
            key={item.id}
            style={[
              timelineStyles.row,
              { justifyContent: isActorBuyer ? "flex-start" : "flex-end" },
            ]}
          >
            <View
              style={[
                timelineStyles.bubble,
                {
                  backgroundColor: bubbleColor,
                  borderTopLeftRadius: isActorBuyer ? 0 : 12,
                  borderTopRightRadius: isActorBuyer ? 12 : 0,
                },
              ]}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: "500" }}>
                {item.action.toUpperCase()}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 12 }}>
                ₦{item.amount.toLocaleString()}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 10 }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          </View>
        );
      })}

      {/* <FlatList
        data={timeline}
        keyExtractor={(item) => item.id.toString()}
        inverted
        renderItem={({ item }) => {
          const isActorBuyer = isBuyer(item.actor.id);
          const bubbleColor =
            item.action === "release" ? colors.success : colors.primary;

          return (
            <View
            key={item.id}
              style={[
                timelineStyles.row,
                { justifyContent: isActorBuyer ? "flex-start" : "flex-end" },
              ]}
            >
              <View
                style={[
                  timelineStyles.bubble,
                  {
                    backgroundColor: bubbleColor,
                    borderTopLeftRadius: isActorBuyer ? 0 : 12,
                    borderTopRightRadius: isActorBuyer ? 12 : 0,
                  },
                ]}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: "500" }}>
                  {item.action.toUpperCase()}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 12 }}>
                  ₦{item.amount.toLocaleString()}
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: 10 }}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          );
        }}
      /> */}
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  title: { marginBottom: 8, fontSize: 13, letterSpacing: 1 },
  row: { flexDirection: "row", marginBottom: 10 },
  bubble: { padding: 12, borderRadius: 12, maxWidth: "70%" },
});

interface ActionProps {
  escrow: Escrow | null;
  isBuyer: boolean;
  isSeller: boolean;
  onRelease: () => void;
  onApprove: () => void;
  onFund: () => void;
  onRefund: () => void;
  onCancel: () => void;
  onDispute: () => void;
}

function EscrowActions({
  escrow,
  isBuyer,
  isSeller,
  onRelease,
  onApprove,
  onFund,
  onRefund,
  onCancel,
  onDispute,
}: ActionProps) {
  const { colors } = useTheme();

  if (!escrow) return null;

  return (
    <View style={[actionStyles.container]}>
      {/* fund */}
      {escrow.status === "pending" && isBuyer && (
        <TouchableOpacity
          style={[
            actionStyles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={onFund}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
            Fund escrow
          </Text>
        </TouchableOpacity>
      )}

      {/* deliver */}
      {escrow.status === "funded" && isSeller && (
        <TouchableOpacity
          style={[
            actionStyles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={onApprove}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
            Mark as Delivered
          </Text>
        </TouchableOpacity>
      )}

      {/* release */}
      {escrow.status === "delivered" && isBuyer && (
        <TouchableOpacity
          style={[
            actionStyles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={onRelease}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
            Release Funds
          </Text>
        </TouchableOpacity>
      )}

      {/* refund */}
      {escrow.status === "funded" && isSeller && (
        <TouchableOpacity
          style={[
            actionStyles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={onRefund}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
            Refund Buyer
          </Text>
        </TouchableOpacity>
      )}

      {/* dispute */}
      {(escrow.status === "funded" || escrow.status === "delivered") && (
        <TouchableOpacity
          style={[
            actionStyles.secondaryButton,
            { borderColor: colors.primary },
          ]}
          onPress={onDispute}
        >
          <Text style={{ color: colors.primary }}>Open Dispute</Text>
        </TouchableOpacity>
      )}

      {/* cancel */}
      {escrow.status === "pending" && (
        <TouchableOpacity
          style={[actionStyles.cancelButton, { backgroundColor: colors.card }]}
          onPress={onCancel}
        >
          <Text style={{ color: colors.danger, fontWeight: "600" }}>
            Cancel Escrow
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const actionStyles = StyleSheet.create({
  container: { position: "absolute", bottom: 20, left: 16, right: 16 },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 10,
  },
  cancelButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
});

function CountdownTimer({ escrow }: Props) {
  const { colors } = useTheme();
  const [timeLeft, setTimeLeft] = useState<string>("Calculating...");
  const expiry = new Date(escrow?.expires_at ?? "");

  const fullPage = false;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = expiry.getTime() - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}h : ${minutes
          .toString()
          .padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [escrow?.expires_at]);

  return (
    <View
      style={[
        timerStyles.container,
        fullPage && { flex: 1, justifyContent: "center", alignItems: "center" },
      ]}
    >
      <View
        style={[
          timerStyles.timerBox,
          { borderColor: colors.primary, backgroundColor: colors.card },
          fullPage && { width: Dimensions.get("window").width * 0.9 },
        ]}
      >
        <Text style={[timerStyles.timeText, { color: colors.primary }]}>
          {timeLeft}
        </Text>
        <Text style={[timerStyles.expiryText, { color: colors.textSecondary }]}>
          Expiry: {expiry.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const timerStyles = StyleSheet.create({
  container: { padding: 16 },
  timerBox: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  timeText: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 2,
    fontFamily: "Courier", // futuristic monospaced
  },
  expiryText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 1,
  },
});
