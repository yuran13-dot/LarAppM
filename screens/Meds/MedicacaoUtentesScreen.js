import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function MedicacaoUtentesScreen() {
  const navigation = useNavigation();
  const [utentes, setUtentes] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Carregar utentes
      const utentesSnapshot = await getDocs(collection(LarApp_db, "utentes"));
      const utentesData = [];
      utentesSnapshot.forEach((doc) => {
        utentesData.push({ id: doc.id, ...doc.data() });
      });
      setUtentes(utentesData);

      // Carregar medicamentos
      const medicamentosSnapshot = await getDocs(
        collection(LarApp_db, "medicamentos")
      );
      const medicamentosData = [];
      medicamentosSnapshot.forEach((doc) => {
        medicamentosData.push({ id: doc.id, ...doc.data() });
      });
      setMedicamentos(medicamentosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const adicionarMedicamentoAoUtente = async (utente) => {
    try {
      navigation.navigate("AdicionarMedicacaoUtente", {
        utenteId: utente.id,
        numeroUtente: utente.numeroUtente,
        nome: utente.nome,
        medicamentosAtuais: utente.medicamentos || [],
        onUpdate: carregarDados,
      });
    } catch (error) {
      console.error("Erro ao adicionar medicamento:", error);
      Alert.alert(
        "Erro",
        "Não foi possível adicionar o medicamento ao utente."
      );
    }
  };

  const renderUtente = ({ item }) => {
    const medicamentosAtivos = item.medicamentos ? item.medicamentos.length : 0;

    return (
      <TouchableOpacity
        style={styles.utenteCard}
        onPress={() => adicionarMedicamentoAoUtente(item)}
      >
        <View style={styles.utenteInfo}>
          <Text style={styles.utenteName}>{item.nome}</Text>
          <Text style={styles.utenteDetails}>
            Nº Utente: {item.numeroUtente}
          </Text>
          <Text style={styles.medicamentosCount}>
            Medicamentos: {medicamentosAtivos}
          </Text>
        </View>
        <Icon name="chevron-forward" size={24} color="#007bff" />
      </TouchableOpacity>
    );
  };

  const filteredUtentes = utentes.filter(
    (utente) =>
      utente.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      utente.numeroUtente.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medicação dos Utentes</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon
          name="search-outline"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar utente..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredUtentes}
        renderItem={renderUtente}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Carregando..." : "Nenhum utente encontrado"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  utenteCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  utenteInfo: {
    flex: 1,
  },
  utenteName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  utenteDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  medicamentosCount: {
    fontSize: 14,
    color: "#007bff",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 30,
  },
});
