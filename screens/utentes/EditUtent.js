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

export default function EditUtenteModal({ visible, onClose, utente }) {
  const [nome, setNome] = useState("");
  const [quarto, setQuarto] = useState("");
  const [contacto, setContacto] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const [modalHeight, setModalHeight] = useState(0);
  const modalAnimation = useRef(new Animated.Value(0)).current;

  const screenHeight = Dimensions.get("window").height;
  const modalMaxHeight = screenHeight * 0.9;

  useEffect(() => {
    if (visible && utente) {
      setNome(utente.name || "");
      setQuarto(utente.quarto || "");
      setContacto(utente.contacto || "");
      setDataNascimento(utente.dataNascimento || "");
      setEmail(utente.email || "");

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
  }, [visible, utente]);

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
    if (!utente) {
      Alert.alert("Erro", "Dados do utente não encontrados.");
      return;
    }

    if (
      nome.trim() &&
      quarto.trim() &&
      contacto.trim() &&
      dataNascimento.trim() &&
      email.trim()
    ) {
      try {
        // Atualizar na coleção user
        const userQuery = query(
          collection(LarApp_db, "user"),
          where("uid", "==", utente.id)
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

        // Atualizar na coleção utentes
        const utenteQuery = query(
          collection(LarApp_db, "utentes"),
          where("id", "==", utente.id)
        );
        const utenteSnapshot = await getDocs(utenteQuery);

        if (!utenteSnapshot.empty) {
          const utenteDoc = utenteSnapshot.docs[0];
          const updateData = {
            name: nome.trim(), // Usar somente o campo name
            quarto: quarto.trim(),
            contacto: contacto.trim(),
            dataNascimento: dataNascimento.trim(),
            email: email.trim(),
            updatedAt: new Date(),
          };
          
          await updateDoc(doc(LarApp_db, "utentes", utenteDoc.id), updateData);
          
          // Forçar atualização da coleção para refletir na listagem
          console.log("Utente atualizado com sucesso:", updateData);
          
          Alert.alert("Sucesso", "Utente atualizado com sucesso!");
          onClose();
        } else {
          throw new Error("Utente não encontrado");
        }
      } catch (error) {
        console.error("Erro ao atualizar utente:", error);
        Alert.alert("Erro", "Ocorreu um erro ao atualizar o utente.");
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
              <Text style={styles.title}>Editar Utente</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.label}>Número do Quarto</Text>
              <TextInput
                style={styles.input}
                placeholder="Número do Quarto"
                value={quarto}
                onChangeText={setQuarto}
                keyboardType="numeric"
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
                  {dataNascimento
                    ? dataNascimento
                    : "Selecionar Data de Nascimento"}
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

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

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
