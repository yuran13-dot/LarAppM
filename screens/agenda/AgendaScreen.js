import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, RefreshControl, ScrollView, Text, TouchableOpacity } from 'react-native';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { LarApp_db } from '../../firebaseConfig';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from './utils/dateUtils';

// Componentes
import Header from './components/Header';
import CalendarComponent from './components/CalendarComponent';
import ActivitiesList from './components/ActivitiesList';

// Configuração do idioma português para o calendário
LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: ['Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje'
};

LocaleConfig.defaultLocale = 'pt';

export default function AgendaScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [activities, setActivities] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [])
  );

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActivities().finally(() => setRefreshing(false));
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar atividades dos últimos 30 dias e próximos 30 dias
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const thirtyDaysAhead = new Date(today);
      thirtyDaysAhead.setDate(today.getDate() + 30);

      console.log('Período de busca:', {
        inicio: thirtyDaysAgo.toISOString(),
        fim: thirtyDaysAhead.toISOString()
      });

      const activitiesRef = collection(LarApp_db, 'atividades');
      const q = query(
        activitiesRef,
        where('dataCriacao', '>=', thirtyDaysAgo),
        where('dataCriacao', '<=', thirtyDaysAhead),
        orderBy('dataCriacao', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const activitiesData = {};
      const markedDatesData = {};

      console.log('Total de atividades encontradas:', querySnapshot.size);

      querySnapshot.forEach((doc) => {
        const activity = doc.data();
        console.log('\nProcessando atividade:', {
          id: doc.id,
          titulo: activity.titulo,
          dataCriacaoOriginal: activity.dataCriacao,
          timestamp: activity.dataCriacao?.seconds,
        });

        let date;
        if (activity.dataCriacao) {
          const timestamp = activity.dataCriacao;
          const dateObj = new Date(timestamp.seconds * 1000);
          console.log('Data convertida:', {
            dataObj: dateObj.toISOString(),
            timezoneOffset: dateObj.getTimezoneOffset(),
            horas: dateObj.getHours(),
            dataLocal: dateObj.toLocaleString('pt-PT'),
          });

          // Usar a data local diretamente
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          date = `${year}-${month}-${day}`;
          
          console.log('Data final:', {
            dataLocal: dateObj.toLocaleString('pt-PT'),
            dataChave: date,
          });
        } else {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          date = `${year}-${month}-${day}`;
          console.log('Sem data de criação, usando data atual:', date);
        }
        
        if (!activitiesData[date]) {
          activitiesData[date] = [];
        }
        activitiesData[date].push({
          id: doc.id,
          ...activity,
          date
        });

        markedDatesData[date] = {
          marked: true,
          dotColor: '#4A90E2'
        };
      });

      console.log('\nDados processados:', {
        datasComAtividades: Object.keys(activitiesData),
        atividadesPorData: Object.entries(activitiesData).map(([data, atividades]) => ({
          data,
          quantidade: atividades.length,
          atividades: atividades.map(a => ({ id: a.id, titulo: a.titulo }))
        }))
      });

      setActivities(activitiesData);
      setMarkedDates(markedDatesData);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      setError('Não foi possível carregar as atividades. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchActivities}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />
      <View style={styles.container}>
        <View style={styles.calendarContainer}>
          <CalendarComponent 
            onDayPress={handleDayPress}
            markedDates={markedDates}
            selectedDate={selectedDate}
          />
        </View>
        <ScrollView 
          style={styles.activitiesContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4A90E2']}
              tintColor="#4A90E2"
            />
          }
        >
          {error ? (
            renderError()
          ) : (
            <ActivitiesList 
              selectedDate={selectedDate}
              activities={activities}
              loading={loading}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1,
  },
  activitiesContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
