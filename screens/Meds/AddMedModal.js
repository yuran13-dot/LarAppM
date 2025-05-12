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
  const [quantidade, setQuantidade] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [unidade, setUnidade] = useState("unidades");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setQuantidade("");
    setQuantidadeMinima("");
    setUnidade("unidades");
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    if (
      !nome.trim() ||
      !dosagem.trim() ||
      !tipo ||
      !frequencia.trim() ||
      !quantidade.trim() ||
      !quantidadeMinima.trim()
    ) {
      Alert.alert(
        "Atenção",
        "Preencha todos os campos obrigatórios, incluindo quantidade em stock e quantidade mínima."
      );
      return;
    }

    const qtdNum = parseInt(quantidade);
    const qtdMinNum = parseInt(quantidadeMinima);

    if (isNaN(qtdNum) || isNaN(qtdMinNum) || qtdNum < 0 || qtdMinNum < 0) {
      Alert.alert(
        "Atenção",
        "As quantidades devem ser números válidos e positivos."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const novoMedicamento = {
        nome: nome.trim(),
        dosagem: dosagem.trim(),
        tipo,
        frequencia: frequencia.trim(),
        observacoes: observacoes.trim(),
        stock: {
          quantidade: qtdNum,
          quantidadeMinima: qtdMinNum,
          unidade,
          ultimaAtualizacao: new Date(),
        },
        createdAt: new Date(),
      };

      await addDoc(collection(LarApp_db, "medicamentos"), novoMedicamento);

      Alert.alert("Sucesso", "Medicamento e stock adicionados com sucesso!");
      limparCampos();
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar medicamento:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o medicamento.");
    } finally {
      setIsSubmitting(false);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? -64 : 0}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.modalContainer,
              {
                maxHeight: modalMaxHeight,
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

            <ScrollView
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
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

              <View style={styles.stockContainer}>
                <Text style={styles.stockTitle}>Informações de Stock</Text>

                <View style={styles.stockRow}>
                  <TextInput
                    style={[styles.input, styles.stockInput]}
                    placeholder="Quantidade em Stock"
                    value={quantidade}
                    onChangeText={setQuantidade}
                    keyboardType="numeric"
                  />

                  <View style={[styles.pickerContainer, styles.unidadePicker]}>
                    <Picker
                      selectedValue={unidade}
                      onValueChange={(itemValue) => setUnidade(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Unidades" value="unidades" />
                      <Picker.Item label="Caixas" value="caixas" />
                      <Picker.Item label="Frascos" value="frascos" />
                      <Picker.Item label="Ampolas" value="ampolas" />
                      <Picker.Item label="Bisnagas" value="bisnagas" />
                    </Picker>
                  </View>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Quantidade Mínima Desejada"
                  value={quantidadeMinima}
                  onChangeText={setQuantidadeMinima}
                  keyboardType="numeric"
                />
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observações"
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isSubmitting && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
