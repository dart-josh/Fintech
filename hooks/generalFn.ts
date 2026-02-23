import { Linking, Alert } from 'react-native';

export const sendEmail = async (email: string, subject: string, body: string) => {

  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url)
  } else {
    Alert.alert('Error', 'No email app available');
  }
};