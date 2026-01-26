import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/user.store";
import { submitAddress } from "@/services/user.service";

type Step = "intro" | "form" | "success";

export default function AddressVerificationFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState<Step>("intro");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  // Function to pick current location
  const pickCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    let reverseGeocode = await Location.reverseGeocodeAsync(location.coords);

    if (reverseGeocode.length > 0) {
      const place = reverseGeocode[0];
      setAddress({
        street: place.street || "",
        city: place.city || place.subregion || "",
        state: place.region || "",
        postalCode: place.postalCode || "",
        country: place.country || "",
      });
    }
  };

  const { user } = useUserStore();

  const handleSubmit = async () => {
    const done = await submitAddress({
      userId: user?.id ?? "",
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    if (done) setStep("success");
  };

  return (
    <View
      style={[
        styles.page,
        { backgroundColor: isDark ? colors.background : "#F4F5F7" },
      ]}
    >
      {/* TOP BAR */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: isDark ? colors.card : "rgba(0,0,0,0.05)" },
          ]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1 }}>
        {/* INTRO */}
        {step === "intro" && (
          <View style={styles.center}>
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: colors.text }]}>
              Address Verification
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Let’s get you started with your{"\n"}Address Verification
            </Text>

            <View
              style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => setStep("form")}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FORM */}
        {step === "form" && (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                Enter Your Address
              </Text>

              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                We need your current address to complete verification.
              </Text>

              {/* STREET */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Street Address
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TextInput
                    value={address.street}
                    onChangeText={(val) =>
                      setAddress((prev) => ({ ...prev, street: val }))
                    }
                    placeholder="Street Address"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        flex: 1,
                        borderBottomWidth: 1,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <TouchableOpacity
                    onPress={pickCurrentLocation}
                    style={{ marginLeft: 12 }}
                  >
                    <MaterialIcons
                      name="my-location"
                      size={28}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* CITY */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  City / Town
                </Text>
                <TextInput
                  value={address.city}
                  onChangeText={(val) =>
                    setAddress((prev) => ({ ...prev, city: val }))
                  }
                  placeholder="City / Town"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              {/* STATE */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  State / Region
                </Text>
                <TextInput
                  value={address.state}
                  onChangeText={(val) =>
                    setAddress((prev) => ({ ...prev, state: val }))
                  }
                  placeholder="State / Region"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              {/* POSTAL CODE */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Postal / ZIP Code
                </Text>
                <TextInput
                  value={address.postalCode}
                  onChangeText={(val) =>
                    setAddress((prev) => ({ ...prev, postalCode: val }))
                  }
                  placeholder="Postal / ZIP Code"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              {/* COUNTRY */}
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: isDark ? colors.card : "#FFF" },
                ]}
              >
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  Country
                </Text>
                <TextInput
                  value={address.country}
                  onChangeText={(val) =>
                    setAddress((prev) => ({ ...prev, country: val }))
                  }
                  placeholder="Country"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>
            </ScrollView>

            {/* BUTTON */}
            <View
              style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      address.street &&
                      address.city &&
                      address.state &&
                      address.country
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                disabled={
                  !address.street ||
                  !address.city ||
                  !address.state ||
                  !address.country
                }
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <View style={styles.center}>
            <Feather name="check-circle" size={96} color={colors.success} />

            <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>
              Address Submitted 🎉
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Your address has been submitted successfully and is being
              verified.
            </Text>

            <View
              style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.back()}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },

  topBar: { paddingHorizontal: 20 },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  image: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },

  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  inputCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
  },

  input: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },

  infoText: {
    fontSize: 13,
    flex: 1,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
  },

  button: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
