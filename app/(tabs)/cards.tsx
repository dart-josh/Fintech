import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";

const { width } = Dimensions.get("window");

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function CardsPage() {
  // const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const cards = [
    {
      id: "1",
      type: "Visa",
      last4: "1234",
      balance: 4520,
      expiry: "12/26",
      frozen: false,
    },
    {
      id: "2",
      type: "Mastercard",
      last4: "5678",
      balance: 10250,
      expiry: "03/27",
      frozen: true,
    },
    {
      id: "3",
      type: "Verve",
      last4: "9012",
      balance: 350,
      expiry: "07/25",
      frozen: false,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [cardStatus, setCardStatus] = useState(
    cards.reduce((acc, card) => ({ ...acc, [card.id]: card.frozen }), {}),
  );

  const activeCard = cards[activeIndex];

  const toggleFreeze = (id: string) => {
    LayoutAnimation.easeInEaseOut();
    setCardStatus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDetails = () => {
    LayoutAnimation.easeInEaseOut();
    setShowDetails((prev) => !prev);
  };

  if (true) return <ComingSoon />;

  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingBottom: 20,
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            My Cards
          </Text>
        </View>

        {/* Cards Slider */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) =>
            setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          scrollEventThrottle={16}
          style={{ marginTop: 24 }}
        >
          {cards.map((card) => (
            <View key={card.id} style={{ width, alignItems: "center" }}>
              <View
                style={{
                  width: "88%",
                  padding: 24,
                  borderRadius: 22,
                  backgroundColor: colors.accent,
                }}
              >
                <Text style={{ color: "#fff", opacity: 0.9 }}>
                  {card.type} Card
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 32,
                    fontWeight: "700",
                    marginVertical: 10,
                  }}
                >
                  ₦{card.balance.toLocaleString()}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#E0F2FE" }}>
                    **** **** **** {card.last4}
                  </Text>
                  <Text style={{ color: "#E0F2FE" }}>Exp {card.expiry}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Card Actions */}
        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <TouchableOpacity
            onPress={() => toggleFreeze(activeCard.id)}
            style={{
              backgroundColor: cardStatus[activeCard.id]
                ? colors.danger
                : "#22C55E",
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {cardStatus[activeCard.id] ? "Unfreeze Card" : "Freeze Card"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleDetails}
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: "700" }}>
              {showDetails ? "Hide Card Details" : "View Card Details"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Details */}
        {showDetails && (
          <View
            style={{
              marginTop: 24,
              marginHorizontal: 16,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <DetailRow
              label="Card Type"
              value={activeCard.type}
              colors={colors}
            />
            <DetailRow
              label="Card Number"
              value={`**** **** **** ${activeCard.last4}`}
              colors={colors}
            />
            <DetailRow
              label="Expiry Date"
              value={activeCard.expiry}
              colors={colors}
            />
            <DetailRow
              label="Status"
              value={cardStatus[activeCard.id] ? "Frozen" : "Active"}
              highlight
              colors={colors}
            />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

/* ---------- Components ---------- */

const DetailRow = ({ label, value, highlight, colors }: any) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    }}
  >
    <Text style={{ color: colors.textSecondary }}>{label}</Text>
    <Text
      style={{
        fontWeight: "600",
        color: highlight ? colors.accent : colors.textPrimary,
      }}
    >
      {value}
    </Text>
  </View>
);

function ComingSoon() {
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  return (
    <View
      style={[
        coming_soon_styles.container,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
       {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            Virtual Cards
          </Text>
        </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* COMING SOON CARD */}
        <View
          style={[
            coming_soon_styles.cardWrapper,
            { backgroundColor: colors.card },
          ]}
        >
          <Text
            style={[
              coming_soon_styles.comingSoonTitle,
              { color: isDark ? "#fff" : "#111" },
            ]}
          >
            Coming Soon
          </Text>

          <View style={coming_soon_styles.cardPreview}>
            <View
              style={[
                coming_soon_styles.virtualCard,
                { backgroundColor: isDark ? "#1E1E1E" : "#1A73E8" },
              ]}
            >
              {/* Card top row */}
              <View style={coming_soon_styles.cardTop}>
                <Text style={coming_soon_styles.issuerText}>Arigo Pay</Text>
                <Feather name="credit-card" size={24} color="#fff" />
              </View>

              {/* Card number */}
              <Text style={coming_soon_styles.cardNumber}>
                **** **** **** 1234
              </Text>

              {/* Card bottom row */}
              <View style={coming_soon_styles.cardBottom}>
                <View>
                  <Text style={coming_soon_styles.cardLabel}>Card Holder</Text>
                  <Text style={coming_soon_styles.cardValue}>John Doe</Text>
                </View>
                <View>
                  <Text style={coming_soon_styles.cardLabel}>Expires</Text>
                  <Text style={coming_soon_styles.cardValue}>12/26</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Professional fintech info */}
          <Text
            style={[
              coming_soon_styles.infoText,
              { color: isDark ? "#ccc" : "#555", marginTop: 20 },
            ]}
          >
            Arigo Pay cards will allow seamless payments, ATM withdrawals, and
            enhanced account security. Manage your virtual and physical cards
            securely through the app.
          </Text>
          <Text
            style={[
              coming_soon_styles.infoText,
              { color: isDark ? "#ccc" : "#555", marginTop: 8 },
            ]}
          >
            Stay tuned to be among the first to experience premium financial
            flexibility.
          </Text>

          {/* CTA BUTTON */}
          <TouchableOpacity
            style={[
              coming_soon_styles.ctaButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => router.push("/card-application")}
          >
            <Text style={coming_soon_styles.ctaText}>
              Pre-Apply for Card Offer
            </Text>
            <Feather name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const coming_soon_styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "700", marginTop: 12 },

  cardWrapper: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },

  cardPreview: {
    alignItems: "center",
    marginBottom: 16,
  },

  virtualCard: {
    width: width - 60,
    height: 200,
    borderRadius: 16,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  issuerText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  cardNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 20,
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  cardLabel: { color: "#fff", fontSize: 12 },
  cardValue: { color: "#fff", fontSize: 16, fontWeight: "700" },

  infoText: { fontSize: 14, lineHeight: 20 },

  ctaButton: {
    marginTop: 30,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ctaText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
