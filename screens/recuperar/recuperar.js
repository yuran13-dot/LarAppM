// screens/ForgotPasswordScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../../components/BackButton';
import styles from "./styles";
import Logo from "../../components/Logo";
import PrimaryButton from "../../components/PrimaryButton";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecoverPassword = () => {
    if (!email) {
      setError("Por favor, insira seu email.");
      return;
    }
    setError("");
    setLoading(true);
    setMessage("");

   
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <BackButton />

          <View style={styles.logoContainer}>
            <Logo />
          </View>


          {error && <Text style={styles.error}>{error}</Text>}
          {message && <Text style={styles.success}>{message}</Text>}

          {!message && (
            <>
              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <PrimaryButton
                title={loading ? "Enviando..." : "Recuperar"}
                onPress={handleRecoverPassword}
                disabled={loading}
                style={{ width: "100%", marginTop: 20 }}  // Ajuste para o espaçamento adequado
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
