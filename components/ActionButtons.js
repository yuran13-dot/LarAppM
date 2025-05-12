import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const ActionButtons = ({ navigation }) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("UtentesScreen")}
    >
      <Icon name="users" size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Utentes</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("RoomsScreen")}
    >
      <Icon name="bed" size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Quartos</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("FuncionarioScreen")}
    >
      <Icon name="user" size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Funcionários</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("RelatorioScreen")}
    >
      <Icon name="list-alt" size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Relatório</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 40,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    width: "45%", // Define a largura para que ocupem 40% da largura da tela
    justifyContent: "center",
  },
  icon: {
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ActionButtons;
