// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
  // Show splash first
  return <Redirect href="/splash" />;
}

// eas build --platform android --profile production

// eas build -p android --profile preview

// eas build --platform android --profile preview --local

// "usesCleartextTraffic": true
