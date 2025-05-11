
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // IMPORTA Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDcOKKFyFRqYGWPc8XmKxcC_6Tg3lRtdQ0",
  authDomain: "cgroup45-79a0a.firebaseapp.com",
  projectId: "cgroup45-79a0a",
  storageBucket: "cgroup45-79a0a.appspot.com",
  messagingSenderId: "36989268482",
  appId: "1:36989268482:web:6cbdb38350ddbfe5ffad1b"
};


const app = initializeApp(firebaseConfig);


const LarApp_db = getFirestore(app);


const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth, LarApp_db };  
