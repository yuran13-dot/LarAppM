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
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
  const [password, setPassword] = useState("");
  const [numeroUtente, setNumeroUtente] = useState("");
  const [status, setStatus] = useState("ativo");
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
    setPassword("");
    setNumeroUtente("");
    setStatus("ativo");
    setQuartoSelecionado(null);
  };

  const handleSave = async () => {
    if (
      !nome.trim() ||
      !quarto ||
      !contacto.trim() ||
      !dataNascimento.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert("Atenção", "Preencha todos os campos, incluindo a senha.");
      return;
    }

    if (!quartoSelecionado) {
      Alert.alert("Erro", "Selecione um quarto válido.");
      return;
    }

    try {
      // 1. Criar autenticação do usuário
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userData = {
        uid: userCredential.user.uid,
        name: nome.trim(),
        email: email.trim(),
        role: "utente",
        createdAt: new Date(),
        status: status,
      };

      // Adicionar à coleção de users primeiro
      const userDocRef = await addDoc(collection(LarApp_db, "user"), userData);

      // 2. Adiciona o utente com o UID do Firebase Auth
      const novoUtente = {
        id: userCredential.user.uid,
        numeroUtente,
        nome: nome.trim(),
        quarto: quarto,
        contacto: contacto.trim(),
        dataNascimento: dataNascimento.trim(),
        email: email.trim(),
        createdAt: new Date(),
        quartoId: quartoSelecionado.id,
        medicamentos: [],
        atividades: [],
        role: "utente",
        status: status,
      };

      const docRef = await addDoc(collection(LarApp_db, "utentes"), novoUtente);
      const utenteId = docRef.id;

      // Verificar se os dados foram salvos corretamente
      const verificarDados = async () => {
        const userQuery = query(
          collection(LarApp_db, "user"),
          where("uid", "==", userCredential.user.uid)
        );
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
          throw new Error("Dados do usuário não foram salvos corretamente");
        }
      };

      // Tentar verificar os dados algumas vezes antes de prosseguir
      for (let i = 0; i < 3; i++) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Espera 1 segundo
          await verificarDados();
          break;
        } catch (error) {
          if (i === 2) {
            // Se for a última tentativa
            throw error;
          }
          // Continua tentando se não for a última tentativa
        }
      }

      // 3. Atualiza o quarto
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
      let errorMessage = "Ocorreu um erro ao adicionar o utente.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este e-mail já está em uso.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      }

      Alert.alert("Erro", errorMessage);
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContainer,
            {
              maxHeight: modalMaxHeight,
              transform: [
                {
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
                { translateY: pan.y },
              ],
            },
          ]}
          onLayout={(e) => setModalHeight(e.nativeEvent.layout.height)}
        >
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <View style={styles.closeButtonContainer}>
                <Icon name="close" size={30} color="#555" />
              </View>
            </TouchableOpacity>

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

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail para acesso ao app"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Senha para acesso ao app"
              secureTextEntry
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Ativo" value="ativo" />
                <Picker.Item label="Inativo" value="inativo" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
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
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 5,
    right: 10,
    zIndex: 2,
    padding: 10,
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
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
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
