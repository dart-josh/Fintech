import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as Contacts from "expo-contacts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (phone: string) => void;
}

export default function ContactPickerModal({
  visible,
  onClose,
  onSelect,
}: Props) {
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [filtered, setFiltered] = useState<Contacts.Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) loadContacts();
  }, [visible]);

  const loadContacts = async () => {
    setLoading(true);

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied");
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const withNumbers = data.filter(
      (c) => c.phoneNumbers && c.phoneNumbers.length > 0
    );

    setContacts(withNumbers);
    setFiltered(withNumbers);
    setLoading(false);
  };

  const handleSearch = (text: string) => {
    setSearch(text);

    const filteredData = contacts.filter((c) =>
      c.name?.toLowerCase().includes(text.toLowerCase())
    );

    setFiltered(filteredData);
  };

  const normalizeNumber = (number: string) => {
    return number.replace(/\s+/g, "").replace("+234", "0");
  };

  const handleSelect = (contact: Contacts.Contact) => {
    const phone = contact.phoneNumbers?.[0]?.number;
    if (!phone) return;

    onSelect(normalizeNumber(phone));
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, {paddingBottom: insets.bottom + 10}]}>
        <Text style={styles.header}>Select Contact</Text>

        <TextInput
          placeholder="Search contact..."
          value={search}
          onChangeText={handleSearch}
          style={styles.search}
        />

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.number}>
                  {item.phoneNumbers?.[0]?.number}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={{ color: "white" }}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  number: {
    fontSize: 14,
    color: "#666",
  },
  closeBtn: {
    padding: 15,
    backgroundColor: "black",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
});
