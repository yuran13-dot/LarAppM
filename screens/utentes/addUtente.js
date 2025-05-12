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
  StyleSheet,
  View,
  Alert,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function AddUtenteModal({ visible, onClose }) {
  const [nome, setNome] = useState("");
  const [quarto, setQuarto] = useState("");
  const [contacto, setContacto] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [numeroUtente, setNumeroUtente] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [listaQuartos, setListaQuartos] = useState([]);
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);

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
    setQuarto("");
    setContacto("");
    setDataNascimento("");
    setEmail("");
    setNumeroUtente("");
    setQuartoSelecionado(null);
  };

  const handleSave = async () => {
    if (
      !nome.trim() ||
      !quarto ||
      !contacto.trim() ||
      !dataNascimento.trim() ||
      !email.trim()
    ) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (!quartoSelecionado) {
      Alert.alert("Erro", "Selecione um quarto válido.");
      return;
    }

    try {
      // 1. Adiciona o utente com arrays vazios para medicamentos e atividades
      const novoUtente = {
        numeroUtente,
        nome: nome.trim(),
        quarto: quarto,
        contacto: contacto.trim(),
        dataNascimento: dataNascimento.trim(),
        email: email.trim(),
        createdAt: new Date(),
        quartoId: quartoSelecionado.id,
        medicamentos: [], // Array vazio para medicamentos
        atividades: [], // Array vazio para atividades
      };

      const docRef = await addDoc(collection(LarApp_db, "utentes"), novoUtente);
      const utenteId = docRef.id;

      // 2. Atualiza o quarto
      const quartoRef = doc(LarApp_db, "quartos", quartoSelecionado.id);

      if (quartoSelecionado.tipo === "Individual") {
        await updateDoc(quartoRef, {
          utenteId: utenteId,
          estado: "Ocupado",
        });
      } else if (quartoSelecionado.tipo === "Casal") {
        const utentesAtuais = quartoSelecionado.utentesIds || [];
        const novosUtentes = [...utentesAtuais, utenteId];
        await updateDoc(quartoRef, {
          utentesIds: novosUtentes,
          estado: novosUtentes.length >= 2 ? "Ocupado" : "Parcialmente Ocupado",
        });
      }

      Alert.alert("Sucesso", "Utente adicionado com sucesso!");
      limparCampos();
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar utente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o utente.");
    }
  };

  const carregarQuartosLivres = async () => {
    try {
      const querySnapshot = await getDocs(collection(LarApp_db, "quartos"));
      const quartosDisponiveis = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const quartoInfo = {
          id: doc.id,
          numero: data.numero,
          tipo: data.tipo,
          estado: data.estado,
          utentesIds: data.utentesIds,
        };

        // Verifica disponibilidade baseado no tipo e estado do quarto
        if (data.tipo === "Individual" && data.estado === "Livre") {
          quartosDisponiveis.push(quartoInfo);
        } else if (
          data.tipo === "Casal" &&
          (!data.utentesIds || data.utentesIds.length < 2)
        ) {
          quartosDisponiveis.push(quartoInfo);
        }
      });

      setListaQuartos(quartosDisponiveis);
    } catch (error) {
      console.error("Erro ao buscar quartos:", error);
      Alert.alert("Erro", "Não foi possível carregar os quartos.");
    }
  };

  const handleQuartoChange = (numero) => {
    setQuarto(numero);
    const quartoInfo = listaQuartos.find((q) => q.numero === numero);
    setQuartoSelecionado(quartoInfo);
  };

  useEffect(() => {
    if (visible) {
      setNumeroUtente(uuidv4());
      carregarQuartosLivres();
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
      const day = selectedDate.getDate().toString().padStart(2, "0");
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDataNascimento(`${day}/${month}/${year}`);
    }
  };

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
              <Text style={styles.title}>Adicionar Utente</Text>

              <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={quarto}
                  onValueChange={handleQuartoChange}
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Selecione um Quarto"
                    value=""
                    color="#999"
                  />
                  {listaQuartos.map((q) => (
                    <Picker.Item
                      key={q.id}
                      label={`Quarto ${q.numero} (${q.tipo}${
                        q.tipo === "Casal" && q.utentesIds
                          ? ` - ${q.utentesIds.length}/2`
                          : ""
                      })`}
                      value={q.numero}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Contacto (telefone)"
                value={contacto}
                onChangeText={setContacto}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: dataNascimento ? "#000" : "#999" }}>
                  {dataNascimento || "Selecionar Data de Nascimento"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  closeButton: { position: "absolute", top: 10, right: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    justifyContent: "center",
  },
  pickerContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  picker: { height: 50, width: "100%" },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
