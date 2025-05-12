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

export default function UtenteHome() {
  const { user, userData } = useAuth();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bem-vindo(a), {userData?.name || "Utente"}
        </Text>
        <Text style={styles.subtitle}>Tenha um ótimo dia!</Text>
      </View>

      {/* Today's Schedule */}
      <View style={styles.todaySection}>
        <Text style={styles.sectionTitle}>Agenda de Hoje</Text>
        <View style={styles.scheduleCard}>
          <Icon name="time-outline" size={24} color="#007bff" />
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleTime}>09:00</Text>
            <Text style={styles.scheduleText}>Café da Manhã</Text>
          </View>
        </View>
        <View style={styles.scheduleCard}>
          <Icon name="fitness-outline" size={24} color="#007bff" />
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleTime}>10:30</Text>
            <Text style={styles.scheduleText}>Atividade Física</Text>
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

        {/* Schedule Section */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Agenda")}
        >
          <Icon name="calendar-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Agenda</Text>
        </TouchableOpacity>

        {/* Chat Section */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Chat")}
        >
          <Icon name="chatbubbles-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Mensagens</Text>
        </TouchableOpacity>

        {/* Activities Section */}
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="fitness-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Atividades</Text>
        </TouchableOpacity>

        {/* Medical Info */}
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="medical-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Informações Médicas</Text>
        </TouchableOpacity>

        {/* Help */}
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-circle-outline" size={32} color="#007bff" />
          <Text style={styles.menuText}>Ajuda</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Avisos Importantes</Text>
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color="#007bff" />
          <Text style={styles.infoText}>
            Lembre-se de confirmar sua presença nas atividades do dia
          </Text>
        </View>
      </View>

      {/* Emergency Contact */}
      <TouchableOpacity style={styles.emergencyButton}>
        <Icon name="alert-circle-outline" size={24} color="#fff" />
        <Text style={styles.emergencyText}>Contato de Emergência</Text>
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
  todaySection: {
    padding: 20,
  },
  scheduleCard: {
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
  scheduleInfo: {
    marginLeft: 15,
    flex: 1,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  scheduleText: {
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
