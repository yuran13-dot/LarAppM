import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, addDoc } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import 'moment/locale/pt-br';
import moment from 'moment';

export default function AdicionarAtividadeScreen({ visible, onClose, onActivityAdded }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = moment(selectedTime).format('HH:mm');
      setHorario(formattedTime);
    }
  };

  const handleSubmit = async () => {
    if (!titulo || !descricao || !horario || !local) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const dataCriacao = new Date();
      const atividadeRef = collection(LarApp_db, 'atividades');
      await addDoc(atividadeRef, {
        titulo,
        descricao,
        horario,
        local,
        dataCriacao,
        participantes: []
      });

      Alert.alert('Sucesso', 'Atividade adicionada com sucesso!');
      onClose();
      onActivityAdded();
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a atividade. Tente novamente.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nova Atividade</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Digite o título da atividade"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Digite a descrição da atividade"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Horário</Text>
              <TouchableOpacity
                style={[styles.input, styles.timePickerButton]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={[styles.timePickerText, !horario && styles.placeholderText]}>
                  {horario || 'Selecionar Horário'}
                </Text>
                <Icon name="time-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showTimePicker && (
                <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    style={Platform.OS === 'ios' ? styles.iosPicker : null}
                    textColor="#000000"
                    themeVariant="light"
                    locale="pt-PT"
                    minuteInterval={1}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Local</Text>
              <TextInput
                style={styles.input}
                value={local}
                onChangeText={setLocal}
                placeholder="Digite o local da atividade"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Adicionar Atividade</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    flex: 1,
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
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
  },
  iosPicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
  },
}); 