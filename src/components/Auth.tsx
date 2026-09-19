import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import logoImg from '../assets/logo.png';
import { useTranslation } from 'react-i18next';
import accounts from '../data/accounts.json';

const Auth = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const upperUsername = username.trim().toUpperCase();
    const cleanPassword = password.trim();

    try {
      const account = (accounts as any[]).find(a => a.username.toUpperCase() === upperUsername && a.password === cleanPassword);
      if (!account) throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");

      const email = `${upperUsername}@v-scene.local`.toLowerCase();
      let user = null;
      const firebasePassword = cleanPassword + "X";

      try {
        const result = await signInWithEmailAndPassword(auth, email, firebasePassword);
        user = result.user;
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          const result = await createUserWithEmailAndPassword(auth, email, firebasePassword);
          user = result.user;
        } else throw err;
      }

      if (user) {
        const nameToUse = account.displayName || upperUsername;
        try {
          await updateProfile(user, { displayName: nameToUse });
        } catch (pErr) {
          console.warn("Could not update profile displayName:", pErr);
        }

        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          uid: user.uid,
          username: upperUsername,
          displayName: nameToUse,
          role: account.role,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message.includes('network') ? "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้" : (err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-800">

      {/* ===== LEFT HERO PANEL ===== */}
      <div
        className="hidden lg:flex flex-col items-center justify-between w-[55%] min-h-screen px-6 py-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #fdf2f8 0%, #fce7f3 40%, #f3e8ff 100%)' }}
      >
        {/* Soft decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: '#ec4899' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: '#a855f7' }} />

        {/* TOP: University logos row */}
        <div className="relative z-10 self-start w-full">
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl px-5 py-3 w-fit shadow-sm border border-white/80">
            {/* NMU Logo */}
            <img
              src="/assets/nmu_logo_v2.png"
              alt="Navamindradhiraj University"
              className="h-12 xl:h-14 w-auto object-contain"
            />
            {/* Divider */}
            <div className="w-px h-10 bg-slate-200" />
            {/* MEDVJR Logo */}
            <img
              src="/assets/medvjr_logo.png"
              alt="Faculty of Medicine Vajira Hospital"
              className="h-10 xl:h-12 w-auto object-contain"
            />
          </div>
        </div>

        {/* CENTER: V-SCENE — big and dominant (50% larger) */}
        <div className="relative z-10 flex flex-col items-center gap-6 my-auto py-6">
          <img
            src={logoImg}
            alt="V-SCENE Logo"
            className="w-[320px] lg:w-[420px] xl:w-[500px] h-auto object-contain drop-shadow-2xl transition-all duration-300 transform scale-110"
          />
          <p className="text-slate-600 text-center text-base xl:text-lg leading-relaxed max-w-md font-medium">
            ระบบฝึกซักประวัติและให้เหตุผลทางคลินิกเสมือนจริง
          </p>
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] rounded-full" style={{ background: '#ec4899' }}></span>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#db2777' }}>
              Clinical Simulation Platform
            </span>
            <span className="w-8 h-[2px] rounded-full" style={{ background: '#ec4899' }}></span>
          </div>
        </div>

        {/* BOTTOM: credit */}
        <div className="relative z-10 text-center">
          <p className="text-slate-400 text-xs">
            Faculty of Medicine Vajira Hospital · Navamindradhiraj University
          </p>
        </div>
      </div>

      {/* ===== RIGHT FORM PANEL ===== */}
      <div className="flex flex-col items-center justify-center flex-1 min-h-screen bg-white px-6 sm:px-10 py-16">

        {/* Mobile: logos */}
        <div className="flex lg:hidden flex-col items-center gap-4 mb-10">
          <div className="flex items-center gap-3 bg-pink-50 rounded-xl px-4 py-2 border border-pink-100">
            <img src="/assets/nmu_logo_v2.png" alt="NMU" className="h-8 w-auto object-contain" />
            <div className="w-px h-6 bg-pink-200" />
            <img src="/assets/medvjr_logo.png" alt="MEDVJR" className="h-7 w-auto object-contain" />
          </div>
          <img src={logoImg} alt="V-SCENE" className="w-[300px] sm:w-[390px] h-auto object-contain drop-shadow-md" />
        </div>

        <div className="w-full max-w-sm sm:max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-1">เข้าสู่ระบบ</h1>
            <p className="text-slate-400 text-sm">กรุณากรอกรหัสประจำตัวและรหัสผ่านเพื่อเข้าใช้งาน</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <form className="space-y-5" onSubmit={handleLogin}>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  รหัสประจำตัว (Username)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น VS001"
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  รหัสผ่าน (Password)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัส 5 หลัก"
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                style={{
                  background: isLoading
                    ? '#c9a090'
                    : 'linear-gradient(135deg, #a0654a 0%, #7d4a34 100%)'
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    กำลังประมวลผล...
                  </span>
                ) : 'เข้าสู่ระบบ →'}
              </button>

            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2025 Faculty of Medicine Vajira Hospital · V-SCENE Platform
          </p>
        </div>
      </div>

      {/* Yenjai mascot — fixed bottom right */}
      <img
        src="/assets/yenjai.png"
        alt="น้องเย็นใจ"
        className="fixed bottom-4 right-4 w-20 sm:w-24 md:w-28 lg:w-32 h-auto object-contain z-50 drop-shadow-lg pointer-events-none select-none"
        style={{ animation: 'yenjaiFloat 3s ease-in-out infinite' }}
      />
      <style>{`
        @keyframes yenjaiFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default Auth;
