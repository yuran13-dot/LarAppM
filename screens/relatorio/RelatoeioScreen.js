import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function RelatorioScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all activities
      const activitiesRef = collection(LarApp_db, 'atividades');
      const activitiesQuery = query(activitiesRef);
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activitiesData = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);

      // Fetch patients
      const patientsRef = collection(LarApp_db, 'utentes');
      const patientsQuery = query(patientsRef, orderBy('nome'));
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsData = patientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório</Text>
      </View>
      <ScrollView style={styles.container}>
        {/* Activities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>Atividades</Text>
          </View>
          {activities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={40} color="#ccc" />
              <Text style={styles.noDataText}>Nenhuma atividade encontrada</Text>
            </View>
          ) : (
            activities.map((activity) => (
              <View key={activity.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="create-outline" size={20} color="#2196F3" />
                  <Text style={styles.cardTitle}>{activity.titulo || activity.nome}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Icon name="time-outline" size={16} color="#666" />
                  <Text style={styles.cardSubtitle}>Data: {formatDate(activity.data)}</Text>
                </View>
                <View style={styles.participantsContainer}>
                  <View style={styles.participantsHeader}>
                    <Icon name="people-outline" size={16} color="#666" />
                    <Text style={styles.cardText}>Participantes:</Text>
                  </View>
                  {activity.participantes?.map((participant, index) => (
                    <View key={index} style={styles.participantItem}>
                      <Icon name="person-outline" size={14} color="#2196F3" />
                      <Text style={styles.listItem}>
                        {typeof participant === 'object' ? participant.nome : participant}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Patients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="users" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>Utentes</Text>
          </View>
          {patients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={40} color="#ccc" />
              <Text style={styles.noDataText}>Nenhum utente encontrado</Text>
            </View>
          ) : (
            patients.map((patient) => (
              <View key={patient.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Icon name="person-outline" size={20} color="#2196F3" />
                  <Text style={styles.cardTitle}>{patient.nome}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Icon name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.cardSubtitle}>Idade: {patient.idade}</Text>
                </View>
                <View style={styles.medicationsContainer}>
                  <View style={styles.medicationsHeader}>
                    <Icon name="medkit-outline" size={16} color="#666" />
                    <Text style={styles.cardText}>Medicamentos:</Text>
                  </View>
                  {patient.medicamentos?.map((med, index) => (
                    <View key={index} style={styles.medicationItem}>
                      <Icon name="medical-outline" size={14} color="#2196F3" />
                      <Text style={styles.listItem}>{med.nome} - {med.dosagem}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  participantsContainer: {
    marginTop: 8,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationsContainer: {
    marginTop: 8,
  },
  medicationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});