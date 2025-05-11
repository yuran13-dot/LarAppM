import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackButton from '../../components/BackButton';
import AddUtenteModal from '../utentes/addUtente';
import styles from './styles';

import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';

export default function UtentesScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [utentes, setUtentes] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);

  // Carregar utentes do Firestore automaticamente
  useEffect(() => {
    const q = query(collection(LarApp_db, 'utentes'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUtentes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUtentes(fetchedUtentes);
    });

    return () => unsubscribe();
  }, []);

  const filteredUtentes = utentes.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.utenteItem}>
      <View style={styles.utenteInfo}>
        <FontAwesome name="user-circle" size={40} color="#007bff" style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.utenteNome}>{item.nome}</Text>
          <Text style={styles.utenteQuarto}>Quarto: {item.quarto}</Text> 
        </View>
  
        <TouchableOpacity style={styles.iconAction} onPress={() => console.log('Editar', item.id)}>
          <Icon name="pencil-outline" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconAction} onPress={() => console.log('Excluir', item.id)}>
          <Icon name="trash-outline" size={20} color="#d11a2a" />
        </TouchableOpacity>
      </View>
    </View>
  );
  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <BackButton />

      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Utentes</Text>
        <Text style={styles.subtitle}>Lista e detalhe de utentes</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={18} color="#007bff" style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar utentes..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {filteredUtentes.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum utente encontrado.</Text>
      ) : (
        <FlatList
          data={filteredUtentes}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      
      <AddUtenteModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
