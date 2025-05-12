import React, { useEffect } from "react";
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

export default function AdminHome() {
  const {
    user,
    userData,
    quartos,
    funcionarios,
    utentes,
    fetchFuncionarios,
    fetchUtentes,
  } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      console.log("Carregando dados...");
      console.log("UserData:", userData);
      if (userData?.role === "admin") {
        await Promise.all([fetchFuncionarios(), fetchUtentes()]);
      }
      console.log("Funcionários:", funcionarios.length);
      console.log("Utentes:", utentes.length);
    };

    loadData();
  }, []);

  const menuItems = [
    {
      title: "Gestão de Utentes",
      icon: "people",
      onPress: () => navigation.navigate("UtentesScreen"),
      description: "Adicionar, editar e gerenciar utentes",
    },
    {
      title: "Gestão de Quartos",
      icon: "bed",
      onPress: () => navigation.navigate("RoomsScreen"),
      description: "Gerenciar quartos e ocupação",
    },
    {
      title: "Gestão de Funcionários",
      icon: "person",
      onPress: () => navigation.navigate("FuncionarioScreen"),
      description: "Adicionar e gerenciar funcionários",
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
          Bem-vindo(a), {userData?.name || "Administrador"}
        </Text>
        <Text style={styles.subtitle}>Painel Administrativo</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.iconContainer}>
              <Icon name={item.icon} size={32} color="#007bff" />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Visão Geral</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="people" size={24} color="#007bff" />
            <Text style={styles.statNumber}>{utentes.length}</Text>
            <Text style={styles.statLabel}>Utentes</Text>
            <Text style={styles.statSubtext}>Total registrado</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="person" size={24} color="#007bff" />
            <Text style={styles.statNumber}>{funcionarios.length}</Text>
            <Text style={styles.statLabel}>Funcionários</Text>
            <Text style={styles.statSubtext}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="bed" size={24} color="#007bff" />
            <Text style={styles.statNumber}>{quartos.length}</Text>
            <Text style={styles.statLabel}>Quartos</Text>
            <Text style={styles.statSubtext}>
              Disponíveis: {quartos.filter((q) => q.estado === "Livre").length}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Atividades Recentes</Text>
        <View style={styles.infoCard}>
          <Icon name="notifications-outline" size={24} color="#007bff" />
          <Text style={styles.infoText}>
            Nenhuma atividade recente para mostrar
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 30,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    justifyContent: "space-between",
  },
  menuItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "48%", // quase metade da largura com espaço
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 12,
    color: "#666",
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
});
