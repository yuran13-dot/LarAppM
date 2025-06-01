import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getActivityStatus, formatTime } from '../utils/dateUtils';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const ActivityCard = ({ activity }) => {
  const status = getActivityStatus(activity);
  const time = formatTime(activity.dataCriacao);
  
  return (
    <TouchableOpacity
      style={[styles.activityCard, { borderLeftColor: status.color }]}
      activeOpacity={0.7}
    >
      <View style={styles.activityHeader}>
        <View style={styles.activityTimeContainer}>
          <Ionicons name="time-outline" size={isSmallDevice ? 16 : 20} color={status.color} />
          <Text style={[styles.activityTime, { color: status.color }]}>{time}</Text>
        </View>
        <View style={styles.activityStatusContainer}>
          <Ionicons name={status.icon} size={isSmallDevice ? 16 : 20} color={status.color} />
          <Text style={[styles.activityStatus, { color: status.color }]}>{status.text}</Text>
        </View>
      </View>
      <Text style={styles.activityTitle}>{activity.titulo}</Text>
      <Text style={styles.activityDescription}>{activity.descricao}</Text>
      {activity.local && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={isSmallDevice ? 14 : 16} color="#718096" />
          <Text style={styles.locationText}>{activity.local}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  activityCard: {
    backgroundColor: '#F7FAFC',
    padding: isSmallDevice ? 12 : 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: isSmallDevice ? 12 : 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  activityStatus: {
    fontSize: isSmallDevice ? 12 : 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  activityTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#4A5568',
    lineHeight: isSmallDevice ? 18 : 20,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#718096',
    marginLeft: 4,
  },
});

export default ActivityCard; 