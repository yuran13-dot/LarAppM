// components/BackButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
      <Icon name="arrow-back-outline" size={30} color="#333" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 50,
    left: 15, 
    zIndex: 1,
  },
});

export default BackButton;
