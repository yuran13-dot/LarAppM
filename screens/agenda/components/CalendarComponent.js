import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const CalendarComponent = ({ onDayPress, markedDates, selectedDate }) => {
  return (
    <View style={styles.calendarContainer}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#4A90E2'
          }
        }}
        theme={{
          todayTextColor: '#FF6B6B',
          todayBackgroundColor: '#FFE5E5',
          selectedDayBackgroundColor: '#4A90E2',
          selectedDayTextColor: '#fff',
          arrowColor: '#4A90E2',
          monthTextColor: '#2D3748',
          textMonthFontSize: isSmallDevice ? 16 : 18,
          textMonthFontWeight: 'bold',
          textDayHeaderFontSize: isSmallDevice ? 12 : 14,
          textDayHeaderFontWeight: '600',
          textDayFontSize: isSmallDevice ? 12 : 14,
          'stylesheet.calendar.header': {
            dayTextAtIndex0: { color: '#E53E3E' },
            dayTextAtIndex6: { color: '#E53E3E' }
          },
          'stylesheet.calendar.main': {
            today: {
              backgroundColor: '#FFE5E5',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#FF6B6B'
            }
          }
        }}
        style={styles.calendar}
        hideExtraDays={false}
        disableAllTouchEventsForDisabledDays={false}
        enableSwipeMonths={true}
        maxDate="2025-12-31"
        firstDay={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: isSmallDevice ? 8 : 16,
    paddingTop: isSmallDevice ? 8 : 16,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  }
});

export default CalendarComponent; 