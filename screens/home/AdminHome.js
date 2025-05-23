import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, query, getDocs } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";

export default function AdminHome() {
  const { userData } = useAuth();
  const navigation = useNavigation();
  const [totais, setTotais] = useState({
    utentes: 0,
    funcionarios: 0,
    quartos: 0,
  });

  useEffect(() => {
    const carregarTotais = async () => {
      try {
        // Buscar total de utentes
        const utentesQuery = query(collection(LarApp_db, "utentes"));
        const utentesSnapshot = await getDocs(utentesQuery);

        // Buscar total de funcionários
        const funcionariosQuery = query(collection(LarApp_db, "funcionarios"));
        const funcionariosSnapshot = await getDocs(funcionariosQuery);

        // Buscar total de quartos
        const quartosQuery = query(collection(LarApp_db, "quartos"));
        const quartosSnapshot = await getDocs(quartosQuery);

        setTotais({
          utentes: utentesSnapshot.size,
          funcionarios: funcionariosSnapshot.size,
          quartos: quartosSnapshot.size,
        });
      } catch (error) {
        console.error("Erro ao carregar totais:", error);
      }
    };

    carregarTotais();
  }, []);

  const menuItems = [
    {
      title: "Gestão de Utentes",
      icon: "people",
      onPress: () => navigation.navigate("UtentesScreen"),
      description: "Adicionar, editar e gerenciar utentes",
      total: totais.utentes,
    },
    {
      title: "Gestão de Quartos",
      icon: "bed",
      onPress: () => navigation.navigate("RoomsScreen"),
      description: "Gerenciar quartos e ocupação",
      total: totais.quartos,
    },
    {
      title: "Gestão de Funcionários",
      icon: "person",
      onPress: () => navigation.navigate("FuncionarioScreen"),
      description: "Adicionar e gerenciar funcionários",
      total: totais.funcionarios,
    },
    {
      title: "Relatórios",
      icon: "document-text",
      onPress: () => navigation.navigate("RelatorioScreen"),
      description: "Gerar e visualizar relatórios",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bem-vindo(a), {userData?.name || "Admin"}
        </Text>
        <Text style={styles.subtitle}>Painel de Controle</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statsCard, { backgroundColor: "#4CAF50" }]}>
            <Icon name="people" size={30} color="#fff" />
            <Text style={styles.statsNumber}>{totais.utentes}</Text>
            <Text style={styles.statsLabel}>Utentes</Text>
          </View>

          <View style={[styles.statsCard, { backgroundColor: "#2196F3" }]}>
            <Icon name="person" size={30} color="#fff" />
            <Text style={styles.statsNumber}>{totais.funcionarios}</Text>
            <Text style={styles.statsLabel}>Funcionários</Text>
          </View>
        </View>

        <View
          style={[
            styles.statsCard,
            { backgroundColor: "#FF9800", width: "100%" },
          ]}
        >
          <Icon name="bed" size={30} color="#fff" />
          <Text style={styles.statsNumber}>{totais.quartos}</Text>
          <Text style={styles.statsLabel}>Quartos</Text>
        </View>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Icon name={item.icon} size={32} color="#007bff" />
            <Text style={styles.menuText}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  statsLabel: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    textAlign: "center",
  },
  menuDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
});
