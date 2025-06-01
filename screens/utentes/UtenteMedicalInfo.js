import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';

export default function UtenteMedicalInfo({ navigation }) {
  const { user, userData } = useAuth();
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicalData();
  }, []);

  const fetchMedicalData = async () => {
    try {
      const utentesRef = collection(LarApp_db, 'utentes');
      const q = query(utentesRef, where('id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const utenteDoc = querySnapshot.docs[0];
        const utenteData = utenteDoc.data();
        setMedicalData(utenteData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Informações Médicas</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Medicamentos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="medical-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Medicamentos</Text>
          </View>
          <View style={styles.card}>
            {medicalData?.medicamentos?.length > 0 ? (
              medicalData.medicamentos.map((med, index) => (
                <View key={index} style={[styles.medicationItem, index !== medicalData.medicamentos.length - 1 && styles.medicationItemBorder]}>
                  <View style={styles.medicationInfo}>
                    <View style={styles.medicationHeader}>
                      <View style={styles.medicationTitleContainer}>
                        <Icon name="medkit-outline" size={20} color="#007bff" style={styles.medicationIcon} />
                        <Text style={styles.medicationName}>{med.nome}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: med.status === 'pendente' ? '#fff3cd' : '#d4edda' }]}>
                        <Icon 
                          name={med.status === 'pendente' ? 'time' : 'checkmark-circle'} 
                          size={12} 
                          color={med.status === 'pendente' ? '#856404' : '#155724'} 
                          style={styles.statusIcon}
                        />
                        <Text style={[styles.statusText, { color: med.status === 'pendente' ? '#856404' : '#155724' }]}>
                          {med.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.medicationDetailsContainer}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="fitness-outline" size={16} color="#666" />
                        </View>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Dosagem</Text>
                          <Text style={styles.medicationDetails}>{med.dosagem}</Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="time-outline" size={16} color="#666" />
                        </View>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Horário</Text>
                          <Text style={styles.medicationDetails}>{med.horario}</Text>
                        </View>
                      </View>
                      {med.dataInicio && (
                        <View style={styles.detailRow}>
                          <View style={styles.detailIconContainer}>
                            <Icon name="calendar-outline" size={16} color="#666" />
                          </View>
                          <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Início</Text>
                            <Text style={styles.medicationDetails}>
                              {med.dataInicio.toDate().toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Nenhum medicamento registrado</Text>
            )}
          </View>
        </View>

        {/* Sinais Vitais Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="pulse-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Sinais Vitais</Text>
          </View>
          <View style={styles.card}>
            {medicalData?.dadosVitais?.length > 0 ? (
              <View style={styles.vitalSignsGrid}>
                <View style={[styles.vitalSignCard, { backgroundColor: '#e3f2fd' }]}>
                  <Icon name="pulse" size={24} color="#1976d2" style={styles.vitalSignIcon} />
                  <Text style={styles.vitalSignLabel}>Pressão Arterial</Text>
                  <Text style={styles.vitalSignValue}>
                    {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].pressao}
                  </Text>
                  <Text style={styles.vitalSignUnit}>mmHg</Text>
                  <Text style={styles.vitalSignDate}>
                    {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].data.toDate().toLocaleDateString()}
                  </Text>
                  <Text style={styles.vitalSignRegistrado}>
                    Registrado por: {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].registradoPor}
                  </Text>
                </View>

                <View style={[styles.vitalSignCard, { backgroundColor: '#fff9c4' }]}>
                  <Icon name="thermometer" size={24} color="#f57f17" style={styles.vitalSignIcon} />
                  <Text style={styles.vitalSignLabel}>Temperatura</Text>
                  <Text style={styles.vitalSignValue}>
                    {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].temperatura}
                  </Text>
                  <Text style={styles.vitalSignUnit}>°C</Text>
                  <Text style={styles.vitalSignDate}>
                    {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].data.toDate().toLocaleDateString()}
                  </Text>
                  <Text style={styles.vitalSignRegistrado}>
                    Registrado por: {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].registradoPor}
                  </Text>
                </View>

                <View style={[styles.vitalSignCard, { backgroundColor: '#fce4ec' }]}>
                  <Icon name="heart" size={24} color="#c2185b" style={styles.vitalSignIcon} />
                  <Text style={styles.vitalSignLabel}>Frequência Cardíaca</Text>
                  <Text style={styles.vitalSignValue}>
                    {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].frequenciaCardiaca}
                  </Text>
                  <Text style={styles.vitalSignUnit}>bpm</Text>
                  <Text style={styles.vitalSignDate}>
                    {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].data.toDate().toLocaleDateString()}
                  </Text>
                  <Text style={styles.vitalSignRegistrado}>
                    Registrado por: {medicalData.dadosVitais[medicalData.dadosVitais.length - 1].registradoPor}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>Nenhum dado vital registrado</Text>
            )}
          </View>
        </View>

        {/* Atividades Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Atividades</Text>
          </View>
          <View style={styles.card}>
            {medicalData?.atividades?.length > 0 ? (
              medicalData.atividades.map((atividade, index) => (
                <View key={index} style={[styles.medicationItem, index !== medicalData.atividades.length - 1 && styles.medicationItemBorder]}>
                  <View style={styles.medicationInfo}>
                    <View style={styles.medicationHeader}>
                      <View style={styles.medicationTitleContainer}>
                        <Icon name="calendar" size={20} color="#007bff" style={styles.medicationIcon} />
                        <Text style={styles.medicationName}>{atividade.titulo}</Text>
                      </View>
                    </View>
                    <View style={styles.medicationDetailsContainer}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="time-outline" size={16} color="#666" />
                        </View>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Horário</Text>
                          <Text style={styles.medicationDetails}>{atividade.horario}</Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="location-outline" size={16} color="#666" />
                        </View>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Local</Text>
                          <Text style={styles.medicationDetails}>{atividade.local}</Text>
                        </View>
                      </View>
                      {atividade.dataCriacao && (
                        <View style={styles.detailRow}>
                          <View style={styles.detailIconContainer}>
                            <Icon name="calendar-outline" size={16} color="#666" />
                          </View>
                          <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Data</Text>
                            <Text style={styles.medicationDetails}>
                              {atividade.dataCriacao.toDate().toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Nenhuma atividade registrada</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medicationItem: {
    marginBottom: 15,
    paddingBottom: 15,
  },
  medicationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicationIcon: {
    marginRight: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  medicationDetailsContainer: {
    marginTop: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  vitalSignsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  vitalSignCard: {
    width: '31%',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vitalSignIcon: {
    marginBottom: 6,
  },
  vitalSignLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  vitalSignValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  vitalSignUnit: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  vitalSignDate: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  vitalSignRegistrado: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
}); 