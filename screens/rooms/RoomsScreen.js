import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, onSnapshot } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import AddQuartoModal from './AddQuartoModal';
import QuartoDetalhesModal from './RoomDetail';
import BackButton from '../../components/BackButton';

export default function QuartosScreen({ navigation }) {
  const [quartos, setQuartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedQuarto, setSelectedQuarto] = useState(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(LarApp_db, 'quartos'), (snapshot) => {
      const quartosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuartos(quartosData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredQuartos = quartos.filter((q) =>
    q.numero.toString().includes(searchText)
  );

  const contarQuartos = (estado) => {
    return quartos.filter((q) => q.estado.toLowerCase() === estado).length;
  };

  const renderQuarto = ({ item }) => {
    const isOcupado = item.estado.toLowerCase() === 'ocupado';
    return (
      <View style={[styles.card, { borderColor: isOcupado ? '#28a745' : '#ffc107' }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Quarto {item.numero}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isOcupado ? '#d4edda' : '#fff3cd' }]}>
            <Text style={[styles.statusText, { color: isOcupado ? '#28a745' : '#ffc107' }]}>
              {isOcupado ? 'Ocupado' : 'Livre'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardSubTitle}>{item.tipo}</Text>

        <View style={styles.iconRow}>
          <Icon name="person" size={18} color="#333" />
        </View>

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => {
            setSelectedQuarto(item);
            setDetailModalVisible(true);
          }}
        >
          <Text style={styles.detailButtonText}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <Text style={styles.headerTitle}>Gestão de Quartos</Text>
      <Text style={styles.headerSubtitle}>Lista e detalhe de Quarto</Text>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Pesquisar quartos..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addButton}>
          <Icon name="bed" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}><Text style={styles.statNumber}>{quartos.length}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statBox}><Text style={[styles.statNumber, { color: '#dc3545' }]}>{contarQuartos('ocupado')}</Text><Text style={styles.statLabel}>Ocupados</Text></View>
        <View style={styles.statBox}><Text style={[styles.statNumber, { color: '#28a745' }]}>{contarQuartos('livre')}</Text><Text style={styles.statLabel}>Livres</Text></View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={filteredQuartos.sort((a, b) => a.numero - b.numero)}
          keyExtractor={(item) => item.id}
          renderItem={renderQuarto}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <AddQuartoModal visible={isAddModalVisible} onClose={() => setAddModalVisible(false)} />
      <QuartoDetalhesModal
        visible={isDetailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        quarto={selectedQuarto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff', paddingTop: "25%" },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  headerSubtitle: { color: '#666', marginBottom: 15 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 10 },
  addButton: { backgroundColor: '#e6f0ff', padding: 10, borderRadius: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 14, color: '#666' },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  statusBadge: { borderRadius: 12, paddingVertical: 2, paddingHorizontal: 8 },
  statusText: { fontWeight: 'bold' },
  cardSubTitle: { fontSize: 14, color: '#666', marginBottom: 8 },
  iconRow: { flexDirection: 'row', marginBottom: 10 },
  detailButton: { backgroundColor: '#e0e0e0', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  detailButtonText: { color: '#333', fontWeight: 'bold' },
});
