import { useTheme } from "@/theme/ThemeContext";
import { TV_PROVIDERS } from "@/utils/globalVariables";
import { Feather } from "@expo/vector-icons";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProviderSelector({
  providerModal,
  setProviderModal,
  provider,
  setProvider,
}: {
  providerModal: boolean;
  setProviderModal: any;
  provider: { key: string; name: string };
  setProvider: any;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={providerModal} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={() => setProviderModal(false)}>
        <View style={[styles.networkModal, { backgroundColor: colors.card, paddingBottom: insets.bottom + 10 }]}>
          {TV_PROVIDERS.map((prv) => {
            const selected = prv.key === provider.key;
            return (
              <TouchableOpacity
                key={prv.key}
                style={styles.networkRow}
                onPress={() => {
                  setProvider(prv);
                  setProviderModal(false);
                }}
              >
                <View style={styles.networkLogo}>
                  <Image
                    source={prv.image}
                    style={styles.networkLogo}
                    
                    resizeMode="contain"
                  />
                </View>

                <Text style={{ flex: 1, color: colors.text }}>{prv.name}</Text>

                <Feather
                  name={selected ? "check-circle" : "circle"}
                  size={18}
                  color={selected ? colors.primary : colors.muted}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  networkLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  networkModal: {
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  networkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
});
