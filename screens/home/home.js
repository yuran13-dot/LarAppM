import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/AuthContext";

import ActionButtons from "../../components/ActionButtons";
import InfoSection from "../../components/InfoSection";

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ActionButtons navigation={navigation} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f6f6f6",
  },
});
