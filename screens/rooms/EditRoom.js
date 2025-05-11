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
import { doc, updateDoc } from "firebase/firestore";
import { LarApp_db } from "../../firebaseConfig";

export default function EditRoomModal({ visible, onClose, quarto }) {
  const [estado, setEstado] = useState("");
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("");

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

  // Preenche os campos quando o modal abre
  useEffect(() => {
    if (visible && quarto) {
      setNumero(quarto.numero || "");
      setTipo(quarto.tipo || "");
      setEstado(quarto.estado || "");

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
  }, [visible, quarto]);

  const handleUpdate = async () => {
    if (estado.trim() && tipo.trim() && numero.trim()) {
      try {
        const QuartoRef = doc(LarApp_db, "quartos", quarto.id); //quarto.numero

        await updateDoc(QuartoRef, {
          estado: estado.trim(),
          tipo: tipo.trim(),
          numero: numero.trim(),
        });

        Alert.alert("Sucesso", "Quarto atualizado com sucesso!");
        onClose();
      } catch (error) {
        console.error("Erro ao atualizar Quarto:", error);
        Alert.alert("Erro", "Ocorreu um erro ao atualizar o Quarto.");
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
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            setModalHeight(height);
          }}
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
              <Text style={styles.title}>Editar Quarto</Text>

              <TextInput
                style={styles.input}
                placeholder="Número"
                value={numero}
                keyboardType="numeric"
                onChangeText={setNumero}
              />

              <TextInput
                style={styles.input}
                placeholder="Estado"
                value={estado}
                onChangeText={setEstado}
              />

              <TextInput
                style={styles.input}
                placeholder="Tipo"
                value={tipo}
                onChangeText={setTipo}
                keyboardType="default"
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
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
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
