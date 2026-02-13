// app/index.tsx
import { Redirect } from "expo-router";

import "react-native-get-random-values";


export default function Index() {

  // Show splash first
  return <Redirect href="/splash" />;
}

// npx eas build -p android --profile preview

// eas build -p android --profile preview
