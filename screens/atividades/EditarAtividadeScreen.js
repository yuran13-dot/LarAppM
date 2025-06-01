import React, { useState, useEffect } from 'react';
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
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import 'moment/locale/pt-br';
import moment from 'moment';

export default function EditarAtividadeScreen({ visible, onClose, atividade, onAtividadeEditada }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (atividade) {
      setTitulo(atividade.titulo || '');
      setDescricao(atividade.descricao || '');
      setHorario(atividade.horario || '');
      setLocal(atividade.local || '');
      if (atividade.data) {
        const dataObj = atividade.data.toDate();
        setSelectedDate(dataObj);
        setData(dataObj.toLocaleDateString('pt-PT'));
      }
      if (atividade.horario) {
        const [hours, minutes] = atividade.horario.split(':');
        const time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes));
        setSelectedTime(time);
      }
    }
  }, [atividade]);

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = moment(selectedTime).format('HH:mm');
      setHorario(formattedTime);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
      setData(formattedDate);
    }
  };

  const handleSubmit = async () => {
    if (!titulo || !descricao || !horario || !local || !data) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      const atividadeRef = doc(LarApp_db, 'atividades', atividade.id);
      
      // Converter a data do formato pt-PT para Date
      const [day, month, year] = data.split('/');
      const dataObj = new Date(year, month - 1, day);

      await updateDoc(atividadeRef, {
        titulo,
        descricao,
        horario,
        local,
        data: dataObj,
        dataAtualizacao: new Date()
      });

      Alert.alert('Sucesso', 'Atividade atualizada com sucesso!');
      onAtividadeEditada();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a atividade. Tente novamente.');
    } finally {
      setLoading(false);
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
            <Text style={styles.modalTitle}>Editar Atividade</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data</Text>
              <TouchableOpacity
                style={[styles.input, styles.timePickerButton]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.timePickerText, !data && styles.placeholderText]}>
                  {data || 'Selecionar Data'}
                </Text>
                <Icon name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showDatePicker && (
                <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    style={Platform.OS === 'ios' ? styles.iosPicker : null}
                    textColor="#000000"
                    themeVariant="light"
                    locale="pt-PT"
                  />
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Atualizando...' : 'Atualizar Atividade'}
              </Text>
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
  submitButtonDisabled: {
    backgroundColor: '#ccc',
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