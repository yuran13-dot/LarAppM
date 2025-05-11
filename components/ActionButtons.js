import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const ActionButtons = ({ navigation }) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("UserScreen")}
    >
      <Icon name="user" size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Utente</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("MedicationScreen")}
    >
      <Icon name="medkit" size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Medicação</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("HealthScreen")}
    >
      <Icon name="heartbeat" size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Saúde</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("ActivitiesScreen")}
    >
      <Icon name="list-alt" size={24} color="#fff" style={styles.icon} />
      <Text style={styles.buttonText}>Atividades</Text>
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
