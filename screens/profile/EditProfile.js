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
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Modal
} from 'react-native';
import { useAuth } from '../../hooks/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { auth, LarApp_db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditProfileScreen() {
  const { user, userData, fetchUserData } = useAuth();
  const navigation = useNavigation();
  const [hasCheckedRole, setHasCheckedRole] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [contacto, setContacto] = useState('');
  const [morada, setMorada] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [condicoesMedicas, setCondicoesMedicas] = useState('');
  const [medicacoes, setMedicacoes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch latest user data when screen loads
  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(LarApp_db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setContacto(data.contacto || '');
          setMorada(data.morada || '');
          setDataNascimento(data.dataNascimento || '');
          setCondicoesMedicas(data.condicoesMedicas || '');
          setMedicacoes(data.medicacoes || '');

          // Check role after loading data
          if (!hasCheckedRole) {
            setHasCheckedRole(true);
            if (data.role?.toLowerCase() !== 'admin') {
              Alert.alert(
                'Acesso Negado',
                'Apenas administradores podem editar perfis.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        Alert.alert(
          'Erro',
          'Não foi possível carregar os dados do usuário. Por favor, tente novamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUserData();
  }, [user, navigation, hasCheckedRole]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('pt-PT');
      setDataNascimento(formattedDate);
    }
  };

  const getInitialDate = () => {
    if (dataNascimento) {
      const [day, month, year] = dataNascimento.split('/');
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(LarApp_db, 'users', user.uid);
      const updatedData = {
        name: name.trim(),
        contacto: contacto.trim(),
        morada: morada.trim(),
        dataNascimento: dataNascimento,
        condicoesMedicas: condicoesMedicas.trim(),
        medicacoes: medicacoes.trim(),
        updatedAt: new Date().toISOString()
      };

      // Check if document exists
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, updatedData);
      } else {
        // Create new document with all required fields
        await setDoc(userDocRef, {
          ...updatedData,
          email: user.email,
          role: userData?.role || 'utente',
          createdAt: new Date(),
        });
      }
      
      // Update local storage
      const currentData = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(currentData);
      const newUserData = {
        ...parsedData,
        ...updatedData
      };
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));

      // Refresh the user data in the context
      if (typeof fetchUserData === 'function') {
        await fetchUserData(user.uid);
      } else {
        console.warn('fetchUserData is not available');
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao atualizar o perfil. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo *</Text>
              <View style={styles.inputContainer}>
                <Icon name="person-outline" size={24} color="#007bff" />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputContainer}>
                <Icon name="call-outline" size={24} color="#007bff" />
                <TextInput
                  style={styles.input}
                  value={contacto}
                  onChangeText={setContacto}
                  placeholder="Seu telefone"
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
                <Icon name="calendar-outline" size={24} color="#007bff" />
                <Text style={[styles.input, !dataNascimento && styles.placeholderText]}>
                  {dataNascimento || 'Selecione uma data'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Morada</Text>
              <View style={styles.inputContainer}>
                <Icon name="home-outline" size={24} color="#007bff" />
                <TextInput
                  style={styles.input}
                  value={morada}
                  onChangeText={setMorada}
                  placeholder="Sua morada"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {userData?.role === 'utente' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Condições Médicas</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="fitness-outline" size={24} color="#007bff" />
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={condicoesMedicas}
                      onChangeText={setCondicoesMedicas}
                      placeholder="Suas condições médicas"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Medicações</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="medical-outline" size={24} color="#007bff" />
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={medicacoes}
                      onChangeText={setMedicacoes}
                      placeholder="Suas medicações"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="save-outline" size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showDatePicker && (
          <Modal
            transparent={true}
            visible={showDatePicker}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>Selecione a Data</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Icon name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={getInitialDate()}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    style={styles.datePicker}
                    textColor="#000"
                  />
                ) : (
                  <DateTimePicker
                    value={getInitialDate()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#007bff',
  },
  headerRight: {
    width: 24, // To balance the back button
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  placeholderText: {
    color: '#999',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  datePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
  },
});
