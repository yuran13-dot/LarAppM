// components/Logo.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Logo = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="home-outline" size={50} color="#fff" />
      </View>
      <Text style={styles.text}>LarApp</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: '#007bff',  
    padding: 20,  
    borderRadius: 50,  
    marginBottom: 10,  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007bff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default Logo;
