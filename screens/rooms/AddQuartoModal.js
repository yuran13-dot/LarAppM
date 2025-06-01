import React, { useState, useRef } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, PanResponder, Animated, Platform, KeyboardAvoidingView, ScrollView, Dimensions, StyleSheet, View, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, addDoc } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';

export default function AddQuartoModal({ visible, onClose }) {
  const [numero, setNumero] = useState('');
  const [estado, setEstado] = useState('Livre'); // Default
  const [tipo, setTipo] = useState('Individual'); // Default

  const estados = ['Livre', 'Ocupado'];
  const tipos = ['Individual', 'Casal'];

  const pan = useRef(new Animated.ValueXY()).current;
  const [modalHeight, setModalHeight] = useState(0);

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

  const handleSave = async () => {
    if (numero.trim()) {
      try {
        const newRoom = {
          numero: numero.trim(),
          estado: estado,
          tipo: tipo,
          ...(tipo === 'Individual' ? { utenteId: null } : { utentesIds: [] }),
        };

        await addDoc(collection(LarApp_db, 'quartos'), newRoom);

        Alert.alert('Sucesso', 'Quarto adicionado com sucesso!');
        onClose();
        setNumero('');
        setEstado('Livre');
        setTipo('Individual');
      } catch (error) {
        console.error('Erro ao adicionar quarto:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao adicionar o quarto.');
      }
    } else {
      Alert.alert('Atenção', 'Preencha o número do quarto.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContainer,
            { height: modalMaxHeight, transform: [{ translateY: pan.y }] },
          ]}
          onLayout={(e) => setModalHeight(e.nativeEvent.layout.height)}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={28} color="#333" />
          </TouchableOpacity>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Adicionar Quarto</Text>

              <Text style={styles.label}>Número do Quarto</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 12"
                value={numero}
                onChangeText={setNumero}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Estado</Text>
              <View style={styles.selectContainer}>
                {estados.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.optionButton,
                      estado === item && styles.optionButtonSelected,
                    ]}
                    onPress={() => setEstado(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        estado === item && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Tipo</Text>
              <View style={styles.selectContainer}>
                {tipos.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.optionButton,
                      tipo === item && styles.optionButtonSelected,
                    ]}
                    onPress={() => setTipo(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        tipo === item && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Quarto</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentContainer: {
    flexGrow: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  selectContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
