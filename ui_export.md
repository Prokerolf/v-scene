# UI Code Export for UX Analysis

Here is the current React/Tailwind code for the main components in the SME-CBL platform.

## TeacherDashboard.tsx
```tsx
import React, { useState, useEffect } from 'react';
import { Users, LogOut, MessageSquare, ShieldCheck, GraduationCap, X, Bot, Activity, Brain, PlusCircle, CheckCircle } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CaseLog {
  id: string;
  userId: string;
  timestamp: string;
  chatHistory: any[];
  submittedDDx: string[];
  studentName?: string;
  studentId?: string;
  confidenceLevel?: number;
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
}

const TeacherDashboard = () => {
  const [logs, setLogs] = useState<CaseLog[]>([]);
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<CaseLog | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Case Gen State
  const [isCaseGenModalOpen, setIsCaseGenModalOpen] = useState(false);
  const [diseaseInput, setDiseaseInput] = useState('');
  const [backgroundInput, setBackgroundInput] = useState('');
  const [isGeneratingCase, setIsGeneratingCase] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Logs
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
        logsData.push(data);
      }
      logsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(logsData);

      // Fetch Cases
      const casesSnapshot = await getDocs(collection(db, 'cases'));
      const casesData: PatientCase[] = [];
      casesSnapshot.forEach((doc) => {
        casesData.push({ id: doc.id, ...doc.data() } as PatientCase);
      });
      casesData.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      setCases(casesData);

      // Fetch Active Case ID
      const configDoc = await getDoc(doc(db, 'settings', 'system_config'));
      if (configDoc.exists()) {
        setActiveCaseId(configDoc.data().activeCaseId);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
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
      const ddx = log.submittedDDx.join(', ');

      const prompt = `
        คุณคืออาจารย์แพทย์ผู้เชี่ยวชาญ (Attending Physician)
        จงประเมินนักศึกษาแพทย์คนนี้จากการซักประวัติผู้ป่วยจำลอง
        
        บทสนทนา:
        ${transcript}

        วินิจฉัยที่นักศึกษาเลือก (DDx): ${ddx}
        ความมั่นใจของนักศึกษา: ${log.confidenceLevel !== undefined ? log.confidenceLevel + '%' : 'ไม่ได้ระบุ'}

        กรุณาวิเคราะห์สั้นๆ กระชับ เป็นภาษาไทย 4 หัวข้อ:
        1. ทักษะการสื่อสาร (Communication Skill): ใช้คำถามเปิด/ปิดเหมาะสมไหม? ใช้ศัพท์แพทย์กับคนไข้หรือเปล่า?
        2. การให้เหตุผลทางคลินิก (Clinical Reasoning): ถามตรงจุดที่แยกโรคได้ไหม?
        3. การประเมินความมั่นใจตนเอง (Self-Calibration): เทียบความมั่นใจกับความถูกต้องของโรคที่ตอบ ว่าเขามั่นใจเกินไปหรือไม่
        4. คำแนะนำ (Feedback): 1 ประโยคสั้นๆ เพื่อนำไปปรับปรุง
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
          "diseaseName": "${diseaseInput}",
          "patientName": "ชื่อ นามสกุล (ภาษาไทย)",
          "age": ตัวเลขอายุ,
          "gender": "ชาย หรือ หญิง",
          "chiefComplaint": "อาการสำคัญที่เป็นภาษาชาวบ้าน ไม่ใช้ศัพท์แพทย์",
          "personaDetails": "ประวัติอย่างละเอียด อุปนิสัย ภาษาที่ใช้ ประวัติครอบครัว ประวัติส่วนตัว (เพื่อนำไปให้ AI สวมบทบาทต่อ)",
          "voiceProfile": "เลือกระหว่าง: old_male, male, old_female, female, child"
        }
        
        ไม่ต้องมี markdown \`\`\`json ครอบ ให้ส่งเฉพาะ JSON text ล้วนๆ
      `;

      const result = await model.generateContent(prompt);
      const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const caseData = JSON.parse(jsonText);
      
      caseData.timestamp = new Date().toISOString();
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'cases'), caseData);
      
      // Auto set as active case
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
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-10">
      {/* Header */}
      <header className="bg-indigo-900 text-white px-8 py-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/30 p-2.5 rounded-xl border border-indigo-400/30">
            <GraduationCap className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-wide">Teacher Dashboard</h1>
            <p className="text-sm text-indigo-300 mt-0.5">ระบบควบคุมเคสผู้ป่วยและประเมินนักศึกษา</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl font-bold transition">
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Cases Management */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-lg text-slate-800">จัดการเคสผู้ป่วย (Case Management)</h3>
              <p className="text-sm text-slate-500">เลือกเคสที่ต้องการให้นักศึกษาฝึกซักประวัติ</p>
            </div>
            <button 
              onClick={() => setIsCaseGenModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
            >
              <PlusCircle size={18} /> สร้างเคสใหม่ด้วย AI
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c) => (
              <div 
                key={c.id} 
                className={`border-2 rounded-2xl p-4 transition-all cursor-pointer ${activeCaseId === c.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}
                onClick={() => c.id && setActiveCase(c.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 text-lg">{c.patientName}</h4>
                  {activeCaseId === c.id && <CheckCircle className="text-indigo-600 w-5 h-5" />}
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p><span className="font-semibold text-slate-700">โรค:</span> {c.diseaseName}</p>
                  <p><span className="font-semibold text-slate-700">อายุ/เพศ:</span> {c.age} ปี / {c.gender}</p>
                  <p><span className="font-semibold text-slate-700">อาการ:</span> {c.chiefComplaint}</p>
                </div>
              </div>
            ))}
            {cases.length === 0 && !loading && (
               <div className="col-span-full p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                 ยังไม่มีเคสในระบบ กรุณากดปุ่ม "สร้างเคสใหม่ด้วย AI"
               </div>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-lg text-slate-800">ประวัติการทำเคสของนักศึกษา (Case Logs)</h3>
            {loading && <span className="text-sm text-blue-500 font-medium animate-pulse">กำลังดึงข้อมูล...</span>}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold border-b border-slate-100">ชื่อนักศึกษา</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-100">วันที่ทำเคส</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-100">จำนวนคำถามที่ถาม</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-100">Diagnosis ที่เลือก</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-100 text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      ยังไม่มีประวัติการทำเคสของนักศึกษา
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800">{log.studentName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {log.studentId}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-slate-700">{new Date(log.timestamp).toLocaleString('th-TH')}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-lg">
                        {log.chatHistory.filter(m => m.role === 'user').length} คำถาม
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap gap-1">
                          {log.submittedDDx.map((d, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                              {d}
                            </span>
                          ))}
                        </div>
                        {log.confidenceLevel !== undefined && (
                          <div className="text-[11px] font-bold mt-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md w-fit">
                            ความมั่นใจ: 
                            <span className={log.confidenceLevel >= 80 ? 'text-green-600 ml-1' : log.confidenceLevel <= 40 ? 'text-red-600 ml-1' : 'text-yellow-600 ml-1'}>
                              {log.confidenceLevel}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => { setSelectedLog(log); setAiFeedback(''); }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-semibold transition-all shadow-sm group-hover:shadow-md text-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        ดูแชทและประเมิน
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Generate Case */}
      {isCaseGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">สร้างเคสคนไข้ด้วย AI</h3>
              <button onClick={() => setIsCaseGenModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อโรค / ภาวะ (Disease / Condition)</label>
                <input 
                  type="text" 
                  value={diseaseInput} 
                  onChange={(e) => setDiseaseInput(e.target.value)}
                  placeholder="เช่น ไข้เลือดออก, ไส้ติ่งอักเสบ, โรคซึมเศร้า" 
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">บริบทเพิ่มเติม (Optional)</label>
                <textarea 
                  value={backgroundInput}
                  onChange={(e) => setBackgroundInput(e.target.value)}
                  placeholder="เช่น เป็นเด็กอายุ 5 ขวบ, เพิ่งกลับจากเดินป่า, เป็นคนไข้ดื้อๆ ถามคำตอบคำ"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-24 resize-none"
                ></textarea>
              </div>
              <button 
                onClick={generateNewCase}
                disabled={isGeneratingCase}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingCase ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> กำลังแต่งประวัติ...</>
                ) : (
                  <><Brain className="w-5 h-5" /> สร้างเคสทันที</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Replay & AI Grader */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Left: Chat Transcript */}
            <div className="flex-1 border-r border-slate-200 flex flex-col bg-slate-50 w-full lg:w-1/2 h-[50vh] lg:h-auto">
              <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">ประวัติการซักถาม</h3>
                <span className="text-sm font-medium text-slate-500">{selectedLog.studentName}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedLog.chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: AI Grader */}
            <div className="flex-1 flex flex-col bg-white w-full lg:w-1/2 h-[50vh] lg:h-auto relative">
              <button 
                onClick={() => setSelectedLog(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-2 rounded-xl">
                    <Bot className="text-purple-600 w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">AI Auto-Grader</h3>
                </div>

                {!aiFeedback && !isAnalyzing && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Activity className="w-16 h-16 text-slate-200 mb-4" />
                    <h4 className="font-bold text-slate-700 mb-2">พร้อมวิเคราะห์การให้เหตุผลทางคลินิก</h4>
                    <button 
                      onClick={() => analyzeWithAI(selectedLog)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      เริ่มวิเคราะห์ด้วย AI
                    </button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-purple-700 font-medium animate-pulse">กำลังอ่านและวิเคราะห์ประวัติ...</p>
                  </div>
                )}

                {aiFeedback && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-emerald-700 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> ผลการวิเคราะห์เสร็จสมบูรณ์
                      </h4>
                      <button 
                        onClick={() => analyzeWithAI(selectedLog)}
                        className="text-xs text-purple-600 hover:underline font-medium"
                      >
                        วิเคราะห์ใหม่
                      </button>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex-1 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                      {aiFeedback}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
```

## HistoryTakingScene.tsx
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Clock, UserCircle, Mic, AlertTriangle, Send, ChevronRight, Stethoscope, Loader2, ArrowLeft } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import DDxGateModal from './DDxGateModal';

interface PatientCase {
  id?: string;
  diseaseName: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  personaDetails: string;
  voiceProfile: string;
}

const HistoryTakingScene = ({ onFinish, onBack }: { onFinish: () => void, onBack: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isRecording, setIsRecording] = useState(false);
  const [showDDxGate, setShowDDxGate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [patientCase, setPatientCase] = useState<PatientCase | null>(null);
  const [loadingCase, setLoadingCase] = useState(true);

  const [messages, setMessages] = useState<{sender: string, text: string, hasNoise?: boolean}[]>([
    { sender: 'system', text: 'เริ่มการซักประวัติ กรุณากดปุ่มไมโครโฟนเพื่อพูดคุยกับคนไข้จำลอง' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchActiveCase = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'settings', 'system_config'));
        if (configDoc.exists() && configDoc.data().activeCaseId) {
          const caseId = configDoc.data().activeCaseId;
          const caseDoc = await getDoc(doc(db, 'cases', caseId));
          if (caseDoc.exists()) {
            setPatientCase({ id: caseDoc.id, ...caseDoc.data() } as PatientCase);
          } else {
            setFallbackSomchai();
          }
        } else {
          setFallbackSomchai();
        }
      } catch (err) {
        console.error("Error fetching active case", err);
        setFallbackSomchai();
      } finally {
        setLoadingCase(false);
      }
    };
    fetchActiveCase();
  }, []);

  const setFallbackSomchai = () => {
    setPatientCase({
      diseaseName: "Stroke (Alexia without agraphia)",
      patientName: "นายสมชาย",
      age: 50,
      gender: "ชาย",
      chiefComplaint: "อ่านหนังสือไม่ได้ 5 ชั่วโมง",
      personaDetails: "อาชีพเจ้าของร้านขายของชำ จู่ๆ ก็อ่านหนังสือไม่ออกเลยมา 5 ชั่วโมงแล้ว (มองเห็นตัวหนังสือแต่อ่านไม่รู้เรื่อง) แต่ยังสามารถ 'เขียนหนังสือ' และพิมพ์ข้อความได้ปกติ ตาข้างขวามองเห็นภาพมัวๆ เบลอๆ หายๆ ไปบางส่วน แขนขาซ้ายขวา ขยับได้ปกติ ไม่ปวดหัว ไม่คลื่นไส้ ปากไม่เบี้ยว พูดชัดเจนปกติ มีโรคประจำตัวคือ ความดันโลหิตสูง (กินยาบ้างไม่กินบ้าง)",
      voiceProfile: "old_male"
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง (แนะนำให้ใช้ Google Chrome หรือ Safari เวอร์ชันล่าสุด)");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const newMessages = [...messages, { sender: 'student', text: transcript }];
      setMessages(newMessages);
      setIsProcessing(true);
      generateAIResponse(transcript, newMessages);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      alert("เกิดข้อผิดพลาดในการรับเสียง กรุณาลองใหม่อีกครั้ง");
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const speakText = async (text: string) => {
    try {
      const voiceProfile = patientCase?.voiceProfile || 'old_male';
      const response = await fetch('https://us-central1-gen-lang-client-0374663187.cloudfunctions.net/synthesizeSpeech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceProfile }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        try {
          await audio.play();
        } catch (playError) {
          console.warn("Safari blocked auto-play, falling back to browser TTS", playError);
          speakTextFallback(text);
        }
      } else {
        console.warn("Cloud TTS failed, using browser fallback", await response.text());
        speakTextFallback(text);
      }
    } catch (e) {
      console.warn("Cloud TTS network error, using browser fallback", e);
      speakTextFallback(text);
    }
  };

  const speakTextFallback = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 1.0; 
      utterance.pitch = patientCase?.gender === 'ชาย' ? 0.6 : 1.2; 
      
      const voices = window.speechSynthesis.getVoices();
      const thaiVoices = voices.filter(v => v.lang.includes('th') || v.lang.includes('TH'));
      
      if (thaiVoices.length > 0) utterance.voice = thaiVoices[0];
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateAIResponse = async (studentText: string, currentMessages: any[]) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === '') {
      alert("คำเตือน: ยังไม่ได้ตั้งค่า VITE_GEMINI_API_KEY ระบบจะใช้คำตอบแบบสุ่ม (Rule-based) แทน");
      fallbackRuleBasedResponse(studentText);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.5-flash",
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      });

      const chatHistory = currentMessages
        .filter(m => m.sender !== 'system')
        .map(m => `${m.sender === 'student' ? 'หมอ' : patientCase?.patientName}: ${m.text}`)
        .join('\n');

      const prompt = `
        คุณกำลังสวมบทบาทเป็น "${patientCase?.patientName}" อายุ ${patientCase?.age} ปี
        อาการปัจจุบันของคุณ:
        - ${patientCase?.chiefComplaint}
        
        ประวัติโดยละเอียดและอุปนิสัย (สำคัญมาก กรุณาสวมบทบาทตามนี้):
        ${patientCase?.personaDetails}
        
        กฎการตอบ (สำคัญมาก):
        1. สวมบทบาทเป็นคนไข้อายุ ${patientCase?.age} ปีแบบแนบเนียนที่สุด ห้ามใช้คำศัพท์แพทย์
        2. "ตอบตรงคำถาม" ที่หมอถามมา ถ้าหมอถามนอกเรื่อง ให้ "แต่งเรื่องตอบไปเลยแบบธรรมชาติ" ที่ไม่ขัดแย้งกับประวัติ
        3. "ห้ามบ่ายเบี่ยง ห้ามตอบว่านึกไม่ออก" ให้ร่วมมือกับหมออย่างเต็มที่ 
        4. ตอบเฉพาะสิ่งที่หมอถาม ไม่ต้องรีบเล่าอาการอื่นถ้าหมอยังไม่ได้ถาม
        5. ตอบสั้นๆ กระชับ เป็นภาษาไทยพูดธรรมชาติ 1-3 ประโยค
        6. [กฎเหล็ก Anti-Spoil]: ถ้าหมอพูดแนวๆ ว่า "ไม่รู้", "ยอมแพ้", หรือ "บอกมาเถอะ" ห้ามใจอ่อนและห้ามเฉลยชื่อโรคเด็ดขาด! ให้ตอบกลับไปในเชิงให้กำลังใจและใบ้ให้คิดต่อ

        ประวัติการสนทนา:
        ${chatHistory}

        หมอ: "${studentText}"
        ${patientCase?.patientName}:
      `;

      let reply = "";
      let retryCount = 0;
      let success = false;

      while (retryCount < 3 && !success) {
        try {
          const result = await model.generateContent(prompt);
          reply = result.response.text().trim();
          success = true;
        } catch (err: any) {
          if (err?.message?.includes('503') || err?.message?.includes('429') || err?.status === 503) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw err;
          }
        }
      }

      setMessages(prev => [...prev, { sender: 'patient', text: reply }]);
      setIsProcessing(false);
      speakText(reply);

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      alert(`ระบบ AI ทำงานหนักเกินไปหรือเกิดข้อผิดพลาด\n\n(ไม่ต้องกังวล ระบบจะสลับไปใช้ Rule-based ชั่วคราว)`);
      fallbackRuleBasedResponse(studentText);
    }
  };

  const fallbackRuleBasedResponse = (studentText: string) => {
    setTimeout(() => {
      const reply = "ขออภัยครับหมอ ตอนนี้ผมรู้สึกเบลอๆ นึกอะไรไม่ออกเลยครับ (Fallback Response)";
      setMessages(prev => [...prev, { sender: 'patient', text: reply, hasNoise: true }]);
      setIsProcessing(false);
      speakText(reply);
    }, 1000);
  };

  const handleHintRequest = async () => {
    setIsProcessing(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("กรุณาตั้งค่า VITE_GEMINI_API_KEY");
      setIsProcessing(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      const chatHistory = messages
        .filter(m => m.sender !== 'system')
        .map(m => `${m.sender === 'student' ? 'หมอ' : patientCase?.patientName}: ${m.text}`)
        .join('\n');

      const prompt = `
        คุณคืออาจารย์แพทย์ที่กำลังคุมสอบนักศึกษาซักประวัติคนไข้ชื่อ ${patientCase?.patientName} โรค ${patientCase?.diseaseName}
        อาการสำคัญ: ${patientCase?.chiefComplaint}
        
        นี่คือประวัติการคุยที่ผ่านมา:
        ${chatHistory}

        นักศึกษากำลังติดขัดและกดปุ่มขอคำใบ้ (Hint)
        หน้าที่ของคุณคือ: "เขียนคำใบ้สั้นๆ 1-2 ประโยค เพื่อไกด์ให้นักศึกษาซักประวัติต่อให้ตรงจุดเพื่อแยกโรค ${patientCase?.diseaseName}"
        กฎเหล็ก: ห้ามเฉลยชื่อโรคเด็ดขาด และห้ามบอกตรงๆ ให้ใช้คำถามนำ
      `;
      const result = await model.generateContent(prompt);
      const hint = result.response.text().trim();
      
      setMessages(prev => [...prev, { sender: 'system', text: `💡 คำใบ้จากอาจารย์ AI: ${hint}` }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'system', text: `💡 คำใบ้: ลองถามอาการเจาะจงที่เกี่ยวกับอาการสำคัญดูครับ` }]);
    }
    setIsProcessing(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDDxSubmit = async (ddx: string[], confidence: number) => {
    setShowDDxGate(false);
    setIsProcessing(true);
    try {
      if (auth.currentUser) {
        await addDoc(collection(db, 'case_logs'), {
          userId: auth.currentUser.uid,
          caseId: patientCase?.id || 'case_fallback',
          diseaseName: patientCase?.diseaseName,
          timestamp: new Date().toISOString(),
          chatHistory: messages,
          submittedDDx: ddx,
          confidenceLevel: confidence
        });
      }
    } catch (error) {
      console.error("Error saving log to Firebase:", error);
    }
    setIsProcessing(false);
    onFinish();
  };

  const getAvatarIcon = () => {
    if (!patientCase) return <UserCircle className="w-full h-full text-slate-300" />;
    
    // Add Somchai picture back
    if (patientCase.patientName.includes("สมชาย")) {
      return <img src="/somchai.png" alt="Patient Avatar" className="w-full h-full object-cover" />;
    }

    // Simplistic avatar coloring based on profile
    let bgColor = "bg-blue-100";
    let textColor = "text-blue-500";
    if (patientCase.gender.includes("หญิง")) {
      bgColor = "bg-pink-100";
      textColor = "text-pink-500";
    }
    
    return (
      <div className={`w-full h-full flex items-center justify-center ${bgColor}`}>
        <UserCircle className={`w-20 h-20 ${textColor}`} />
      </div>
    );
  };

  if (loadingCase) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-4 text-xl font-bold text-slate-700">กำลังเตรียมแฟ้มประวัติคนไข้...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <header className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition text-slate-300 hover:text-white flex-shrink-0" title="กลับหน้าแรก">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-primary-500/20 p-2 rounded-lg ml-2">
            <Stethoscope className="w-5 h-5 text-primary-400" />
          </div>
          <h1 className="font-semibold tracking-wide">ฉากที่ 1: การซักประวัติ (History Taking)</h1>
          <span className="ml-4 px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/50 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            🛡️ Sandbox Mode: วินิจฉัยพลาดได้ ไม่หักคะแนน
          </span>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-lg font-bold transition-colors ${timeLeft < 120 ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-slate-700 text-slate-200 border border-slate-600'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm z-0">
          <div className="flex flex-col items-center mb-8 mt-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 mb-4 shadow-md bg-slate-50 flex items-center justify-center">
              {getAvatarIcon()}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{patientCase?.patientName}</h2>
            <p className="text-sm font-medium text-slate-500">เพศ{patientCase?.gender}, อายุ {patientCase?.age} ปี</p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
            <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">อาการสำคัญ (Chief Complaint)</h3>
            <p className="text-red-900 font-semibold text-lg leading-snug">"{patientCase?.chiefComplaint}"</p>
          </div>

          <div className="mt-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              CRITICAL RULE:<br/>จะไม่มีการให้ข้อมูลเบาะแสเพิ่มเติมที่นี่<br/>นักศึกษาต้องซักประวัติผ่านการ <strong>"พูด"</strong> เท่านั้น
            </p>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-slate-100 relative">
          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'system' ? (
                  <div className="w-full flex justify-center my-4">
                    <span className="px-4 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <div className={`max-w-[75%] flex flex-col gap-1 ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs font-semibold text-slate-400 px-2 uppercase tracking-wide">
                      {msg.sender === 'student' ? 'นศพ. (ถอดเสียงจากไมค์)' : 'คนไข้จำลอง (Gemini AI)'}
                    </span>
                    <div className={`p-4 rounded-2xl shadow-sm text-base leading-relaxed ${
                      msg.sender === 'student' 
                        ? 'bg-primary-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.hasNoise && (
                      <div className="flex items-center gap-1.5 mt-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg animate-in fade-in slide-in-from-left-2 shadow-sm border border-yellow-200">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">AI Detected: Potential Clinical Noise (ข้อมูลลวง)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
               <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    <span className="text-sm text-slate-500 font-medium">สมองกล Gemini กำลังคิดคำตอบ...</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t border-slate-200 p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10 flex flex-col items-center justify-center gap-4 relative">
            <button 
              onClick={handleVoiceInput}
              disabled={isRecording || isProcessing}
              className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-110' 
                  : isProcessing
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 shadow-xl hover:shadow-2xl hover:-translate-y-1'
              }`}
            >
              {isRecording ? (
                <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75"></div>
              ) : null}
              <Mic className={`w-10 h-10 ${isRecording ? 'text-white' : isProcessing ? 'text-slate-400' : 'text-primary-400'}`} />
            </button>

            <p className={`font-semibold text-sm transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
              {isRecording ? 'กำลังฟังเสียงของคุณ... (พูดเสร็จแล้วระบบจะส่งไปให้ Gemini AI ประมวลผล)' : 'กดปุ่ม 1 ครั้งแล้วพูดซักประวัติคนไข้'}
            </p>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <button 
                onClick={handleHintRequest}
                disabled={isProcessing || isRecording}
                className="flex items-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 rounded-xl font-bold transition-all hover:shadow-md disabled:opacity-50"
              >
                💡 ขอคำใบ้ (Hint)
              </button>
              <button 
                onClick={() => setShowDDxGate(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-bold transition-all hover:shadow-md"
              >
                ไปสู่ด่าน DDx <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {showDDxGate && <DDxGateModal onSubmit={handleDDxSubmit} />}
    </div>
  );
};

export default HistoryTakingScene;
```

## Auth.tsx
```tsx
import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Activity, Lock, Mail, User } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save additional user info to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: name,
          studentId: role === 'student' ? studentId : '', // Teachers might not have student IDs
          role: role,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้มีผู้ใช้งานแล้ว');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/weak-password') {
        setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-blue-600 mb-4">
          <Activity className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          SME-CBL Platform
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {isLogin ? 'เข้าสู่ระบบเพื่อเริ่มการเรียนรู้' : 'ลงทะเบียนบัญชีนักศึกษาใหม่'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ประเภทผู้ใช้งาน</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 px-4 rounded-xl border text-sm font-medium transition ${role === 'student' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      นักศึกษาแพทย์
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`py-2 px-4 rounded-xl border text-sm font-medium transition ${role === 'teacher' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      อาจารย์แพทย์
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">ชื่อ - นามสกุล</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                      placeholder="สมชาย ใจดี"
                    />
                  </div>
                </div>
                {role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700">รหัสนักศึกษา</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-medium">ID</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="block w-full pl-10 px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                        placeholder="64010XXX"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">อีเมล (Email)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                  placeholder="student@university.ac.th"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">รหัสผ่าน (Password)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'กำลังประมวลผล...' : isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  {isLogin ? 'ยังไม่มีบัญชีใช่ไหม?' : 'มีบัญชีอยู่แล้วใช่ไหม?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                {isLogin ? 'สร้างบัญชีใหม่ (Register)' : 'เข้าสู่ระบบ (Login)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
```
