import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

export default function LarScreen() {
  const navigation = useNavigation();

  const navigateToMeds = () => {
    navigation.navigate("Home", {
      screen: "MedsScreen",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão do Lar</Text>
      </View>

      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.card}>
          <Icon name="people-outline" size={32} color="#007bff" />
          <Text style={styles.cardText}>Capacidade Total</Text>
          <Text style={styles.cardNumber}>50</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Icon name="bed-outline" size={32} color="#28a745" />
          <Text style={styles.cardText}>Vagas Disponíveis</Text>
          <Text style={styles.cardNumber}>8</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#e8f4ff" }]}
          onPress={navigateToMeds}
        >
          <Icon name="medkit-outline" size={32} color="#007bff" />
          <Text style={styles.cardText}>Medicamentos</Text>
          <Text style={styles.cardNumber}>Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Icon name="calendar-outline" size={32} color="#ffc107" />
          <Text style={styles.cardText}>Atividades Hoje</Text>
          <Text style={styles.cardNumber}>5</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings-outline" size={24} color="#007bff" />
          <Text style={styles.menuText}>Configurações do Lar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="document-text-outline" size={24} color="#007bff" />
          <Text style={styles.menuText}>Relatórios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="cash-outline" size={24} color="#007bff" />
          <Text style={styles.menuText}>Gestão Financeira</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="nutrition-outline" size={24} color="#007bff" />
          <Text style={styles.menuText}>Cardápio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
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
  cardText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  cardNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  menuSection: {
    padding: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
});
