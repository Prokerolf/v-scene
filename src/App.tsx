import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Auth from './components/Auth';
import TeacherDashboard from './components/TeacherDashboard';
import StudentApp from './StudentApp';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<'app'>('app');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          try {
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setStage('app');

              if (data.role === 'teacher' || data.role === 'admin') {
                setRole(data.role as any);
              } else {
                setRole('student');
              }
            } else {
              setRole('student');
              setStage('app');
            }
          } catch (e) {
            console.warn("Could not fetch user data", e);
            setRole('student');
            setStage('app');
          }
        }
      } catch (error) {
        console.error("Unexpected error in auth state:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }



  if (role === 'admin') {
    return <TeacherDashboard onSwitchToStudent={() => setRole('student')} />;
  }

  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  return <StudentApp user={user} />;
}

export default App;
