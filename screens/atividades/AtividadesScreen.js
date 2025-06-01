import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import BackButton from '../../components/BackButton';
import AdicionarAtividadeScreen from './AdicionarAtividadeScreen';
import { useFocusEffect } from '@react-navigation/native';

export default function AtividadesScreen({ navigation }) {
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchAtividades();
    }, [])
  );

  const fetchAtividades = async () => {
    try {
      setLoading(true);
      const atividadesRef = collection(LarApp_db, 'atividades');
      const q = query(atividadesRef, orderBy('dataCriacao', 'desc'));
      const querySnapshot = await getDocs(q);
      const atividadesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAtividades(atividadesData);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAtividades();
  }, []);

  const formatarData = (data) => {
    if (!data) return '';
    const dataObj = data?.toDate?.() || new Date(data);
    return dataObj.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderAtividade = ({ item }) => (
    <TouchableOpacity 
      style={styles.atividadeCard}
      onPress={() => navigation.navigate('DetalhesAtividade', { atividadeId: item.id })}
    >
      <View style={styles.atividadeHeader}>
        <Icon name="calendar-outline" size={24} color="#007bff" />
        <Text style={styles.atividadeTitulo}>{item.titulo}</Text>
      </View>
      <View style={styles.atividadeInfo}>
        <Text style={styles.atividadeHorario}>
          <Icon name="time-outline" size={16} color="#666" /> {item.horario}
        </Text>
        <Text style={styles.atividadeLocal}>
          <Icon name="location-outline" size={16} color="#666" /> {item.local}
        </Text>
      </View>
      <Text style={styles.atividadeDescricao}>{item.descricao}</Text>
      <View style={styles.atividadeFooter}>
        <Text style={styles.atividadeData}>
          <Icon name="calendar-outline" size={16} color="#666" /> {formatarData(item.dataCriacao)}
        </Text>
        <Text style={styles.atividadeParticipantes}>
          <Icon name="people-outline" size={16} color="#666" /> {item.participantes?.length || 0} participantes
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Lista de Atividades</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <FlatList
          data={atividades}
          renderItem={renderAtividade}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007bff']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma atividade registada</Text>
            </View>
          }
        />
      )}

      <AdicionarAtividadeScreen
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onActivityAdded={fetchAtividades}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    paddingTop: '25%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  atividadeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  atividadeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  atividadeTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  atividadeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  atividadeHorario: {
    color: '#666',
    fontSize: 14,
  },
  atividadeLocal: {
    color: '#666',
    fontSize: 14,
  },
  atividadeDescricao: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  atividadeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  atividadeData: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  atividadeParticipantes: {
    color: '#666',
    fontSize: 14,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
}); 