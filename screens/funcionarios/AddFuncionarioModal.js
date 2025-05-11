import React, { useState, useRef, useEffect } from 'react';
import {
  Modal, Text, TextInput, TouchableOpacity, PanResponder, Animated, Platform,
  KeyboardAvoidingView, ScrollView, Dimensions, StyleSheet, View, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, addDoc } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function AddFuncionarioModal({ visible, onClose }) {
  const [nome, setNome] = useState('');
  const [contacto, setContacto] = useState('');
  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [numeroFuncionario, setNumeroFuncionario] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const [modalHeight, setModalHeight] = useState(0);
  const modalAnimation = useRef(new Animated.Value(0)).current;

  const screenHeight = Dimensions.get('window').height;
  const modalMaxHeight = screenHeight * 0.9;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > modalHeight / 4) {
          onClose();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const limparCampos = () => {
    setNome('');
    setContacto('');
    setDataNascimento(new Date());
    setEmail('');
    setFuncao('');
  };

  const formatarData = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    if (nome.trim() && contacto.trim() && dataNascimento && email.trim() && funcao) {
      try {
        const novoFuncionario = {
          numeroFuncionario,
          nome: nome.trim(),
          contacto: contacto.trim(),
          dataNascimento: formatarData(dataNascimento),
          email: email.trim(),
          funcao,
          createdAt: new Date(),
        };

        await addDoc(collection(LarApp_db, 'funcionarios'), novoFuncionario);

        Alert.alert('Sucesso', 'Funcionário adicionado com sucesso!');
        limparCampos();
        onClose();
      } catch (error) {
        console.error('Erro ao adicionar funcionário:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao adicionar o funcionário.');
      }
    } else {
      Alert.alert('Atenção', 'Preencha todos os campos.');
    }
  };

  useEffect(() => {
    if (visible) {
      setNumeroFuncionario(uuidv4());

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
  }, [visible]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDataNascimento(selectedDate);
    }
  };

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContainer,
            {
              height: modalMaxHeight,
              opacity: modalAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
              transform: [
                { scaleY: modalAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                { translateY: pan.y },
              ],
            },
          ]}
          onLayout={(e) => setModalHeight(e.nativeEvent.layout.height)}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={30} color="#555" />
          </TouchableOpacity>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>Adicionar Funcionário</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />

              <Text style={styles.label}>Contacto (Telefone)</Text>
              <TextInput
                style={styles.input}
                placeholder="Contacto (telefone)"
                value={contacto}
                onChangeText={setContacto}
                keyboardType="phone-pad"
              />

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
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              
              <Text style={styles.label}>Função</Text>
                <TextInput
                style={styles.input}
                placeholder="Função"
                value={funcao}
                onChangeText={setFuncao}
                />


              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 40, paddingHorizontal: 20, paddingBottom: 10 },
  contentContainer: { flexGrow: 1, justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingLeft: 15, justifyContent: 'center' },
  pickerContainer: { borderColor: '#ccc', borderWidth: 1, borderRadius: 10, marginBottom: 15 },
  picker: { height: 50, width: '100%' },
  saveButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
