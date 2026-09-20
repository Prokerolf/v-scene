import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, writeBatch, onSnapshot, deleteDoc } from 'firebase/firestore';
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
import { ExamEditorModal, type ExamCategory } from './ExamEditorModal';
import { ExamSimulationModal } from './ExamSimulationModal';
import { MedicalAnalyticsModal } from './MedicalAnalyticsModal';
import { AIQuestionAssistantModal } from './AIQuestionAssistantModal';
import { ExamExporterModal } from './ExamExporterModal';
import { BATCH1_QUESTIONS, BATCH2_QUESTIONS, DEFAULT_KFP_QUESTIONS, DEFAULT_KFQ_QUESTIONS } from '../data/exams';
import { getResolvedExams, seedCategoryExamsToFirestore, resetQuestionToOriginal, clearAllCorruptedExamsFromFirestore } from '../lib/examUtils';
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
  postTestScore?: number;
  postTestAnswers?: number[];
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
  timeSpent?: number;
  hintsUsedCount?: number;
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
  const [activePeriod, setActivePeriod] = useState<number>(1);
  const [diseaseInput, setDiseaseInput] = useState('');
  const [backgroundInput, setBackgroundInput] = useState('');
  const [isGeneratingCase, setIsGeneratingCase] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitoring' | 'approval' | 'bug_reports' | 'allocation' | 'exam_bank'>('allocation');
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [studentFilter, setStudentFilter] = useState<'all' | 'needs_help'>('all');

  // Exam Bank Real-time State
  const [examCategory, setExamCategory] = useState<ExamCategory>('pretest_batch1');
  const [examCaseFilter, setExamCaseFilter] = useState<'all' | 'case_a' | 'case_b' | 'case_c' | 'general'>('all');
  const [dbExams, setDbExams] = useState<any[]>([]);
  const [activeExamEditors, setActiveExamEditors] = useState<{ [docId: string]: { userName: string, category: string, questionId: string, updatedAt: string } }>({});
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExamItem, setEditingExamItem] = useState<any | null>(null);
  const [isSeedingExams, setIsSeedingExams] = useState(false);

  const handleSeedCurrentCategory = async () => {
    if (!confirm(`คุณต้องการบันทึกข้อสอบตั้งต้นของหมวด ${examCategory} ลงฐานข้อมูล Firestore ทั้งหมดใช่หรือไม่?`)) return;
    setIsSeedingExams(true);
    try {
      const count = await seedCategoryExamsToFirestore(examCategory);
      alert(`บันทึกข้อสอบจำนวน ${count} ข้อลงฐานข้อมูลเรียบร้อยแล้ว!`);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อสอบ');
    } finally {
      setIsSeedingExams(false);
    }
  };

  const handleCleanAndRestoreExams = async () => {
    if (!confirm('คุณต้องการล้างข้อสอบที่ซ้ำซ้อนและคืนค่าชุดข้อสอบมาตรฐานทั้งหมดหรือไม่? (ข้อสอบดั้งเดิมจะกลับมาครบทุกข้อ)')) return;
    setLoading(true);
    try {
      await clearAllCorruptedExamsFromFirestore();
      alert('ล้างข้อมูลข้อสอบซ้ำซ้อนและคืนค่าชุดข้อสอบมาตรฐานเรียบร้อยแล้ว!');
    } catch (err: any) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการกู้คืนข้อสอบ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Exam Simulation State
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simInitialIndex, setSimInitialIndex] = useState(0);

  // System 1, 2, 6 Modals State
  const [isMedicalAnalyticsOpen, setIsMedicalAnalyticsOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isExamExporterOpen, setIsExamExporterOpen] = useState(false);

  const [waitingUsers, setWaitingUsers] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'allocation') {
      fetchWaitingUsers();
    }
  }, [activeTab]);

  const fetchWaitingUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const waiting: any[] = [];
      usersSnap.forEach(doc => {
        const data = doc.data();
        if (data.role === 'student' && data.hasCompletedPretest && !data.allocatedCaseId) {
          waiting.push({ id: doc.id, ...data });
        }
      });
      setWaitingUsers(waiting);
    } catch (err) {
      console.error(err);
    }
  };

  const allocateStudents = async () => {
    if (waitingUsers.length === 0) return alert('No waiting students');
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const caseOptions = ['case_a', 'case_b', 'case_c'];
      
      let counts = { 'case_a': 0, 'case_b': 0, 'case_c': 0 };
      
      // Try to distribute them evenly
      waitingUsers.forEach((user, idx) => {
        // Just round-robin for simplicity
        const assignedBaseCase = caseOptions[idx % 3];
        const assignedTier = user.triageTiers?.[assignedBaseCase] || 'Low';
        const finalCaseId = `${assignedBaseCase}_${assignedTier.toLowerCase()}`;
        const allocatedGroup = idx % 2 === 0 ? 'A' : 'B';
        
        batch.update(doc(db, 'users', user.id), {
          allocatedCaseId: finalCaseId,
          allocatedGroup: allocatedGroup
        });
      });
      
      await batch.commit();
      alert('Allocated ' + waitingUsers.length + ' students successfully!');
      fetchWaitingUsers();
    } catch (e: any) {
      alert('Error allocating: ' + e.message);
    }
    setLoading(false);
  };


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

  const exportResearchDataCSV = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap: Record<string, any> = {};
      usersSnap.forEach(doc => {
        usersMap[doc.id] = doc.data();
      });

      let csvContent = "StudentID,ConsentDate,AssignedCase,PreTest_Score,PostTest_Score,Diagnostic_Result,Selected_Labs_Count,Selected_Drugs_Count,AI_KnowledgeLevel,AI_CriticalThinking\n";
      
      logs.forEach(log => {
        const user = usersMap[log.userId] || {};
        const consentDate = user.consentDate || 'N/A';
        const postTestScore = log.postTestScore !== undefined ? log.postTestScore : 'N/A';
        const diagnosticAcc = log.finalDiagnosis ? `"${log.finalDiagnosis.replace(/"/g, '""')}"` : 'N/A';
        const labsCount = log.selectedLabs ? log.selectedLabs.length : 0;
        const drugsCount = log.selectedDrugs ? log.selectedDrugs.length : 0;
        const aiLevel = log.yenjaiEvaluation ? log.yenjaiEvaluation.knowledgeLevel : 'N/A';
        const aiThinking = log.yenjaiEvaluation ? `"${log.yenjaiEvaluation.criticalThinking.replace(/"/g, '""')}"` : 'N/A';
        
        csvContent += `${log.studentId || log.userId},${consentDate},${log.activeCaseId || 'N/A'},${log.preTestScore || 0},${postTestScore},${diagnosticAcc},${labsCount},${drugsCount},${aiLevel},${aiThinking}\n`;
      });

      // Include BOM for Excel UTF-8 support
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `VScene_Research_Data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export error", e);
      alert("Failed to export data");
    }
    setLoading(false);
  };

  const [activeEditors, setActiveEditors] = useState<{ [caseId: string]: { userName: string, updatedAt: string } }>({});

  useEffect(() => {
    setLoading(true);

    // 1. Real-time Cases Listener (Multi-user sync for cases)
    const unsubscribeCases = onSnapshot(collection(db, 'cases'), async (snapshot) => {
      const casesData: PatientCase[] = [];
      if (snapshot.empty) {
        console.log("Migrating default cases to Firestore...");
        for (const c of CLINICAL_CASES) {
          const newCase = { ...c, status: 'deployed', timestamp: new Date().toISOString() };
          await setDoc(doc(db, 'cases', c.id), newCase);
          casesData.push(newCase as unknown as PatientCase);
        }
      } else {
        snapshot.forEach((docSnap) => {
          casesData.push({ id: docSnap.id, ...docSnap.data() } as PatientCase);
        });
      }

      const order = ['case_covid_pneumonia', 'case_diaphragmatic_paralysis', 'case_paragonimus'];
      casesData.sort((a, b) => {
        const indexA = order.indexOf(a.id || '');
        const indexB = order.indexOf(b.id || '');
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return (a.id || '').localeCompare(b.id || '');
      });
      setCases(casesData);
      setLoading(false);
    }, (error) => {
      console.error("Real-time cases sync error", error);
      setLoading(false);
    });

    // 2. Real-time System Config Listener
    const unsubscribeConfig = onSnapshot(doc(db, 'settings', 'system_config'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.activeCaseId) setActiveCaseId(data.activeCaseId);
        if (data.activePeriod) setActivePeriod(data.activePeriod);
      }
    }, console.error);

    // 3. Real-time Active Editors Presence Listener
    const unsubscribeEditors = onSnapshot(collection(db, 'active_editors'), (snapshot) => {
      const editorsMap: { [caseId: string]: { userName: string, updatedAt: string } } = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userName && data.caseId) {
          editorsMap[data.caseId] = { userName: data.userName, updatedAt: data.updatedAt };
        }
      });
      setActiveEditors(editorsMap);
    }, console.error);

    // 4. Real-time Exams Listener
    const unsubscribeExams = onSnapshot(collection(db, 'exams'), (snapshot) => {
      const examList: any[] = [];
      snapshot.forEach((docSnap) => {
        examList.push({ docId: docSnap.id, ...docSnap.data() });
      });
      setDbExams(examList);
    }, console.error);

    // 5. Real-time Active Exam Editors Presence Listener
    const unsubscribeExamEditors = onSnapshot(collection(db, 'active_exam_editors'), (snapshot) => {
      const editorsMap: { [docId: string]: { userName: string, category: string, questionId: string, updatedAt: string } } = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userName && data.editingQuestionId) {
          editorsMap[`${data.category}_${data.editingQuestionId}`] = {
            userName: data.userName,
            category: data.category,
            questionId: data.editingQuestionId,
            updatedAt: data.updatedAt
          };
        }
      });
      setActiveExamEditors(editorsMap);
    }, console.error);

    fetchLogsAndBugs();

    return () => {
      unsubscribeCases();
      unsubscribeConfig();
      unsubscribeEditors();
      unsubscribeExams();
      unsubscribeExamEditors();
    };
  }, []);

  const fetchLogsAndBugs = async () => {
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

      const bugReportsSnapshot = await getDocs(collection(db, 'bug_reports'));
      const bugsData: BugReport[] = [];
      bugReportsSnapshot.forEach((doc) => {
        bugsData.push({ id: doc.id, ...doc.data() } as BugReport);
      });
      bugsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setBugReports(bugsData);
    } catch (err) {
      console.error("Error fetching logs and bugs", err);
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

      const transcript = log.chatHistory?.map(m => `${m?.role === 'user' ? 'Student' : 'Patient'}: ${m?.text}`).join('\n') || '';
      const ddx = log.submittedDDx && Array.isArray(log.submittedDDx) ? log.submittedDDx.join(', ') : (log.submittedDDx || 'ไม่ได้ระบุ');
      const labs = log.selectedLabs?.map(id => labOptions?.find(l => l?.id === id)?.name || id).join(', ') || 'ไม่ได้ระบุ';
      const drugs = log.selectedDrugs?.map(id => drugOptions?.find(d => d?.id === id)?.name || id).join(', ') || 'ไม่ได้ระบุ';

      const caseQuestions = cases?.find(c => c?.id === log.activeCaseId)?.preTestQuestions || CLINICAL_CASES?.find(c => c?.id === log.activeCaseId)?.preTestQuestions || [];
      
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
        
        สำคัญมาก: คุณต้องสร้างเคสย่อยทั้งหมด 3 เคส (3 ระดับความยาก: Low, Mid, High) สำหรับโรคนี้ โดยประยุกต์อาการและโรคแทรกซ้อนให้เหมาะสมกับแต่ละระดับความยาก
        ให้ตอบกลับมาเป็น JSON Array ที่ประกอบด้วย 3 Object เท่านั้น โดยมีรูปแบบดังนี้:
        [
          {
            "tier": "Low หรือ Mid หรือ High",
            "tierExplanation": "อธิบายสั้นๆ ว่าทำไมเคสนี้ถึงมีความยากระดับนี้ (เช่น เคส Low จะตรงไปตรงมา, เคส High จะมีโรคแทรกซ้อนหรือต้องแปลผลซับซ้อน)",
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
            "goldStandardLabs": ["1", "3"], // ID ของ Lab ที่จำเป็นที่สุดจริงๆ (ห้ามใส่เกิน 1-3 ตัวเด็ดขาด! เอาเฉพาะ Gold Standard ที่ใช้ยืนยันโรค)
            "specificLabResults": {
              "1": { "text": "**CT Brain:** Normal findings." },
              "3": { "text": "**Complete Blood Count (CBC):**\\n- Hb: 10 g/dL (Normal: 12-15 g/dL)\\n- WBC: 12,000 /uL (Normal: 4,500-11,000 /uL)" } 
            }
          }
        ]
        
        กติกาสำหรับผลแล็บ (specificLabResults): 
        - ต้องใส่ **ค่าอ้างอิงปกติ (Normal Range)** ไว้ในวงเล็บต่อท้ายค่าผลแล็บที่เป็นตัวเลขเสมอ เช่น Hb: 10 g/dL (Normal: 12-15 g/dL)
        
        ไม่ต้องมี markdown \`\`\`json ครอบ ให้ส่งเฉพาะ JSON Array ล้วนๆ
      `;

      const result = await model.generateContent(prompt);
      const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const casesArray = JSON.parse(jsonText);
      
      if (!Array.isArray(casesArray)) {
        throw new Error("AI did not return an array.");
      }

      const batch = writeBatch(db);
      for (const caseData of casesArray) {
        caseData.timestamp = new Date().toISOString();
        caseData.status = 'draft';
        const docRef = doc(collection(db, 'cases'));
        batch.set(docRef, caseData);
      }
      
      await batch.commit();
      
      alert("สร้างเคสสำเร็จทั้ง 3 ระดับ!");
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

  const seedDefaultExamsToCloud = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการอัปโหลด/Sync ข้อสอบชุดมาตรฐาน (Pretest, Posttest, KFP, KFQ) ขึ้นสู่ระบบ Firestore?')) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);

      // Seed Pretest Batch 1
      for (const q of BATCH1_QUESTIONS) {
        const ref = doc(db, 'exams', `pretest_batch1_${q.id}`);
        batch.set(ref, { ...q, category: 'pretest_batch1', updatedAt: new Date().toISOString() });
      }

      // Seed Pretest Batch 2
      for (const q of BATCH2_QUESTIONS) {
        const ref = doc(db, 'exams', `pretest_batch2_${q.id}`);
        batch.set(ref, { ...q, category: 'pretest_batch2', updatedAt: new Date().toISOString() });
      }

      // Seed Posttest
      for (const q of BATCH1_QUESTIONS) {
        const ref = doc(db, 'exams', `posttest_${q.id}`);
        batch.set(ref, { ...q, category: 'posttest', updatedAt: new Date().toISOString() });
      }

      // Seed KFP
      for (const q of DEFAULT_KFP_QUESTIONS) {
        const ref = doc(db, 'exams', `kfp_${q.id}`);
        batch.set(ref, { ...q, category: 'kfp', updatedAt: new Date().toISOString() });
      }

      // Seed KFQ
      for (const q of DEFAULT_KFQ_QUESTIONS) {
        const ref = doc(db, 'exams', `kfq_${q.id}`);
        batch.set(ref, { ...q, category: 'kfq', updatedAt: new Date().toISOString() });
      }

      await batch.commit();
      alert('อัปโหลดชุดข้อสอบตั้งต้นขึ้น Cloud เรียบร้อยแล้ว!');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดข้อสอบ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExamItem = async (docId: string, qId: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อสอบ ID: ${qId}?`)) return;
    try {
      await deleteDoc(doc(db, 'exams', docId));
      alert('ลบข้อสอบเรียบร้อยแล้ว');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการลบข้อสอบ: ' + err.message);
    }
  };

  const setActiveCase = async (id: string) => {
    await setDoc(doc(db, 'settings', 'system_config'), { activeCaseId: id }, { merge: true });
    setActiveCaseId(id);
  };

  const toggleActivePeriod = async () => {
    const newPeriod = activePeriod === 1 ? 2 : 1;
    if (!confirm(`Are you sure you want to switch to Period ${newPeriod}? This will change the exam batch for all students.`)) return;
    try {
      await setDoc(doc(db, 'settings', 'system_config'), { activePeriod: newPeriod }, { merge: true });
      setActivePeriod(newPeriod);
      alert(`Successfully switched to Period ${newPeriod}!`);
    } catch (e: any) {
      alert("Error updating period: " + e.message);
    }
  };

  return (
    <div className="bg-surface text-on-surface overflow-hidden flex h-screen w-full font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Desktop Navigation Drawer */}
      <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 pt-20 z-30 w-64 lg:w-72 border-r border-outline-variant bg-surface-container-low">
        <div className="px-6 pb-6">
          <h2 className="font-headline-md text-xl font-bold text-primary">{t('teacher.title')}</h2>
        </div>
        <ul className="flex-1 flex flex-col gap-1.5 pr-2.5">
          {/* Active/Inactive classes based on state */}
          
          <li>
            <button 
              onClick={() => setActiveTab('allocation')}
              className={`w-full flex items-center gap-2.5 py-2.5 rounded-r-full pl-4 pr-3 transition-all ${
                activeTab === 'allocation' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded shrink-0">group_add</span>
              <span className="font-label-md text-xs lg:text-sm font-semibold whitespace-nowrap">Allocation</span>
              {waitingUsers.length > 0 && (
                <span className="bg-primary text-on-primary text-xs px-2 py-0.5 rounded-full ml-auto">{waitingUsers.length}</span>
              )}
            </button>
          </li>

          <li>
            <button 
              onClick={() => setActiveTab('monitoring')}
              className={`w-full flex items-center gap-2.5 py-2.5 rounded-r-full pl-4 pr-3 transition-all ${
                activeTab === 'monitoring' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded shrink-0 fill" data-icon="monitoring">monitoring</span>
              <span className="font-label-md text-xs lg:text-sm font-semibold whitespace-nowrap">{t('teacher.monitoring')}</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('approval')}
              className={`w-full flex items-center gap-2.5 py-2.5 rounded-r-full pl-4 pr-3 transition-all ${
                activeTab === 'approval' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded shrink-0" data-icon="edit_note">edit_document</span>
              <span className="font-label-md text-xs lg:text-sm font-semibold whitespace-nowrap">{t('teacher.approvals')}</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('exam_bank')}
              className={`w-full flex items-center gap-2.5 py-2.5 rounded-r-full pl-4 pr-3 transition-all ${
                activeTab === 'exam_bank' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded shrink-0">quiz</span>
              <span className="font-label-md text-xs lg:text-sm font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">คลังข้อสอบ (Exam Bank)</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('bug_reports')}
              className={`w-full flex items-center gap-2.5 py-2.5 rounded-r-full pl-4 pr-3 transition-all ${
                activeTab === 'bug_reports' 
                  ? 'bg-primary-container text-on-primary-container font-bold hover:bg-primary-fixed' 
                  : 'text-on-surface-variant hover:bg-surface-variant font-label-md'
              }`}
            >
              <span className="material-symbols-rounded shrink-0">bug_report</span>
              <span className="font-label-md text-xs lg:text-sm font-semibold whitespace-nowrap">{t('teacher.bugs')}</span>
              {bugReports.length > 0 && (
                <span className="bg-error text-on-error text-xs px-2 py-0.5 rounded-full ml-auto">{bugReports.length}</span>
              )}
            </button>
          </li>
        </ul>
        <div className="p-4 border-t border-outline-variant">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-2.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-xl transition-colors font-label-md">
            <span className="material-symbols-rounded">logout</span>
            {t('teacher.logout')}
          </button>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden md:ml-64 lg:ml-72 w-full">
        
        {/* Top App Bar */}
        <header className="w-full top-0 border-b border-outline-variant flex justify-between items-center px-4 md:px-10 py-4 z-40 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="h-14 md:h-20 overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="V-SCENE Logo" className="h-40 md:h-52 w-auto object-contain" />
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
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{t('teacher.dashboard_title')}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs rounded-full font-bold shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Real-time Multi-User Sync Active</span>
                </span>
              </div>
              <p className="font-body-md text-on-surface-variant flex items-center gap-2">
                <span>{t('teacher.dashboard_subtitle')}</span>
                {Object.keys(activeEditors).length > 0 && (
                  <span className="text-xs text-amber-700 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full animate-pulse">
                    ✍️ มีสมาชิกกำลังแก้ไขเคสอยู่ {Object.keys(activeEditors).length} รายการ
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={toggleActivePeriod}
                className="hidden md:flex items-center gap-2 bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-full hover:bg-secondary-fixed transition-all font-label-md shadow-sm border border-outline-variant"
              >
                <span className="material-symbols-rounded text-[18px]">toggle_on</span> Current Phase: Period {activePeriod}
              </button>
              <button 
                onClick={exportResearchDataCSV}
                className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full hover:bg-primary-fixed-variant transition-all font-label-md shadow-sm"
              >
                <span className="material-symbols-rounded text-[18px]">download</span> Export Research Data
              </button>
            </div>
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

          
          {activeTab === 'allocation' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden mb-8 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-headline-md text-2xl text-on-surface">Student Allocation</h3>
                  <p className="font-body-md text-on-surface-variant mt-2">There are {waitingUsers.length} students waiting in the lobby after completing their pre-test.</p>
                </div>
                <button 
                  onClick={allocateStudents}
                  disabled={waitingUsers.length === 0 || loading}
                  className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  <span className="material-symbols-rounded">shuffle</span>
                  Batch Allocate Now
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant">Student ID</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant">Case A Score (Tier)</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant">Case B Score (Tier)</th>
                      <th className="font-label-sm text-on-surface-variant px-6 py-4 border-b border-outline-variant">Case C Score (Tier)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingUsers.map(user => (
                      <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-6 py-4 border-b border-outline-variant font-bold">{user.username || user.id}</td>
                        <td className="px-6 py-4 border-b border-outline-variant">{user.pretestScores?.case_a} ({user.triageTiers?.case_a})</td>
                        <td className="px-6 py-4 border-b border-outline-variant">{user.pretestScores?.case_b} ({user.triageTiers?.case_b})</td>
                        <td className="px-6 py-4 border-b border-outline-variant">{user.pretestScores?.case_c} ({user.triageTiers?.case_c})</td>
                      </tr>
                    ))}
                    {waitingUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-on-surface-variant">No students are currently waiting.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                        <div key={c.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col relative">
                          {activeEditors[c.id || ''] && (
                            <div className="mb-3 px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs rounded-xl font-bold flex items-center gap-1.5 animate-pulse">
                              <span className="material-symbols-rounded text-[14px]">edit</span>
                              <span>{activeEditors[c.id || ''].userName} กำลังแก้ไขอยู่นี้</span>
                            </div>
                          )}
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
                        <div key={c.id} className="bg-primary-container/10 border border-primary/30 rounded-2xl p-6 shadow-sm flex flex-col relative">
                          {activeEditors[c.id || ''] && (
                            <div className="mb-3 px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs rounded-xl font-bold flex items-center gap-1.5 animate-pulse">
                              <span className="material-symbols-rounded text-[14px]">edit</span>
                              <span>{activeEditors[c.id || ''].userName} กำลังแก้ไขอยู่นี้</span>
                            </div>
                          )}
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

          {activeTab === 'exam_bank' && (
            <div className="space-y-6">
              {/* Exam Bank Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 border border-indigo-800/40 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline-md text-2xl font-bold flex items-center gap-2 text-white">
                    <span className="material-symbols-rounded text-sky-400 text-3xl">quiz</span>
                    คลังและระบบแก้ไขข้อสอบรวม (Pre-test / Post-test / KFP / KFQ)
                  </h3>
                  <p className="text-sm text-sky-200/80 mt-1">
                    ระบบแก้ไขข้อสอบร่วมกันแบบ Real-time ซิงก์ข้อมูลลง Firestore อัตโนมัติรองรับการทำงานทีมวิจัย (เขม, พิช, ฟา, โบนัส, อี้หง, เก้า)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* System 1: Psychometrics */}
                  <button
                    onClick={() => setIsMedicalAnalyticsOpen(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition"
                  >
                    <span className="material-symbols-rounded text-base font-bold">analytics</span>
                    Psychometrics (ระบบ 1)
                  </button>

                  {/* System 2: AI Assistant */}
                  <button
                    onClick={() => setIsAIAssistantOpen(true)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition"
                  >
                    <span className="material-symbols-rounded text-base font-bold">auto_awesome</span>
                    AI Assistant (ระบบ 2)
                  </button>

                  {/* System 6: PDF / OMR Exporter */}
                  <button
                    onClick={() => setIsExamExporterOpen(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
                  >
                    <span className="material-symbols-rounded text-base font-bold">print</span>
                    PDF & OMR (ระบบ 6)
                  </button>

                  <button
                    onClick={() => {
                      setSimInitialIndex(0);
                      setIsSimModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs shadow-lg shadow-amber-400/20 flex items-center gap-1.5 transition"
                  >
                    <span className="material-symbols-rounded text-base font-bold">visibility</span>
                    Simulation
                  </button>

                  <button
                    onClick={handleCleanAndRestoreExams}
                    className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                    title="ล้างข้อมูลข้อสอบซ้ำซ้อนและกู้คืนชุดข้อสอบมาตรฐาน"
                  >
                    <span className="material-symbols-rounded text-sm">cleaning_services</span>
                    ล้างกู้คืนข้อสอบ
                  </button>

                  <button
                    onClick={handleSeedCurrentCategory}
                    disabled={isSeedingExams}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-sky-100 rounded-xl font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <span className="material-symbols-rounded text-sm">cloud_upload</span>
                    {isSeedingExams ? 'กำลัง Sync...' : 'Sync ตั้งต้น'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingExamItem(null);
                      setIsExamModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/20 flex items-center gap-2 transition"
                  >
                    <span className="material-symbols-rounded text-sm font-extrabold">add</span>
                    สร้างข้อสอบใหม่
                  </button>
                </div>
              </div>

              {/* Active Editors Live Banner */}
              {Object.keys(activeExamEditors).length > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-800 text-sm font-semibold animate-pulse">
                  <span className="material-symbols-rounded text-amber-600">record_voice_over</span>
                  <div>
                    <span>กำลังมีสมาชิกในทีมเข้าแก้ไขข้อสอบอยู่: </span>
                    <span className="font-bold underline">
                      {Object.values(activeExamEditors).map(e => `${e.userName} (ข้อสอบ ${e.questionId})`).join(', ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Filter & Category Controls */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'pretest_batch1', label: 'Pre-test (Batch 1)' },
                    { id: 'pretest_batch2', label: 'Pre-test (Batch 2)' },
                    { id: 'posttest', label: 'Post-test (Final)' },
                    { id: 'kfp', label: 'KFP (Key Feature Problems)' },
                    { id: 'kfq', label: 'KFQ (Key Feature Questions)' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setExamCategory(cat.id as ExamCategory)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        examCategory === cat.id
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Case Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Filter Case:</span>
                  <select
                    value={examCaseFilter}
                    onChange={(e: any) => setExamCaseFilter(e.target.value)}
                    className="bg-surface border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="all">ทั้งหมด (All Cases)</option>
                    <option value="case_a">Case A (Neurocysticercosis)</option>
                    <option value="case_b">Case B</option>
                    <option value="case_c">Case C</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {(() => {
                  let categoryExams = getResolvedExams(dbExams, examCategory);

                  if (examCaseFilter !== 'all') {
                    categoryExams = categoryExams.filter(e => e.caseKey === examCaseFilter);
                  }

                  if (categoryExams.length === 0) {
                    return (
                      <div className="bg-surface-container-lowest border border-outline-variant border-dashed rounded-2xl p-12 text-center">
                        <span className="material-symbols-rounded text-4xl text-on-surface-variant mb-2">find_in_page</span>
                        <p className="font-bold text-on-surface text-base">ไม่พบข้อสอบในหมวดนี้</p>
                        <p className="text-xs text-on-surface-variant mt-1">กดปุ่ม "สร้างข้อสอบใหม่" หรือ "Sync / Seed ข้อสอบตั้งต้น" ด้านบนเพื่อเริ่มอัปโหลดข้อสอบ</p>
                      </div>
                    );
                  }

                  return categoryExams.map((q, idx) => {
                    const docKey = `${examCategory}_${q.id}`;
                    const activeEditor = activeExamEditors[docKey];

                    return (
                      <div
                        key={q.docId || q.id || idx}
                        className={`bg-surface-container-lowest border rounded-2xl p-6 shadow-sm relative transition-all ${
                          activeEditor ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10' : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        {activeEditor && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 animate-bounce">
                            <span className="material-symbols-rounded text-sm">edit</span>
                            <span>{activeEditor.userName} กำลังแก้ไขข้อนี้อยู่</span>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-primary-container text-on-primary-container rounded-lg">
                              #{q.id}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-1 bg-surface-variant text-on-surface-variant rounded-lg uppercase">
                              {q.caseKey || 'General'}
                            </span>
                            {q.isCustomized ? (
                              <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1 shadow-2xs">
                                <span className="material-symbols-rounded text-xs">auto_awesome</span>
                                เวอร์ชั่นล่าสุด (Updated Live)
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                ชุดมาตรฐาน
                              </span>
                            )}
                            {q.title && <span className="font-bold text-sm text-on-surface">{q.title}</span>}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSimInitialIndex(idx);
                                setIsSimModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold transition flex items-center gap-1"
                              title="ทดลองสอบข้อนี้ในมุมมองนักเรียน"
                            >
                              <span className="material-symbols-rounded text-sm">visibility</span>
                              Simulation
                            </button>
                            <button
                              onClick={() => {
                                setEditingExamItem(q);
                                setIsExamModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition flex items-center gap-1"
                            >
                              <span className="material-symbols-rounded text-sm">edit</span>
                              แก้ไข (Edit)
                            </button>
                            {q.isCustomized && (
                              <button
                                onClick={async () => {
                                  if (!confirm(`คุณต้องการคืนค่าข้อสอบ #${q.id} กลับเป็นโจทย์มาตรฐานตั้งต้นใช่หรือไม่?`)) return;
                                  try {
                                    await resetQuestionToOriginal(examCategory, q.id);
                                    alert('คืนค่าข้อสอบเป็นโจทย์มาตรฐานเรียบร้อยแล้ว');
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                                title="คืนค่าข้อสอบเป็นโจทย์มาตรฐาน"
                              >
                                <span className="material-symbols-rounded text-sm">restart_alt</span>
                                คืนค่าเดิม
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteExamItem(q.docId || `${examCategory}_${q.id}`, q.id)}
                              className="px-3.5 py-1.5 bg-error/10 text-error hover:bg-error/20 rounded-xl text-xs font-bold transition flex items-center gap-1"
                            >
                              <span className="material-symbols-rounded text-sm">delete</span>
                              ลบ (Delete)
                            </button>
                          </div>
                        </div>

                        {/* Standard Choice Question View (Pretest / Posttest / KFP / KFQ) */}
                        <div className="space-y-3">
                          <p className="font-bold text-base text-on-surface">
                            {q.question || q.questionPrompt || q.vignette || 'ไม่มีโจทย์'}
                          </p>

                          {/* Display Teacher Uploaded Image if available */}
                          {(q.imageUrl || q.image) && (
                            <div className="my-3 flex items-center gap-3 p-2.5 bg-purple-50/50 border border-purple-100 rounded-xl">
                              <img src={q.imageUrl || q.image} alt="Exam Figure" className="h-28 w-auto object-contain rounded-lg border border-slate-200 shadow-2xs" />
                              <div className="text-xs text-slate-600">
                                <span className="font-bold text-purple-900 block flex items-center gap-1">
                                  <span className="material-symbols-rounded text-sm text-purple-700">image</span>
                                  รูปภาพประกอบโจทย์ข้อสอบ
                                </span>
                                <span className="text-[11px] text-slate-500">ไฟล์รูปภาพจริงที่อาจารย์อัปโหลดขึ้นระบบ</span>
                              </div>
                            </div>
                          )}

                          {q.options && Array.isArray(q.options) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl text-xs border font-medium ${
                                    q.correctAnswerIndex === optIdx
                                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 font-bold'
                                      : 'bg-surface-container-low border-outline-variant text-on-surface-variant'
                                  }`}
                                >
                                  {q.correctAnswerIndex === optIdx ? '✓ ' : ''}{opt}
                                </div>
                              ))}
                            </div>
                          )}

                          {q.explanation && (
                            <p className="text-xs text-slate-500 italic mt-1">คำอธิบายเฉลย: {q.explanation}</p>
                          )}

                          {/* Audit Trail: Who edited & when */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-rounded text-sm text-slate-400">person_edit</span>
                              <span>แก้ไขล่าสุดโดย: <strong className="text-slate-800">{q.updatedBy || 'ผู้ดูแลระบบ V-SCENE'}</strong></span>
                            </div>
                            {q.updatedAt && (
                              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                                <span className="material-symbols-rounded text-xs">schedule</span>
                                <span>{new Date(q.updatedAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
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
                    <div className="flex border-b border-outline-variant/50 pb-2">
                      <span className="w-1/3 font-label-md">Time Spent:</span> 
                      <span className="w-2/3">{selectedLog.timeSpent !== undefined ? `${Math.floor(selectedLog.timeSpent / 60)}m ${selectedLog.timeSpent % 60}s` : 'N/A'}</span>
                    </div>
                    <div className="flex border-b border-outline-variant/50 pb-2">
                      <span className="w-1/3 font-label-md">Hints Used:</span> 
                      <span className="w-2/3">{selectedLog.hintsUsedCount !== undefined ? selectedLog.hintsUsedCount : 'N/A'}</span>
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
                      <div key={idx} className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'} mb-2`}>
                        <span className="font-label-sm text-on-surface-variant mb-1 px-1">
                          {msg.sender === 'student' ? selectedLog.studentName || 'Student' : 'Patient'}
                        </span>
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
      <ExamEditorModal 
        isOpen={isExamModalOpen} 
        onClose={() => {
          setIsExamModalOpen(false);
          setEditingExamItem(null);
        }} 
        category={examCategory} 
        initialQuestion={editingExamItem}
        onSaveSuccess={() => {
          setIsExamModalOpen(false);
          setEditingExamItem(null);
        }}
      />

      <ExamSimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        category={examCategory}
        questions={(() => {
          let categoryExams = getResolvedExams(dbExams, examCategory);
          if (examCaseFilter !== 'all') {
            categoryExams = categoryExams.filter(e => e.caseKey === examCaseFilter);
          }
          return categoryExams;
        })()}
        initialIndex={simInitialIndex}
      />

      {/* System 1: Medical Psychometrics Analytics */}
      <MedicalAnalyticsModal
        isOpen={isMedicalAnalyticsOpen}
        onClose={() => setIsMedicalAnalyticsOpen(false)}
        examTitle="V-SCENE Medical Licensing Exam Analytics"
      />

      {/* System 2: AI Question Assistant */}
      <AIQuestionAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      {/* System 6: PDF / OMR Exporter */}
      <ExamExporterModal
        isOpen={isExamExporterOpen}
        onClose={() => setIsExamExporterOpen(false)}
        examTitle="V-SCENE Clinical Competency Examination"
        questions={dbExams}
      />

    </div>
  );
};

export default TeacherDashboard;
