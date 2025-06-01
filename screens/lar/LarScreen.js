import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useSchedule } from "../../hooks/useSchedule";

export default function LarScreen() {
  const navigation = useNavigation();
  const { getAtividadesByDate } = useSchedule();
  const [todayActivities, setTodayActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayActivities = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const atividades = await getAtividadesByDate(today, tomorrow);
        setTodayActivities(atividades);
      } catch (error) {
        console.error('Erro ao buscar atividades de hoje:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayActivities();
  }, []);

  const navigateToMeds = () => {
    navigation.navigate("MedsScreen");
  };

  const navigateToMedicacaoUtentes = () => {
    navigation.navigate("MedicacaoUtentesScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Gestão do Lar</Text>
        <Text style={styles.subtitle}>Bem-vindo ao seu painel de controle</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[styles.card, styles.cardElevated, { backgroundColor: "#e8f4ff" }]}
              onPress={navigateToMeds}
            >
              <View style={styles.cardIconContainer}>
                <Icon name="medkit-outline" size={32} color="#007bff" />
              </View>
              <Text style={styles.cardText}>Medicamentos</Text>
              <Text style={styles.cardNumber}>Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.cardElevated, { backgroundColor: "#fff3e0" }]}
              onPress={navigateToMedicacaoUtentes}
            >
              <View style={styles.cardIconContainer}>
                <Icon name="fitness-outline" size={32} color="#ff9800" />
              </View>
              <Text style={styles.cardText}>Medicação</Text>
              <Text style={styles.cardNumber}>Utentes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, styles.cardElevated]}
              onPress={() => navigation.navigate("AtividadesScreen")}
            >
              <View style={styles.cardIconContainer}>
                <Icon name="calendar-outline" size={32} color="#ffc107" />
              </View>
              <Text style={styles.cardText}>Atividades Hoje</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#ffc107" />
              ) : (
                <Text style={styles.cardNumber}>{todayActivities.length}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007bff',
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    backgroundColor: '#007bff',
  },
  title: {
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
  contentContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  cardElevated: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardText: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
});
