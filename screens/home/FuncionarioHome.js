import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";

export default function FuncionarioHome() {
  const { user, userData } = useAuth();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bem-vindo(a), {userData?.name || "Funcionário"}
        </Text>
        <Text style={styles.subtitle}>Painel de Controle</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("UtentesScreen")}
          >
            <Icon name="people" size={20} color="#fff" />
            <Text style={styles.actionText}>Ver Utentes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, {backgroundColor: '#28a745'}]}
            onPress={() => navigation.navigate("TarefasRealizadas")}
          >
            <Icon name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionText}>Tarefas</Text>
          </TouchableOpacity>
        </View>


        
        <Text style={[styles.sectionTitle, {marginHorizontal: 20}]}>Acesso Rápido</Text>
        <View style={styles.menuGrid}>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("UtentesScreen")}
          >
            <Icon name="people-outline" size={32} color="#007bff" />
            <Text style={styles.menuText}>Utentes</Text>
          </TouchableOpacity>

          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("TarefasRealizadas")}
          >
            <Icon name="list-outline" size={32} color="#007bff" />
            <Text style={styles.menuText}>Tarefas</Text>
          </TouchableOpacity>

         
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("RelatorioScreen")}
          >
            <Icon name="document-text-outline" size={32} color="#007bff" />
            <Text style={styles.menuText}>Relatórios</Text>
          </TouchableOpacity>
          
         
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("MedsScreen")}
          >
            <Icon name="medkit-outline" size={32} color="#007bff" />
            <Text style={styles.menuText}>Medicação</Text>
          </TouchableOpacity>
        </View>

      

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#007bff",
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    backgroundColor: "#007bff",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    width: "48%",
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 2,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
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
  viewAllButton: {
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 10,
  },
  viewAllText: {
    color: "#007bff",
    fontWeight: "600",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    justifyContent: "space-between",
    marginHorizontal: 5,
  },
  menuItem: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
    height: 110,
  },
  menuText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#444",
    flex: 1,
    lineHeight: 22,
  },
  emergencyButton: {
    backgroundColor: "#dc3545",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 20,
    borderRadius: 15,
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
