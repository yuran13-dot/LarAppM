import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";

export default function FuncionarioHome() {
  const { user, userData } = useAuth();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bem-vindo(a), {userData?.name || "Funcionário"}
        </Text>
        <Text style={styles.subtitle}>Painel de Controle</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Nova Tarefa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="notifications-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>Notificações</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Tasks */}
      <View style={styles.todaySection}>
        <Text style={styles.sectionTitle}>Tarefas de Hoje</Text>
        <View style={styles.taskCard}>
          <Icon name="checkmark-circle-outline" size={24} color="#28a745" />
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Medicação - Quarto 101</Text>
            <Text style={styles.taskTime}>08:00 - Concluído</Text>
          </View>
        </View>
        <View style={styles.taskCard}>
          <Icon name="time-outline" size={24} color="#ffc107" />
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>Acompanhamento - Quarto 203</Text>
            <Text style={styles.taskTime}>11:00 - Pendente</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuGrid}>
        {/* Profile Section */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Icon name="person-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Meu Perfil</Text>
        </TouchableOpacity>

        {/* Utentes Management */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("RoomsScreen")}
        >
          <Icon name="people-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Utentes</Text>
        </TouchableOpacity>

        {/* Schedule Management */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Agenda")}
        >
          <Icon name="calendar-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Agenda</Text>
        </TouchableOpacity>

        {/* Tasks Section */}
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="list-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Tarefas</Text>
        </TouchableOpacity>

        {/* Chat Section */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Chat")}
        >
          <Icon name="chatbubbles-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Mensagens</Text>
        </TouchableOpacity>

        {/* Reports Section */}
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="document-text-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Relatórios</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Lembretes</Text>
        <View style={styles.infoCard}>
          <Icon name="alert-circle-outline" size={24} color="#007bff" />
          <Text style={styles.infoText}>Reunião de equipe às 15:00</Text>
        </View>
      </View>

      {/* Emergency Protocol */}
      <TouchableOpacity style={styles.emergencyButton}>
        <Icon name="alert-circle-outline" size={24} color="#fff" />
        <Text style={styles.emergencyText}>Protocolo de Emergência</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
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
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButton: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    justifyContent: "center",
  },
  actionText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  todaySection: {
    padding: 20,
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  taskInfo: {
    marginLeft: 15,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  taskTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
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
  emergencyButton: {
    backgroundColor: "#dc3545",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
