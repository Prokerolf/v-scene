import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Auth from './components/Auth';
import TeacherDashboard from './components/TeacherDashboard';
import StudentApp from './StudentApp';
import MobileBlocker from './components/MobileBlocker';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<'app'>('app');

  useEffect(() => {
    let isSubscribed = true;

    // Safety timeout: Never hang on spinner for more than 1.5 seconds
    const safetyTimer = setTimeout(() => {
      if (isSubscribed) {
        setLoading(false);
      }
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!isSubscribed) return;
        setUser(currentUser);
        if (currentUser) {
          // Check if there is a dev role preserved in localStorage across page refreshes
          const savedDevRole = localStorage.getItem('vscene_dev_role') as 'student' | 'teacher' | 'admin' | null;

          try {
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await Promise.race([
              getDoc(docRef),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1200))
            ]) as any;

            if (savedDevRole === 'student' || savedDevRole === 'teacher' || savedDevRole === 'admin') {
              setRole(savedDevRole);
            } else if (docSnap && docSnap.exists && docSnap.exists()) {
              const data = docSnap.data();
              if (data.role === 'teacher' || data.role === 'admin') {
                setRole(data.role as any);
              } else {
                setRole('student');
              }
            } else {
              setRole('student');
            }
            setStage('app');
          } catch (e) {
            console.warn("Could not fetch user data in time, defaulting to saved/student role", e);
            setRole(savedDevRole || 'student');
            setStage('app');
          }
        }
      } catch (error) {
        console.error("Unexpected error in auth state:", error);
      } finally {
        if (isSubscribed) {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    });

    return () => {
      isSubscribed = false;
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const handleSwitchToStudent = () => {
    localStorage.setItem('vscene_dev_role', 'student');
    setRole('student');
  };

  const handleSwitchToTeacher = () => {
    localStorage.setItem('vscene_dev_role', 'teacher');
    setRole('teacher');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderAppContent = () => {
    if (!user) {
      return <Auth />;
    }

    if (role === 'admin' || role === 'teacher') {
      return <TeacherDashboard onSwitchToStudent={handleSwitchToStudent} />;
    }

    return <StudentApp user={user} onSwitchToTeacher={handleSwitchToTeacher} />;
  };

  return <MobileBlocker>{renderAppContent()}</MobileBlocker>;
}

export default App;
