import React from "react";
import { View, Text, StyleSheet } from "react-native";

const InfoSection = () => (
  <View style={styles.infoContainer}>
    <Text style={styles.infoText}>Total de Utentes: 30</Text>
    <Text style={styles.infoText}>Quartos Ocupados: 28/30</Text>
    <Text style={styles.infoText}>Atividades de Hoje: 8</Text>
  </View>
);

const styles = StyleSheet.create({
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#333",
  },
});

export default InfoSection;
