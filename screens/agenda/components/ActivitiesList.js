import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActivityCard from './ActivityCard';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const ActivitiesList = ({ selectedDate, activities, loading }) => (
  <View style={styles.activitiesSection}>
    {loading ? (
      <View style={styles.noActivitiesContainer}>
        <Text style={styles.noActivities}>Carregando atividades...</Text>
      </View>
    ) : selectedDate && activities[selectedDate] ? (
      activities[selectedDate].map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))
    ) : (
      <View style={styles.noActivitiesContainer}>
        <Ionicons name="calendar-outline" size={isSmallDevice ? 40 : 48} color="#CBD5E0" />
        <Text style={styles.noActivities}>
          {selectedDate ? 'Nenhuma atividade para esta data' : 'Selecione uma data para ver as atividades'}
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  activitiesSection: {
    flex: 1,
    padding: isSmallDevice ? 12 : 16,
  },
  noActivitiesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  noActivities: {
    textAlign: 'center',
    fontSize: isSmallDevice ? 14 : 16,
    color: '#A0AEC0',
    marginTop: 16,
    paddingHorizontal: 20,
  },
});

export default ActivitiesList; 