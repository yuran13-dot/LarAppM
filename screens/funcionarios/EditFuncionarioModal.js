// src/screens/funcionarios/EditFuncionarioModal.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, Text, TextInput, TouchableOpacity, Animated, KeyboardAvoidingView,
  ScrollView, Dimensions, StyleSheet, View, Alert, Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, updateDoc } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditFuncionarioModal({ visible, onClose, funcionario }) {
  const [nome, setNome] = useState('');
  const [contacto, setContacto] = useState('');
  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const modalAnimation = useRef(new Animated.Value(0)).current;

  const screenHeight = Dimensions.get('window').height;
  const modalMaxHeight = screenHeight * 0.9;

  useEffect(() => {
    if (visible && funcionario) {
      setNome(funcionario.nome);
      setContacto(funcionario.contacto);
      setDataNascimento(parseDate(funcionario.dataNascimento));
      setEmail(funcionario.email);
      setFuncao(funcionario.funcao);

      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(modalAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, funcionario]);

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const formatarData = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDataNascimento(selectedDate);
    }
  };

  const handleUpdate = async () => {
    if (nome.trim() && contacto.trim() && email.trim() && funcao) {
      try {
        const funcionarioRef = doc(LarApp_db, 'funcionarios', funcionario.id);
        await updateDoc(funcionarioRef, {
          nome: nome.trim(),
          contacto: contacto.trim(),
          dataNascimento: formatarData(dataNascimento),
          email: email.trim(),
          funcao: funcao,
        });

        Alert.alert('Sucesso', 'Funcionário atualizado com sucesso!');
        onClose();
      } catch (error) {
        console.error('Erro ao atualizar funcionário:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao atualizar o funcionário.');
      }
    } else {
      Alert.alert('Atenção', 'Preencha todos os campos.');
    }
  };

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, { height: modalMaxHeight, opacity: modalAnimation }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={30} color="#555" />
          </TouchableOpacity>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>Editar Funcionário</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} value={nome} onChangeText={setNome} />

              <Text style={styles.label}>Contacto</Text>
              <TextInput style={styles.input} value={contacto} onChangeText={setContacto} keyboardType="phone-pad" />

              <Text style={styles.label}>Data de Nascimento</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: '#000' }}>{formatarData(dataNascimento)}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dataNascimento}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

              <Text style={styles.label}>Função</Text>
              <TextInput style={styles.input} value={funcao} onChangeText={setFuncao} />

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 40, paddingHorizontal: 20, paddingBottom: 10 },
  contentContainer: { flexGrow: 1, justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingLeft: 15, justifyContent: 'center' },
  saveButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
