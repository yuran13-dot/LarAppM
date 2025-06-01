export const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-PT', options);
};

export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString('pt-PT', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export const getActivityStatus = (activity) => {
  const now = new Date();
  let activityDate;
  
  if (activity.dataCriacao) {
    activityDate = new Date(activity.dataCriacao.seconds * 1000);
  } else {
    activityDate = new Date();
  }

  if (activityDate < now) {
    return {
      status: 'completed',
      color: '#48BB78',
      icon: 'checkmark-circle',
      text: 'Concluída'
    };
  } else if (activityDate.toDateString() === now.toDateString()) {
    return {
      status: 'today',
      color: '#FF6B6B',
      icon: 'time',
      text: 'Hoje'
    };
  } else {
    return {
      status: 'upcoming',
      color: '#805AD5',
      icon: 'calendar',
      text: 'Agendada'
    };
  }
}; 