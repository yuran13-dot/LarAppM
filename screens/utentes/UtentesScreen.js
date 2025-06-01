import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import BackButton from "../../components/BackButton";
import AddUtenteModal from "../utentes/addUtente";
import EditUtenteModal from "./EditUtent";
import GerenciarUtenteModal from "./DeleteUser";
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

export default function UtentesScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [utentes, setUtentes] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedUtente, setSelectedUtente] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [gerenciarModalVisible, setGerenciarModalVisible] = useState(false);

  // Carregar utentes do Firestore automaticamente
  useEffect(() => {
    console.log("Iniciando busca de utentes...");
    const q = query(
      collection(LarApp_db, "utentes"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Snapshot recebido:", snapshot.size, "documentos");
      const fetchedUtentes = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Dados do utente:", data);
        return {
          id: doc.id,
          ...data,
          // Usar apenas o campo name para o nome
          name: data.name || '',
          quarto: data.quarto || '',
          status: data.status || 'ativo'
        };
      });
      console.log("Utentes processados:", fetchedUtentes);
      setUtentes(fetchedUtentes);
    }, (error) => {
      console.error("Erro ao buscar utentes:", error);
      Alert.alert("Erro", "Não foi possível carregar a lista de utentes.");
    });

    return () => unsubscribe();
  }, []);

  // Sempre usar dados atualizados
  const refreshUtentes = () => {
    // Esta função é apenas para documentar que estamos usando os dados mais recentes
    // A atualização já acontece automaticamente através do onSnapshot
    console.log("Garantindo dados atualizados de utentes");
  };
  
  const filteredUtentes = utentes.filter((u) => {
    const searchTerm = search.toLowerCase();
    // Usar apenas o campo name
    const name = (u.name || '').toLowerCase();
    return name.includes(searchTerm);
  });

  const renderItem = ({ item }) => {
    console.log("Renderizando item:", item);
    return (
      <TouchableOpacity 
        style={styles.utenteItem}
        onPress={() => navigation.navigate('PerfilUtente', { utenteId: item.id })}
      >
        <View style={styles.utenteInfo}>
          <FontAwesome
            name="user-circle"
            size={40}
            color="#007bff"
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.utenteNome}>{item.name || 'Nome não definido'}</Text>
            <Text style={styles.utenteQuarto}>Quarto: {item.quarto || 'Não definido'}</Text>
            <Text style={styles.utenteStatus}>
              Status:{" "}
              <Text
                style={
                  item.status === "ativo"
                    ? styles.statusAtivo
                    : styles.statusInativo
                }
              >
                {item.status === "ativo" ? "Ativo" : "Inativo"}
              </Text>
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.iconAction}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedUtente(item);
                setEditModalVisible(true);
              }}
            >
              <Icon name="pencil-outline" size={20} color="#555" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconAction}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedUtente(item);
                setGerenciarModalVisible(true);
              }}
            >
              <Icon name="settings-outline" size={20} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <BackButton />

      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Utentes</Text>
        <Text style={styles.subtitle}>Lista e detalhe de utentes</Text>
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
            placeholder="Pesquisar utentes..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#007bff" }]}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {filteredUtentes.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum utente encontrado.</Text>
      ) : (
        <FlatList
          data={filteredUtentes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <AddUtenteModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      <EditUtenteModal
        visible={isEditModalVisible}
        onClose={() => {
          // Quando fechamos o modal, garantimos dados atualizados
          setEditModalVisible(false);
          // Já não precisamos chamar refreshUtentes() explicitamente
          // porque o onSnapshot já fará isso automaticamente
        }}
        utente={selectedUtente}
      />

      <GerenciarUtenteModal
        visible={gerenciarModalVisible}
        onClose={() => setGerenciarModalVisible(false)}
        utente={selectedUtente}
      />
    </KeyboardAvoidingView>
  );
}
