import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Agenda</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    padding: isSmallDevice ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
});

export default Header; 