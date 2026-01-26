import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Modal from "react-native-modal";
import { useTheme } from "@/theme/ThemeContext";
import { AddBeneficiaryModal } from "./AddBeneficiaryModal";
import { useUserStore } from "@/store/user.store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Beneficiary {
  id: string;
  name: string;
  paymentCode: string;
  nickname: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (b: Beneficiary) => void;
}

export const BeneficiaryModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { beneficiaries } = useUserStore.getState();

  const [addVisible, setAddVisible] = useState(false);

  const cardBg = isDark ? "#2C2C2C" : "#fff";
  const textColor = isDark ? "#fff" : "#111";

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ margin: 0, justifyContent: "flex-end"}}
    >
      {/* Main beneficiary list */}
      <View
        style={{
          backgroundColor: cardBg,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "80%",
          padding: 20,
          paddingBottom: insets.bottom + 12
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: textColor,
            marginBottom: 20,
          }}
        >
          Select Beneficiary
        </Text>

        <FlatList
          data={beneficiaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 14,
                marginBottom: 8,
                backgroundColor: isDark ? "#3A3A3A" : "#F9F9F9",
                borderRadius: 12,
              }}
            >
              <View>
                <Text style={{ fontWeight: "600", color: textColor }}>
                  {item.nickname}
                </Text>
                <Text style={{ color: "#888", fontSize: 12 }}>
                  {item.paymentCode}
                </Text>
              </View>
              <Text style={{ color: "#AAA", fontSize: 12 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
              No beneficiaries yet
            </Text>
          }
        />

        <TouchableOpacity
          onPress={() => setAddVisible(true)}
          style={{
            marginTop: 10,
            padding: 14,
            backgroundColor: "#007AFF",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Add New Beneficiary
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Beneficiary */}
      <AddBeneficiaryModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        // onAdd={handleAdd}
      />
    </Modal>
  );
};
