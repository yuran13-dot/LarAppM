import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import BackButton from "../../components/BackButton";
import AddMedModal from "./AddMedModal";
import EditMedModal from "./EditMedModal";
import DeleteMedModal from "./DeleteMedModal";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import styles from "./styles";

export default function MedsScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [meds, setMeds] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    const q = query(
      collection(LarApp_db, "medicamentos"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMeds = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMeds(fetchedMeds);
    });

    return () => unsubscribe();
  }, []);

  const filteredMeds = meds.filter((m) =>
    m.nome.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.medItem}>
      <View style={styles.medInfo}>
        <FontAwesome
          name="medkit"
          size={40}
          color="#007bff"
          style={styles.icon}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.medNome}>{item.nome}</Text>
          <Text style={styles.medDosagem}>Dosagem: {item.dosagem}</Text>
        </View>

        <TouchableOpacity
          style={styles.iconAction}
          onPress={() => {
            setSelectedMed(item);
            setEditModalVisible(true);
          }}
        >
          <Icon name="pencil-outline" size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconAction}
          onPress={() => {
            setSelectedMed(item);
            setDeleteModalVisible(true);
          }}
        >
          <Icon name="trash-outline" size={20} color="#d11a2a" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleDeleteMed = async (medId) => {
    try {
      const medRef = doc(LarApp_db, "medicamentos", medId);
      await deleteDoc(medRef);
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Erro ao excluir medicamento:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <BackButton />

      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Medicamentos</Text>
        <Text style={styles.subtitle}>Lista e detalhes dos medicamentos</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Icon
            name="search-outline"
            size={18}
            color="#007bff"
            style={{ marginLeft: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar medicamentos..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {filteredMeds.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum medicamento encontrado.</Text>
      ) : (
        <FlatList
          data={filteredMeds}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <AddMedModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
      <EditMedModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        med={selectedMed}
      />
      <DeleteMedModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        med={selectedMed}
        onDeleteSuccess={() => handleDeleteMed(selectedMed.id)}
      />
    </KeyboardAvoidingView>
  );
}
