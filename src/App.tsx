import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, query } from 'firebase/firestore';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdaptivePreTestModal from './components/AdaptivePreTestModal';
import HistoryTakingScene from './components/HistoryTakingScene';
import LabOrderScene from './components/LabOrderScene';
import LabResultsScene from './components/LabResultsScene';
import TreatmentScene from './components/TreatmentScene';
import DiagnosticSynthesisScene from './components/DiagnosticSynthesisScene';
import SolutionScene from './components/SolutionScene';
import TeacherDashboard from './components/TeacherDashboard';
import GatewayPreTest from './components/GatewayPreTest';
import ScratchpadWidget from './components/ScratchpadWidget';
import ReportBugWidget from './components/ReportBugWidget';
import ConsentForm from './components/ConsentForm';
import PostTest from './components/PostTest';
import { CLINICAL_CASES } from './data/cases';
import { signOut } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<'gateway' | 'consent' | 'dashboard' | 'pretest' | 'history' | 'lab' | 'lab_results' | 'diagnostic' | 'treatment' | 'posttest' | 'solution' | 'teacher'>('gateway');
  const [availableCases, setAvailableCases] = useState<any[]>(CLINICAL_CASES);

  const [activeCase, setActiveCase] = useState<any>(null);
  const [preTestScore, setPreTestScore] = useState<number>(0);
  const [preTestAnswers, setPreTestAnswers] = useState<number[]>([]);
  const [postTestScore, setPostTestScore] = useState<number | null>(null);
  const [postTestAnswers, setPostTestAnswers] = useState<number[]>([]);
  const [submittedDDx, setSubmittedDDx] = useState<string>('');
  const [finalDiagnosis, setFinalDiagnosis] = useState<string>('');
  const [isEvaluatingYenjai, setIsEvaluatingYenjai] = useState(false);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [ddxReason, setDdxReason] = useState<string>('');
  const [labReason, setLabReason] = useState<string>('');
  const [diagnosisReason, setDiagnosisReason] = useState<string>('');
  const [drugReason, setDrugReason] = useState<string>('');
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [studentActionsLog, setStudentActionsLog] = useState<{dimension: string, action: string, mistake: string, tag: string}[]>([]);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const fadingRef = useRef(false);
  const splashRef = useRef<HTMLDivElement>(null);

  const handleFinishSplash = () => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    
    // Direct DOM manipulation for guaranteed CSS transition
    if (splashRef.current) {
      splashRef.current.style.opacity = '0';
      splashRef.current.style.pointerEvents = 'none';
    }
    
    // Remove from DOM after fade completes
    setTimeout(() => {
      setShowSplash(false);
    }, 500);
  };

  // Strictly 3 seconds splash screen (2.5s play + 0.5s fade)
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        handleFinishSplash();
      }, 2500); // 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Auto-save states
  const [gatewayAnswers, setGatewayAnswers] = useState<number[]>(new Array(20).fill(-1));
  const [gatewayIndex, setGatewayIndex] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [diagnosticInput, setDiagnosticInput] = useState<string>('');

  const addLogAction = (dimension: string, action: string, mistake: string, tag: string) => {
    setStudentActionsLog(prev => [...prev, { dimension, action, mistake, tag }]);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // 1. Load session from localStorage first (synchronous, immune to Firestore rules)
          try {
            const localSession = localStorage.getItem(`sme_cbl_session_${currentUser.uid}`);
            if (localSession) {
              try {
                const data = JSON.parse(localSession);
                if (data.session_version !== 'v5_no_somsri') {
                  localStorage.removeItem(`sme_cbl_session_${currentUser.uid}`);
                  setStage('gateway');
                } else {
                  if (data.activeCase) setActiveCase(data.activeCase);
                  if (data.preTestScore !== undefined) setPreTestScore(data.preTestScore);
                  if (data.preTestAnswers) setPreTestAnswers(data.preTestAnswers);
                  if (data.submittedDDx) setSubmittedDDx(data.submittedDDx);
                  if (data.finalDiagnosis) setFinalDiagnosis(data.finalDiagnosis);
                  if (data.selectedLabs) setSelectedLabs(data.selectedLabs);
                  if (data.selectedDrugs) setSelectedDrugs(data.selectedDrugs);
                  if (data.scratchpadText) setScratchpadText(data.scratchpadText);
                  if (data.studentActionsLog) setStudentActionsLog(data.studentActionsLog);
                  if (data.gatewayAnswers) setGatewayAnswers(data.gatewayAnswers);
                  if (data.gatewayIndex !== undefined) setGatewayIndex(data.gatewayIndex);
                  if (data.chatHistory) setChatHistory(data.chatHistory);
                  if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
                  if (data.diagnosticInput !== undefined) setDiagnosticInput(data.diagnosticInput);
                  if (data.stage) setStage(data.stage);
                  else setStage('gateway');
                }
              } catch (e) {
                console.error("Error parsing session", e);
                setStage('gateway');
              }
            } else {
              setStage('gateway');
            }
          } catch (err) {
            console.error("Error loading session from localStorage", err);
            setStage('gateway');
          }

          // 2. Fetch role from Firestore
          try {
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.hasConsented === true) {
                setHasConsented(true);
              } else {
                setHasConsented(false);
                setStage('consent');
              }

              if (data.role === 'teacher') {
                setRole('teacher');
                setStage('teacher');
              } else {
                setRole('student');
                // Force consent stage if student hasn't consented and they are trying to enter gateway/dashboard
                if (data.hasConsented !== true) {
                  setStage('consent');
                }
              }
            } else {
              setRole('student');
              setHasConsented(false);
              setStage('consent');
            }
          } catch (e) {
            console.warn("Could not fetch user data or case config from Firestore (expected during dev/offline)", e);
            setRole('student');
            setHasConsented(false);
            setStage('consent');
          }

          // Fetch deployed cases for student assignment
          try {
            const casesQuery = query(collection(db, 'cases'));
            const casesSnap = await getDocs(casesQuery);
            const customCases: any[] = [];
            casesSnap.forEach(doc => {
              const data = doc.data();
              if (data.status === 'deployed' || !data.status) {
                // If it's a built-in case, ALWAYS use the local version to prevent stale Firestore data from overriding updates.
                const localMatch = CLINICAL_CASES.find(c => c.id === doc.id);
                if (localMatch) {
                  customCases.push({ ...localMatch, status: 'deployed' });
                } else {
                  customCases.push({ id: doc.id, ...data });
                }
              }
            });
            
            // Ensure all built-in cases are included even if missing from Firestore
            for (const localCase of CLINICAL_CASES) {
              if (!customCases.some(c => c.id === localCase.id)) {
                customCases.push({ ...localCase, status: 'deployed' });
              }
            }
            
            setAvailableCases(customCases);
          } catch (e) {
            console.warn("Could not fetch custom cases", e);
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

  // Auto-save effect
  useEffect(() => {
    if (!user || loading) return;
    
    const saveData = () => {
      try {
        const sessionData = {
          stage,
          activeCase,
          preTestScore,
          preTestAnswers,
          postTestScore,
          postTestAnswers,
          submittedDDx,
          finalDiagnosis,
          selectedLabs,
          selectedDrugs,
          scratchpadText,
          studentActionsLog,
          gatewayAnswers,
          gatewayIndex,
          chatHistory,
          timeLeft,
          diagnosticInput,
          session_version: 'v5_no_somsri',
          updatedAt: new Date().toISOString()
        };
        // Save to localStorage synchronously for instant F5 resilience
        localStorage.setItem(`sme_cbl_session_${user.uid}`, JSON.stringify(sessionData));
        
        // Also save to Firestore in background (no await needed for UI)
        const sessionRef = doc(db, 'users', user.uid);
        setDoc(sessionRef, sessionData, { merge: true }).catch(e => console.error("Firestore save error:", e));
      } catch (e) {
        console.error("Error auto-saving session:", e);
      }
    };

    // We can save synchronously to localStorage, but we'll debounce the Firestore write
    // Actually, setting localStorage is fast enough to do on every render change
    saveData();
  }, [stage, activeCase, preTestScore, preTestAnswers, submittedDDx, finalDiagnosis, selectedLabs, selectedDrugs, ddxReason, labReason, diagnosisReason, drugReason, scratchpadText, studentActionsLog, gatewayAnswers, gatewayIndex, chatHistory, timeLeft, diagnosticInput, user, role, loading]);

  // Student Flow

  const startCase = async (selectedCase: any) => {
    setActiveCase(selectedCase);
    setStudentActionsLog([]); // Reset logs for new case
    setCurrentLogId(null);
    setScratchpadText('');
    setPreTestScore(0);
    setPreTestAnswers([]);
    setPostTestScore(null);
    setPostTestAnswers([]);
    setSubmittedDDx('');
    setFinalDiagnosis('');
    setSelectedLabs([]);
    setSelectedDrugs([]);
    setDdxReason('');
    setLabReason('');
    setDiagnosisReason('');
    setDrugReason('');
    setGatewayAnswers(new Array(20).fill(-1));
    setGatewayIndex(0);
    setChatHistory([]);
    setTimeLeft(600);
    setDiagnosticInput('');
    setStage('pretest');

    if (user) {
      try {
        const resetData = {
          chatHistory: [],
          timeLeft: 600,
          preTestScore: 0,
          preTestAnswers: [],
          gatewayAnswers: new Array(20).fill(-1),
          gatewayIndex: 0,
          diagnosticInput: '',
          selectedLabs: [],
          selectedDrugs: [],
          ddxReason: '',
          labReason: '',
          diagnosisReason: '',
          drugReason: ''
        };
        // Update localStorage immediately
        const localSession = localStorage.getItem(`sme_cbl_session_${user.uid}`);
        const parsed = localSession ? JSON.parse(localSession) : {};
        localStorage.setItem(`sme_cbl_session_${user.uid}`, JSON.stringify({ ...parsed, ...resetData, stage: 'pretest', session_version: 'v5_no_somsri' }));

        const sessionRef = doc(db, 'users', user.uid);
        await setDoc(sessionRef, resetData, { merge: true });
      } catch (err) {
        console.error("Failed to reset session data", err);
      }
    }
  };

  const handlePreTestComplete = (score: number, answers: number[]) => {
    setPreTestScore(score);
    setPreTestAnswers(answers);
    
    // Assign case based on score and tier
    let targetTier = 'High';
    if (score <= 4) targetTier = 'Low';
    else if (score <= 7) targetTier = 'Mid';

    // Find cases with the SAME disease as the active case
    const sameDiseaseCases = availableCases.filter(c => c.diseaseName === activeCase.diseaseName);
    const tierCases = sameDiseaseCases.filter(c => c.tier === targetTier);
    
    // Pick a random case from the correct tier for THIS disease, or default to the originally clicked case
    let assignedCase = activeCase;
    if (tierCases.length > 0) {
      assignedCase = tierCases[Math.floor(Math.random() * tierCases.length)];
    }
    
    setActiveCase(assignedCase);
    setStage('history');
  };

  const handleSkipForDev = () => {
    if (!activeCase && stage !== 'gateway' && stage !== 'dashboard') {
        setActiveCase(CLINICAL_CASES[0]);
    }
    switch (stage) {
      case 'gateway': setStage('dashboard'); break;
      case 'dashboard': 
        if (!activeCase) setActiveCase(CLINICAL_CASES[0]);
        setStage('pretest'); 
        break;
      case 'pretest': setStage('history'); break;
      case 'history': setStage('lab'); break;
      case 'lab': setStage('diagnostic'); break;
      case 'diagnostic': setStage('treatment'); break;
      case 'treatment': setStage('posttest'); break;
      case 'posttest': setStage('solution'); break;
      case 'solution': setStage('dashboard'); break;
      case 'teacher': setStage('dashboard'); break;
      default: break;
    }
  };

  const handleConsentAccept = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { hasConsented: true, consentDate: new Date().toISOString() }, { merge: true });
        setHasConsented(true);
        setStage('gateway');
      } catch (err) {
        console.error("Error saving consent", err);
      }
    }
  };

  const handleConsentDecline = () => {
    alert("ระบบนี้สงวนสิทธิ์ให้ผู้ที่ยินยอมเข้าร่วมวิจัยเท่านั้น หากคุณเปลี่ยนใจสามารถกด ยินยอม ได้ครับ");
  };

  return (
    <>
      {showSplash && (
        <div 
          ref={splashRef}
          style={{ transition: 'opacity 500ms ease-in-out' }}
          className="fixed inset-0 z-[1000000] bg-black flex items-center justify-center cursor-pointer opacity-100"
          onClick={handleFinishSplash}
        >
          <video 
            src="/open2.mov" 
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !user ? (
        <Auth />
      ) : stage === 'consent' ? (
        <ConsentForm onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      ) : (
        <div className="min-h-screen font-sans text-slate-800 bg-slate-50">

      <ReportBugWidget stage={stage} caseName={activeCase?.diseaseName} />

      {(stage === 'gateway' || stage === 'dashboard') && (
        <div className="fixed bottom-6 right-6 z-[999999] flex gap-2">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'th' ? 'en' : 'th')}
            className="px-4 py-2 bg-surface-container-lowest text-on-surface-variant rounded-full shadow-lg font-label-sm border border-outline-variant hover:bg-surface-container transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-rounded text-[18px]">language</span> 
            {i18n.language === 'th' ? 'EN' : 'TH'}
          </button>
        </div>
      )}

      {stage !== 'teacher' && (
        <div className="fixed bottom-16 left-4 z-[999999] flex flex-col gap-2 items-start">
          <button 
            onClick={() => setStage('teacher')}
            className="px-4 py-2 bg-indigo-900 text-white rounded-full shadow-lg font-bold text-sm hover:bg-indigo-800 hover:scale-105 transition-transform border-2 border-indigo-400 flex items-center gap-2"
          >
            <span className="material-symbols-rounded text-[18px]">admin_panel_settings</span> {t('app.switch_teacher')}
          </button>
        </div>
      )}

      <div className="fixed bottom-4 left-4 z-[999999] flex flex-col gap-2 items-start">
        <button 
          onClick={handleSkipForDev}
          className="px-4 py-2 bg-yellow-500 text-black rounded-full shadow-lg font-bold text-sm hover:bg-yellow-400 hover:scale-105 transition-transform flex items-center gap-2"
        >
          <span className="material-symbols-rounded text-[18px]">fast_forward</span> Skip for Dev
        </button>
      </div>

      {stage === 'gateway' && (
        <GatewayPreTest 
          onPass={() => setStage('dashboard')} 
          onLogout={() => signOut(auth)} 
          answers={gatewayAnswers}
          setAnswers={setGatewayAnswers}
          currentIndex={gatewayIndex}
          setCurrentIndex={setGatewayIndex}
        />
      )}

      {stage === 'dashboard' && <Dashboard onStartCase={startCase} />}
      
      {stage === 'pretest' && (
        <>
          <Dashboard onStartCase={() => {}} />
          <AdaptivePreTestModal 
            caseData={activeCase}
            onClose={handlePreTestComplete} 
            onCancel={() => setStage('dashboard')}
            addLogAction={addLogAction} 
          />
        </>
      )}

      {stage === 'history' && (
        <div className="flex flex-col md:flex-row w-full min-h-screen items-start">
          <div className="w-full md:w-[70%] lg:w-[75%]">
            <HistoryTakingScene 
              activeCase={activeCase}
              preTestScore={preTestScore}
              addLogAction={addLogAction}
              onBack={() => setStage('dashboard')} 
              onFinish={(ddx, logId, reason) => {
                setSubmittedDDx(ddx);
                setDdxReason(reason);
                if (logId) setCurrentLogId(logId);
                setStage('lab');
              }} 
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
            />
          </div>
          <div className="hidden md:block md:w-[30%] lg:w-[25%] z-50 sticky top-0 h-screen">
            <ScratchpadWidget 
              notes={scratchpadText} 
              setNotes={setScratchpadText} 
              submittedDDx={submittedDDx} 
              finalDiagnosis={finalDiagnosis} 
              selectedLabs={selectedLabs} 
            />
          </div>
        </div>
      )}

      {stage === 'lab' && (
        <div className="flex flex-col md:flex-row w-full min-h-screen items-start">
          <div className="w-full md:w-[70%] lg:w-[75%] h-full">
            <LabOrderScene 
              activeCase={activeCase}
              addLogAction={addLogAction}
              onFinish={async (labs, reason) => {
                setSelectedLabs(labs);
                setLabReason(reason);
                if (currentLogId) {
                  await updateDoc(doc(db, 'case_logs', currentLogId), { selectedLabs: labs, labReason: reason });
                }
                setStage('lab_results');
              }} 
              selectedLabs={selectedLabs}
              setSelectedLabs={setSelectedLabs}
            />
          </div>
          <div className="hidden md:block md:w-[30%] lg:w-[25%] z-50 sticky top-0 h-screen">
            <ScratchpadWidget 
              notes={scratchpadText} 
              setNotes={setScratchpadText} 
              submittedDDx={submittedDDx} 
              finalDiagnosis={finalDiagnosis} 
              selectedLabs={selectedLabs} 
            />
          </div>
        </div>
      )}

      {stage === 'lab_results' && (
        <div className="flex flex-col md:flex-row w-full min-h-screen items-start">
          <div className="w-full md:w-[70%] lg:w-[75%] h-full">
            <LabResultsScene
              activeCase={activeCase}
              selectedLabs={selectedLabs}
              onNext={() => setStage('diagnostic')}
            />
          </div>
          <div className="hidden md:block md:w-[30%] lg:w-[25%] z-50 sticky top-0 h-screen">
            <ScratchpadWidget 
              notes={scratchpadText} 
              setNotes={setScratchpadText} 
              submittedDDx={submittedDDx} 
              finalDiagnosis={finalDiagnosis} 
              selectedLabs={selectedLabs} 
            />
          </div>
        </div>
      )}

      {stage === 'diagnostic' && (
        <div className="flex flex-col md:flex-row w-full min-h-screen items-start">
          <div className="w-full md:w-[70%] lg:w-[75%] h-full">
            <DiagnosticSynthesisScene
              activeCase={activeCase}
              addLogAction={addLogAction}
              onFinish={async (finalDx, reason) => {
                setFinalDiagnosis(finalDx);
                setDiagnosisReason(reason);
                if (currentLogId) {
                  await updateDoc(doc(db, 'case_logs', currentLogId), { finalDiagnosis: finalDx, diagnosisReason: reason });
                }
                setStage('treatment');
              }}
              diagnosticInput={diagnosticInput}
              setDiagnosticInput={setDiagnosticInput}
            />
          </div>
          <div className="hidden md:block md:w-[30%] lg:w-[25%] z-50 sticky top-0 h-screen">
            <ScratchpadWidget 
              notes={scratchpadText} 
              setNotes={setScratchpadText} 
              submittedDDx={submittedDDx} 
              finalDiagnosis={finalDiagnosis} 
              selectedLabs={selectedLabs} 
            />
          </div>
        </div>
      )}

      {stage === 'treatment' && (
        <div className="flex flex-col md:flex-row w-full min-h-screen items-start">
          <div className="w-full md:w-[70%] lg:w-[75%] h-full">
            <TreatmentScene 
              activeCase={activeCase}
              addLogAction={addLogAction}
              selectedDrugs={selectedDrugs}
              setSelectedDrugs={setSelectedDrugs}
              onFinish={async (drugs, reason) => {
                setSelectedDrugs(drugs);
                setDrugReason(reason);
                setIsEvaluatingYenjai(true);
                let yenjaiEval = null;
                let chatHistory = null;
                
                try {
                  const savedChat = sessionStorage.getItem(`yenjai_chat_${activeCase?.id || 'default'}`);
                  if (savedChat) {
                    chatHistory = JSON.parse(savedChat);
                  }
                } catch (e) {
                  console.error(e);
                }

                if (currentLogId) {
                  await updateDoc(doc(db, 'case_logs', currentLogId), { selectedDrugs: drugs, drugReason: reason });
                }

                try {
                  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                  if (chatHistory && apiKey) {
                    const studentMsgs = chatHistory.filter((m: any) => m.sender === 'student');
                    if (studentMsgs.length > 0) {
                        const genAI = new GoogleGenerativeAI(apiKey);
                        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
                        
                        const prompt = `
                          คุณเป็นอาจารย์แพทย์ที่กำลังประเมินนักศึกษาจากการซักถามผู้ช่วย AI (ชื่อน้องเย็นใจ)
                          คนไข้: ${activeCase?.diseaseName}
                          ประวัติการคุย:
                          ${studentMsgs.map((m: any) => 'นักศึกษา: ' + m.text).join('\n')}

                          นอกจากนี้ นักศึกษายังได้ให้เหตุผล (Clinical Reasoning) ประกอบการตัดสินใจในแต่ละขั้นตอนดังนี้:
                          1. เหตุผลการให้ DDx: ${ddxReason || 'ไม่ได้ระบุ'}
                          2. เหตุผลการสั่ง Lab: ${labReason || 'ไม่ได้ระบุ'}
                          3. เหตุผลการวินิจฉัย: ${diagnosisReason || 'ไม่ได้ระบุ'}
                          4. เหตุผลการจ่ายยา: ${reason || 'ไม่ได้ระบุ'}
                          
                          ประเมินนักศึกษาคนนี้แล้วตอบเป็น JSON format เท่านั้น โดยมี key ดังนี้:
                          {
                            "knowledgeLevel": "High", "Medium", หรือ "Low",
                            "knowledgeSummary": "สรุปสั้นๆ ว่ามีความรู้พื้นฐานระดับไหน เข้าใจโรคไหม (ไทย)",
                            "criticalThinking": "สรุปสั้นๆ ว่านักศึกษามี critical thinking ไหม หรือแค่ถามเอาคำตอบตรงๆ (ไทย)",
                            "reasoningScore": "คะแนน Clinical Reasoning ประเมินจากเหตุผลที่พิมพ์มา (เต็ม 10) ให้เป็นตัวเลขเท่านั้น",
                            "reasoningFeedback": "คำอธิบายเหตุผลของคะแนน reasoningScore (ไทย)",
                            "overallAssessment": "คำแนะนำสั้นๆ 1 ประโยค (ไทย)"
                          }
                          ไม่ต้องมี markdown \`\`\`json ครอบ ให้ส่งเฉพาะ JSON text ล้วนๆ
                        `;
                        const result = await model.generateContent(prompt);
                        const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                        yenjaiEval = JSON.parse(jsonText);
                      }
                    }
                } catch (e) {
                  console.error("Yenjai Eval Error", e);
                }

                if (currentLogId) {
                  const updateData: any = { 
                    selectedDrugs: drugs,
                    studentActionsLog: studentActionsLog,
                    preTestAnswers: preTestAnswers,
                    scratchpadNotes: scratchpadText
                  };
                  if (chatHistory) updateData.yenjaiChatHistory = chatHistory;
                  if (yenjaiEval) updateData.yenjaiEvaluation = yenjaiEval;
                  
                  await updateDoc(doc(db, 'case_logs', currentLogId), updateData);
                }
                
                setIsEvaluatingYenjai(false);
                setStage('posttest');
              }} 
            />
          </div>
          <div className="hidden md:block md:w-[30%] lg:w-[25%] z-50 sticky top-0 h-screen">
            <ScratchpadWidget 
              notes={scratchpadText} 
              setNotes={setScratchpadText} 
              submittedDDx={submittedDDx} 
              finalDiagnosis={finalDiagnosis} 
              selectedLabs={selectedLabs} 
            />
          </div>
        </div>
      )}

      {stage === 'posttest' && (
        <PostTest 
          caseData={activeCase}
          onComplete={async (score, answers) => {
            setPostTestScore(score);
            setPostTestAnswers(answers);
            if (currentLogId) {
              await updateDoc(doc(db, 'case_logs', currentLogId), {
                postTestScore: score,
                postTestAnswers: answers
              });
            }
            setStage('solution');
          }}
        />
      )}

      {stage === 'solution' && (
        <SolutionScene 
          patientCase={activeCase}
          preTestScore={preTestScore}
          preTestAnswers={preTestAnswers}
          submittedDDx={submittedDDx}
          selectedLabs={selectedLabs}
          selectedDrugs={selectedDrugs}
          studentActionsLog={studentActionsLog}
          onFinish={() => setStage('dashboard')} 
        />
      )}

      {stage === 'teacher' && (
        <TeacherDashboard onSwitchToStudent={() => setStage('gateway')} />
      )}
    </div>
    )}
    </>
  );
}

export default App;
