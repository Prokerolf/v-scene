import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from './lib/firebase';
import { doc, updateDoc, setDoc, collection, getDocs, query, getDoc } from 'firebase/firestore';
import { signOut, type User } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import AdaptivePreTestModal from './components/AdaptivePreTestModal';
import HistoryTakingScene from './components/HistoryTakingScene';
import LabOrderScene from './components/LabOrderScene';
import LabResultsScene from './components/LabResultsScene';
import TreatmentScene from './components/TreatmentScene';
import DiagnosticSynthesisScene from './components/DiagnosticSynthesisScene';
import SolutionScene from './components/SolutionScene';
import GatewayPreTest from './components/GatewayPreTest';
import ScratchpadWidget from './components/ScratchpadWidget';
import ReportBugWidget from './components/ReportBugWidget';
import PostTest from './components/PostTest';
import FinalPostTest from './components/FinalPostTest';
import { CLINICAL_CASES } from './data/cases';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTranslation } from 'react-i18next';

interface StudentAppProps {
  user: User;
}

export default function StudentApp({ user }: StudentAppProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<'gateway' | 'dashboard' | 'pretest' | 'history' | 'lab' | 'lab_results' | 'diagnostic' | 'treatment' | 'posttest' | 'solution' | 'finalposttest'>('gateway');
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
  const fadingRef = useRef(false);
  const splashRef = useRef<HTMLDivElement>(null);

  // Auto-save states
  const [gatewayAnswers, setGatewayAnswers] = useState<number[]>(new Array(30).fill(-1));
  const [gatewayIndex, setGatewayIndex] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(660);
  const [diagnosticInput, setDiagnosticInput] = useState<string>('');

  const addLogAction = (dimension: string, action: string, mistake: string, tag: string) => {
    setStudentActionsLog(prev => [...prev, { dimension, action, mistake, tag }]);
  };

  const handleFinishSplash = () => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    
    if (splashRef.current) {
      splashRef.current.style.opacity = '0';
      splashRef.current.style.pointerEvents = 'none';
    }
    
    setTimeout(() => {
      setShowSplash(false);
    }, 500);
  };

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        handleFinishSplash();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Load session & fetch cases on mount
  useEffect(() => {
    const initializeStudentData = async () => {
      setLoading(true);
      try {
        // 1. Load session from localStorage
        const localSession = localStorage.getItem(`sme_cbl_session_${user.uid}`);
        if (localSession) {
          try {
            const data = JSON.parse(localSession);
            if (data.session_version !== 'v5_no_somsri') {
              localStorage.removeItem(`sme_cbl_session_${user.uid}`);
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
              if (data.stage && data.stage !== 'teacher') {
                setStage(data.stage === 'posttest' ? 'solution' : data.stage);
              } else {
                setStage('gateway');
              }
            }
          } catch (e) {
            console.error("Error parsing session", e);
            setStage('gateway');
          }
        } else {
          setStage('gateway');
        }

        // 2. Fetch deployed cases
        try {
          const casesQuery = query(collection(db, 'cases'));
          const casesSnap = await getDocs(casesQuery);
          const customCases: any[] = [];
          casesSnap.forEach(doc => {
            const data = doc.data();
            if (data.status === 'deployed' || !data.status) {
              const localMatch = CLINICAL_CASES.find(c => c.id === doc.id);
              if (localMatch) {
                customCases.push({ ...localMatch, status: 'deployed' });
              } else {
                customCases.push({ id: doc.id, ...data });
              }
            }
          });
          
          for (const localCase of CLINICAL_CASES) {
            if (!customCases.some(c => c.id === localCase.id)) {
              customCases.push({ ...localCase, status: 'deployed' });
            }
          }
          
          setAvailableCases(customCases);
        } catch (e) {
          console.warn("Could not fetch custom cases", e);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeStudentData();
  }, [user.uid]);

  // Auto-save effect
  useEffect(() => {
    if (loading) return;
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
        localStorage.setItem(`sme_cbl_session_${user.uid}`, JSON.stringify(sessionData));
        
        const sessionRef = doc(db, 'users', user.uid);
        setDoc(sessionRef, sessionData, { merge: true }).catch(e => console.error("Firestore save error:", e));
      } catch (e) {
        console.error("Error auto-saving session:", e);
      }
    };
    saveData();
  }, [stage, activeCase, preTestScore, preTestAnswers, submittedDDx, finalDiagnosis, selectedLabs, selectedDrugs, ddxReason, labReason, diagnosisReason, drugReason, scratchpadText, studentActionsLog, gatewayAnswers, gatewayIndex, chatHistory, timeLeft, diagnosticInput, user.uid, loading]);

  const startCase = async (selectedCase: any) => {
    setActiveCase(selectedCase);
    setStudentActionsLog([]); 
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
    setGatewayAnswers(new Array(30).fill(-1));
    setGatewayIndex(0);
    setChatHistory([]);
    setTimeLeft(660);
    setDiagnosticInput('');
    setStage('history');

    try {
      const resetData = {
        chatHistory: [],
        timeLeft: 660,
        preTestScore: 0,
        preTestAnswers: [],
        gatewayAnswers: new Array(30).fill(-1),
        gatewayIndex: 0,
        diagnosticInput: '',
        selectedLabs: [],
        selectedDrugs: [],
        ddxReason: '',
        labReason: '',
        diagnosisReason: '',
        drugReason: ''
      };
      const localSession = localStorage.getItem(`sme_cbl_session_${user.uid}`);
      const parsed = localSession ? JSON.parse(localSession) : {};
      localStorage.setItem(`sme_cbl_session_${user.uid}`, JSON.stringify({ ...parsed, ...resetData, stage: 'history', session_version: 'v5_no_somsri' }));

      const sessionRef = doc(db, 'users', user.uid);
      await setDoc(sessionRef, resetData, { merge: true });
    } catch (err) {
      console.error("Failed to reset session data", err);
    }
  };

  const handlePreTestComplete = (score: number, answers: number[]) => {
    setPreTestScore(score);
    setPreTestAnswers(answers);
    
    let targetTier = 'High';
    if (score <= 4) targetTier = 'Low';
    else if (score <= 7) targetTier = 'Mid';

    const sameDiseaseCases = availableCases.filter(c => c.diseaseName === activeCase.diseaseName);
    const tierCases = sameDiseaseCases.filter(c => c.tier === targetTier);
    
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
      case 'treatment': setStage('solution'); break;
      case 'solution': setStage('dashboard'); break;
      default: break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50">
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

      <div className="fixed bottom-4 left-4 z-[999999] flex flex-col gap-2 items-start">
        <button 
          onClick={handleSkipForDev}
          className="px-4 py-2 bg-yellow-500 text-black rounded-full shadow-lg font-bold text-sm hover:bg-yellow-400 hover:scale-105 transition-transform flex items-center gap-2"
        >
          <span className="material-symbols-rounded text-[18px]">fast_forward</span> Skip for Dev
        </button>
        <button 
          onClick={async () => {
             const userRef = doc(db, 'users', user.uid);
             const snap = await getDoc(userRef);
             const curr = snap.data()?.allocatedGroup || 'A';
             const next = curr === 'A' ? 'B' : 'A';
             await updateDoc(userRef, { allocatedGroup: next });
             alert('Switched to Group ' + next);
             window.location.reload();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg font-bold text-sm hover:bg-blue-400 hover:scale-105 transition-transform flex items-center gap-2"
        >
          <span className="material-symbols-rounded text-[18px]">swap_horiz</span> Toggle Group (A/B)
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

      {stage === 'dashboard' && <Dashboard onStartCase={startCase} onStartPostTest={() => setStage('finalposttest')} />}
      
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
                let chatHistoryObj = null;
                
                try {
                  const savedChat = sessionStorage.getItem(`yenjai_chat_${activeCase?.id || 'default'}`);
                  if (savedChat) {
                    chatHistoryObj = JSON.parse(savedChat);
                  }
                } catch (e) {
                  console.error(e);
                }

                if (currentLogId) {
                  await updateDoc(doc(db, 'case_logs', currentLogId), { selectedDrugs: drugs, drugReason: reason });
                }

                try {
                  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                  if (chatHistoryObj && apiKey) {
                    const studentMsgs = chatHistoryObj.filter((m: any) => m.sender === 'student');
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
                        const result = await Promise.race([
                          model.generateContent(prompt),
                          new Promise((_, reject) => setTimeout(() => reject(new Error('AI Evaluation Timeout')), 10000))
                        ]) as any;
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
                    scratchpadNotes: scratchpadText,
                    timeSpent: 600 - timeLeft,
                    hintsUsedCount: studentActionsLog.filter((log: any) => log.dimension === 'hint').length
                  };
                  if (chatHistoryObj) updateData.yenjaiChatHistory = chatHistoryObj;
                  if (yenjaiEval) updateData.yenjaiEvaluation = yenjaiEval;
                  
                  await updateDoc(doc(db, 'case_logs', currentLogId), updateData);
                }
                
                setIsEvaluatingYenjai(false);
                setStage('solution'); // Skip per-case post-test in this study
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

      {(stage === 'solution' || stage === 'posttest') && (
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

      {stage === 'finalposttest' && (
        <FinalPostTest 
          onComplete={() => setStage('dashboard')}
          onLogout={() => signOut(auth)}
        />
      )}
    </div>
  );
}
