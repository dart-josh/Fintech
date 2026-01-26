// components/QRCodeView.tsx
import React from "react";
import QRCode from "react-native-qrcode-svg";
import { View } from "react-native";

type Props = {
  value: string;
  size?: number;
};

export default function QRCodeView({ value, size = 180 }: Props) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 20,
      }}
    >
      <QRCode
        value={value}
        size={size}
        color="#020617"
        backgroundColor="#FFFFFF"
      />
    </View>
  );
}
