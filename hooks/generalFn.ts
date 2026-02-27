import { Linking, Alert } from 'react-native';

import * as Clipboard from "expo-clipboard";
import { useToastStore } from '@/store/toast.store';

export const sendEmail = async (email: string, subject: string, body: string) => {

  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url)
  } else {
    Alert.alert('Error', 'No email app available');
  }
};

export const copyToClipboard = (text: string) => {
  const toast = useToastStore.getState();
    Clipboard.setStringAsync(text);
    toast.show({
      message: "Copied",
      type: "success",
    });
  };