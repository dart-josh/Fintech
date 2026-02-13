import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@/theme/ThemeContext";
import { fetchUserByDetails } from "@/services/user.service";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useUserStore } from "@/store/user.store";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (user: { id: string; full_name: string; username: string }) => void;
}

export const SelectUserModal = ({ visible, onClose, onSelectUser }: Props) => {
  const { colors } = useTheme();

  const [username, setUsername] = useState("");
  const [fetchedUser, setFetchedUser] = useState<{
    id: string;
    full_name: string;
    username: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {user} = useUserStore();

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    setUsername(text);
    fetchUser(text);
  };

  const fetchUser = async (uname?: string) => {
    const value = uname ?? username;
    if (!value.trim()) return;

    setLoading(true);
    setFetchedUser(null);
    setError("");

    try {
      const user = await fetchUserByDetails({ userDetail: value });
      if (user) {
        setFetchedUser(user);
      } else {
        setError("User not found");
      }
    } catch (e) {
      setError("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (!fetchedUser) {
      fetchUser();
      return;
    }

    if (user?.id === fetchedUser.id) {
        setError('You cannot select yourself');
        return;
    }
    
    onSelectUser(fetchedUser);
    setUsername("");
    setFetchedUser(null);
    setError("");
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContainer}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.dialog, { backgroundColor: colors.card }]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  Select User
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Feather name="x" size={24} color={colors.accent} />
                </TouchableOpacity>
              </View>

              {/* Username Input */}
              <Text style={[styles.label, { color: "#888" }]}>Username</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.border }]}>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor="#999"
                  style={[styles.input, { color: colors.textPrimary }]}
                />
                <TouchableOpacity onPress={handlePaste} style={styles.iconButton}>
                  <Feather name="clipboard" size={20} color="#00E5FF" />
                </TouchableOpacity>
              </View>

              {/* Fetched User Info */}
              {fetchedUser && (
                <View style={[styles.userInfo, { borderColor: colors.accent }]}>
                  <View>
                    <Text style={[styles.label, { color: "#888" }]}>Full Name</Text>
                    <Text style={[styles.userText, { color: colors.textPrimary }]}>
                      {fetchedUser.full_name}
                    </Text>
                    <Text style={[styles.label, { color: "#888", marginTop: 4 }]}>
                      Username
                    </Text>
                    <Text style={[styles.userText, { color: colors.textPrimary }]}>
                      {fetchedUser.username}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setFetchedUser(null);
                      setUsername("");
                      setError("");
                    }}
                    style={styles.clearButton}
                  >
                    <Feather name="x" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Error */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* CTA Button */}
              <TouchableOpacity onPress={handleSelect} style={styles.primaryButton}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {fetchedUser ? "Select User" : "Fetch User"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  dialog: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#00E5FF33",
    backdropFilter: "blur(10px)", // pseudo-glass effect for web/modern
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 16 },
  iconButton: { marginLeft: 10 },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  userText: { fontSize: 14, fontWeight: "600" },
  clearButton: { padding: 6 },
  errorText: { color: "#FF4D4D", marginBottom: 8 },
  primaryButton: {
    backgroundColor: "#00E5FF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});


