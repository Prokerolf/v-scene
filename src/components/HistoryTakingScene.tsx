import React, { useState, useEffect, useRef } from 'react';
import { Clock, UserCircle, Mic, AlertTriangle, Send, ChevronRight, Stethoscope, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import DDxGateModal from './DDxGateModal';
import AdaptivePreTestModal from './AdaptivePreTestModal';
import PatientAvatarSVG from './PatientAvatarSVG';
import YenjaiChatWidget from './YenjaiChatWidget';

interface PatientCase {
  id?: string;
  diseaseName: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  personaDetails: string;
  voiceProfile: string;
  ddxKeywords?: string[];
  ddxGroup?: string;
  ddxExplanation?: string;
  tier?: string;
  vitals?: {
    bp: string;
    hr: number;
    rr: number;
    temp: number;
    spo2: number;
    weight: number;
    height: number;
  };
}

const HistoryTakingScene = ({ activeCase, preTestScore, onFinish, onBack, addLogAction, chatHistory, setChatHistory, timeLeft, setTimeLeft }: { activeCase: any, preTestScore: number, onFinish: (ddx: string, logId: string, reason: string) => void, onBack: () => void, addLogAction: (dim: string, act: string, mis: string, tag: string) => void, chatHistory: any[], setChatHistory: (v: any[]) => void, timeLeft: number, setTimeLeft: (v: number) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showDDxGate, setShowDDxGate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0); 
  const [ddxAttempts, setDdxAttempts] = useState(0);
  const [ddxErrorHint, setDdxErrorHint] = useState<string | null>(null);
  const [ddxFeedbackPopup, setDdxFeedbackPopup] = useState<{status: 'success' | 'fail', message: string, ddx: string[], logId: string, reason: string} | null>(null);
  
  const [patientCase, setPatientCase] = useState<PatientCase | null>(activeCase);
  const [loadingCase, setLoadingCase] = useState(false);

  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isSpeakingFallback, setIsSpeakingFallback] = useState(false);

  const messages = chatHistory.length > 0 ? chatHistory : [{ sender: 'system', text: 'เริ่มการซักประวัติ กรุณากดปุ่มไมโครโฟนเพื่อพูดคุยกับคนไข้จำลอง' }];
  const setMessages = setChatHistory;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'ต่อไป ➔',
      prevBtnText: '⬅ ก่อนหน้า',
      doneBtnText: 'เข้าใจแล้ว!',
      steps: [
        { element: '#tour-timer', popover: { title: 'เวลาจับเวลา', description: 'คุณมีเวลา 10 นาทีในการซักประวัติ บริหารเวลาให้ดีนะครับ!', side: "bottom", align: 'end' }},
        { element: '#tour-avatar', popover: { title: 'คนไข้จำลอง AI', description: 'นี่คือคนไข้ของคุณในเคสนี้ ขยับปากและมีเสียงพูดตอบกลับได้สมจริง!', side: "right", align: 'start' }},
        { element: '#tour-cc', popover: { title: 'อาการสำคัญ (Chief Complaint)', description: 'อย่าลืมโฟกัสการซักประวัติให้สอดคล้องกับอาการสำคัญที่คนไข้มาหานะครับ', side: "bottom", align: 'start' }},
        { element: '#tour-vitals', popover: { title: 'สัญญาณชีพ (Vital Signs)', description: 'ข้อมูลสัญญาณชีพเบื้องต้นจากจุดคัดกรอง ไว้ใช้ประเมินความฉุกเฉินของคนไข้ครับ', side: "right", align: 'start' }},
        { element: '#tour-mic', popover: { title: 'ปุ่มไมโครโฟน', description: 'กดปุ่มนี้ 1 ครั้งแล้วพูดซักประวัติได้เลยครับ พูดเสร็จระบบจะประมวลผลคำถามส่งให้คนไข้ AI', side: "top", align: 'center' }},
        { element: '#tour-yenjai', popover: { title: 'ผู้ช่วย AI (น้องเย็นใจ)', description: 'ถ้านึกไม่ออกว่าจะถามอะไรต่อ สามารถกดเรียกน้องเย็นใจมาช่วยไกด์ทางให้ได้เสมอนะครับ!', side: "left", align: 'end' }},
        { element: '#tour-next', popover: { title: 'ไปด่านต่อไป', description: 'เมื่อคิดว่าซักประวัติได้ข้อมูลเพียงพอแล้ว กดปุ่มนี้เพื่อไปสู่การระบุโรคเบื้องต้น (DDx) ครับ', side: "top", align: 'end' }}
      ]
    });
    driverObj.drive();
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

  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง (แนะนำให้ใช้ Google Chrome หรือ Safari เวอร์ชันล่าสุด)");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'th-TH'; 
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let accumulatedTranscript = '';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        accumulatedTranscript += event.results[i][0].transcript + ' ';
      }
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      alert("เกิดข้อผิดพลาดในการรับเสียง กรุณาลองใหม่อีกครั้ง");
    };
    recognition.onend = () => {
      setIsRecording(false);
      if (accumulatedTranscript.trim()) {
        const transcript = accumulatedTranscript.trim();
        const newMessages = [...messages, { sender: 'student', text: transcript }];
        setMessages(newMessages);
        setMessagesCount(prev => prev + 1);
        setIsProcessing(true);
        generateAIResponse(transcript, newMessages);
      }
    };
    recognition.start();
  };

  const speakText = async (text: string) => {
    try {
      // ป้องกัน TTS อ่านสะกดคำผิด เช่น "หมอ" เป็น "หอ-มอ-ออ"
      let sanitizedText = text;
      // ถ้ามีคำว่า "หมอ" โดดๆ ให้เปลี่ยนเป็น "คุณหมอ" หรือป้องกันการสะกดคำ
      sanitizedText = sanitizedText.replace(/(?<!คุณ)หมอ/g, 'คุณหมอ');
      sanitizedText = sanitizedText.replace(/ห ม อ/g, 'คุณหมอ');
      sanitizedText = sanitizedText.replace(/รพ\./g, 'โรงพยาบาล');
      sanitizedText = sanitizedText.replace(/ซม\./g, 'เซนติเมตร');

      const voiceProfile = patientCase?.voiceProfile || 'old_male';
      const response = await fetch('https://us-central1-gen-lang-client-0374663187.cloudfunctions.net/synthesizeSpeech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: sanitizedText, voiceProfile }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);
        try {
          await audio.play();
          audio.onended = () => setCurrentAudio(null);
          audio.onerror = () => setCurrentAudio(null);
        } catch (playError) {
          console.warn("Safari blocked auto-play, falling back to browser TTS", playError);
          setCurrentAudio(null);
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
      
      let sanitizedText = text;
      sanitizedText = sanitizedText.replace(/(?<!คุณ)หมอ/g, 'คุณหมอ');
      sanitizedText = sanitizedText.replace(/ห ม อ/g, 'คุณหมอ');
      sanitizedText = sanitizedText.replace(/รพ\./g, 'โรงพยาบาล');
      sanitizedText = sanitizedText.replace(/ซม\./g, 'เซนติเมตร');

      const utterance = new SpeechSynthesisUtterance(sanitizedText);
      utterance.lang = 'th-TH';
      utterance.rate = 1.0; 
      utterance.pitch = patientCase?.gender === 'ชาย' ? 0.6 : 1.2; 
      
      utterance.onstart = () => setIsSpeakingFallback(true);
      utterance.onend = () => setIsSpeakingFallback(false);
      utterance.onerror = () => setIsSpeakingFallback(false);
      
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
        model: "gemini-2.5-flash",
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
        7. "ห้ามใช้สัญลักษณ์ Markdown เด็ดขาด" (เช่น ** * # // \n) ให้ตอบเป็นข้อความธรรมดา (Plain text) เท่านั้น
        8. "ต้องพูดในมุมมองของตัวเองเท่านั้น" (ใช้คำแทนตัวเองเช่น ผม, หนู, ฉัน, ดิฉัน) ห้ามใช้คำว่า "คนไข้บอกว่า..." เด็ดขาด
        9. เวลาจะเรียกนักศึกษาแพทย์ ให้พิมพ์คำว่า "คุณหมอ" แบบเต็มคำ ห้ามพิมพ์คำว่า "หมอ" เฉยๆ (เพื่อป้องกันระบบเสียง TTS อ่านผิดเป็น หอ-มอ-ออ)
        10. ห้ามใช้ตัวย่อเด็ดขาด (เช่น พิมพ์ "โรงพยาบาล" แทน "รพ.", "เซนติเมตร" แทน "ซม.")
        ${patientCase?.tier === 'High' ? '11. [เพิ่มความท้าทาย]: ให้พูดเรื่องไม่สำคัญ บ่นเรื่องจิปาถะ หรือให้ข้อมูลลวง (Clinical Noise) แทรกเข้ามาบ่อยๆ เพื่อทดสอบสมาธิของคุณหมอ' : ''}

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



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  const handleDDxSubmit = async (ddx: string[], confidence: number, reason: string) => {
    setIsProcessing(true);
    setDdxErrorHint(null);

    const submittedText = ddx.join(' ').toLowerCase();
    const keywords = patientCase?.ddxKeywords || [];
    
    let isCorrect = keywords.some(kw => submittedText.includes(kw.toLowerCase()));
    let correctSpellingFeedback = '';

    let finalStatus: 'success' | 'fail' = 'success';

    if (!isCorrect) {
      // AI Typo/Meaning Check
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `
            นักศึกษาส่งคำตอบ DDx มาว่า: "${submittedText}"
            คำตอบที่ถูกต้องคือ: ${patientCase?.ddxGroup || patientCase?.diseaseName}
            Keywords: ${keywords.join(', ')}

            ตรวจสอบว่านักศึกษาตอบถูกความหมายหรือไม่ (อาจจะสะกดผิด หรือพิมพ์ภาษาไทย/อังกฤษสลับกัน แต่ความหมายคือโรคเดียวกัน)
            ตอบกลับเป็น JSON Format เท่านั้น (ไม่ต้องใส่ Markdown หรือคำอธิบายเพิ่ม):
            {
              "isCorrect": true หรือ false,
              "correctSpelling": "ถ้าสะกดผิด ให้บอกคำสะกดที่ถูกต้อง ถ้าสะกดถูกเป๊ะๆ หรือตอบผิดไปเลย ให้ปล่อยว่าง"
            }
          `;
          const result = await model.generateContent(prompt);
          const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(responseText);
          isCorrect = parsed.isCorrect;
          if (parsed.isCorrect && parsed.correctSpelling) {
             correctSpellingFeedback = `\n\n💡 หมายเหตุ: คำสะกดที่ถูกต้องคือ ${parsed.correctSpelling}`;
          }
        }
      } catch (e) {
        console.error("AI Spelling Eval Error:", e);
      }
    }

    if (!isCorrect) {
      const newAttempts = ddxAttempts + 1;
      setDdxAttempts(newAttempts);

      if (newAttempts < 3) {
        if (newAttempts === 1) {
          setDdxErrorHint("ยังไม่ถูกต้องนะคะ ลองพิจารณาอาการหลักและข้อมูลที่ได้จากการซักประวัติเพื่อหาคำตอบอีกครั้งค่ะ ✌️");
          setIsProcessing(false);
          return;
        }

        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `
            คุณคือ "เย็นใจ" ผู้ช่วย AI สาวน้อยน่ารัก สุภาพ อ่อนโยน
            นักศึกษาส่งคำตอบ Differential Diagnosis (DDx) มาว่า: "${ddx.join(', ')}"
            แต่กลุ่มโรคที่ถูกต้องและควรนึกถึงคือ: ${patientCase?.ddxGroup || patientCase?.diseaseName}
            
            กฎเหล็กการตอบ (Yenjai Strict Tone):
            - "บอกตรงๆ ทันทีในประโยคแรกว่าคำตอบยังไม่ถูกต้อง"
            - "เนื้อหาคำใบ้ต้องสั้น ตรงประเด็นสุดๆ ห้ามเกิน 4 บรรทัด" ตัดคำชมและน้ำทิ้งทั้งหมด
            - ห้ามพูดเยิ่นเย้อ ห้ามเฉลยชื่อกลุ่มโรคตรงๆ
            - "ห้ามใช้สัญลักษณ์ Markdown เด็ดขาด" (เช่น ** * # // \\n) ให้ตอบเป็นข้อความธรรมดาเท่านั้น
            - ตัวอย่าง: "ยังไม่ถูกต้องนะคะ! อาการเกิดขึ้นฉับพลันแบบนี้ ลองนึกถึงกลุ่มโรคอื่นดูค่ะ"
          `;
          const result = await model.generateContent(prompt);
          setDdxErrorHint(result.response.text().trim());
        } catch (e) {
          setDdxErrorHint("เกือบถูกแล้วค่ะคุณหมอ! ลองพิจารณาอาการหลักของคนไข้ประกอบอีกครั้งนะคะ");
        }
        setIsProcessing(false);
        return; 
      } else {
        addLogAction('Diagnosis', 'DDx Failed 3 Attempts', `Submitted: ${ddx.join(', ')}`, 'Review Slide Section: Differential Diagnosis');
        finalStatus = 'fail';
      }
    }

    setShowDDxGate(false);

    let baselineKnowledgeLog = {};
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chatHistory = messages.filter(m => m.sender === 'student').map(m => m.text).join(' | ');
        const prompt = `
          วิเคราะห์คำถามของนักศึกษาแพทย์ต่อไปนี้: "${chatHistory}"
          ตอบกลับเป็น JSON format เท่านั้น โดยมี 2 keys:
          {
            "student_asked_summary": "สรุปสั้นๆ ว่านักศึกษาถามเรื่องอะไรบ้าง",
            "baseline_knowledge_level": "วิเคราะห์ระดับความรู้พื้นฐานจากการตั้งคำถาม (Low/Medium/High) พร้อมเหตุผลสั้นๆ"
          }
        `;
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        const jsonMatch = text.match(/\\{.*\\}/s);
        if (jsonMatch) {
          baselineKnowledgeLog = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.warn("Silent logging failed", e);
    }

    const chatText = messages.map(m => m.text).join(' ');
    const timeKeywords = ['กี่ชั่วโมง', 'นานแค่ไหน', 'เมื่อไหร่', 'ตอนไหน', 'ชั่วโมง', 'เวลา', 'เมื่อไร'];
    const hasTimeKeyword = timeKeywords.some(kw => chatText.includes(kw));

    if (!hasTimeKeyword) {
      addLogAction('History Taking', 'Omitted symptom onset time', 'Missed critical temporal profiling criteria', 'Review Slide Section: Timeline & Evolution of Neurological Symptoms');
    }

    try {
      if (auth.currentUser) {
        const docRef = await addDoc(collection(db, 'case_logs'), {
          userId: auth.currentUser.uid,
          caseId: patientCase?.id || 'case_fallback',
          diseaseName: patientCase?.diseaseName,
          timestamp: new Date().toISOString(),
          chatHistory: messages,
          submittedDDx: ddx,
          confidenceLevel: confidence,
          preTestScore: preTestScore,
          assignedTier: patientCase?.tier || 'High',
          baselineKnowledgeLog: baselineKnowledgeLog,
          ddxAttempts: ddxAttempts,
          ddxReason: reason
        });
        setIsProcessing(false);
        setDdxFeedbackPopup({
          status: finalStatus,
          message: finalStatus === 'success' 
            ? `🎉 เย่! ถูกต้องแล้วครับ\n\nยอดเยี่ยมมาก คุณระบุกลุ่มโรคได้ถูกต้อง\n\n🎯 กลุ่มโรคที่ควรนึกถึงคือ: ${patientCase?.ddxGroup || patientCase?.diseaseName}\n\n💡 เหตุผล: ${patientCase?.ddxExplanation || 'อาการเข้าได้กับกลุ่มโรคนี้'}${correctSpellingFeedback}`
            : `คุณตอบผิดครบ 3 ครั้ง ระบบขอเฉลยเพื่อให้คุณไปต่อ\n\n🎯 กลุ่มโรคที่ควรนึกถึงคือ: ${patientCase?.ddxGroup || patientCase?.diseaseName}\n\n💡 เหตุผล: ${patientCase?.ddxExplanation || 'อาการเข้าได้กับกลุ่มโรคนี้'}`,
          ddx: ddx,
          logId: docRef.id,
          reason: reason
        });
        return;
      }
    } catch (error) {
      console.error("Error saving log to Firebase:", error);
    }
    
    setIsProcessing(false);
    setDdxFeedbackPopup({
      status: finalStatus,
      message: finalStatus === 'success' 
        ? `🎉 เย่! ถูกต้องแล้วครับ\n\nยอดเยี่ยมมาก คุณระบุกลุ่มโรคได้ถูกต้อง\n\n🎯 กลุ่มโรคที่ควรนึกถึงคือ: ${patientCase?.ddxGroup || patientCase?.diseaseName}\n\n💡 เหตุผล: ${patientCase?.ddxExplanation || 'อาการเข้าได้กับกลุ่มโรคนี้'}${correctSpellingFeedback}`
        : `คุณตอบผิดครบ 3 ครั้ง ระบบขอเฉลยเพื่อให้คุณไปต่อ\n\n🎯 กลุ่มโรคที่ควรนึกถึงคือ: ${patientCase?.ddxGroup || patientCase?.diseaseName}\n\n💡 เหตุผล: ${patientCase?.ddxExplanation || 'อาการเข้าได้กับกลุ่มโรคนี้'}`,
      ddx: ddx,
      logId: 'local_fallback'
    });
  };

  if (loadingCase) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="material-symbols-rounded animate-spin text-primary text-[40px]">sync</span>
        <span className="ml-4 font-headline-md text-xl text-on-surface">Loading Case File...</span>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="bg-primary text-on-primary text-center py-2 px-4 font-label-sm tracking-wide flex items-center justify-center gap-2 relative z-20">
        <span className="material-symbols-rounded text-[16px] flex-shrink-0">shield</span>
        <span>Formative Sandbox: This activity is for diagnostic learning and skills development. Results are confidential.</span>
      </div>
      
      {/* TopAppBar */}
      <header className="bg-surface-container-lowest w-full top-0 border-b border-outline-variant flex justify-between items-center px-4 md:px-6 py-4 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-surface-container-low rounded-full transition text-on-surface-variant hover:text-primary flex-shrink-0">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <div className="bg-secondary-container p-2 rounded-full hidden sm:block">
            <span className="material-symbols-rounded text-secondary text-[20px]">stethoscope</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface hidden sm:block">History Taking Phase</h1>
          <h1 className="font-headline-md text-xl font-bold text-on-surface sm:hidden">History Taking</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={startTutorial}
            className="font-label-sm text-on-surface-variant hover:text-primary bg-surface-container-low hover:bg-surface-container px-4 py-2 rounded-full transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-rounded text-[16px]">help</span> <span className="hidden sm:inline">Tutorial</span>
          </button>
          <div id="tour-timer" className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold transition-colors border ${
            timeLeft < 120 
              ? 'bg-error-container text-on-error-container border-error animate-pulse' 
              : 'bg-surface-container-low text-on-surface border-outline-variant'
          }`}>
            <span className="material-symbols-rounded text-[20px]">timer</span>
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Patient Profile Sidebar */}
        <aside className="w-full md:w-80 bg-surface-container-lowest border-b md:border-b-0 md:border-r border-outline-variant flex flex-row md:flex-col shadow-sm z-0 shrink-0 overflow-y-auto">
          {/* Avatar Area */}
          <div id="tour-avatar" className="w-32 md:w-full h-auto md:h-64 relative flex-shrink-0 border-r md:border-r-0 md:border-b border-outline-variant overflow-hidden bg-surface-container-low flex items-center justify-center">
            <PatientAvatarSVG audioElement={currentAudio} isSpeakingFallback={isSpeakingFallback} patientCase={patientCase} />
            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-surface-container-lowest/90 text-on-surface font-label-sm px-3 py-1.5 rounded-full shadow-sm border border-outline-variant hidden md:block">
              AI Patient: {patientCase?.patientName}
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 md:p-6 justify-center">
            <div id="tour-cc" className="bg-primary-container/30 border border-primary-container rounded-2xl p-4 md:p-6 relative overflow-hidden text-center mb-4">
              <h3 className="font-label-sm text-primary uppercase tracking-widest mb-2">Chief Complaint</h3>
              <p className="font-headline-md text-on-surface leading-snug">"{patientCase?.chiefComplaint}"</p>
            </div>

            {patientCase?.vitals && (
              <div id="tour-vitals" className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm relative overflow-hidden hidden md:block">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                  <h3 className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Vital Signs</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 font-body-md text-sm">
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-semibold">BP</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.bp} <span className="text-[10px] text-outline font-normal">mmHg</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-semibold">HR</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.hr} <span className="text-[10px] text-outline font-normal">bpm</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-semibold">RR</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.rr} <span className="text-[10px] text-outline font-normal">/min</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-semibold">Temp</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.temp} <span className="text-[10px] text-outline font-normal">°C</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-semibold">SpO2</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.spo2} <span className="text-[10px] text-outline font-normal">%</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-semibold">Wt/Ht</span>
                    <span className="font-bold text-on-surface text-[10px] md:text-xs whitespace-nowrap">{patientCase.vitals.weight}kg / {patientCase.vitals.height}cm</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 bg-tertiary-container/30 border border-tertiary-container rounded-xl p-3 text-center hidden md:block">
              <p className="font-label-sm text-tertiary">
                Focus on exploring this chief complaint using the microphone.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Interactive Workspace (Chat) */}
        <main className="flex-1 flex flex-col bg-surface relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'system' ? (
                  <div className="w-full flex justify-center my-4">
                    <span className="px-5 py-2 bg-surface-container-low border border-outline-variant text-on-surface-variant font-label-sm uppercase tracking-wider rounded-full shadow-sm">
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <div className={`max-w-[85%] md:max-w-[70%] flex flex-col gap-1 ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}>
                    <span className="font-label-sm text-outline px-2 uppercase tracking-wide">
                      {msg.sender === 'student' ? 'You' : patientCase?.patientName || 'Patient'}
                    </span>
                    <div className={`p-4 md:p-5 rounded-2xl shadow-sm font-body-md text-base leading-relaxed ${
                      msg.sender === 'student' 
                        ? 'bg-primary text-on-primary rounded-tr-sm' 
                        : 'bg-surface-container-lowest border border-outline-variant text-on-surface rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.hasNoise && (
                      <div className="flex items-center gap-2 mt-1 px-3 py-1.5 bg-error-container text-on-error-container rounded-lg border border-error shadow-sm">
                        <span className="material-symbols-rounded text-[16px]">warning</span>
                        <span className="font-label-sm">AI Detected: Potential Clinical Noise</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                    <span className="material-symbols-rounded animate-spin text-primary">sync</span>
                    <span className="font-label-md text-on-surface-variant">Patient is thinking...</span>
                  </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Control Bar */}
          <div className="bg-surface-container-lowest border-t border-outline-variant p-4 md:p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10 flex flex-col items-center justify-center gap-3 relative shrink-0">
            <div className="flex w-full items-center justify-between md:justify-center gap-4">
              


              <div id="tour-mic" className="flex flex-col items-center flex-shrink-0">
                <button 
                  onClick={handleVoiceInput}
                  disabled={isProcessing}
                  className={`relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full transition-all duration-300 shadow-md ${
                    isRecording 
                      ? 'bg-error text-on-error scale-110' 
                      : isProcessing
                      ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
                      : 'bg-primary text-on-primary hover:bg-primary-fixed-variant hover:-translate-y-1'
                  }`}
                >
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-error/50 animate-ping"></div>
                  )}
                  <span className="material-symbols-rounded text-[32px]">{isRecording ? 'mic' : isProcessing ? 'mic_off' : 'mic'}</span>
                </button>
              </div>

              <div id="tour-next" className="flex-1 flex justify-end md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
                <button 
                  onClick={() => setShowDDxGate(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-colors border border-secondary-fixed-dim rounded-full font-label-md shadow-sm text-[10px] md:text-sm"
                >
                  Propose DDx <span className="material-symbols-rounded text-[18px] hidden sm:block">arrow_forward</span>
                </button>
              </div>

            </div>

            <p className={`font-label-sm transition-colors text-center mt-2 ${isRecording ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
              {isRecording ? 'Listening to your microphone...' : 'Tap the microphone icon to speak'}
            </p>
          </div>
        </main>
      </div>

      {showDDxGate && (
        <DDxGateModal 
          onSubmit={handleDDxSubmit} 
          onCancel={() => setShowDDxGate(false)}
          errorHint={ddxErrorHint}
          attempts={ddxAttempts}
          isProcessing={isProcessing}
        />
      )}

      <YenjaiChatWidget patientCase={patientCase} contextMessages={messages} />

      {ddxFeedbackPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-scrim/80 backdrop-blur-md">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300 border border-outline-variant">
            {ddxFeedbackPopup.status === 'success' ? (
              <span className="material-symbols-rounded text-[80px] text-primary mx-auto mb-6 block">check_circle</span>
            ) : (
              <img src="/yenjai2.png?v=2" alt="Yenjai Chicken" className="w-24 h-24 mx-auto mb-6 object-contain rounded-full border-4 border-error bg-surface-container-highest" />
            )}
            <h2 className={`font-headline-md text-2xl md:text-3xl font-bold mb-4 ${ddxFeedbackPopup.status === 'success' ? 'text-primary' : 'text-error'}`}>
              {ddxFeedbackPopup.status === 'success' ? 'Correct Diagnosis!' : 'System Feedback'}
            </h2>
            <p className="font-body-md text-on-surface-variant mb-8 whitespace-pre-line text-lg">
              {ddxFeedbackPopup.message}
            </p>
            <button
              onClick={() => {
                onFinish(ddxFeedbackPopup.ddx.join(', '), ddxFeedbackPopup.logId, ddxFeedbackPopup.reason);
                setDdxFeedbackPopup(null);
              }}
              className="w-full py-4 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-full font-label-md text-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              Continue <span className="material-symbols-rounded text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTakingScene;
