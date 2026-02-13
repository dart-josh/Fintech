import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useToastStore } from "@/store/toast.store";
import { LinearGradient } from "expo-linear-gradient";
import { fetchUser } from "@/services/user.service";
import { useRegisterStore } from "@/store/register.store";
import { useUserStore } from "@/store/user.store";
import * as Clipboard from "expo-clipboard";
import { useWalletStore } from "@/store/wallet.store";
import { capitalizeFirst } from "@/hooks/format.hook";
import { useUIStore } from "@/store/ui.store";
import { registerForPushNotifications } from "@/services/notification.service";
import * as SecureStore from "expo-secure-store";
import { DedicatedAccountModal } from "@/components/DedicatedAccountModal";
import { sendEmailCode } from "@/services/auth.service";
import SpendingInsights from "@/components/SpendingInsights";

// MAIN DASHBOARD SCREEN

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const { showBalance } = useUIStore();

  const [balanceVisible, setBalanceVisible] = useState(showBalance);
  const [refreshing, setRefreshing] = useState(false);

  const { userId } = useRegisterStore();

  const { user, verificationDetails } = useUserStore();

  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser(userId);

    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  useEffect(() => {
    setBalanceVisible(showBalance);
  }, [showBalance]);

  useEffect(() => {
    const getAppPreference = async (): Promise<boolean | null> => {
      const value = await SecureStore.getItemAsync("showAppNotif");
      if (!value) return null;
      const showNotif = value === "true";
      return showNotif;
    };

    const getToken = async () => {
      const showNotif = await getAppPreference();
      if (showNotif === null) await registerForPushNotifications();
      if (showNotif === true) {
        await registerForPushNotifications();
      }
    };

    getToken();
  }, []);

  const f_name = user?.fullname ? user?.fullname.split(" ")[0] : "";
  const fname = capitalizeFirst(f_name);

  return (
    <View
      style={[
        DashboardStyles.container,
        { backgroundColor: isDark ? "#121212" : "#eeeeee" },
      ]}
    >
      {/* FIXED TOP BAR */}
      <View
        style={[
          DashboardStyles.topBarWrapper,
          {
            paddingTop: insets.top + 12,
            backgroundColor: isDark ? "#121212" : "#eeeeee",
          },
        ]}
      >
        <TopBar
          firstName={fname}
          verified={verificationDetails?.userVerified ?? false}
          isDark={isDark}
        />
      </View>
      {/* SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          DashboardStyles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary} // iOS spinner
            colors={[colors.primary]} // Android spinner
            progressBackgroundColor={isDark ? "#1E1E1E" : "#FFFFFF"}
          />
        }
      >
        <WalletInfo
          balanceVisible={balanceVisible}
          setBalanceVisible={setBalanceVisible}
          isDark={isDark}
        />

        <QuickActions isDark={isDark} setModalVisible={setModalVisible} />

        <EventBox
          title="ArigoPay Launch Event"
          subtitle="Mar 01, 2026 | 10:00 AM"
        />

        <RecentTransactions isDark={isDark} />

        <SpendingInsights isDark={isDark} />
      </ScrollView>

      <DedicatedAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const DashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topBarWrapper: {
    zIndex: 10,
    paddingHorizontal: 20,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16, // spacing below top bar
  },
});

export default DashboardScreen;

/////////////////////// COMPONENTS ///////////////////////

// 1. TOP BAR
const TopBar = ({ firstName, verified, isDark }: any) => {
  const router = useRouter();
  const { notifications } = useUserStore();

  const isUnRead = notifications.filter((not) => !not.is_read);
  const pendingNots = isUnRead.length > 0;

  return (
    <View style={TopBarStyles.container}>
      <TouchableOpacity
        style={TopBarStyles.profileContainer}
        onPress={() => router.push("/profile-page")}
      >
        <View
          style={[TopBarStyles.profileCircle, { backgroundColor: "#4B7BEC" }]}
        >
          <Text style={TopBarStyles.profileInitials}>
            {firstName[0]?.toUpperCase() ?? ""}
          </Text>
        </View>
        {verified && (
          // <View style={TopBarStyles.verificationBadge}>
          <Ionicons
            name="checkmark-circle"
            size={12}
            color="#4ADE80"
            style={TopBarStyles.verificationBadge}
          />
          // </View>
        )}
      </TouchableOpacity>

      <View style={TopBarStyles.welcomeContainer}>
        <Text
          style={[
            TopBarStyles.welcomeLabel,
            { color: isDark ? "#ccc" : "#555" },
          ]}
        >
          Welcome
        </Text>
        <Text
          style={[
            TopBarStyles.usernameLabel,
            { color: isDark ? "#fff" : "#000" },
          ]}
        >
          {firstName}
        </Text>
      </View>

      <View style={TopBarStyles.topBarIcons}>
        <TouchableOpacity
          onPress={() => router.push("/chat-page")}
          style={[
            TopBarStyles.iconWrapper,
            { backgroundColor: isDark ? "#fff1" : "#00000010" },
          ]}
        >
          <Feather
            name="message-circle"
            size={20}
            color={isDark ? "#fff" : "#555"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          style={[
            TopBarStyles.iconWrapper,
            { backgroundColor: isDark ? "#fff1" : "#00000010" },
          ]}
        >
          <View>
            <Feather name="bell" size={20} color={isDark ? "#fff" : "#555"} />
            {pendingNots && <View style={TopBarStyles.notificationDot} />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TopBarStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  profileContainer: { position: "relative" },
  profileCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: { color: "#fff", fontWeight: "bold" },
  verificationBadge: {
    position: "absolute",
    bottom: 0,
    right: -2,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  welcomeContainer: { marginLeft: 10 },
  welcomeLabel: { fontSize: 12 },
  usernameLabel: { fontWeight: "bold", fontSize: 14 },
  topBarIcons: { flexDirection: "row", marginLeft: "auto" },
  iconWrapper: { marginHorizontal: 5, padding: 8, borderRadius: 10 },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    position: "absolute",
    top: 0,
    right: 0,
  },
});

const toast = useToastStore.getState();

// 2. WALLET INFO
const WalletInfo = ({ balanceVisible, setBalanceVisible, isDark }: any) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, verificationDetails } = useUserStore();
  const { wallet } = useWalletStore();
  const emailVerified = user?.emailVerified ?? false;
  const bvnVerified =
    verificationDetails?.bvnStatus === "Submitted" ||
    verificationDetails?.bvnStatus === "Verified";

  return (
    <View
      style={[
        WalletStyles.container,
        { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
      ]}
    >
      <View style={[WalletStyles.accountContainer]}>
        {/* title & account tag */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={[WalletStyles.label, { color: isDark ? "#aaa" : "#888" }]}
          >
            Main Balance
          </Text>
          <View style={WalletStyles.slantContainer}>
            <Text
              style={[
                WalletStyles.accountTag,
                { color: isDark ? "#fff" : "#000" },
              ]}
            >
              {user?.payment_code ?? "No Wallet"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setStringAsync(user?.payment_code ?? "");
              }}
            >
              <Feather name="copy" size={16} color="#4B7BEC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* balance */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 12,
          }}
        >
          <Text
            style={[
              WalletStyles.balanceText,
              { color: isDark ? "#fff" : "#000" },
            ]}
          >
            {balanceVisible ? wallet?.balance : "****"}
          </Text>
          <TouchableOpacity
            onPress={() => setBalanceVisible(!balanceVisible)}
            style={{ marginLeft: 10 }}
          >
            <Feather
              name={balanceVisible ? "eye" : "eye-off"}
              size={20}
              color={isDark ? "#fff" : "#555"}
            />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
          <TouchableOpacity
            style={[WalletStyles.button]}
            onPress={() => router.push("/receive")}
          >
            <Text style={WalletStyles.buttonText}>Receive</Text>
            <Feather
              name="arrow-down-left"
              size={18}
              color="#855ae1"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[WalletStyles.button]}
            onPress={() => {
              if (!user?.transaction_pin) {
                toast.show({
                  type: "warning",
                  message: "Transaction PIN Not set",
                });
                router.push("/security");
                sendEmailCode(user?.email ?? "");
                router.push({
                  pathname: "/verify-otp",
                  params: {
                    flow: "change-pin",
                    target: user?.email ?? "",
                    mode: "transaction",
                  },
                });
                return;
              }

              router.push("/send");
            }}
          >
            <Text style={WalletStyles.buttonText}>Send</Text>
            <Feather
              name="arrow-up-right"
              size={18}
              color="#855ae1"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>

        {/* <View
          style={[WalletStyles.tagContainer, { backgroundColor: colors.card }]}
        >
          <Ionicons name="wallet-outline" size={14} color={colors.primary} />
          <Text style={[WalletStyles.tagText, { color: colors.textSecondary }]}>
            wallet-wallet transfers
          </Text>
        </View> */}
      </View>

      {!emailVerified ? (
        <VerificationBox isDark={isDark} />
      ) : !bvnVerified ? (
        <BVNVerificationBox isDark={isDark} />
      ) : null}
    </View>
  );
};

const WalletStyles = StyleSheet.create({
  container: { borderRadius: 25, marginBottom: 20 },
  label: { fontSize: 15 },
  accountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 12,
  },
  slantContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: "#dddde48c",
    transform: [{ skewX: "-20deg" }],
  },
  accountTag: {
    fontSize: 12,
    fontWeight: "600",
    transform: [{ skewX: "20deg" }],
  },
  balanceText: { fontSize: 20, fontWeight: "bold" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 25,
    backgroundColor: "#6f91da1e",
  },
  buttonText: { color: "#855ae1", fontWeight: "bold", fontSize: 12 },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 8,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
});

const VerificationBox = ({ isDark }: any) => {
  const router = useRouter();
  return (
    <View
      style={[
        verificationStyles.verificationCTA,
        { backgroundColor: "#4b7bec35" },
      ]}
    >
      <View style={{ width: "70%", maxWidth: 300 }}>
        <Text
          style={[
            verificationStyles.ctaTitle,
            { color: isDark ? "#fff" : "#000" },
          ]}
        >
          {"Hey! let's verify your E-mail"}
        </Text>
        <Text
          style={[
            verificationStyles.ctaLabel,
            { color: isDark ? "#ccc" : "#555" },
          ]}
        >
          Kindly check your email for an OTP to verify email.
        </Text>
        <TouchableOpacity
          style={verificationStyles.ctaButton}
          onPress={() => router.push("/verify-email")}
        >
          <Text style={verificationStyles.ctaButtonText}>Continue</Text>
          <Feather
            name="arrow-right"
            size={16}
            color="#000"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BVNVerificationBox = ({ isDark }: any) => {
  const router = useRouter();
  return (
    <View
      style={[
        verificationStyles.verificationCTA,
        { backgroundColor: "#4b7bec35" },
      ]}
    >
      <View style={{ width: "70%", maxWidth: 300 }}>
        <Text
          style={[
            verificationStyles.ctaTitle,
            { color: isDark ? "#fff" : "#000" },
          ]}
        >
          {"Kindly verify your BVN"}
        </Text>
        <Text
          style={[
            verificationStyles.ctaLabel,
            { color: isDark ? "#ccc" : "#555" },
          ]}
        >
          Let’s get you started with your BVN Verification.
        </Text>
        <TouchableOpacity
          style={verificationStyles.ctaButton}
          onPress={() => router.push("/bvn-verification")}
        >
          <Text style={verificationStyles.ctaButtonText}>Continue</Text>
          <Feather
            name="arrow-right"
            size={16}
            color="#000"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const verificationStyles = StyleSheet.create({
  verificationCTA: { borderRadius: 25, padding: 20 },
  ctaTitle: { fontWeight: "bold", marginBottom: 5 },
  ctaLabel: { fontSize: 12, marginBottom: 10 },
  ctaButton: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  ctaButtonText: { fontWeight: "bold", fontSize: 12 },
});

// 3. QUICK ACTIONS
const QuickActions = ({ isDark, setModalVisible }: any) => {
  const toast = useToastStore.getState();
  const { user } = useUserStore();
  const router = useRouter();

  const actions = [
    {
      label: "Airtime",
      icon: <Feather name="phone" size={24} color="#4B7BEC" />, // phone icon for airtime
      color: "#4B7BEC",
      route: "airtime-top-up",
    },
    {
      label: "Data",
      icon: <Feather name="wifi" size={24} color="#00C896" />, // wifi icon for data
      color: "#00C896",
      route: "data-top-up",
    },
    {
      label: "Add Money",
      icon: <Feather name="download" size={24} color="#4CAF50" />,
      color: "#4CAF50",
      route: "modal",
    },
    {
      label: "Withdraw",
      icon: <Feather name="arrow-up-right" size={24} color="#FF6B6B" />,
      color: "#FF6B6B",
      route: "withdraw",
    },
  ];

  return (
    <View
      style={[
        QuickActionsStyles.container,
        { backgroundColor: isDark ? "#1E1E1E" : "#fff" },
      ]}
    >
      {actions.map((item, idx) => (
        <View key={idx} style={QuickActionsStyles.item}>
          <TouchableOpacity
            onPress={() => {
              if (item.route) {
                if (
                  item.route === "airtime-top-up" ||
                  item.route === "data-top-up" ||
                  item.route === "withdraw" ||
                  item.label === "Add Money"
                ) {
                  if (!user?.transaction_pin) {
                    toast.show({
                      type: "warning",
                      message: "Transaction PIN Not set",
                    });
                    router.push("/security");
                    sendEmailCode(user?.email ?? "");
                    router.push({
                      pathname: "/verify-otp",
                      params: {
                        flow: "change-pin",
                        target: user?.email ?? "",
                        mode: "transaction",
                      },
                    });
                    // Alert.alert(
                    //   "Set Transaction PIN",
                    //   `To set transaction PIN\nGo to Profile -> Security -> Set Transaction PIN`,
                    // );
                    return;
                  }
                }
                if (item.route === "modal") {
                  setModalVisible(true);
                } else {
                  router.push(item.route);
                }
              } else {
                toast.show({
                  message: "This feature is not yet available.",
                  type: "warning",
                });
              }
            }}
            style={[
              QuickActionsStyles.icon,
              { backgroundColor: item.color + "20" },
            ]}
          >
            {item.icon}
          </TouchableOpacity>
          <Text
            style={[
              QuickActionsStyles.label,
              { color: isDark ? "#fff" : "#000" },
            ]}
          >
            {item.label}
          </Text>
          {idx < actions.length - 1 && (
            <View style={QuickActionsStyles.divider} />
          )}
        </View>
      ))}
    </View>
  );
};

const QuickActionsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  item: { alignItems: "center", flex: 1 },
  icon: { padding: 12, borderRadius: 12, marginBottom: 5 },
  label: { fontSize: 12, fontWeight: "600" },
  divider: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#00000010",
  },
});

// 4. RECENT TRANSACTIONS
const RecentTransactions = ({ isDark }: { isDark: boolean }) => {
  const { wallet } = useWalletStore();
  const recent = wallet?.transactions.slice(0, 5) ?? [];

  return (
    <View
      style={[
        TransactionStyles.container,
        { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" },
      ]}
    >
      <Text
        style={[TransactionStyles.title, { color: isDark ? "#FFF" : "#000" }]}
      >
        Recent Transactions
      </Text>

      {recent.map((tx) => {
        const isCredit = tx.type === "Payment Received" || tx.type === "Top-up";
        const isFailed = tx.status === "failed";

        return (
          <View
            key={`${tx.id}-${tx.description}`}
            style={[
              TransactionStyles.item,
              {
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
          >
            {/* LEFT: description + date */}
            <View
              style={{
                flex: 1, // 👈 TAKE AVAILABLE SPACE
                marginRight: 12, // 👈 SPACE BEFORE AMOUNT
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  TransactionStyles.label,
                  {
                    color: isDark ? "#E5E5E5" : "#111827",
                  },
                ]}
              >
                {tx.description}
              </Text>

              <Text
                style={[
                  TransactionStyles.date,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                {tx.date}
              </Text>
            </View>

            {/* RIGHT: amount */}
            <Text
              style={[
                TransactionStyles.amount,
                {
                  color: isFailed
                    ? "#9CA3AF" // disabled gray
                    : isCredit
                      ? "#22C55E"
                      : "#EF4444",
                  flexShrink: 0, // 👈 NEVER SHRINK
                  textDecorationLine: isFailed ? "line-through" : "none",
                  opacity: isFailed ? 0.6 : 1,
                },
              ]}
            >
              {isCredit ? "+" : "-"}₦
              {Number(tx.amount).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const TransactionStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },

  date: {
    fontSize: 12,
  },

  amount: {
    fontSize: 14,
    fontWeight: "700",
  },
});

type EventBoxProps = {
  title: string;
  subtitle?: string;
};

function EventBox({ title, subtitle }: EventBoxProps) {
  return (
    <LinearGradient
      colors={["#FF6FD8", "#4B7BEC", "#6A5DFD"]} // vibrant, colorful gradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={EventStyles.container}
    >
      <View style={EventStyles.badge}>
        <Text style={EventStyles.badgeText}>Event</Text>
      </View>
      <Text style={EventStyles.title}>{title}</Text>
      {subtitle && <Text style={EventStyles.subtitle}>{subtitle}</Text>}
    </LinearGradient>
  );
}

const EventStyles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 24,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#6A5DFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    alignItems: "flex-start",
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
