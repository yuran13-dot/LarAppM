// src/screens/funcionarios/EditFuncionarioModal.js

import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  StyleSheet,
  View,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function EditFuncionarioModal({
  visible,
  onClose,
  funcionario,
}) {
  const [nome, setNome] = useState("");
  const [contacto, setContacto] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [funcao, setFuncao] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const modalAnimation = useRef(new Animated.Value(0)).current;

  const screenHeight = Dimensions.get("window").height;
  const modalMaxHeight = screenHeight * 0.9;

  useEffect(() => {
    if (visible && funcionario) {
      setNome(funcionario.nome || "");
      setContacto(funcionario.contacto || "");
      setDataNascimento(funcionario.dataNascimento || "");
      setEmail(funcionario.email || "");
      setFuncao(funcionario.funcao || "");

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

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, "0");
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDataNascimento(`${day}/${month}/${year}`);
    }
  };

  const handleUpdate = async () => {
    if (!funcionario) {
      Alert.alert("Erro", "Dados do funcionário não encontrados.");
      return;
    }

    if (
      nome.trim() &&
      contacto.trim() &&
      dataNascimento.trim() &&
      email.trim() &&
      funcao
    ) {
      try {
        // Atualizar na coleção user
        const userQuery = query(
          collection(LarApp_db, "user"),
          where("uid", "==", funcionario.id)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          await updateDoc(doc(LarApp_db, "user", userDoc.id), {
            name: nome.trim(),
            email: email.trim(),
            updatedAt: new Date(),
          });
        }

        // Atualizar na coleção funcionarios
        const funcionarioQuery = query(
          collection(LarApp_db, "funcionarios"),
          where("id", "==", funcionario.id)
        );
        const funcionarioSnapshot = await getDocs(funcionarioQuery);

        if (!funcionarioSnapshot.empty) {
          const funcionarioDoc = funcionarioSnapshot.docs[0];
          await updateDoc(doc(LarApp_db, "funcionarios", funcionarioDoc.id), {
            nome: nome.trim(),
            contacto: contacto.trim(),
            dataNascimento: dataNascimento.trim(),
            email: email.trim(),
            funcao: funcao,
            updatedAt: new Date(),
          });

          Alert.alert("Sucesso", "Funcionário atualizado com sucesso!");
          onClose();
        } else {
          throw new Error("Funcionário não encontrado");
        }
      } catch (error) {
        console.error("Erro ao atualizar funcionário:", error);
        Alert.alert("Erro", "Ocorreu um erro ao atualizar o funcionário.");
      }
    } else {
      Alert.alert("Atenção", "Preencha todos os campos.");
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              height: modalMaxHeight,
              opacity: modalAnimation,
              transform: [
                {
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
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

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Editar Funcionário</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.label}>Contacto</Text>
              <TextInput
                style={styles.input}
                placeholder="Contacto (telefone)"
                value={contacto}
                onChangeText={setContacto}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Data de Nascimento</Text>
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
                  value={
                    dataNascimento
                      ? new Date(dataNascimento.split("/").reverse().join("-"))
                      : new Date()
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
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
              <View style={styles.pickerContainer}>
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
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdate}
              >
                <Text style={styles.saveButtonText}>Atualizar</Text>
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    paddingLeft: 15,
    justifyContent: "center",
  },
  pickerContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
