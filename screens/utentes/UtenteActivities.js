import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";

const getActivityIcon = (activityName) => {
  const name = activityName?.toLowerCase() || '';
  
  if (name.includes('banho')) return 'water-outline';
  if (name.includes('yoga')) return 'body-outline';
  if (name.includes('café') || name.includes('cafe') || name.includes('refeição') || name.includes('refeicao')) return 'restaurant-outline';
  if (name.includes('fisio') || name.includes('fisioterapia')) return 'fitness-outline';
  if (name.includes('medic')) return 'medkit-outline';
  if (name.includes('caminhada') || name.includes('passeio')) return 'walk-outline';
  if (name.includes('jogo') || name.includes('jogos')) return 'game-controller-outline';
  if (name.includes('música') || name.includes('musica')) return 'musical-notes-outline';
  if (name.includes('arte') || name.includes('pintura')) return 'color-palette-outline';
  
  // Ícone padrão para outras atividades
  return 'calendar-outline';
};

export default function UtenteActivities() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);

  const fetchUtenteActivities = async () => {
    try {
      // Buscar o documento do utente
      const utentesRef = collection(LarApp_db, "utentes");
      const q = query(utentesRef, where("id", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const utenteData = querySnapshot.docs[0].data();
        console.log("Dados do utente:", utenteData);
        console.log("Atividades do utente:", utenteData.atividades);
        
        if (utenteData.atividades && Array.isArray(utenteData.atividades)) {
          setActivities(utenteData.atividades);
        } else {
          console.log("Nenhuma atividade encontrada para o utente");
          setActivities([]);
        }
      } else {
        console.log("Utente não encontrado");
        setActivities([]);
      }
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUtenteActivities();
  }, [userId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUtenteActivities();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Minhas Atividades</Text>
          </View>
        </View>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minhas Atividades</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007bff"]}
            tintColor="#007bff"
          />
        }
      >
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            console.log("Renderizando atividade:", activity);
            const activityName = activity.titulo || activity.nome || "Atividade";
            const iconName = getActivityIcon(activityName);
            
            return (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.iconContainer}>
                    <Icon name={iconName} size={28} color="#fff" />
                  </View>
                  <View style={styles.titleContainer}>
                    <Text style={styles.activityName}>{activityName}</Text>
                    {activity.horario && (
                      <Text style={styles.timeText}>{activity.horario}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.activityDetails}>
                  {activity.local && (
                    <View style={styles.detailRow}>
                      <Icon name="location-outline" size={20} color="#007bff" />
                      <Text style={styles.detailText}>{activity.local}</Text>
                    </View>
                  )}
                  
                  {activity.instrutor && (
                    <View style={styles.detailRow}>
                      <Icon name="person-outline" size={20} color="#007bff" />
                      <Text style={styles.detailText}>Instrutor: {activity.instrutor}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.noActivitiesContainer}>
            <Icon name="information-circle-outline" size={48} color="#666" />
            <Text style={styles.noActivitiesText}>Nenhuma atividade encontrada</Text>
          </View>
        )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  userIdText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  activityCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "500",
  },
  activityDetails: {
    marginBottom: 0,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  noActivitiesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  noActivitiesText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
}); 