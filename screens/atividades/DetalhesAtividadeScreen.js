import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import EditarAtividadeScreen from './EditarAtividadeScreen';

export default function DetalhesAtividadeScreen({ route, navigation }) {
  const { atividadeId } = route.params;
  const [atividade, setAtividade] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [utentes, setUtentes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    fetchAtividadeDetails();
  }, []);

  const fetchAtividadeDetails = async () => {
    try {
      setLoading(true);
      // Buscar detalhes da atividade
      const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
      const atividadeDoc = await getDoc(atividadeRef);
      
      if (atividadeDoc.exists()) {
        const atividadeData = atividadeDoc.data() || {};
        console.log('Dados da atividade:', atividadeData);
        setAtividade({ id: atividadeDoc.id, ...atividadeData });

        // Buscar informações dos utentes participantes
        const participantesData = [];
        const participantesAtuais = atividadeData.participantes || [];
        console.log('Participantes atuais:', participantesAtuais);
        
        if (participantesAtuais.length > 0) {
          for (const participante of participantesAtuais) {
            console.log('Processando participante:', participante);
            if (participante && participante.id) {
              const utenteRef = doc(LarApp_db, 'utentes', participante.id);
              const utenteDoc = await getDoc(utenteRef);
              
              if (utenteDoc.exists()) {
                const utenteData = utenteDoc.data() || {};
                console.log('Dados do utente encontrado:', utenteData);
                participantesData.push({
                  utenteId: participante.id,
                  nome: utenteData.nome || participante.nome,
                  ...utenteData
                });
              } else {
                console.log('Utente não encontrado:', participante.id);
                // Se o utente não for encontrado, usa os dados do participante
                participantesData.push({
                  utenteId: participante.id,
                  nome: participante.nome,
                  ...participante
                });
              }
            }
          }
        }
        console.log('Lista final de participantes:', participantesData);
        setParticipantes(participantesData);
      } else {
        console.error('Atividade não encontrada');
        Alert.alert('Erro', 'Atividade não encontrada.');
        navigation.goBack();
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da atividade:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os detalhes da atividade. Tente novamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUtentes = async () => {
    try {
      const utentesRef = collection(LarApp_db, 'utentes');
      const querySnapshot = await getDocs(utentesRef);
      const utentesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUtentes(utentesList || []);
      // Filtra os utentes que já são participantes
      const availableUtentes = utentesList.filter(utente => 
        !participantes.some(p => p.utenteId === utente.id)
      );
      setSearchResults(availableUtentes || []);
    } catch (error) {
      console.error('Erro ao buscar utentes:', error);
      setUtentes([]);
      setSearchResults([]);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filtered = utentes.filter(utente => 
        utente.nome.toLowerCase().includes(text.toLowerCase()) &&
        !participantes.some(p => p.utenteId === utente.id)
      );
      setSearchResults(filtered || []);
    } else {
      // Mostra todos os utentes que ainda não são participantes
      const availableUtentes = utentes.filter(utente => 
        !participantes.some(p => p.utenteId === utente.id)
      );
      setSearchResults(availableUtentes || []);
    }
  };

  const handleModalOpen = () => {
    setModalVisible(true);
    fetchUtentes();
  };

  const adicionarParticipante = async (utente) => {
    console.log('Iniciando adição de participante:', utente);
    
    if (!utente || !utente.id || !utente.nome) {
      console.error('Dados do utente inválidos:', utente);
      Alert.alert('Erro', 'Dados do utente inválidos.');
      return;
    }

    try {
      const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
      // Buscar o utente pelo número de utente em vez do ID
      const utentesRef = collection(LarApp_db, 'utentes');
      const q = query(utentesRef, where('numeroUtente', '==', utente.numeroUtente));
      const querySnapshot = await getDocs(q);
      
      console.log('Buscando utente pelo número:', utente.numeroUtente);
      
      if (querySnapshot.empty) {
        console.error('Utente não encontrado no Firestore:', utente.numeroUtente);
        Alert.alert('Erro', 'Utente não encontrado no sistema.');
        return;
      }

      const utenteDoc = querySnapshot.docs[0];
      const utenteRef = utenteDoc.ref;
      const utenteData = utenteDoc.data();
      
      console.log('Dados do utente encontrado:', utenteData);
      
      const atividadesAtuais = utenteData.atividades || [];
      console.log('Atividades atuais do utente:', atividadesAtuais);

      // Buscar dados atuais da atividade
      const atividadeDoc = await getDoc(atividadeRef);
      console.log('Documento da atividade encontrado:', atividadeDoc.exists());
      
      if (!atividadeDoc.exists()) {
        console.error('Atividade não encontrada:', atividadeId);
        Alert.alert('Erro', 'Atividade não encontrada no sistema.');
        return;
      }

      const atividadeData = atividadeDoc.data();
      console.log('Dados da atividade:', atividadeData);

      // Verificar se o utente já está na atividade
      if (atividadesAtuais.some(a => a.id === atividadeId)) {
        console.log('Utente já está na atividade');
        Alert.alert('Aviso', 'Este utente já é participante da atividade.');
        return;
      }
      
      const participantesAtuais = atividadeData.participantes || [];
      console.log('Participantes atuais:', participantesAtuais);

      // Verificar se o utente já é participante
      if (participantesAtuais.some(p => p.id === utente.id)) {
        console.log('Utente já é participante');
        Alert.alert('Aviso', 'Este utente já é participante da atividade.');
        return;
      }

      // Adicionar o novo participante ao array com ID e nome
      const novoParticipante = {
        id: utente.id,
        nome: utente.nome
      };
      
      const novosParticipantes = [...participantesAtuais, novoParticipante];
      console.log('Novos participantes:', novosParticipantes);
      
      // Preparar os dados completos da atividade para o utente
      const dadosAtividade = {
        id: atividadeId,
        titulo: atividadeData.titulo || '',
        descricao: atividadeData.descricao || '',
        horario: atividadeData.horario || '',
        local: atividadeData.local || '',
        dataCriacao: atividadeData.dataCriacao || new Date(),
        dataAtualizacao: new Date()
      };
      
      // Atualizar o documento da atividade
      await updateDoc(atividadeRef, {
        participantes: novosParticipantes,
        dataAtualizacao: new Date()
      });
      console.log('Atividade atualizada com sucesso');

      // Atualizar o documento do utente com os dados completos da atividade
      const atividadesAtualizadas = [...atividadesAtuais, dadosAtividade];
      await updateDoc(utenteRef, {
        atividades: atividadesAtualizadas
      });
      console.log('Utente atualizado com sucesso');
      
      // Atualizar o estado local
      setParticipantes(prev => [...prev, { utenteId: utente.id, ...utente }]);
      
      // Atualizar a lista de resultados da pesquisa
      setSearchResults(prev => prev.filter(u => u.id !== utente.id));
      setSearchQuery('');
      
      // Atualizar a lista de utentes disponíveis
      const availableUtentes = utentes.filter(u => 
        !novosParticipantes.some(p => p.id === u.id)
      );
      setSearchResults(availableUtentes || []);

      Alert.alert('Sucesso', 'Participante adicionado com sucesso!');
    } catch (error) {
      console.error('Erro detalhado ao adicionar participante:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o participante. Tente novamente.');
    }
  };

  const removerParticipante = async (utenteId) => {
    if (!utenteId) {
      console.error('ID do utente não fornecido');
      return;
    }

    try {
      // Primeiro, encontrar o utente pelo ID
      const utentesRef = collection(LarApp_db, 'utentes');
      const q = query(utentesRef, where('id', '==', utenteId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error('Utente não encontrado:', utenteId);
        Alert.alert('Erro', 'Utente não encontrado no sistema.');
        return;
      }

      const utenteDoc = querySnapshot.docs[0];
      const utenteRef = utenteDoc.ref;
      const utenteData = utenteDoc.data();
      const atividadesAtuais = utenteData.atividades || [];

      // Remover a atividade do array de atividades do utente
      const atividadesAtualizadas = atividadesAtuais.filter(a => a.id !== atividadeId);

      // Atualizar o documento do utente
      await updateDoc(utenteRef, {
        atividades: atividadesAtualizadas
      });

      // Agora atualizar a atividade
      const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
      const atividadeDoc = await getDoc(atividadeRef);
      
      if (atividadeDoc.exists()) {
        const atividadeData = atividadeDoc.data();
        const participantesAtuais = atividadeData.participantes || [];
        
        // Remove o participante do array
        const novosParticipantes = participantesAtuais.filter(p => p.id !== utenteId);
        
        // Atualiza o documento da atividade
        await updateDoc(atividadeRef, {
          participantes: novosParticipantes,
          dataAtualizacao: new Date()
        });
        
        // Atualiza o estado local
        setParticipantes(participantes.filter(p => p.utenteId !== utenteId));
        
        // Adiciona o utente de volta à lista de resultados da pesquisa
        const utenteRemovido = participantes.find(p => p.utenteId === utenteId);
        if (utenteRemovido) {
          setSearchResults([...searchResults, utenteRemovido]);
        }

        Alert.alert('Sucesso', 'Participante removido com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      Alert.alert('Erro', 'Não foi possível remover o participante. Tente novamente.');
    }
  };

  const removerAtividade = async () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const atividadeRef = doc(LarApp_db, 'atividades', atividadeId);
              await deleteDoc(atividadeRef);
              Alert.alert('Sucesso', 'Atividade excluída com sucesso.');
              navigation.goBack();
            } catch (error) {
              console.error('Erro ao excluir atividade:', error);
              Alert.alert('Erro', 'Não foi possível excluir a atividade. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  const formatarData = (data) => {
    if (!data) return '';
    const dataObj = data?.toDate?.() || new Date(data);
    return dataObj.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleAtividadeEditada = () => {
    fetchAtividadeDetails();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Atividade</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Icon name="create-outline" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={removerAtividade}
          >
            <Icon name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.contentHeader}>
          <Text style={styles.title}>{atividade?.titulo}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleModalOpen}
          >
            <Icon name="person-add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Icon name="calendar-outline" size={20} color="#007bff" />
            <Text style={styles.infoText}>{formatarData(atividade?.dataCriacao)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="time-outline" size={20} color="#007bff" />
            <Text style={styles.infoText}>{atividade?.horario}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="location-outline" size={20} color="#007bff" />
            <Text style={styles.infoText}>{atividade?.local}</Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{atividade?.descricao}</Text>
        </View>

        <View style={styles.participantsSection}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="people" size={20} color="#333" />
            <Text style={styles.sectionTitle}>Participantes ({participantes.length})</Text>
          </View>
          {participantes.length > 0 ? (
            <FlatList
              data={participantes}
              keyExtractor={item => item.utenteId}
              renderItem={({ item }) => (
                <View style={styles.participantItem}>
                  <View style={styles.participantInfo}>
                    <Icon name="person" size={20} color="#666" />
                    <Text style={styles.participantName}>{item.nome}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removerParticipante(item.utenteId)}
                    style={styles.removeButton}
                  >
                    <Icon name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhum participante registado</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Participante</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar utente..."
              value={searchQuery}
              onChangeText={handleSearch}
            />

            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => adicionarParticipante(item)}
                >
                  <Icon name="person" size={20} color="#666" />
                  <Text style={styles.searchResultText}>{item.nome}</Text>
                  <Icon name="add-circle" size={24} color="#007bff" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptySearchText}>Nenhum utente encontrado</Text>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>

      <EditarAtividadeScreen
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        atividade={atividade}
        onAtividadeEditada={handleAtividadeEditada}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 5,
    marginRight: 10,
  },
  deleteButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  participantsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  emptySearchText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
}); 