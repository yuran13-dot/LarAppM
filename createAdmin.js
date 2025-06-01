import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDcOKKFyFRqYGWPc8XmKxcC_6Tg3lRtdQ0",
  authDomain: "cgroup45-79a0a.firebaseapp.com",
  projectId: "cgroup45-79a0a",
  storageBucket: "cgroup45-79a0a.appspot.com",
  messagingSenderId: "36989268482",
  appId: "1:36989268482:web:6cbdb38350ddbfe5ffad1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
    const email = 'admin@larapp.pt';
    const password = 'Admin123!';

    try {
        // Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create admin document in users collection
        const userData = {
          
            uid: user.uid,
            email: email,
            role: 'admin',
            createdAt: new Date().toISOString(),
            status: 'ativo',
            name: 'Administrador',
            morada: 'Rua do Admin, 123',
            dataNascimento: '1990-01-01',
            contacto: '912345678',
            
        };

        // Create in 'users' collection
        await setDoc(doc(db, 'users', user.uid), userData);

        console.log('Admin user created successfully!');
        console.log('User ID:', user.uid);
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
    }
}

// Run the function
createAdminUser(); 