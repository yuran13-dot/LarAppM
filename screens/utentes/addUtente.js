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
  const [morada, setMorada] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("ativo");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [listaQuartos, setListaQuartos] = useState([]);
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);
  const [showQuartoPicker, setShowQuartoPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const [modalHeight, setModalHeight] = useState(0);
  const modalAnimation = useRef(new Animated.Value(0)).current;

  const screenHeight = Dimensions.get("window").height;
  const modalMaxHeight = screenHeight * 0.9;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Só responde se o toque começar na área do indicador
        const { locationY } = evt.nativeEvent;
        return locationY <= 24; // altura do dragHandle
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Só responde se o movimento for para baixo e começar na área do indicador
        const { locationY } = evt.nativeEvent;
        return gestureState.dy > 0 && locationY <= 24;
      },
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
            friction: 8,
            tension: 40,
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
      const userDocRef = await addDoc(collection(LarApp_db, "users"), userData);

      // 2. Adiciona o utente com o UID do Firebase Auth
      const novoUtente = {
        id: userCredential.user.uid,
        name: nome.trim(),
        quarto: quarto,
        contacto: contacto.trim(),
        dataNascimento: dataNascimento.trim(),
        morada: morada.trim(),
        email: email.trim(),
        createdAt: new Date(),
        quartoId: quartoSelecionado.id,
        medicamentos: [],
        atividades: [],
        dadosVitais: [],
        role: "utente",
        status: status,
      };

      const docRef = await addDoc(collection(LarApp_db, "utentes"), novoUtente);
      const utenteId = docRef.id;

      // Verificar se os dados foram salvos corretamente
      const verificarDados = async () => {
        const userQuery = query(
          collection(LarApp_db, "users"),
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
    if (Platform.OS === 'ios') {
      setTempDate(selectedDate || tempDate);
    } else {
      setShowDatePicker(false);
      if (selectedDate) {
        const day = selectedDate.getDate().toString().padStart(2, "0");
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
        const year = selectedDate.getFullYear();
        setDataNascimento(`${day}/${month}/${year}`);
      }
    }
  };

  const confirmDate = () => {
    const day = tempDate.getDate().toString().padStart(2, "0");
    const month = (tempDate.getMonth() + 1).toString().padStart(2, "0");
    const year = tempDate.getFullYear();
    setDataNascimento(`${day}/${month}/${year}`);
    setShowDatePicker(false);
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateInputText, !dataNascimento && styles.dateInputPlaceholder]}>
              {dataNascimento || "Selecionar Data de Nascimento"}
            </Text>
            <Icon name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>

          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.iosPickerButton}
                >
                  <Text style={styles.iosPickerButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDate}
                  style={styles.iosPickerButton}
                >
                  <Text style={[styles.iosPickerButtonText, styles.iosPickerButtonTextConfirm]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={onChangeDate}
                maximumDate={new Date()}
                style={styles.iosDatePicker}
              />
            </View>
          </Modal>
        </>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateInputText, !dataNascimento && styles.dateInputPlaceholder]}>
            {dataNascimento || "Selecionar Data de Nascimento"}
          </Text>
          <Icon name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}
      </>
    );
  };

  const renderQuartoPicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => setShowQuartoPicker(true)}
          >
            <Text style={[styles.pickerTriggerText, !quarto && styles.pickerTriggerPlaceholder]}>
              {quarto ? `Quarto ${quarto}` : "Selecione um Quarto"}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Modal
            visible={showQuartoPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowQuartoPicker(false)}
                  style={styles.iosPickerButton}
                >
                  <Text style={styles.iosPickerButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowQuartoPicker(false)}
                  style={styles.iosPickerButton}
                >
                  <Text style={[styles.iosPickerButtonText, styles.iosPickerButtonTextConfirm]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={quarto}
                onValueChange={(value) => {
                  handleQuartoChange(value);
                }}
                style={styles.iosPicker}
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
          </Modal>
        </>
      );
    }

    return (
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
    );
  };

  const renderStatusPicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <>
          <TouchableOpacity
            style={styles.pickerTrigger}
            onPress={() => setShowStatusPicker(true)}
          >
            <Text style={styles.pickerTriggerText}>
              {status === "ativo" ? "Ativo" : "Inativo"}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Modal
            visible={showStatusPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowStatusPicker(false)}
                  style={styles.iosPickerButton}
                >
                  <Text style={styles.iosPickerButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowStatusPicker(false)}
                  style={styles.iosPickerButton}
                >
                  <Text style={[styles.iosPickerButtonText, styles.iosPickerButtonTextConfirm]}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={status}
                onValueChange={(value) => setStatus(value)}
                style={styles.iosPicker}
              >
                <Picker.Item label="Ativo" value="ativo" />
                <Picker.Item label="Inativo" value="inativo" />
              </Picker>
            </View>
          </Modal>
        </>
      );
    }

    return (
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
    );
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
            <View style={styles.dragHandle} {...panResponder.panHandlers}>
              <View style={styles.dragIndicator} />
            </View>

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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#999"
              />

              <TextInput
                style={styles.input}
                placeholder="Contacto (telefone)"
                value={contacto}
                onChangeText={setContacto}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />

              <TextInput
                style={styles.input}
                placeholder="Morada"
                value={morada}
                onChangeText={setMorada}
                placeholderTextColor="#999"
              />

              {renderDatePicker()}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acomodação</Text>
              {renderQuartoPicker()}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acesso ao Sistema</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail para acesso ao app"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Senha para acesso ao app"
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {renderStatusPicker()}
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#1a73e8",
  },
  input: {
    height: 56,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    color: "#202124",
  },
  pickerContainer: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
  },
  picker: {
    height: 56,
    width: "100%",
    color: "#202124",
  },
  saveButton: {
    backgroundColor: "#1a73e8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#1a73e8",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#202124",
  },
  dateInput: {
    height: 56,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInputText: {
    fontSize: 16,
    color: "#202124",
  },
  dateInputPlaceholder: {
    color: "#999",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  pickerTrigger: {
    height: 56,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerTriggerText: {
    fontSize: 16,
    color: "#202124",
  },
  pickerTriggerPlaceholder: {
    color: "#999",
  },
  iosPickerContainer: {
    backgroundColor: "#f8f9fa",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  iosPickerButton: {
    padding: 8,
  },
  iosPickerButtonText: {
    fontSize: 16,
    color: "#666",
  },
  iosPickerButtonTextConfirm: {
    color: "#1a73e8",
    fontWeight: "600",
  },
  iosPicker: {
    backgroundColor: "#fff",
  },
  dragHandle: {
    width: '100%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  iosDatePicker: {
    backgroundColor: "#fff",
    height: 200,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  passwordInput: {
    paddingRight: 50, // Espaço para o ícone
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
});
