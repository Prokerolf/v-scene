import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CLINICAL_CASES } from '../data/cases';
import type { ClinicalCase } from '../data/cases';
import { labOptions } from './LabOrderScene';
import { drugOptions } from './TreatmentScene';
import logoImg from '../assets/logo.png';
import ReportBugWidget from './ReportBugWidget';
import { CaseEditModal } from './CaseEditModal';
import { ClassAnalyticsModal } from './ClassAnalyticsModal';
import { useTranslation } from 'react-i18next';

interface CaseLog {
  id: string;
  userId: string;
  timestamp: string;
  chatHistory: any[];
  submittedDDx: string[];
  studentName?: string;
  studentId?: string;
  confidenceLevel?: number;
  studyProgress?: number;
  preTestScore?: number;
  preTestAnswers?: number[];
  assignedTier?: string;
  selectedLabs?: string[];
  selectedDrugs?: string[];
  activeCaseId?: string;
  studentActionsLog?: any[];
  baselineKnowledgeLog?: {
    student_asked_summary?: string;
    baseline_knowledge_level?: string;
  };
  yenjaiChatHistory?: any[];
  yenjaiEvaluation?: {
    knowledgeLevel: string;
    knowledgeSummary: string;
    criticalThinking: string;
    overallAssessment: string;
  };
  teacherFeedback?: string;
  scratchpadNotes?: string;
  ddxReason?: string;
  labReason?: string;
  diagnosisReason?: string;
  drugReason?: string;
  finalDiagnosis?: string;
}

interface PatientCase {
  id?: string;
  diseaseName: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  personaDetails: string;
  voiceProfile: string;
  timestamp?: string;
  status?: 'draft' | 'deployed';
  tier?: 'Low' | 'Mid' | 'High';
  goldStandardLabs?: string[];
  goldStandardDrugs?: string[];
  contraindicatedDrugs?: string[];
  ddxKeywords?: string[];
  finalDiagnosisKeywords?: string[];
  ddxGroup?: string;
  ddxExplanation?: string;
  diagnosisExplanation?: string;
  specificLabResults?: {
    [labId: string]: {
      text?: string;
      imageUrl?: string;
    };
  };
  preTestQuestions?: any[];
}

interface BugReport {
  id: string;
  text: string;
  timestamp: string;
  url: string;
  userAgent: string;
  stage: string;
  caseName: string;
}

const TeacherDashboard = ({ onSwitchToStudent }: { onSwitchToStudent?: () => void }) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<CaseLog[]>([]);
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<CaseLog | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewCase, setPreviewCase] = useState<PatientCase | null>(null);
  const [editingCase, setEditingCase] = useState<PatientCase | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const [isCaseGenModalOpen, setIsCaseGenModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [diseaseInput, setDiseaseInput] = useState('');
  const [backgroundInput, setBackgroundInput] = useState('');
  const [activeTab, setActiveTab] = useState<'monitoring' | 'approval' | 'bug_reports'>('monitoring');
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [studentFilter, setStudentFilter] = useState<'all' | 'needs_help'>('all');

  const resetToDefaultCases = async () => {
    if (!confirm("Are you sure you want to reset all cases to the system defaults (3 Cases)? This will delete all current cases in the database.")) return;
    setLoading(true);
    try {
      const casesSnapshot = await getDocs(collection(db, 'cases'));
      const batch = writeBatch(db);
      casesSnapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      
      for (const c of CLINICAL_CASES) {
        const caseRef = doc(db, 'cases', c.id);
        batch.set(caseRef, { ...c, status: 'deployed', timestamp: new Date().toISOString() });
      }
      
      await batch.commit();
      alert("Successfully synced cases to default!");
      await fetchData();
    } catch (e: any) {
      alert("Error resetting cases: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'case_logs'));
      const logsData: CaseLog[] = [];
      for (const document of querySnapshot.docs) {
        const data = document.data() as CaseLog;
        data.id = document.id;
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        if (userDoc.exists()) {
          data.studentName = userDoc.data().name;
          data.studentId = userDoc.data().studentId;
        } else {
          data.studentName = "Unknown Student";
          data.studentId = "-";
        }
        
        data.studyProgress = Math.floor(Math.random() * 60) + 40; 
        data.preTestScore = data.preTestScore !== undefined ? data.preTestScore : Math.floor(Math.random() * 10);
        data.assignedTier = data.assignedTier || (data.preTestScore <= 3 ? 'Low' : data.preTestScore <= 6 ? 'Mid' : 'High');

        logsData.push(data);
      }
      logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(logsData);

      const casesSnapshot = await getDocs(collection(db, 'cases'));
      const casesData: PatientCase[] = [];
      
      if (casesSnapshot.empty) {
        console.log("Migrating default cases to Firestore...");
        for (const c of CLINICAL_CASES) {
          const newCase = { ...c, status: 'deployed', timestamp: new Date().toISOString() };
          await setDoc(doc(db, 'cases', c.id), newCase);
          casesData.push(newCase as unknown as PatientCase);
        }
      } else {
        casesSnapshot.forEach((doc) => {
          casesData.push({ id: doc.id, ...doc.data() } as PatientCase);
        });
      }
      
      casesData.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      setCases(casesData);

      const configDoc = await getDoc(doc(db, 'settings', 'system_config'));
      if (configDoc.exists()) {
        setActiveCaseId(configDoc.data().activeCaseId);
      }

      const bugReportsSnapshot = await getDocs(collection(db, 'bug_reports'));
      const bugsData: BugReport[] = [];
      bugReportsSnapshot.forEach((doc) => {
        bugsData.push({ id: doc.id, ...doc.data() } as BugReport);
      });
      bugsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setBugReports(bugsData);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async () => {
    if (!selectedLog || !selectedLog.id) return;
    setIsSendingFeedback(true);
    try {
      await updateDoc(doc(db, 'case_logs', selectedLog.id), {
        teacherFeedback: feedbackMessage
      });
      alert('ส่งข้อความถึงนักศึกษาเรียบร้อยแล้ว!');
      setLogs(logs.map(l => l.id === selectedLog.id ? { ...l, teacherFeedback: feedbackMessage } : l));
    } catch (error: any) {
      alert('Error sending feedback: ' + error.message);
    }
    setIsSendingFeedback(false);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const analyzeWithAI = async (log: CaseLog) => {
    setIsAnalyzing(true);
    setAiFeedback('');
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return setAiFeedback('ไม่พบ API Key');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

      const transcript = log.chatHistory.map(m => `${m.role === 'user' ? 'Student' : 'Patient'}: ${m.text}`).join('\n');
      const ddx = log.submittedDDx && Array.isArray(log.submittedDDx) ? log.submittedDDx.join(', ') : (log.submittedDDx || 'ไม่ได้ระบุ');
      const labs = log.selectedLabs?.map(id => labOptions.find(l => l.id === id)?.name || id).join(', ') || 'ไม่ได้ระบุ';
      const drugs = log.selectedDrugs?.map(id => drugOptions.find(d => d.id === id)?.name || id).join(', ') || 'ไม่ได้ระบุ';

      const caseQuestions = cases.find(c => c.id === log.activeCaseId)?.preTestQuestions || CLINICAL_CASES.find(c => c.id === log.activeCaseId)?.preTestQuestions || [];
      
      let preTestSummary = `คะแนน: ${log.preTestScore || 0}/${caseQuestions.length || 9}`;
      if (log.preTestAnswers && Array.isArray(log.preTestAnswers) && caseQuestions.length > 0) {
        const missedTopics: string[] = [];
        log.preTestAnswers.forEach((ansIndex, i) => {
          if (caseQuestions[i] && ansIndex !== caseQuestions[i].correctAnswerIndex) {
            missedTopics.push(caseQuestions[i].category || `ข้อ ${i+1}`);
          }
        });
        if (missedTopics.length > 0) {
          preTestSummary += `\nหัวข้อที่ตอบผิด: ${missedTopics.join(', ')}`;
        } else if (log.preTestAnswers.length > 0) {
          preTestSummary += ` (ตอบถูกทั้งหมด)`;
        }
      }

      const prompt = `
        คุณคืออาจารย์แพทย์ผู้เชี่ยวชาญ ทำหน้าที่เป็น "Coach" (ห้ามทำตัวเป็นผู้ให้คะแนนหรือตัดเกรด)
        จงประเมินนักศึกษาแพทย์คนนี้จากการซักประวัติและดูแลผู้ป่วยจำลอง
        
        บทสนทนา:
        ${transcript}

        วินิจฉัยที่นักศึกษาเลือก (DDx): ${ddx}
        เหตุผลการให้ DDx: ${log.ddxReason || 'ไม่ได้ระบุ'}
        ความมั่นใจของนักศึกษา: ${log.confidenceLevel !== undefined ? log.confidenceLevel + '%' : 'ไม่ได้ระบุ'}
        ผล Pre-test: ${preTestSummary}
        Lab ที่สั่ง: ${labs}
        เหตุผลการสั่ง Lab: ${log.labReason || 'ไม่ได้ระบุ'}
        วินิจฉัยสุดท้าย: ${log.finalDiagnosis || 'ไม่ได้ระบุ'}
        เหตุผลการวินิจฉัยสุดท้าย: ${log.diagnosisReason || 'ไม่ได้ระบุ'}
        ยาและการรักษาที่เลือก: ${drugs}
        เหตุผลการให้ยา: ${log.drugReason || 'ไม่ได้ระบุ'}

        กรุณาวิเคราะห์ทุกแง่มุมสั้นๆ กระชับ เป็นภาษาไทย เพื่อช่วยอาจารย์ในการแนะนำนักศึกษา (เน้นการพัฒนา ไม่ใช่การตัดสิน):
        1. ความรู้พื้นฐาน (Pre-test): สรุปว่านักศึกษาอ่อนตรงไหน และจากภาพรวมควรกลับไปทบทวนหัวข้อใดบ้าง (ดูจากหัวข้อที่ตอบผิด)
        2. ทักษะการสื่อสาร (Communication Skill): การใช้คำถาม สร้างความไว้วางใจ
        3. การให้เหตุผลทางคลินิก (Clinical Reasoning): ประเมินเหตุผลทั้งหมดที่นักศึกษาให้มาว่าสมเหตุสมผลหรือไม่ สอดคล้องกับโรคไหม พร้อมให้คะแนนเต็ม 10 และคำอธิบาย
        4. การเลือกตรวจและการรักษา (Labs & Treatment): ความสมเหตุสมผลของการเลือก Lab และยา (Over-investigation หรือไม่, ยาตรงจุดไหม)
        5. การประเมินตนเอง (Self-Calibration): ความมั่นใจ ${log.confidenceLevel}% เหมาะสมไหม?
        6. แนะนำข้อความให้กำลังใจ (Suggested Coaching Message): 1 ประโยคสั้นๆ ที่อาจารย์สามารถก๊อปปี้ไปส่งให้นักศึกษาได้เลย
      `;

      const result = await model.generateContent(prompt);
      setAiFeedback(result.response.text());
    } catch (error: any) {
      console.error(error);
      setAiFeedback('เกิดข้อผิดพลาดในการเรียกใช้ AI: ' + error.message);
    }
    setIsAnalyzing(false);
  };

  const generateNewCase = async () => {
    if (!diseaseInput) return alert("กรุณาใส่ชื่อโรค");
    setIsGeneratingCase(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

      const prompt = `
        คุณเป็นระบบสร้างเคสผู้ป่วยจำลอง (Patient Persona Generator) สำหรับให้นักศึกษาแพทย์ฝึกซักประวัติ
        จงสร้างข้อมูลผู้ป่วยจากชื่อโรค: "${diseaseInput}"
        บริบทเพิ่มเติม (ถ้ามี): "${backgroundInput}"
        
        ให้ตอบกลับมาเป็น JSON FORMAT เท่านั้น โดยมีรูปแบบดังนี้:
        {
          "tier": "Low หรือ Mid หรือ High",
          "diseaseName": "${diseaseInput}",
          "patientName": "ชื่อ นามสกุล (ภาษาไทย)",
          "age": ตัวเลขอายุ,
          "gender": "ชาย หรือ หญิง",
          "chiefComplaint": "อาการสำคัญที่เป็นภาษาชาวบ้าน ไม่ใช้ศัพท์แพทย์",
          "personaDetails": "ประวัติอย่างละเอียด อุปนิสัย ภาษาที่ใช้ ประวัติครอบครัว ประวัติส่วนตัว (เพื่อนำไปให้ AI สวมบทบาทต่อ)",
          "voiceProfile": "เลือกระหว่าง: old_male, male, old_female, female, child",
          "ddxGroup": "กลุ่มโรคที่เป็นไปได้ (ภาษาไทย)",
          "ddxExplanation": "คำอธิบายเหตุผลในการซักประวัติแยกโรค",
          "diagnosisExplanation": "คำอธิบายเหตุผลของการวินิจฉัยโรคนี้",
          "goldStandardLabs": ["1", "3"], // ID ของ Lab ที่จำเป็นที่สุดจริงๆ (ห้ามใส่เกิน 1-3 ตัวเด็ดขาด! เอาเฉพาะ Gold Standard ที่ใช้ยืนยันโรค ห้ามใส่ Lab พื้นฐานทั่วไปเช่น CBC ถ้าไม่จำเป็น) (1=CT Brain, 2=MRI Brain, 3=CBC, 4=Coag, 5=BUN/Cr, 6=Electrolytes, 7=FBS, 8=Lipid, 9=EKG, 10=Echo, 11=CXR, 12=LFT, 13=TFT, 14=UA)
          "specificLabResults": {
            "1": { "text": "**CT Brain:** Normal findings." } // ตัวอย่างการใส่ผลแล็บจำเพาะสำหรับ goldStandardLabs
          }
        }
        
        ไม่ต้องมี markdown \`\`\`json ครอบ ให้ส่งเฉพาะ JSON text ล้วนๆ
      `;

      const result = await model.generateContent(prompt);
      const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const caseData = JSON.parse(jsonText);
      
      caseData.timestamp = new Date().toISOString();
      caseData.status = 'draft';
      
      const docRef = await addDoc(collection(db, 'cases'), caseData);
      await setDoc(doc(db, 'settings', 'system_config'), { activeCaseId: docRef.id }, { merge: true });
      
      alert("สร้างเคสสำเร็จ!");
      setIsCaseGenModalOpen(false);
      setDiseaseInput('');
      setBackgroundInput('');
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Error generating case: " + error.message);
    }
    setIsGeneratingCase(false);
  };

  const setActiveCase = async (id: string) => {
    await setDoc(doc(db, 'settings', 'system_config'), { activeCaseId: id }, { merge: true });
    setActiveCaseId(id);
  };

  return (
    <div className="bg-surface text-on-surface overflow-hidden flex h-screen w-full font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Desktop Navigation Drawer */}
      <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 pt-20 z-30 w-64 border-r border-outline-variant bg-surface-container-low">
        <div className="px-6 pb-6">
          <h2 className="font-headline-md text-xl font-bold text-primary">{t('teacher.title')}</h2>
        </div>
        <ul className="flex-1 flex flex-col gap-2">
          {/* Active/Inactive classes based on state */}
          <li>
            <button 
              onClick={() => setActiveTab('monitoring')}
              className={`w-full flex items-center gap-4 py-3 rounded-r-full mr-4 px-6 transition-all ${
                activeTab === 'monitoring' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded fill" data-icon="monitoring">monitoring</span>
              <span className="font-label-md whitespace-nowrap">{t('teacher.monitoring')}</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('approval')}
              className={`w-full flex items-center gap-4 py-3 rounded-r-full mr-4 px-6 transition-all ${
                activeTab === 'approval' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded" data-icon="edit_note">edit_document</span>
              <span className="font-label-md whitespace-nowrap">{t('teacher.approvals')}</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('bug_reports')}
              className={`w-full flex items-center gap-4 py-3 rounded-r-full mr-4 px-6 transition-all ${
                activeTab === 'bug_reports' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded">bug_report</span>
              <span className="font-label-md whitespace-nowrap">{t('teacher.bugs')}</span>
              {bugReports.length > 0 && (
                <span className="bg-error text-on-error text-xs px-2 py-0.5 rounded-full ml-auto">{bugReports.length}</span>
              )}
            </button>
          </li>
        </ul>
        <div className="p-4 border-t border-outline-variant">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-on-surface-variant hover:text-error hover:bg-error-container rounded-xl transition-colors font-label-md">
            <span className="material-symbols-rounded">logout</span>
            {t('teacher.logout')}
          </button>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-64 w-full">
        
        {/* Top App Bar */}
        <header className="w-full top-0 border-b border-outline-variant flex justify-between items-center px-4 md:px-10 py-4 z-40 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="h-14 md:h-20 overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="Bridge AI Logo" className="h-40 md:h-52 w-auto object-contain" />
            </div>
            <h1 className="font-headline-md text-xl font-bold text-primary sm:hidden ml-2">{t('teacher.portal')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('bug_reports')}
              className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors hidden md:block relative"
            >
              <span className="material-symbols-rounded">notifications</span>
              {bugReports.length > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-label-md text-on-surface hidden md:block">Teacher</span>
              <span className="material-symbols-rounded text-3xl text-secondary-fixed-dim bg-secondary-container rounded-full p-1 border-2 border-primary-container">account_circle</span>
            </div>
            {onSwitchToStudent && (
              <button onClick={onSwitchToStudent} className="hidden md:flex items-center gap-2 bg-surface-variant text-on-surface-variant px-4 py-2 rounded-full hover:bg-surface-container-highest transition-all font-label-md shadow-sm border border-outline-variant">
                <span className="material-symbols-rounded text-[18px]">swap_horiz</span> {t('teacher.student_view')}
              </button>
            )}
            <button onClick={handleLogout} className="md:hidden text-on-surface-variant p-2 hover:bg-error-container hover:text-error rounded-full">
              <span className="material-symbols-rounded">logout</span>
            </button>
          </div>
        </header>

        {/* Main Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 bg-surface w-full max-w-[1280px] mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">{t('teacher.dashboard_title')}</h2>
              <p className="font-body-md text-on-surface-variant">{t('teacher.dashboard_subtitle')}</p>
            </div>
            <button className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full hover:bg-primary-fixed-variant transition-all font-label-md shadow-sm">
              <span className="material-symbols-rounded text-[18px]">download</span> {t('teacher.export')}
            </button>
          </div>

          {/* KPI Summary Grid (Bento style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              onClick={() => setIsAnalyticsModalOpen(true)}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col justify-between shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-on-surface-variant">{t('teacher.class_avg')}</span>
                <span className="material-symbols-rounded text-secondary text-2xl">analytics</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-headline-md text-[40px] text-primary leading-none">
                  {logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + (log.preTestScore || 0), 0) / logs.length / 9 * 100) : 0}%
                </span>
                <span className="font-label-sm text-secondary-fixed-dim mb-1 font-semibold">{t('teacher.based_on_pretest')}</span>
              </div>
            </div>
            <div 
              onClick={() => { setActiveTab('approval'); }}
              className={`border rounded-2xl p-6 flex flex-col justify-between shadow-sm cursor-pointer transition-colors ${
                activeTab === 'approval' ? 'bg-surface-variant border-primary text-on-surface' : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-on-surface-variant">{t('teacher.ai_queue')}</span>
                <span className="material-symbols-rounded text-secondary text-2xl">edit_document</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-headline-md text-[40px] text-primary leading-none">{cases.length}</span>
                <span className="font-label-sm text-on-surface-variant mb-1">{t('teacher.total_cases')}</span>
              </div>
            </div>
            <div 
              onClick={() => { setActiveTab('monitoring'); setStudentFilter(studentFilter === 'needs_help' ? 'all' : 'needs_help'); }}
              className={`border rounded-2xl p-6 flex flex-col justify-between shadow-sm cursor-pointer transition-colors border-error/20 ${
                studentFilter === 'needs_help' ? 'bg-error-container text-on-error-container border-error' : 'bg-surface-container-lowest hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-on-surface-variant">{t('teacher.alerts')}</span>
                <span className="material-symbols-rounded text-error text-2xl">warning</span>
              </div>
              <div className="flex items-end gap-3">
                <span className={`font-headline-md text-[40px] leading-none ${studentFilter === 'needs_help' ? 'text-on-error-container' : 'text-error'}`}>
                  {logs.filter(l => l.assignedTier === 'Low' || (l.preTestScore || 0) < 4).length}
                </span>
                <span className="font-label-sm text-on-surface-variant mb-1">{t('teacher.students_flagged')}</span>
              </div>
            </div>
          </div>

          {activeTab === 'monitoring' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden mb-8 shadow-sm">
              <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                <h3 className="font-headline-md text-2xl text-on-surface">
                  {t('teacher.class_overview')}
                  {studentFilter === 'needs_help' && <span className="ml-2 text-sm bg-error text-on-error px-2 py-0.5 rounded-full">Filtered: Needs Help</span>}
                </h3>
                {loading && <span className="font-label-sm text-secondary-fixed-dim animate-pulse">{t('common.loading')}</span>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant font-bold uppercase tracking-wider">{t('teacher.student_name')}</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant font-bold uppercase tracking-wider">{t('teacher.tier')}</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant font-bold uppercase tracking-wider">{t('teacher.pretest_score')}</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant font-bold uppercase tracking-wider text-right">{t('teacher.action')}</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md">
                    {logs.length === 0 && !loading && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">No student records found.</td>
                      </tr>
                    )}
                    {logs.filter(log => studentFilter === 'all' || log.assignedTier === 'Low' || (log.preTestScore || 0) < 4).map(log => (
                      <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 border-b border-outline-variant">
                          <div className="text-on-surface font-semibold">{log.studentName}</div>
                          <div className="font-label-sm text-on-surface-variant">ID: {log.studentId}</div>
                        </td>
                        <td className="px-6 py-4 border-b border-outline-variant">
                          <div className="flex flex-col items-start gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm ${
                              log.assignedTier === 'Low' ? 'bg-error-container text-on-error-container' :
                              log.assignedTier === 'Mid' ? 'bg-secondary-container text-on-secondary-container' :
                              'bg-primary-container text-on-primary-container'
                            }`}>
                              Tier: {log.assignedTier}
                            </span>
                            <span className="font-label-sm text-on-surface-variant">
                              DDx: {log.submittedDDx && Array.isArray(log.submittedDDx) ? log.submittedDDx.join(', ') : (log.submittedDDx || '-')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-outline-variant">
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${
                              (log.preTestScore || 0) < 4 ? 'text-error' : 'text-on-surface'
                            }`}>{log.preTestScore || 0}/9</span>
                            <div className="w-24 h-2 bg-surface-container-highest rounded-full overflow-hidden hidden sm:block">
                              <div className={`h-full rounded-full ${
                                (log.preTestScore || 0) < 4 ? 'bg-error' : 'bg-primary'
                              }`} style={{ width: `${((log.preTestScore || 0) / 9) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-outline-variant text-right">
                          <button 
                            onClick={() => { 
                              setSelectedLog(log); 
                              setAiFeedback(''); 
                              setFeedbackMessage(log.teacherFeedback || ''); 
                            }}
                            className="bg-primary text-on-primary px-3 py-1.5 rounded-full font-label-sm whitespace-nowrap hover:bg-primary-fixed-variant transition-colors shadow-sm inline-flex items-center gap-1.5"
                          >
                            <span className="material-symbols-rounded text-[16px]">forum</span> {t('teacher.review')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'approval' && (
            <div className="flex flex-col gap-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-headline-md text-2xl text-on-surface mb-1">{t('teacher.case_approval_title')}</h3>
                  <p className="font-body-md text-on-surface-variant">{t('teacher.case_approval_subtitle')}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={resetToDefaultCases}
                    className="bg-surface-variant text-on-surface-variant font-label-md px-6 py-3 rounded-full hover:bg-surface-container-highest transition-colors shadow-sm flex items-center justify-center gap-2 flex-1 md:flex-none whitespace-nowrap border border-outline-variant"
                  >
                    <span className="material-symbols-rounded">sync</span> ซิงค์เคสเริ่มต้น
                  </button>
                  <button 
                    onClick={() => setIsCaseGenModalOpen(true)}
                    className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-full hover:bg-primary-fixed-variant transition-colors shadow-sm flex items-center justify-center gap-2 flex-1 md:flex-none whitespace-nowrap"
                  >
                    <span className="material-symbols-rounded">add_circle</span> {t('teacher.generate_new')}
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                {/* Drafts Section */}
                <div>
                  <h4 className="font-headline-sm text-lg text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-rounded text-secondary">draft</span> {t('teacher.drafts')}
                  </h4>
                  {cases.filter(c => c.status === 'draft').length === 0 ? (
                    <div className="bg-surface-container-lowest border border-outline-variant border-dashed rounded-2xl p-8 text-center text-on-surface-variant">
                      <p>{t('teacher.no_drafts')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cases.filter(c => c.status === 'draft').map((c) => (
                        <div key={c.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-headline-md text-xl text-on-surface font-bold">{c.diseaseName}</h4>
                            <span className="bg-secondary-container text-on-secondary-container text-[10px] uppercase font-bold px-3 py-1 rounded-full">Draft</span>
                          </div>
                          <div className="flex-1 space-y-2 mb-6">
                            <p className="font-body-md text-on-surface-variant"><span className="font-label-md text-on-surface">Patient:</span> {c.patientName}</p>
                            <p className="font-body-md text-on-surface-variant"><span className="font-label-md text-on-surface">CC:</span> {c.chiefComplaint}</p>
                            <p className="font-body-sm text-secondary mt-2"><span className="material-symbols-rounded text-[14px] align-middle">warning</span> Needs lab review before deploy</p>
                          </div>
                          <div className="flex gap-3 mt-auto">
                            <button onClick={() => setPreviewCase(c)} className="flex-1 bg-surface-container-low text-on-surface-variant font-label-md py-2.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors">{t('teacher.preview')}</button>
                            <button onClick={() => setEditingCase(c)} className="flex-1 bg-primary text-on-primary font-label-md py-2.5 rounded-full shadow-sm hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-2">
                              <span className="material-symbols-rounded text-[18px]">edit</span> {t('teacher.edit_deploy')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Deployed Section */}
                <div>
                  <h4 className="font-headline-sm text-lg text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-rounded text-primary">cloud_done</span> {t('teacher.deployed')}
                  </h4>
                  {cases.filter(c => c.status === 'deployed' || !c.status).length === 0 ? (
                    <div className="bg-surface-container-lowest border border-outline-variant border-dashed rounded-2xl p-8 text-center text-on-surface-variant">
                      <p>{t('teacher.no_deployed')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cases.filter(c => c.status === 'deployed' || !c.status).map((c) => (
                        <div key={c.id} className="bg-primary-container/10 border border-primary/30 rounded-2xl p-6 shadow-sm flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-headline-md text-xl text-on-surface font-bold">{c.diseaseName}</h4>
                            <span className="bg-primary text-on-primary text-[10px] uppercase font-bold px-3 py-1 rounded-full flex items-center gap-1">
                              <span className="material-symbols-rounded text-[12px]">check_circle</span> {t('teacher.deployed')}
                            </span>
                          </div>
                          <div className="flex-1 space-y-2 mb-6">
                            <p className="font-body-md text-on-surface-variant"><span className="font-label-md text-on-surface">Patient:</span> {c.patientName}</p>
                            <p className="font-body-md text-on-surface-variant"><span className="font-label-md text-on-surface">CC:</span> {c.chiefComplaint}</p>
                          </div>
                          <div className="flex gap-3 mt-auto">
                            <button onClick={() => setPreviewCase(c)} className="flex-1 bg-surface-container-low text-on-surface-variant font-label-md py-2.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors">{t('teacher.preview')}</button>
                            <button onClick={() => setEditingCase(c)} className="flex-1 bg-surface-container-highest text-on-surface font-label-md py-2.5 rounded-full hover:bg-outline-variant transition-colors flex items-center justify-center gap-2">
                              <span className="material-symbols-rounded text-[18px]">edit</span> {t('teacher.edit')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'bug_reports' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                <h3 className="font-headline-md text-2xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-rounded text-error">bug_report</span> {t('teacher.bug_reports_title')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant font-bold uppercase tracking-wider">{t('teacher.date_time')}</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant font-bold uppercase tracking-wider">{t('teacher.stage_case')}</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant font-bold uppercase tracking-wider">{t('teacher.description')}</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md">
                    {bugReports.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-on-surface-variant">{t('teacher.no_bugs')}</td>
                      </tr>
                    )}
                    {bugReports.map(bug => (
                      <tr key={bug.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 border-b border-outline-variant whitespace-nowrap">
                          {bug.timestamp ? (isNaN(new Date(bug.timestamp).getTime()) ? 'Invalid Date' : new Date(bug.timestamp).toLocaleString('th-TH')) : '-'}
                        </td>
                        <td className="px-6 py-4 border-b border-outline-variant">
                          <span className="bg-surface-variant text-on-surface-variant text-xs px-2 py-1 rounded-md font-mono uppercase tracking-wider block mb-1 w-max">Stage: {bug.stage}</span>
                          <span className="font-label-md text-on-surface">Case: {bug.caseName}</span>
                        </td>
                        <td className="px-6 py-4 border-b border-outline-variant text-sm">
                          {bug.text}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Teacher Mode) */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 z-50 bg-surface-container-lowest border-t border-outline-variant md:hidden">
        <button onClick={() => setActiveTab('monitoring')} className={`flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all ${activeTab === 'monitoring' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-rounded text-[24px] ${activeTab === 'monitoring' ? 'fill' : ''}`}>monitoring</span>
          <span className="font-label-sm mt-1 font-bold">Monitor</span>
        </button>
        <button onClick={() => setActiveTab('approval')} className={`flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all ${activeTab === 'approval' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-rounded text-[24px] ${activeTab === 'approval' ? 'fill' : ''}`}>edit_document</span>
          <span className="font-label-sm mt-1 font-bold">Cases</span>
        </button>
        <button onClick={() => setActiveTab('bug_reports')} className={`flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all ${activeTab === 'bug_reports' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-rounded text-[24px] ${activeTab === 'bug_reports' ? 'fill text-error' : ''}`}>bug_report</span>
          <span className="font-label-sm mt-1 font-bold">Bugs</span>
        </button>
      </nav>

      {/* Modal: Generate Case */}
      {isCaseGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
              <h3 className="font-headline-md text-2xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-rounded text-primary">auto_awesome</span> Create AI Case
              </h3>
              <button onClick={() => setIsCaseGenModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors p-2 bg-surface-container rounded-full">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block font-label-md text-on-surface mb-2">Disease / Condition</label>
                <input 
                  type="text" 
                  value={diseaseInput} 
                  onChange={(e) => setDiseaseInput(e.target.value)}
                  placeholder="e.g. Stroke, Parkinson's" 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body-md text-on-surface"
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-2">Additional Context (Optional)</label>
                <textarea 
                  value={backgroundInput}
                  onChange={(e) => setBackgroundInput(e.target.value)}
                  placeholder="e.g. 60yo male, sudden onset"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none h-24 resize-none font-body-md text-on-surface"
                ></textarea>
              </div>
              <button 
                onClick={generateNewCase}
                disabled={isGeneratingCase}
                className="w-full bg-primary text-on-primary font-label-md py-4 rounded-full shadow-md hover:bg-primary-fixed-variant transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isGeneratingCase ? (
                  <><span className="material-symbols-rounded animate-spin">sync</span> Generating Persona...</>
                ) : (
                  <><span className="material-symbols-rounded">smart_toy</span> Generate Case Content</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <CaseEditModal 
        isOpen={!!editingCase} 
        onClose={() => setEditingCase(null)} 
        caseData={editingCase} 
        onSave={() => fetchData()} 
      />

      {/* Modal: Preview Case */}
      {previewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-xl w-full max-w-2xl p-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant pb-4">
              <h3 className="font-headline-md text-2xl text-on-surface">Preview: {previewCase.diseaseName}</h3>
              <button onClick={() => setPreviewCase(null)} className="text-on-surface-variant hover:text-primary transition-colors bg-surface-container p-2 rounded-full">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-5 rounded-2xl border border-outline-variant">
                <div><span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Patient Name</span><p className="font-headline-md text-lg text-on-surface mt-1">{previewCase.patientName}</p></div>
                <div><span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Demographics</span><p className="font-headline-md text-lg text-on-surface mt-1">{previewCase.age} yo / {previewCase.gender}</p></div>
              </div>

              <div>
                <h4 className="font-label-md text-on-surface mb-2">Chief Complaint</h4>
                <div className="bg-primary-container/50 border border-primary-container text-on-primary-container p-4 rounded-xl font-body-lg italic">
                  "{previewCase.chiefComplaint}"
                </div>
              </div>

              <div>
                <h4 className="font-label-md text-on-surface mb-2">Persona Details (AI System Prompt)</h4>
                <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl font-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap shadow-sm">
                  {previewCase.personaDetails}
                </div>
              </div>

              <div>
                <h4 className="font-label-md text-on-surface mb-2">Voice Profile</h4>
                <div className="inline-flex px-4 py-2 bg-surface-container-high text-on-surface rounded-full font-mono text-sm border border-outline-variant">
                  {previewCase.voiceProfile}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={() => setPreviewCase(null)} 
                className="px-6 py-3 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full font-label-md transition-colors w-full sm:w-auto"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  if (previewCase.id) {
                    setActiveCase(previewCase.id);
                    setPreviewCase(null);
                    alert('อนุมัติและตั้งเป็นเคสปัจจุบันสำหรับนักศึกษาเรียบร้อยแล้ว!');
                  }
                }}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-full font-label-md shadow-md hover:bg-primary-fixed-variant transition-all w-full sm:w-auto"
              >
                <span className="material-symbols-rounded text-[20px]">check_circle</span> Deploy Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Replay & AI Grader */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-scrim/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-xl w-full max-w-6xl flex flex-col lg:flex-row overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Left: Chat Transcript */}
            <div className="flex-1 border-b lg:border-b-0 lg:border-r border-outline-variant flex flex-col bg-surface-container-lowest w-full lg:w-1/2 h-[50vh] lg:h-auto overflow-hidden">
              <div className="p-5 bg-surface-bright border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-headline-md text-xl text-on-surface truncate">Clinical Log</h3>
                <span className="font-label-md text-primary bg-primary-container px-3 py-1 rounded-full">{selectedLog.studentName}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Clinical Decisions Summary Block */}
                <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 shadow-sm">
                  <h4 className="font-label-md text-on-surface mb-3 flex items-center gap-2"><span className="material-symbols-rounded text-primary">analytics</span> Clinical Decisions</h4>
                  <div className="space-y-3 font-body-md text-on-surface-variant">
                    <div className="flex border-b border-outline-variant/50 pb-2">
                      <span className="w-1/3 font-label-md">Pre-test Score:</span> 
                      <span className="w-2/3 font-bold text-primary">{selectedLog.preTestScore || 0}/9</span>
                    </div>
                    <div className="flex flex-col border-b border-outline-variant/50 pb-2">
                      <div className="flex">
                        <span className="w-1/3 font-label-md">DDx:</span> 
                        <span className="w-2/3">{selectedLog.submittedDDx && Array.isArray(selectedLog.submittedDDx) ? selectedLog.submittedDDx.join(', ') : selectedLog.submittedDDx}</span>
                      </div>
                      {selectedLog.ddxReason && (
                        <div className="flex mt-1 text-sm bg-surface-container p-2 rounded-lg">
                          <span className="w-1/3 font-label-md text-on-surface-variant">เหตุผล:</span>
                          <span className="w-2/3 italic text-on-surface-variant">{selectedLog.ddxReason}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col border-b border-outline-variant/50 pb-2">
                      <div className="flex">
                        <span className="w-1/3 font-label-md">Labs:</span> 
                        <span className="w-2/3">{selectedLog.selectedLabs?.length ? selectedLog.selectedLabs.map(id => labOptions.find(l => l.id === id)?.name || id).join(', ') : '-'}</span>
                      </div>
                      {selectedLog.labReason && (
                        <div className="flex mt-1 text-sm bg-surface-container p-2 rounded-lg">
                          <span className="w-1/3 font-label-md text-on-surface-variant">เหตุผล:</span>
                          <span className="w-2/3 italic text-on-surface-variant">{selectedLog.labReason}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col border-b border-outline-variant/50 pb-2">
                      <div className="flex">
                        <span className="w-1/3 font-label-md">Final Dx:</span> 
                        <span className="w-2/3">{selectedLog.finalDiagnosis || '-'}</span>
                      </div>
                      {selectedLog.diagnosisReason && (
                        <div className="flex mt-1 text-sm bg-surface-container p-2 rounded-lg">
                          <span className="w-1/3 font-label-md text-on-surface-variant">เหตุผล:</span>
                          <span className="w-2/3 italic text-on-surface-variant">{selectedLog.diagnosisReason}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col border-b border-outline-variant/50 pb-2">
                      <div className="flex">
                        <span className="w-1/3 font-label-md">Treatment:</span> 
                        <span className="w-2/3">{selectedLog.selectedDrugs?.length ? selectedLog.selectedDrugs.map(id => drugOptions.find(d => d.id === id)?.name || id).join(', ') : '-'}</span>
                      </div>
                      {selectedLog.drugReason && (
                        <div className="flex mt-1 text-sm bg-surface-container p-2 rounded-lg">
                          <span className="w-1/3 font-label-md text-on-surface-variant">เหตุผล:</span>
                          <span className="w-2/3 italic text-on-surface-variant">{selectedLog.drugReason}</span>
                        </div>
                      )}
                    </div>
                    {selectedLog.scratchpadNotes && (
                      <div className="flex flex-col mt-2 pt-2">
                        <span className="font-label-md mb-2 flex items-center gap-1">
                          <span className="material-symbols-rounded text-[16px]">edit_note</span> Student Scratchpad:
                        </span> 
                        <div className="w-full bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 text-sm whitespace-pre-wrap">
                          {selectedLog.scratchpadNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Yenjai AI Evaluation Log */}
                {selectedLog.yenjaiEvaluation && (
                  <div className="bg-secondary-container/30 border border-secondary-container rounded-2xl p-5 shadow-sm">
                    <h4 className="font-label-md text-secondary-fixed-dim mb-3 flex items-center gap-2">
                      <span className="material-symbols-rounded text-secondary">psychology</span> Coach Yenjai: Evaluation
                    </h4>
                    <div className="space-y-3 font-body-md text-on-surface-variant">
                      <div>
                        <span className="font-label-md">Knowledge Level:</span> 
                        <span className={`font-bold ml-2 ${selectedLog.yenjaiEvaluation.knowledgeLevel === 'High' ? 'text-primary' : selectedLog.yenjaiEvaluation.knowledgeLevel === 'Medium' ? 'text-secondary' : 'text-error'}`}>
                          {selectedLog.yenjaiEvaluation.knowledgeLevel || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-label-md block mb-1">Knowledge Summary:</span> 
                        <div className="bg-surface-container-lowest p-3 rounded-xl text-sm border border-outline-variant/50">
                          {selectedLog.yenjaiEvaluation.knowledgeSummary || '-'}
                        </div>
                      </div>
                      <div>
                        <span className="font-label-md block mb-1">Critical Thinking:</span> 
                        <div className="bg-surface-container-lowest p-3 rounded-xl text-sm border border-outline-variant/50">
                          {selectedLog.yenjaiEvaluation.criticalThinking || '-'}
                        </div>
                      </div>
                      {selectedLog.yenjaiEvaluation.overallAssessment && (
                        <div className="bg-primary-container text-on-primary-container p-3 rounded-xl mt-2 font-bold text-sm">
                          💡 {selectedLog.yenjaiEvaluation.overallAssessment}
                        </div>
                      )}
                    </div>
                    
                    {/* Yenjai Chat Transcript Collapsible */}
                    {selectedLog.yenjaiChatHistory && selectedLog.yenjaiChatHistory.length > 0 && (
                      <details className="mt-4 group">
                        <summary className="font-label-sm text-secondary hover:text-secondary-fixed-variant cursor-pointer select-none flex items-center gap-1 transition-colors">
                          <span className="material-symbols-rounded text-[18px] transition-transform group-open:rotate-90">chevron_right</span>
                          View Full Yenjai Transcript
                        </summary>
                        <div className="mt-3 space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedLog.yenjaiChatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
                                msg.sender === 'student' 
                                  ? 'bg-secondary text-on-secondary rounded-tr-sm' 
                                  : 'bg-surface-container-highest border border-outline-variant text-on-surface rounded-tl-sm'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-label-md text-on-surface mb-4 flex items-center gap-2"><span className="material-symbols-rounded">forum</span> Chat Transcript</h4>
                  <div className="space-y-4">
                    {selectedLog.chatHistory && Array.isArray(selectedLog.chatHistory) ? selectedLog.chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 font-body-md shadow-sm ${
                          msg.sender === 'student' 
                            ? 'bg-primary-container text-on-primary-container rounded-tr-sm border border-primary/20' 
                            : 'bg-surface-container-highest border border-outline-variant text-on-surface rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center font-body-md text-on-surface-variant py-8 border border-dashed border-outline-variant rounded-2xl">No chat history available.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Grader */}
            <div className="flex-1 flex flex-col bg-surface-container-lowest w-full lg:w-1/2 h-[50vh] lg:h-auto relative">
              <button 
                onClick={() => setSelectedLog(null)}
                className="absolute top-4 right-4 p-2 bg-surface-container hover:bg-surface-container-highest text-on-surface-variant rounded-full transition-colors z-10"
              >
                <span className="material-symbols-rounded">close</span>
              </button>

              <div className="p-6 md:p-8 flex flex-col h-full overflow-hidden">
                <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                  <div className="bg-tertiary-container text-on-tertiary-container p-2 rounded-xl">
                    <span className="material-symbols-rounded text-[28px]">auto_awesome</span>
                  </div>
                  <h3 className="font-headline-md text-2xl text-on-surface">AI Coaching Report</h3>
                </div>

                {!aiFeedback && !isAnalyzing && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center bg-surface-container-low rounded-2xl border border-outline-variant p-8">
                    <span className="material-symbols-rounded text-6xl text-primary/30 mb-4">document_scanner</span>
                    <h4 className="font-headline-md text-xl text-on-surface mb-2">Ready for Analysis</h4>
                    <p className="font-body-md text-on-surface-variant mb-6 max-w-xs">Run the LLM evaluator to generate personalized feedback based on the clinical transcript.</p>
                    <button 
                      onClick={() => analyzeWithAI(selectedLog)}
                      className="px-8 py-4 bg-tertiary text-on-tertiary font-label-md rounded-full shadow-md hover:bg-tertiary/90 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-rounded">magic_button</span> Generate AI Report
                    </button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-outline-variant p-8">
                    <span className="material-symbols-rounded text-6xl text-primary animate-spin mb-4">sync</span>
                    <p className="font-label-md text-primary animate-pulse">Analyzing clinical transcript...</p>
                  </div>
                )}

                {aiFeedback && (
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                      <h4 className="font-label-md text-primary flex items-center gap-2">
                        <span className="material-symbols-rounded">check_circle</span> Analysis Complete
                      </h4>
                      <button 
                        onClick={() => analyzeWithAI(selectedLog)}
                        className="text-sm font-label-md text-tertiary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-rounded text-[16px]">refresh</span> Re-analyze
                      </button>
                    </div>
                    
                    <div className="bg-surface-container-low rounded-2xl p-5 md:p-6 border border-outline-variant flex-1 overflow-y-auto whitespace-pre-wrap font-body-md text-on-surface leading-relaxed mb-6 shadow-inner">
                      {aiFeedback}
                    </div>
                    
                    <div className="mt-auto flex-shrink-0 flex flex-col gap-3">
                      <label className="font-label-md text-on-surface flex items-center gap-2">
                        <span className="material-symbols-rounded text-secondary">edit</span> Send Feedback to Student
                      </label>
                      <textarea
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Type your final feedback here..."
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none h-24 resize-none font-body-md"
                      />
                      <button 
                        onClick={sendFeedback}
                        disabled={isSendingFeedback || !feedbackMessage.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-on-primary hover:bg-primary-fixed-variant disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-label-md transition-all shadow-md mt-2"
                      >
                        {isSendingFeedback ? (
                          <><span className="material-symbols-rounded animate-spin">sync</span> Sending...</>
                        ) : (
                          <><span className="material-symbols-rounded">send</span> Send Comment to Student</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <ClassAnalyticsModal 
        isOpen={isAnalyticsModalOpen} 
        onClose={() => setIsAnalyticsModalOpen(false)} 
        logs={logs} 
        cases={cases}
      />

    </div>
  );
};

export default TeacherDashboard;
