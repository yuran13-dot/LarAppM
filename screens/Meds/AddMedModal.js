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

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 30,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
    zIndex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#000",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        height: 50,
        justifyContent: 'center',
      },
      android: {
        height: 50,
      }
    })
  },
  picker: {
    ...Platform.select({
      ios: {
        height: 50,
        width: '100%',
        color: '#000',
      },
      android: {
        height: 50,
        color: '#000',
      }
    })
  },
  pickerItem: {
    fontSize: 16,
    color: '#000',
    height: 50,
  },
  stockContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  stockTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  stockInput: {
    flex: 1,
    marginRight: 10,
  },
  unidadePicker: {
    width: 120,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  requiredLabel: {
    color: "#dc3545",
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 15,
  },
  modalHeader: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
};

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
            <View style={styles.modalHeader}>
              <View style={styles.dragHandle} />
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={30} color="#555" />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalTitle}>Adicionar Medicamento</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Nome do Medicamento <Text style={styles.requiredLabel}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome do medicamento"
                  placeholderTextColor="#666"
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Dosagem <Text style={styles.requiredLabel}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 500mg"
                  placeholderTextColor="#666"
                  value={dosagem}
                  onChangeText={setDosagem}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Tipo <Text style={styles.requiredLabel}>*</Text>
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    mode="dropdown"
                  >
                    <Picker.Item 
                      label="Selecione o Tipo" 
                      value="" 
                      color="#666"
                    />
                    <Picker.Item 
                      label="Comprimido" 
                      value="comprimido" 
                      color="#000"
                    />
                    <Picker.Item 
                      label="Líquido" 
                      value="liquido" 
                      color="#000"
                    />
                    <Picker.Item 
                      label="Injeção" 
                      value="injecao" 
                      color="#000"
                    />
                    <Picker.Item 
                      label="Pomada" 
                      value="pomada" 
                      color="#000"
                    />
                    <Picker.Item 
                      label="Outro" 
                      value="outro" 
                      color="#000"
                    />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Frequência <Text style={styles.requiredLabel}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 8 em 8 horas"
                  placeholderTextColor="#666"
                  value={frequencia}
                  onChangeText={setFrequencia}
                />
              </View>

              <View style={styles.stockContainer}>
                <Text style={styles.stockTitle}>Informações de Stock</Text>

                <View style={styles.stockRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>
                      Quantidade em Stock <Text style={styles.requiredLabel}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, styles.stockInput]}
                      placeholder="Digite a quantidade"
                      placeholderTextColor="#666"
                      value={quantidade}
                      onChangeText={setQuantidade}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { width: 120 }]}>
                    <Text style={styles.label}>Unidade</Text>
                    <View style={[styles.pickerContainer, styles.unidadePicker]}>
                      <Picker
                        selectedValue={unidade}
                        onValueChange={(itemValue) => setUnidade(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        mode="dropdown"
                      >
                        <Picker.Item 
                          label="Unidades" 
                          value="unidades" 
                          color="#000"
                        />
                        <Picker.Item 
                          label="Caixas" 
                          value="caixas" 
                          color="#000"
                        />
                        <Picker.Item 
                          label="Frascos" 
                          value="frascos" 
                          color="#000"
                        />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Quantidade Mínima <Text style={styles.requiredLabel}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Digite a quantidade mínima"
                    placeholderTextColor="#666"
                    value={quantidadeMinima}
                    onChangeText={setQuantidadeMinima}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                  placeholder="Digite observações adicionais (opcional)"
                  placeholderTextColor="#666"
                  value={observacoes}
                  onChangeText={setObservacoes}
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? "Adicionando..." : "Adicionar Medicamento"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
