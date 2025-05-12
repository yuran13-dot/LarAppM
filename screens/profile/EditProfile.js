import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../hooks/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, LarApp_db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditProfileScreen() {
  const { user, userData, fetchUserData } = useAuth();
  const navigation = useNavigation();
  const [hasCheckedRole, setHasCheckedRole] = useState(false);

  // Check role after userData is loaded
  useEffect(() => {
    if (userData && !hasCheckedRole) {
      setHasCheckedRole(true);
      console.log('User role:', userData.role);
      
      // Case-insensitive role check
      if (userData.role.toLowerCase() !== 'admin') {
        Alert.alert(
          'Acesso Negado',
          'Apenas administradores podem editar perfis.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }
  }, [userData, navigation, hasCheckedRole]);

  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [morada, setMorada] = useState(userData?.morada || '');
  const [nascimento, setNascimento] = useState(userData?.nascimento || '');
  const [condicoesMedicas, setCondicoesMedicas] = useState(userData?.condicoesMedicas || '');
  const [medicacoes, setMedicacoes] = useState(userData?.medicacoes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('pt-PT');
      setNascimento(formattedDate);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(LarApp_db, 'user', user.uid);
      const updatedData = {
        name: name.trim(),
        phone: phone.trim(),
        morada: morada.trim(),
        nascimento,
        updatedAt: new Date(),
      };

      // Add medical info only for utentes
      if (userData?.role === 'utente') {
        updatedData.condicoesMedicas = condicoesMedicas.trim();
        updatedData.medicacoes = medicacoes.trim();
      }

      await updateDoc(userDocRef, updatedData);
      
      // Update local storage
      const currentData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(currentData);
      const newUserData = {
        ...parsedData,
        ...updatedData
      };
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));

      // Refresh the user data in the context
      await fetchUserData(user.uid);

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Perfil</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo *</Text>
          <View style={styles.inputContainer}>
            <Icon name="person-outline" size={20} color="#007bff" />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefone</Text>
          <View style={styles.inputContainer}>
            <Icon name="call-outline" size={20} color="#007bff" />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Seu número de telefone"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Nascimento</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-outline" size={20} color="#007bff" />
            <Text style={styles.dateText}>{nascimento || 'Selecionar data'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Morada</Text>
          <View style={styles.inputContainer}>
            <Icon name="home-outline" size={20} color="#007bff" />
            <TextInput
              style={styles.input}
              value={morada}
              onChangeText={setMorada}
              placeholder="Sua morada"
              multiline
            />
          </View>
        </View>

        {userData?.role === 'utente' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Condições Médicas</Text>
              <View style={styles.inputContainer}>
                <Icon name="fitness-outline" size={20} color="#007bff" />
                <TextInput
                  style={styles.input}
                  value={condicoesMedicas}
                  onChangeText={setCondicoesMedicas}
                  placeholder="Suas condições médicas"
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medicações</Text>
              <View style={styles.inputContainer}>
                <Icon name="medical-outline" size={20} color="#007bff" />
                <TextInput
                  style={styles.input}
                  value={medicacoes}
                  onChangeText={setMedicacoes}
                  placeholder="Suas medicações"
                  multiline
                />
              </View>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
           
            <Text style={styles.saveButtonText}>Guardar </Text>
          </>
        )}
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={nascimento ? new Date(nascimento) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    paddingTop: 30,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
});
