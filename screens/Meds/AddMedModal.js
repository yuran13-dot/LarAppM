import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  View,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, addDoc } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import styles from "./styles";

export default function AddMedModal({ visible, onClose }) {
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [tipo, setTipo] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const pan = useRef(new Animated.ValueXY()).current;
  const [modalHeight, setModalHeight] = useState(0);
  const modalAnimation = useRef(new Animated.Value(0)).current;

  const screenHeight = Dimensions.get("window").height;
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
    setNome("");
    setDosagem("");
    setTipo("");
    setFrequencia("");
    setObservacoes("");
  };

  const handleSave = async () => {
    if (nome.trim() && dosagem.trim() && tipo && frequencia.trim()) {
      try {
        const novoMedicamento = {
          nome: nome.trim(),
          dosagem: dosagem.trim(),
          tipo,
          frequencia: frequencia.trim(),
          observacoes: observacoes.trim(),
          createdAt: new Date(),
        };

        await addDoc(collection(LarApp_db, "medicamentos"), novoMedicamento);

        Alert.alert("Sucesso", "Medicamento adicionado com sucesso!");
        limparCampos();
        onClose();
      } catch (error) {
        console.error("Erro ao adicionar medicamento:", error);
        Alert.alert("Erro", "Ocorreu um erro ao adicionar o medicamento.");
      }
    } else {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
    }
  };

  useEffect(() => {
    if (visible) {
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

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContainer,
            {
              height: modalMaxHeight,
              opacity: modalAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              transform: [
                {
                  scaleY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Adicionar Medicamento</Text>

              <TextInput
                style={styles.input}
                placeholder="Nome do Medicamento"
                value={nome}
                onChangeText={setNome}
              />

              <TextInput
                style={styles.input}
                placeholder="Dosagem (ex: 500mg)"
                value={dosagem}
                onChangeText={setDosagem}
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tipo}
                  onValueChange={(itemValue) => setTipo(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione o Tipo" value="" />
                  <Picker.Item label="Comprimido" value="comprimido" />
                  <Picker.Item label="Líquido" value="liquido" />
                  <Picker.Item label="Injeção" value="injecao" />
                  <Picker.Item label="Pomada" value="pomada" />
                  <Picker.Item label="Outro" value="outro" />
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Frequência (ex: 8 em 8 horas)"
                value={frequencia}
                onChangeText={setFrequencia}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observações"
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                numberOfLines={4}
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
