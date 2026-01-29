import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
};

export default function QRCodeScannerModal({ visible, onClose, onScan }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, setPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermission(status === "granted");
    })();
  }, []);

  console.log(permission);

  if (!visible) return null;

  if (permission === false) {
    return (
      <Modal visible transparent>
        <View style={styles.permissionContainer}>
          <Text style={{ color: "#fff", marginBottom: 12 }}>
            Camera permission is required to scan QR codes
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
    

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Camera */}
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => {
            onScan(data);
            onClose();
          }}
        />

        {/* Scan Frame */}
        <View style={styles.frame}>
          <Text style={styles.frameText}>Align QR within frame</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  frame: {
    position: "absolute",
    top: "35%",
    alignSelf: "center",
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  frameText: {
    color: "#fff",
    fontSize: 12,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 999,
  },
});
