// src/screens/funcionarios/FuncionarioScreen.js

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
import AddFuncionarioModal from "./AddFuncionarioModal";
import EditFuncionarioModal from "./EditFuncionarioModal";
import GerenciarFuncionarioModal from "./GerenciarFuncionarioModal";
import { Alert } from "react-native";
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

export default function FuncionarioScreen() {
  const [search, setSearch] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isGerenciarModalVisible, setGerenciarModalVisible] = useState(false);

  useEffect(() => {
    const q = query(
      collection(LarApp_db, "funcionarios"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedFuncionarios = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFuncionarios(fetchedFuncionarios);
    });

    return () => unsubscribe();
  }, []);

  const filteredFuncionarios = funcionarios.filter((f) =>
    f.nome.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.utenteItem}>
      <View style={styles.utenteInfo}>
        <FontAwesome
          name="user-circle"
          size={40}
          color="#007bff"
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.utenteNome}>{item.nome}</Text>
          <Text style={styles.utenteQuarto}>Cargo: {item.funcao}</Text>
          <Text
            style={[
              styles.statusText,
              { color: item.status === "ativo" ? "#2ecc71" : "#e74c3c" },
            ]}
          >
            {item.status === "ativo" ? "Ativo" : "Inativo"}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconAction}
            onPress={() => {
              setSelectedFuncionario(item);
              setEditModalVisible(true);
            }}
          >
            <Icon name="pencil-outline" size={20} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconAction}
            onPress={() => {
              setSelectedFuncionario(item);
              setGerenciarModalVisible(true);
            }}
          >
            <Icon name="settings-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <BackButton />

      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Funcionários</Text>
        <Text style={styles.subtitle}>Lista e detalhe de funcionários</Text>
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
            placeholder="Pesquisar funcionários..."
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

      {filteredFuncionarios.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum funcionário encontrado.</Text>
      ) : (
        <FlatList
          data={filteredFuncionarios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <AddFuncionarioModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
      <EditFuncionarioModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        funcionario={selectedFuncionario}
      />
      <GerenciarFuncionarioModal
        visible={isGerenciarModalVisible}
        onClose={() => setGerenciarModalVisible(false)}
        funcionario={selectedFuncionario}
      />
    </KeyboardAvoidingView>
  );
}
