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
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, addDoc } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function AddFuncionarioModal({ visible, onClose }) {
  const [nome, setNome] = useState("");
  const [contacto, setContacto] = useState("");
  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [funcao, setFuncao] = useState("");
  const [id, setId] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [role, setRole] = useState("Funcionario");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const [modalHeight, setModalHeight] = useState(0);
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const screenHeight = Dimensions.get("window").height;
  const modalMaxHeight = screenHeight * 0.9;

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

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
    setContacto("");
    setDataNascimento(new Date());
    setEmail("");
    setPassword("");
    setFuncao("");
    setId("");
    setStatus("Ativo");
    setRole("Funcionario");
  };

  const formatarData = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    if (
      nome.trim() &&
      contacto.trim() &&
      dataNascimento &&
      email.trim() &&
      password.trim() &&
      funcao
    ) {
      try {
        // Criar autenticação do usuário
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const novoFuncionario = {
          id: userCredential.user.uid,
          nome: nome.trim(),
          contacto: contacto.trim(),
          dataNascimento: formatarData(dataNascimento),
          email: email.trim(),
          funcao,
          status,
          role,
          createdAt: new Date(),
        };

        // Adicionar à coleção de funcionários
        await addDoc(collection(LarApp_db, "funcionarios"), novoFuncionario);

        // Adicionar à coleção de users
        await addDoc(collection(LarApp_db, "user"), {
          uid: userCredential.user.uid,
          name: nome.trim(),
          email: email.trim(),
          role: role.toLowerCase(),
          createdAt: new Date(),
          status: status,
        });

        Alert.alert("Sucesso", "Funcionário adicionado com sucesso!");
        limparCampos();
        onClose();
      } catch (error) {
        console.error("Erro ao adicionar funcionário:", error);
        let errorMessage = "Ocorreu um erro ao adicionar o funcionário.";

        if (error.code === "auth/email-already-in-use") {
          errorMessage = "Este e-mail já está em uso.";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "E-mail inválido.";
        } else if (error.code === "auth/weak-password") {
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
        }

        Alert.alert("Erro", errorMessage);
      }
    } else {
      Alert.alert("Atenção", "Preencha todos os campos, incluindo a senha.");
    }
  };

  useEffect(() => {
    if (visible) {
      setId(uuidv4());
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

  const focusNextInput = (nextInputRef) => {
    if (nextInputRef && nextInputRef.current) {
      nextInputRef.current.focus();
    }
  };

  const nomeInputRef = useRef(null);
  const contactoInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const funcaoInputRef = useRef(null);

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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.modalContainer,
            {
              maxHeight:
                modalMaxHeight - (isKeyboardVisible ? keyboardHeight : 0),
              opacity: modalAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={30} color="#555" />
          </TouchableOpacity>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Adicionar Funcionário</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              ref={nomeInputRef}
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome completo"
              returnKeyType="next"
              onSubmitEditing={() => focusNextInput(contactoInputRef)}
            />

            <Text style={styles.label}>Contacto</Text>
            <TextInput
              ref={contactoInputRef}
              style={styles.input}
              value={contacto}
              onChangeText={setContacto}
              placeholder="Número de telefone"
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => focusNextInput(emailInputRef)}
            />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {formatarData(dataNascimento)}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              ref={emailInputRef}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Senha para acesso ao app"
              secureTextEntry
              returnKeyType="next"
            />

            <Text style={styles.label}>Função</Text>
            <Picker
              selectedValue={funcao}
              onValueChange={(itemValue) => setFuncao(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma função" value="" />
              <Picker.Item label="Enfermeiro(a)" value="Enfermeiro" />
              <Picker.Item label="Cuidador(a)" value="Cuidador" />
              <Picker.Item label="Auxiliar" value="Auxiliar" />
              <Picker.Item label="Administrativo" value="Administrativo" />
            </Picker>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </ScrollView>

          {showDatePicker && (
            <DateTimePicker
              value={dataNascimento}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}
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
    paddingTop: Platform.OS === "ios" ? 20 : 10,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 5,
    right: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  dateButton: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#000",
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 20 : 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  picker: {
    height: 50,
    width: "100%",
  },
});
