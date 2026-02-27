// import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useTheme } from "@/theme/ThemeContext";
// import { useAuthStore } from "@/store/auth.store";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { useRegisterStore } from "@/store/register.store";
import { fetchUser } from "@/services/user.service";
import { useUIStore } from "@/store/ui.store";

export default function SplashScreen() {
  const { colors } = useTheme();

  // Zustand state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const hasHydrated = useAuthStore.persist.hasHydrated?.(); // check if store is loaded

  // local loading state
  const [loading, setLoading] = useState(true);

  const [altRoute, setAltRoute] = useState("");

  const { toggleShowBalance, toggleUseBiometrics, toggleRequirePin } =
    useUIStore();

  useEffect(() => {
    const getUser = async () => {
      const { setUserId } = useRegisterStore.getState();
      // Retrieve userId
      const userId = await SecureStore.getItemAsync("userId");
      if (userId) {
        setUserId(userId);
        await checkPin(userId);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    const checkPin = async (userId: string) => {
      setAltRoute("");
      const user = await fetchUser(userId ?? "");

      if (!user) {
        setAltRoute("/login");
      } else {
        if (!user.login_pin) {
          setAltRoute("/create-pin");
        } else {
          const value = await SecureStore.getItemAsync("requirePin");
          const requirePin = value ? value === "true" : true;
          toggleRequirePin(requirePin);

          if (requirePin) {
            // check biometric
            setAltRoute("/enter-pin");
          } else {
            setAltRoute("/home");
          }
        }
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const getAppPreference = async () => {
      const value = await SecureStore.getItemAsync("showBalance");
      const showBalance = value === "false";
      toggleShowBalance(!showBalance);

      const value_2 = await SecureStore.getItemAsync("useBiometrics");

      const useBiometrics = value_2 === "true";
      toggleUseBiometrics(useBiometrics);
    };

    getAppPreference();
  }, [toggleShowBalance, toggleUseBiometrics]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Arigo Pay
        </Text>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  //  return <Redirect href="/home" />;

  // After loading, redirect based on auth
  if (!isLoggedIn) {
    return <Redirect href="/welcome" />;
  }

  if (altRoute) {
    return <Redirect href={altRoute} />;
  }

  return <Redirect href="/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 20,
  },
});
