import { useTheme } from "@/theme/ThemeContext";
import { NETWORKS } from "@/utils/globalVariables";
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

export default function NetworkSelector({
  networkModal,
  setNetworkModal,
  network,
  setNetwork,
}: {
  networkModal: boolean;
  setNetworkModal: any;
  network: { key: string; name: string };
  setNetwork: any;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={networkModal} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={() => setNetworkModal(false)}>
        <View style={[styles.networkModal, { backgroundColor: colors.card }]}>
          {NETWORKS.map((net) => {
            const selected = net.key === network.key;
            return (
              <TouchableOpacity
                key={net.key}
                style={styles.networkRow}
                onPress={() => {
                  setNetwork(net);
                  setNetworkModal(false);
                }}
              >
                <View style={styles.networkLogo}>
                  <Image
                    source={net.image}
                    style={styles.networkLogo}
                    
                    resizeMode="contain"
                  />
                </View>

                <Text style={{ flex: 1, color: colors.text }}>{net.name}</Text>

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
