import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { CLINICAL_CASES } from '../data/cases';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import logoImg from '../assets/logo.png';
import { useTranslation } from 'react-i18next';

const Dashboard = ({ onStartCase, onStartPostTest }: { onStartCase: (caseData: any) => void, onStartPostTest: () => void }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<{name: string, studentId: string, role: string} | null>(null);
  const [latestLog, setLatestLog] = useState<any>(null);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [availableCases, setAvailableCases] = useState<any[]>(CLINICAL_CASES.filter(c => !c.id.startsWith('gen_')));
  const [activePeriod, setActivePeriod] = useState<number>(1);
  const [hasCompletedPosttest, setHasCompletedPosttest] = useState(false);

  const notifications = allLogs
    .filter(log => log.teacherFeedback)
    .map(log => ({
      id: log.id || Math.random().toString(),
      title: 'New Feedback from Teacher',
      message: log.teacherFeedback,
      date: log.timestamp ? new Date(log.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'
    }));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchProfileAndLogs = async () => {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as any;
            setProfile(data);
          }

          try {
            const configDoc = await getDoc(doc(db, 'settings', 'system_config'));
            let currentPeriod = 1;
            if (configDoc.exists() && configDoc.data().activePeriod) {
              currentPeriod = configDoc.data().activePeriod;
            }
            setActivePeriod(currentPeriod);
            
            if (docSnap.exists()) {
               const data = docSnap.data() as any;
               if (currentPeriod === 1 && data.hasCompletedPosttest_batch1) setHasCompletedPosttest(true);
               if (currentPeriod === 2 && data.hasCompletedPosttest_batch2) setHasCompletedPosttest(true);
            }
            const q = query(
              collection(db, 'case_logs'), 
              where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            const logsData: any[] = [];
            querySnapshot.forEach((doc) => {
              logsData.push(doc.data());
            });
            
            logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            setAllLogs(logsData);
            if (logsData.length > 0) {
              setLatestLog(logsData[0]);
            }
            
            if (!localStorage.getItem('force_sync_cases_v6_sme')) {
              for (const c of CLINICAL_CASES) {
                const newCase = { ...c, status: 'deployed', timestamp: new Date().toISOString() };
                await setDoc(doc(db, 'cases', c.id), newCase);
              }
              localStorage.setItem('force_sync_cases_v6_sme', 'true');
            }

            const casesSnapshot = await getDocs(collection(db, 'cases'));
            const casesData: any[] = [];
            const validIds = CLINICAL_CASES.map(c => c.id);
            casesSnapshot.forEach((cDoc) => {
              const data = cDoc.data();
              // Hide adaptive cases (which have IDs starting with 'gen_') from the dashboard UI.
              if (data.status === 'deployed' && validIds.includes(cDoc.id) && !cDoc.id.startsWith('gen_')) {
                const localMatch = CLINICAL_CASES.find(c => c.id === cDoc.id);
                if (localMatch) {
                  casesData.push({ ...localMatch, status: 'deployed' });
                } else {
                  casesData.push({ id: cDoc.id, ...data });
                }
              }
            });
            
            if (casesData.length > 0) {
              const order = ['case_covid_pneumonia', 'case_diaphragmatic_paralysis', 'case_paragonimus'];
              casesData.sort((a, b) => {
                const indexA = order.indexOf(a.id);
                const indexB = order.indexOf(b.id);
                
                if (indexA !== -1 && indexB !== -1) {
                  return indexA - indexB;
                }
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                
                return a.id.localeCompare(b.id);
              });
            }
            // Filter cases by user's tier
            let mappedTier = 'Low';
            if (docSnap.exists()) {
              const userData = docSnap.data();
              if (userData.triageTier === 'Intermediate') mappedTier = 'Mid';
              else if (userData.triageTier === 'Advanced') mappedTier = 'High';
            }
            const filteredCasesData = casesData.filter(c => c.tier === mappedTier && c.phase === currentPeriod);

            // Always set, even if empty (do not fallback to default cases if teacher undeployed all)
            setAvailableCases(filteredCasesData);

          } catch (e) {
            console.error("Error fetching logs", e);
          }
        };
        fetchProfileAndLogs();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'ต่อไป ➔',
      prevBtnText: '⬅ ก่อนหน้า',
      doneBtnText: 'เข้าใจแล้ว!',
      steps: [
        { element: '#tour-sidebar', popover: { title: 'บทเรียนแนะนำส่วนตัว', description: 'ที่นี่จะรวมเอกสารการเรียนที่ AI แนะนำให้คุณทบทวนเป็นพิเศษ โดยวิเคราะห์จากผลการทำเคสของคุณครับ', side: "right", align: 'start' }},
        { element: '#tour-bell', popover: { title: 'การแจ้งเตือน (Notifications)', description: 'ถ้าอาจารย์ส่งข้อความแนะนำหรือให้ Feedback คุณจะได้รับการแจ้งเตือนตรงนี้ครับ', side: "bottom", align: 'end' }},
        { element: '#tour-cases', popover: { title: 'เคสผู้ป่วยจำลอง', description: 'ส่วนนี้คือเคสผู้ป่วยจำลองที่คุณต้องเข้าไปฝึกฝนการวินิจฉัยครับ', side: "top", align: 'start' }},
        { element: '#tour-history', popover: { title: 'ประวัติการเรียนรู้', description: 'ประวัติการทำเคสของคุณทั้งหมด สามารถดูคะแนนและ Feedback ได้ที่นี่', side: "top", align: 'start' }},
      ]
    });
    driverObj.drive();
  };

  const completedCaseIds = new Set(allLogs.map(log => log.caseId));
  const uniqueCasesCompleted = completedCaseIds.size;
  const progressPercent = availableCases.length > 0 
    ? Math.min(100, Math.round((uniqueCasesCompleted / availableCases.length) * 100)) 
    : 0;

  let progressLabel = "Beginner";
  let progressText = "Start your first case to begin building expertise.";
  
  if (progressPercent >= 80) {
    progressLabel = "High";
    progressText = "Excellent participation! You've mastered most core cases.";
  } else if (progressPercent >= 40) {
    progressLabel = "Medium";
    progressText = "Great progress! You are consistently improving.";
  } else if (progressPercent > 0) {
    progressLabel = "Started";
    progressText = "Good start! Keep going to build your clinical reasoning.";
  }

  const isGroup1 = profile?.allocatedGroup === 'A';
  const isGroup2 = profile?.allocatedGroup === 'B';
  const canDoCases = (activePeriod === 1 && isGroup1) || (activePeriod === 2 && isGroup2);
  const canDoPosttest = !canDoCases || uniqueCasesCompleted >= availableCases.length;

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-4 md:px-10 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
            title="Toggle Study Path"
          >
            <span className="material-symbols-rounded text-[24px]">menu</span>
          </button>
          <div className="h-14 md:h-20 overflow-hidden flex items-center justify-center">
            <img src={logoImg} alt="Bridge AI Logo" className="h-40 md:h-52 w-auto object-contain" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={startTutorial}
            className="hidden md:flex font-label-md text-primary bg-primary-container hover:bg-surface-variant px-4 py-2 rounded-full transition-colors items-center gap-2"
          >
            <span className="material-symbols-rounded text-[20px]">help</span> Tutorial
          </button>
          
          {/* Notifications */}
          <div className="relative" id="tour-bell">
            <button 
              className="relative p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="material-symbols-rounded text-[24px]">notifications</span>
              {notifications.length > 0 && (
                <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-lg overflow-hidden z-50">
                <div className="bg-surface-container-low border-b border-outline-variant px-4 py-3 flex justify-between items-center">
                  <h3 className="font-label-md text-on-surface">Notifications</h3>
                  <span className="text-[10px] font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">{notifications.length} New</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-on-surface-variant text-label-md">No new notifications</div>
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-4 hover:bg-surface-container transition cursor-pointer">
                          <h4 className="font-label-md text-on-surface mb-1">{notif.title}</h4>
                          <p className="font-label-sm text-on-surface-variant line-clamp-2 mb-2">{notif.message}</p>
                          <span className="text-[10px] text-outline">{notif.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Profile & Logout */}
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
            <div className="hidden sm:block text-right">
              <p className="font-label-md text-on-surface">{profile ? profile.name : 'Loading...'}</p>
              <p className="font-label-sm text-on-surface-variant">{profile ? profile.studentId : '...'}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-on-surface-variant hover:bg-error-container hover:text-on-error-container rounded-full transition-colors" title="Logout">
              <span className="material-symbols-rounded text-[24px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop NavigationDrawer / Sidebar */}
      <nav 
        id="tour-sidebar" 
        className={`hidden md:flex flex-col h-screen fixed left-0 top-0 pt-[128px] z-30 bg-surface-container-low border-r border-outline-variant transition-all duration-300 ${
          isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full overflow-hidden border-none opacity-0'
        }`}
      >
        <div className="px-6 py-4 mb-2">
          <h2 className="font-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-rounded text-primary">auto_awesome</span>
            Study Path
          </h2>
          <p className="font-label-sm text-on-surface-variant mt-1">AI Recommended Materials</p>
        </div>
        
        <div className="flex flex-col gap-3 px-4 flex-grow overflow-y-auto pb-6">
          {latestLog ? (
            <>
              <div 
                onClick={() => alert(`กำลังดาวน์โหลดไฟล์: ${latestLog.assignedTier === 'Low' ? 'L14. Parasitic infection.pdf' : latestLog.assignedTier === 'Mid' ? 'L17. Intro Pulmonary Medicine.pdf' : 'L24. Respiratory failure.pdf'}... (Simulated)`)}
                className="bg-primary-container text-on-primary-container p-4 rounded-xl border border-primary-fixed-dim hover:bg-surface-variant cursor-pointer transition-colors relative"
              >
                <div className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl">Priority</div>
                <div className="flex items-center gap-3 mb-2 mt-1">
                  <span className="material-symbols-rounded text-primary text-[24px]">menu_book</span>
                  <h3 className="font-label-md">
                    {latestLog.assignedTier === 'Low' ? 'L14. Parasitic Infection' : latestLog.assignedTier === 'Mid' ? 'L17. Intro Pulmonary Medicine' : 'L24. Respiratory Failure'}
                  </h3>
                </div>
                <p className="font-label-sm opacity-80 leading-relaxed">
                  Based on your last score ({latestLog.preTestScore || 0}/9), review this to improve diagnostic skills.
                </p>
              </div>

              <div 
                onClick={() => alert('กำลังดาวน์โหลดไฟล์: L23. Restrictive lung disease.pdf... (Simulated)')}
                className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant hover:border-primary cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-rounded text-on-surface-variant text-[24px]">description</span>
                  <h3 className="font-label-md text-on-surface">L23. Restrictive Lung Disease</h3>
                </div>
                <p className="font-label-sm text-on-surface-variant leading-relaxed">Core syllabus review for pulmonary syndromes.</p>
              </div>
            </>
          ) : (
            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant text-center">
              <p className="font-label-sm text-on-surface-variant">Complete a case to get personalized AI recommendations.</p>
            </div>
          )}

          {/* Psychological Safety UI */}
          <div className="mt-auto bg-surface-container p-4 rounded-xl border border-outline-variant">
            <h3 className="font-label-md text-on-surface mb-2">Improvement Progress</h3>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 bg-outline-variant rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="font-label-sm text-primary whitespace-nowrap min-w-[64px] text-right">{progressLabel}</span>
            </div>
            <p className="font-label-sm text-on-surface-variant mt-2">{progressText}</p>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className={`flex-grow pt-[128px] pb-[80px] md:pb-8 flex flex-col px-4 md:px-10 gap-8 transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-72' : 'md:ml-0'
      }`}>
        
        {/* Header */}
        <section className="flex flex-col gap-2">
          <h2 className="font-headline-xl text-on-surface">{t('dashboard.title')} {profile?.name ? profile.name.split(' ')[0] : 'Doctor'}</h2>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            {t('dashboard.subtitle')}
          </p>
        </section>

        {/* Post-test Section */}
        {(!hasCompletedPosttest || canDoPosttest) && (
          <div className={`bg-primary-container border ${canDoPosttest ? 'border-primary' : 'border-outline-variant'} text-on-primary-container p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-md mb-8 ${!canDoPosttest ? 'opacity-75 grayscale' : ''}`}>
            <div>
              <h3 className="font-headline-md text-2xl mb-2 flex items-center gap-2">
                <span className="material-symbols-rounded">{hasCompletedPosttest ? 'verified' : (canDoPosttest ? 'assignment_turned_in' : 'lock')}</span> 
                {hasCompletedPosttest ? 'Post-test Completed' : 'แบบทดสอบหลังเรียน (Post-test)'}
              </h3>
              <p className="font-body-md">
                {!canDoCases 
                  ? 'Since you are in the Traditional CBL group for this period, you can take the post-test now.'
                  : (hasCompletedPosttest 
                      ? 'คุณได้ทำแบบทดสอบหลังเรียนเสร็จสิ้นแล้ว ขอบคุณที่เข้าร่วมการเรียนรู้ครับ!'
                      : (canDoPosttest 
                          ? 'คุณทำครบทุกเคสแล้ว! สามารถทำแบบทดสอบหลังเรียน (Post-test) ได้เลยครับ'
                          : `คุณต้องทำเคสให้ครบก่อนถึงจะปลดล็อคแบบทดสอบนี้ได้ (ทำไปแล้ว ${uniqueCasesCompleted}/${availableCases.length} เคส)`)
                    )
                }
              </p>
            </div>
            {!hasCompletedPosttest && (
              <button 
                onClick={onStartPostTest}
                disabled={!canDoPosttest}
                className={`${canDoPosttest ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-lg' : 'bg-surface-variant text-on-surface-variant cursor-not-allowed shadow-none'} font-headline-md px-8 py-4 rounded-full transition-all flex items-center gap-2 whitespace-nowrap`}
              >
                {canDoPosttest ? 'Take Post-test' : 'Locked'} <span className="material-symbols-rounded">{canDoPosttest ? 'arrow_forward' : 'lock'}</span>
              </button>
            )}
          </div>
        )}

        {/* Assigned Cases Grid */}
        <div id="tour-cases" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!canDoCases ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-surface-container-low border border-outline-variant border-dashed rounded-xl p-10 flex flex-col justify-center items-center text-center opacity-80">
                <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                  <span className="material-symbols-rounded text-3xl">lock</span>
                </div>
                <h3 className="font-headline-md text-on-surface-variant mb-2 text-xl">Cases Locked for Period {activePeriod}</h3>
                <p className="font-body-md text-on-surface-variant max-w-lg">
                  You are assigned to the Traditional CBL group for this period. Please attend the class with your teacher.
                </p>
            </div>
          ) : (
            availableCases.map((caseData, idx) => {
              const isCompleted = completedCaseIds.has(caseData.id);
              return (
              <div key={caseData.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                {isCompleted && (
                  <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute top-4 right-[-20px] bg-green-500 text-white font-bold text-[10px] py-1 px-8 rotate-45 text-center shadow-sm">
                      DONE
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm rounded-full">
                          Case 0{idx + 1}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 font-label-sm rounded-full">
                            <span className="material-symbols-rounded text-sm">check_circle</span> Done
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline-md text-on-surface mb-1 text-xl">
                        {caseData.patientName ? `ผู้ป่วย: ${caseData.patientName}` : 'Clinical Simulation'}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container group-hover:bg-primary group-hover:text-on-primary transition-colors z-10">
                      <span className="material-symbols-rounded text-xl">vital_signs</span>
                    </div>
                  </div>
                  
                  <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4">
                    <p className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Chief Complaint</p>
                    <p className="font-body-md text-on-surface">{caseData.chiefComplaint}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={() => onStartCase(caseData)}
                    className={`w-full ${isCompleted ? 'bg-secondary text-on-secondary hover:bg-secondary/90' : 'bg-primary text-on-primary hover:bg-primary-fixed-variant'} font-label-md px-6 py-3 rounded-full transition-colors shadow-sm flex items-center justify-center gap-2`}
                  >
                    {isCompleted ? 'ทำซ้ำ (Replay Case)' : t('dashboard.start_case')}
                    <span className="material-symbols-rounded text-[20px] group-hover:translate-x-1 transition-transform">{isCompleted ? 'replay' : 'arrow_forward'}</span>
                  </button>
                </div>
              </div>
            )})
          )}

          {/* Locked Cases Placeholder */}
          {canDoCases && Array.from({ length: Math.max(0, 3 - availableCases.length) }).map((_, idx) => (
             <div key={`locked-${idx}`} className="bg-surface-container-low border border-outline-variant border-dashed rounded-xl p-6 flex flex-col justify-center items-center text-center opacity-70">
                <div className="w-12 h-12 bg-surface-variant rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                  <span className="material-symbols-rounded">lock</span>
                </div>
                <h3 className="font-headline-md text-on-surface-variant mb-1 text-lg">Case 0{availableCases.length + idx + 1}</h3>
                <p className="font-body-md text-on-surface-variant">Coming Soon</p>
             </div>
          ))}
        </div>

        {/* Recent Cases List (History) */}
        <div id="tour-history" className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm overflow-hidden mt-4">
          <div className="p-5 border-b border-outline-variant flex items-center gap-3">
            <span className="material-symbols-rounded text-primary text-2xl">history</span>
            <h3 className="font-headline-md text-on-surface text-xl">{t('dashboard.recent_logs')}</h3>
          </div>
          
          <div className="overflow-x-auto">
            {allLogs.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider border-b border-outline-variant">
                    <th className="px-6 py-4">Date / Time</th>
                    <th className="px-6 py-4">Gold Standard Dx</th>
                    <th className="px-6 py-4">Your DDx</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4">Feedback & AI Coaching</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {allLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4 font-label-sm text-on-surface-variant">
                        {new Date(log.timestamp).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 font-label-md text-on-surface">
                        {log.patientName || log.diseaseName || 'Clinical Simulation'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {log.submittedDDx && Array.isArray(log.submittedDDx) ? log.submittedDDx.map((d: string, i: number) => (
                            <span key={i} className="font-label-sm bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-md border border-tertiary-fixed-dim">
                              {d}
                            </span>
                          )) : (
                            <span className="font-label-sm bg-surface-variant text-on-surface-variant px-2 py-1 rounded-md border border-outline-variant">
                              {log.submittedDDx}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-label-md text-primary bg-primary-container px-3 py-1 rounded-full">
                          {log.preTestScore !== undefined ? `${log.preTestScore}/9` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-y-3">
                        {log.teacherFeedback && (
                          <div className="bg-error-container text-on-error-container p-3 rounded-lg border border-error-container/50 relative">
                            <p className="font-label-sm mb-1 opacity-80 text-error">👩‍⚕️ Teacher Feedback:</p>
                            <p className="font-body-md text-sm font-medium">{log.teacherFeedback}</p>
                          </div>
                        )}
                        
                        {log.yenjaiEvaluation && (
                          <div className="bg-secondary-container/30 border border-secondary-container p-3 rounded-lg relative">
                            <p className="font-label-sm mb-1 opacity-80 text-secondary flex items-center gap-1">
                              <span className="material-symbols-rounded text-[14px]">psychology</span> 
                              Coach Yenjai Eval:
                            </p>
                            <div className="space-y-1">
                              <p className="font-body-md text-xs text-on-surface-variant">
                                <strong>Knowledge:</strong> {log.yenjaiEvaluation.knowledgeLevel}
                              </p>
                              {log.yenjaiEvaluation.overallAssessment && (
                                <p className="font-body-md text-sm text-primary font-medium">
                                  💡 {log.yenjaiEvaluation.overallAssessment}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {!log.teacherFeedback && !log.yenjaiEvaluation && (
                          <span className="font-body-md text-outline">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-rounded text-5xl opacity-50 mb-4">folder_open</span>
                <p className="font-label-md">{t('dashboard.no_logs')}</p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Mobile BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant z-50 md:hidden">
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-6 py-2 transition-all duration-150">
          <span className="material-symbols-rounded fill text-[24px]">home</span>
          <span className="font-label-sm mt-1">Home</span>
        </button>
        <button onClick={startTutorial} className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container rounded-full">
          <span className="material-symbols-rounded text-[24px]">help</span>
          <span className="font-label-sm mt-1">Guide</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
