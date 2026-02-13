import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
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
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import ConfirmEscrowFundingModal from "@/components/ConfirmEscrowFundingModal";
import { useWalletStore } from "@/store/wallet.store";
import { useToastStore } from "@/store/toast.store";
import { verifyTxPin } from "@/services/auth.service";
import PinModal from "@/components/PinModal";
import { useConfirmStore } from "@/store/confirmation.store";
import { useEscrowStore } from "@/store/escrow.store";

export default function EscrowDetailScreen() {
  const insets = useSafeAreaInsets();
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [fundingModalVisible, setFundingModalVisible] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [pinError, setPinError] = useState("");

  const { user } = useUserStore();
  const { wallet } = useWalletStore();

  const { colors } = useTheme();
  const toast = useToastStore();

  const isBuyer = escrow?.payer?.id === Number(user?.id);
  const isSeller = escrow?.payee?.id === Number(user?.id);

  const { escrowRef } = useLocalSearchParams<{
    escrowRef: string;
  }>();

  async function reFetchEscrow() {
    if (!escrowRef) return;

    try {
      setLoading(true);
      const response = await getEscrow({ escrowRef });

      if (!response) {
        setError("Failed to refresh escrow");
      } else {
        useEscrowStore.getState().updateEscrow(escrowRef, response);
        setEscrow(response);
      }
    } catch {
      setError("Failed to refresh escrow");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- Funding
  const onFund = async () => {
    if (!escrow || !user) return;
    setFundingModalVisible(true);
  };

  const handleConfirmFunding = () => {
    setFundingModalVisible(false);
    if (user?.transaction_pin) {
      setPinVisible(true);
    } else {
      toast.show({ type: "warning", message: "Transaction PIN Not set" });
    }
  };

  const handlePinComplete = async (pin: string) => {
    setIsLoading(true);
    setPinError("");

    const valid = await verifyTxPin({ userId: user?.id ?? "", pin });
    if (!valid) {
      setPinError("Invalid PIN");
      setIsLoading(false);
      return;
    }

    setPinVisible(false);

    try {
      if (!escrow || !user) return;
      const escrowRef = await fundEscrow({
        escrowRef: escrow.escrow_ref,
        payerId: user.id,
      });

      if (escrowRef) {
        reFetchEscrow();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------

  const confirm = useConfirmStore((state) => state.confirm);

  const onRelease = async () => {
    if (!escrow || !user) return;
    const confirmed = await confirm({
      title: "Release Funds",
      subtitle: "You're about to release escrow funds",
      message: "Please ensure you have confirmed delivery.",
      warning: "This action cannot be undone.",
      confirmText: "Release Now",
      danger: false,
      icon: <Feather name="check-circle" size={28} color="#22c55e" />,
    });

    if (!confirmed) return;

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

    const confirmed = await confirm({
      title: "Mark as Delivered",
      message: "Confirm that you have delivered this item.",
      confirmText: "Confirm Delivery",
      icon: <Feather name="package" size={28} color="#3b82f6" />,
    });

    if (!confirmed) return;

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

    const confirmed = await confirm({
      title: "Issue Refund",
      message: "The funds will be returned to the buyer.",
      warning: "This action cannot be undone.",
      confirmText: "Refund",
      danger: true,
      icon: <MaterialIcons name="undo" size={28} color="#ef4444" />,
    });

    if (!confirmed) return;

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

    const confirmed = await confirm({
      title: "Cancel Transaction",
      warning: "This will permanently cancel the escrow.",
      confirmText: "Cancel Escrow",
      danger: true,
      icon: <Feather name="x-circle" size={28} color="#ef4444" />,
    });

    if (!confirmed) return;

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

    const confirmed = await confirm({
      title: "Open Dispute",
      message:
        "Our team will review this transaction and an action will be taken",
      warning: "This action cannot be undone",
      confirmText: "Open Dispute",
      icon: <Feather name="alert-triangle" size={28} color="#f59e0b" />,
    });

    if (!confirmed) return;

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
      if (!escrowRef) return;

      try {
        setLoading(true);
        const response = await getEscrow({ escrowRef }); // 1= seller; 2= buyer
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
        <EscrowAmountCard escrow={escrow} onCancel={onCancel} />
        <EscrowDescription description={escrow?.description} />
        <EscrowParties escrow={escrow} isBuyer={isBuyer} isSeller={isSeller} />
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

      {fundingModalVisible && (
        <ConfirmEscrowFundingModal
          visible={fundingModalVisible}
          onClose={() => setFundingModalVisible(false)}
          amount={escrow?.amount ?? 0}
          escrowTitle={escrow?.description ?? "No description provided"}
          sellerName={escrow?.payee.full_name ?? ""}
          userBalance={wallet?.balance ?? ""}
          onConfirm={handleConfirmFunding}
        />
      )}

      {pinVisible && (
        <PinModal
          visible={pinVisible}
          onClose={() => setPinVisible(false)}
          onComplete={handlePinComplete}
          error={pinError}
          isLoading={isLoading}
        />
      )}
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
  const { colors, theme } = useTheme();

  const isDark = theme === "dark";

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const statusColors: Record<string, string> = {
    pending: "#FFA500",
    funded: "#00E5FF",
    delivered: "#3B82F6",
    released: "#0BF78B",
    refunded: "#FF4D4F",
    disputed: "#FF00FF",
    cancelled: "#888",
  };

  const status = escrow?.status || "pending";
  const statusColor = statusColors[status];

  return (
    <View
      style={[
        topStyles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: isDark ? "#222" : "#EEE",
        },
      ]}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={topStyles.iconWrapper}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      {/* Center Info */}
      <View style={topStyles.center}>
        <View
          style={[
            topStyles.statusBadge,
            { backgroundColor: `${statusColor}20` },
          ]}
        >
          <Animated.View
            style={[
              topStyles.statusDot,
              {
                backgroundColor: statusColor,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Text style={[topStyles.statusText, { color: statusColor }]}>
            {status.toUpperCase()}
          </Text>
        </View>

        {escrow?.escrow_ref && (
          <Text
            style={[topStyles.reference, { color: isDark ? "#AAA" : "#666" }]}
          >
            #{escrow.escrow_ref}
          </Text>
        )}
      </View>

      {/* Placeholder for symmetry */}
      <View style={{ width: 40 }} />
    </View>
  );
}

const topStyles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 4,
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 30,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  statusText: {
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  reference: {
    marginTop: 4,
    fontSize: 11,
  },
});

interface AmountProps {
  escrow: any;
  onCancel?: () => void;
}

function EscrowAmountCard({ escrow, onCancel }: AmountProps) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const formatMoney = (value: number) =>
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const networkFee =
    escrow?.transactions?.reduce(
      (sum: number, tx: any) => sum + Number(tx.amount),
      0,
    ) || 0;

  const status = escrow?.status || "pending";

  const getStatusLabel = () => {
    if (status === "pending") return "Awaiting Payment";
    if (status === "released") return "Released";
    if (status === "refunded") return "Refunded";
    if (status === "cancelled") return "Cancelled";
    if (status === "disputed") return "Disputed";
    return "Locked";
  };

  function formatMiniCountdown(expiry: string) {
    const diff = new Date(expiry).getTime() - Date.now();
    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  return (
    <View
      style={[
        amountStyles.card,
        {
          backgroundColor: colors.card,
          borderColor: isDark ? "#222" : "#EEE",
        },
      ]}
    >
      {/* Top Row */}
      <View>
        <View style={amountStyles.topRow}>
          <Text style={[amountStyles.label, { color: colors.textSecondary }]}>
            {getStatusLabel()}
          </Text>
          {/* Mini Countdown Crumb */}
          {escrow?.expires_at && status !== "released" && (
            <View style={amountStyles.countdownCrumb}>
              <Ionicons name="time-outline" size={12} color="#00E5FF" />
              <Text style={amountStyles.countdownText}>
                {formatMiniCountdown(escrow.expires_at)}
              </Text>
            </View>
          )}
        </View>
        <Text style={[amountStyles.amount, { color: colors.text }]}>
          ₦{formatMoney(escrow?.amount)}
        </Text>
      </View>

      {/* Network Fee */}
      <Text style={[amountStyles.feeText, { color: colors.textSecondary }]}>
        Network Fee: ₦{formatMoney(networkFee)}
      </Text>

      {/* Progress Bar */}
      <ProgressTracker status={status} />

      {/* Cancel Button */}
      {status === "pending" && (
        <TouchableOpacity style={amountStyles.cancelButton} onPress={onCancel}>
          <Ionicons name="close-circle-outline" size={16} color="#FF4D4F" />
          <Text style={amountStyles.cancelText}>Cancel Escrow</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ProgressTracker({ status }: { status: string }) {
  const steps = ["pending", "funded", "delivered", "released"];

  const finalStates = ["refunded", "disputed", "cancelled"];

  const currentIndex = steps.indexOf(status);

  return (
    <View style={progressStyles.container}>
      {steps.map((step, index) => {
        const active = currentIndex >= index || finalStates.includes(status);

        return (
          <View key={step} style={progressStyles.stepWrapper}>
            <View
              style={[
                progressStyles.circle,
                {
                  backgroundColor: active ? "#3B82F6" : "#2A2A2A",
                },
              ]}
            />
            {index !== steps.length - 1 && (
              <View
                style={[
                  progressStyles.line,
                  {
                    backgroundColor: active ? "#3B82F6" : "#2A2A2A",
                  },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const amountStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
  },

  amount: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  feeText: {
    fontSize: 12,
    marginTop: 8,
  },

  countdownCrumb: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,229,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  countdownText: {
    fontSize: 11,
    color: "#00E5FF",
    marginLeft: 4,
  },

  cancelButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  cancelText: {
    marginLeft: 6,
    color: "#FF4D4F",
    fontWeight: "600",
    fontSize: 13,
  },
});

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
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
    <View style={{ marginBottom: 24 }}>
      <Text style={[partiesStyles.title, { color: colors.textSecondary }]}>
        Parties
      </Text>

      <View style={partiesStyles.row}>
        {/* Buyer Card */}
        <View
          style={[
            partiesStyles.card,
            { backgroundColor: colors.card, shadowColor: colors.primary },
          ]}
        >
          <Text style={[partiesStyles.role, { color: colors.textSecondary }]}>
            Buyer
          </Text>
          <Text style={[partiesStyles.name, { color: colors.text }]}>
            {escrow?.payer?.full_name || "-"}
          </Text>
          {isBuyer && (
            <View
              style={[
                partiesStyles.youBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={partiesStyles.youText}>You</Text>
            </View>
          )}
        </View>

        {/* Seller Card */}
        <View
          style={[
            partiesStyles.card,
            { backgroundColor: colors.card, shadowColor: colors.primary },
          ]}
        >
          <Text style={[partiesStyles.role, { color: colors.textSecondary }]}>
            Seller
          </Text>
          <Text style={[partiesStyles.name, { color: colors.text }]}>
            {escrow?.payee?.full_name || "-"}
          </Text>
          {isSeller && (
            <View
              style={[
                partiesStyles.youBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={partiesStyles.youText}>You</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const partiesStyles = StyleSheet.create({
  title: {
    marginBottom: 12,
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: "600",
  },

  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },

  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  role: { fontSize: 12, marginBottom: 6 },

  name: { fontSize: 16, fontWeight: "700" },

  youBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },

  youText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
});

interface DescriptionProps {
  description?: string | null;
}

function EscrowDescription({ description }: DescriptionProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded((prev) => !prev);

  const displayText = description || "No description provided.";

  const isLong = displayText.length > 30;

  return (
    <View style={[descStyles.container]}>
      <Text style={[descStyles.label, { color: colors.textSecondary }]}>
        Description
      </Text>

      <Text
        style={[descStyles.text, { color: colors.text }]}
        numberOfLines={expanded ? undefined : 1}
        ellipsizeMode="tail"
      >
        {displayText}
      </Text>

      {isLong && !expanded && (
        <TouchableOpacity onPress={toggleExpand}>
          <Text style={[descStyles.moreText, { color: colors.primary }]}>
            More
          </Text>
        </TouchableOpacity>
      )}

      {expanded && isLong && (
        <TouchableOpacity onPress={toggleExpand}>
          <Text style={[descStyles.moreText, { color: colors.primary }]}>
            Less
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const descStyles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 16,
    paddingHorizontal: 16,
  },

  label: {
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: "600",
    marginBottom: 4,
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
  },

  moreText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
});

function EscrowTimeline({ escrow }: Props) {
  const { colors } = useTheme();
  const { user } = useUserStore();

  // Use escrow transactions or dummy preview
  const timeline: EscrowTransaction[] = escrow?.transactions?.length
    ? escrow.transactions
    : [];

  const isBuyer = (id: number) => id === escrow?.payer.id;
  const isYou = (id: number) => id === Number(user?.id);

  const actionColors: Record<string, string> = {
    fund: "#00E5FF",
    release: "#0BF78B",
    refund: "#FF4D4F",
    dispute: "#FF00FF",
    deliver: "#FFD700",
    cancel: "#888",
  };

  const showAmount = (action: string) => {
    return ["fund", "release", "refund"].includes(action);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[timelineStyles.title, { color: colors.textSecondary }]}>
        Activity Timeline
      </Text>

      {timeline.map((item, index) => {
        const isActorBuyer = isBuyer(item.actor.id);
        const isActorYou = isYou(item.actor.id);
        const bubbleColor = actionColors[item.action] || colors.primary;
        // const nextItem = timeline[index - 1];

        return (
          <View
            key={item.id.toString()}
            style={[
              timelineStyles.row,
              { justifyContent: isActorBuyer ? "flex-start" : "flex-end" },
            ]}
          >
            {/* Bubble */}
            <View
              style={[
                timelineStyles.bubble,
                {
                  backgroundColor: bubbleColor,
                  borderTopLeftRadius: isActorBuyer ? 0 : 16,
                  borderTopRightRadius: isActorBuyer ? 16 : 0,
                  shadowColor: bubbleColor,
                },
              ]}
            >
              <Text
                style={[
                  timelineStyles.actionText,
                  { color: colors.textPrimary },
                ]}
              >
                {item.action.toUpperCase()}
              </Text>
              {showAmount(item.action) && (
                <Text
                  style={[
                    timelineStyles.amountText,
                    { color: colors.textPrimary },
                  ]}
                >
                  ₦
                  {Number(item.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              )}
              <Text
                style={[
                  timelineStyles.timeText,
                  { color: colors.textSecondary },
                ]}
              >
                {new Date(item.created_at).toLocaleString()}
              </Text>
              <Text
                style={[
                  timelineStyles.actorText,
                  { color: colors.textSecondary },
                ]}
              >
                {item.actor.full_name} {isActorYou ? "(You)" : ""}
              </Text>
            </View>
            {/*  */}
          </View>
        );
      })}
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  title: {
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  row: { flexDirection: "row", marginBottom: 16, alignItems: "flex-start" },

  bubble: {
    padding: 14,
    borderRadius: 16,
    maxWidth: "70%",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  actionText: { fontWeight: "700", fontSize: 14, marginBottom: 4 },
  amountText: { fontSize: 12, marginBottom: 2 },
  timeText: { fontSize: 10, marginBottom: 2 },
  actorText: { fontSize: 11, fontStyle: "italic" },

  connector: {
    width: 2,
    flex: 1,
    borderRadius: 1,
    marginVertical: 4,
    opacity: 0.5,
  },
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
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  if (!escrow) return null;

  return (
    <View
      style={[
        actionStyles.container,
        { backgroundColor: colors.backgroundOff, bottom: 20 },
      ]}
    >
      {/* ================= PENDING ================= */}
      {escrow.status === "pending" && (
        <>
          {isBuyer ? (
            <>
              <Text
                style={[actionStyles.label, { color: colors.textSecondary }]}
              >
                Secure the transaction by funding this escrow
              </Text>

              <View style={actionStyles.row}>
                <TouchableOpacity
                  style={[
                    actionStyles.primaryButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={onFund}
                >
                  <Feather name="credit-card" size={18} color={"#F8FAFC"} />
                  <Text
                    style={[actionStyles.primaryText, { color: "#F8FAFC" }]}
                  >
                    Fund Escrow
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View
              style={[actionStyles.infoBox, { borderColor: colors.border }]}
            >
              <Feather name="clock" size={16} color={colors.textSecondary} />
              <Text
                style={[actionStyles.infoText, { color: colors.textSecondary }]}
              >
                Awaiting Buyer Payment
              </Text>
            </View>
          )}
        </>
      )}

      {/* ================= FUNDED ================= */}
      {escrow.status === "funded" && (
        <>
          {isSeller ? (
            <>
              <Text
                style={[actionStyles.label, { color: colors.textSecondary }]}
              >
                Confirm delivery or return funds to the buyer
              </Text>

              <View style={actionStyles.row}>
                {/* Deliver */}
                <TouchableOpacity
                  style={[
                    actionStyles.primaryButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={onApprove}
                >
                  <Feather name="package" size={18} color="#F8FAFC" />
                  <Text
                    style={[actionStyles.primaryText, { color: "#F8FAFC" }]}
                  >
                    Deliver
                  </Text>
                </TouchableOpacity>

                {/* Refund */}
                <TouchableOpacity
                  style={[
                    actionStyles.primaryButton,
                    { backgroundColor: "#FF4D4F" },
                  ]}
                  onPress={onRefund}
                >
                  <Feather name="rotate-ccw" size={18} color="#F8FAFC" />
                  <Text
                    style={[actionStyles.primaryText, { color: "#F8FAFC" }]}
                  >
                    Refund
                  </Text>
                </TouchableOpacity>

                {/* Dispute */}
                <TouchableOpacity
                  style={[
                    actionStyles.secondaryButton,
                    { borderColor: colors.primary },
                  ]}
                  onPress={onDispute}
                >
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={actionStyles.row}>
              <View
                style={[
                  actionStyles.infoBox,
                  { borderColor: colors.border, flex: 1 },
                ]}
              >
                <Feather name="shield" size={16} color={colors.textSecondary} />
                <Text
                  style={[
                    actionStyles.infoText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Awaiting Seller Delivery Confirmation
                </Text>
              </View>
              {/* Dispute */}
              <TouchableOpacity
                style={[
                  actionStyles.secondaryButton,
                  { borderColor: colors.primary },
                ]}
                onPress={onDispute}
              >
                <Feather
                  name="alert-triangle"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* ================= DELIVERED ================= */}
      {escrow.status === "delivered" && (
        <>
          {isBuyer ? (
            <>
              <Text
                style={[actionStyles.label, { color: colors.textSecondary }]}
              >
                Review and release funds to complete the escrow
              </Text>

              <View style={actionStyles.row}>
                <TouchableOpacity
                  style={[
                    actionStyles.primaryButton,
                    { backgroundColor: colors.success },
                  ]}
                  onPress={onRelease}
                >
                  <Feather name="check-circle" size={18} color={"#F8FAFC"} />
                  <Text
                    style={[actionStyles.primaryText, { color: "#F8FAFC" }]}
                  >
                    Release Funds
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    actionStyles.secondaryButton,
                    { borderColor: colors.primary },
                  ]}
                  onPress={onDispute}
                >
                  <Feather
                    name="alert-triangle"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={actionStyles.row}>
              <View
                style={[
                  actionStyles.infoBox,
                  { borderColor: colors.border, flex: 1 },
                ]}
              >
                <Feather name="shield" size={16} color={colors.textSecondary} />
                <Text
                  style={[
                    actionStyles.infoText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Awaiting Buyer Fund Release
                </Text>
              </View>
              {/* Dispute */}
              <TouchableOpacity
                style={[
                  actionStyles.secondaryButton,
                  { borderColor: colors.primary },
                ]}
                onPress={onDispute}
              >
                <Feather
                  name="alert-triangle"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* ================= REFUND OPTION ================= */}
      {/* {escrow.status === "funded" && isSeller && (
      <>
        <Text style={[actionStyles.label, { color: colors.textSecondary }]}>
          Return funds to the buyer if necessary
        </Text>

        <View style={actionStyles.row}>
          <TouchableOpacity
            style={[
              actionStyles.primaryButton,
              { backgroundColor: "#FF4D4F" },
            ]}
            onPress={onRefund}
          >
            <Feather name="rotate-ccw" size={18} color={colors.textPrimary} />
            <Text style={[actionStyles.primaryText, { color: "#1E293B" }]}>
              Refund Buyer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              actionStyles.secondaryButton,
              { borderColor: colors.primary },
            ]}
            onPress={onDispute}
          >
            <Feather name="alert-triangle" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </>
    )} */}
    </View>
  );

  // return (
  //   <View style={[actionStyles.container]}>
  //     {/* fund */}
  //     {escrow.status === "pending" && isBuyer && (
  //       <TouchableOpacity
  //         style={[
  //           actionStyles.primaryButton,
  //           { backgroundColor: colors.primary },
  //         ]}
  //         onPress={onFund}
  //       >
  //         <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
  //           Fund escrow
  //         </Text>
  //       </TouchableOpacity>
  //     )}

  //     {/* deliver */}
  //     {escrow.status === "funded" && isSeller && (
  //       <TouchableOpacity
  //         style={[
  //           actionStyles.primaryButton,
  //           { backgroundColor: colors.primary },
  //         ]}
  //         onPress={onApprove}
  //       >
  //         <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
  //           Mark as Delivered
  //         </Text>
  //       </TouchableOpacity>
  //     )}

  //     {/* release */}
  //     {escrow.status === "delivered" && isBuyer && (
  //       <TouchableOpacity
  //         style={[
  //           actionStyles.primaryButton,
  //           { backgroundColor: colors.primary },
  //         ]}
  //         onPress={onRelease}
  //       >
  //         <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
  //           Release Funds
  //         </Text>
  //       </TouchableOpacity>
  //     )}

  //     {/* refund */}
  //     {escrow.status === "funded" && isSeller && (
  //       <TouchableOpacity
  //         style={[
  //           actionStyles.primaryButton,
  //           { backgroundColor: colors.primary },
  //         ]}
  //         onPress={onRefund}
  //       >
  //         <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
  //           Refund Buyer
  //         </Text>
  //       </TouchableOpacity>
  //     )}

  //     {/* dispute */}
  //     {(escrow.status === "funded" || escrow.status === "delivered") && (
  //       <TouchableOpacity
  //         style={[
  //           actionStyles.secondaryButton,
  //           { borderColor: colors.primary },
  //         ]}
  //         onPress={onDispute}
  //       >
  //         <Text style={{ color: colors.primary }}>Open Dispute</Text>
  //       </TouchableOpacity>
  //     )}
  //   </View>
  // );
}

const actionStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)", // glass effect
    backdropFilter: "blur(20px)",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  label: {
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 0.5,
    fontWeight: "500",
  },

  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  primaryText: {
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  cancelButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  infoText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
