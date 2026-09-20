import React, { useState, useEffect, useRef } from 'react';
import { Clock, UserCircle, Mic, AlertTriangle, Send, ChevronRight, Stethoscope, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import DDxGateModal from './DDxGateModal';
import AdaptivePreTestModal from './AdaptivePreTestModal';
import PatientAvatarRealistic, { sharedAudioCtx } from './PatientAvatarRealistic';
import PatientAvatar3D from './PatientAvatar3D';
import YenjaiChatWidget from './YenjaiChatWidget';
import { useTranslation } from 'react-i18next';

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

const HistoryTakingScene = ({ 
  activeCase, 
  preTestScore, 
  onFinish, 
  onBack, 
  addLogAction, 
  chatHistory, 
  setChatHistory, 
  timeLeft, 
  setTimeLeft,
  isScratchpadOpen = true,
  onToggleScratchpad
}: { 
  activeCase: any, 
  preTestScore: number, 
  onFinish: (ddx: string, logId: string, reason: string) => void, 
  onBack: () => void, 
  addLogAction: (dim: string, act: string, mis: string, tag: string) => void, 
  chatHistory: any[], 
  setChatHistory: (v: any[]) => void, 
  timeLeft: number, 
  setTimeLeft: (v: number) => void,
  isScratchpadOpen?: boolean,
  onToggleScratchpad?: () => void
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isMicStarting, setIsMicStarting] = useState(false);
  const [showDDxGate, setShowDDxGate] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0); 
  const [ddxAttempts, setDdxAttempts] = useState(0);
  const [ddxErrorHint, setDdxErrorHint] = useState<string | null>(null);
  const [ddxFeedbackPopup, setDdxFeedbackPopup] = useState<{status: 'success' | 'fail', message: string, ddx: string[], logId: string, reason: string} | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  
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
        { element: '#tour-timer', popover: { title: 'เวลาจับเวลา', description: 'คุณมีเวลา 11 นาทีในการซักประวัติ บริหารเวลาให้ดีนะครับ!', side: "bottom", align: 'end' }},
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
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Initialize speech synthesis voices early
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 60 && !showDDxGate) {
      setAlertMessage("เหลือเวลาอีก 1 นาที! กรุณาสรุปข้อมูลและเตรียมให้การวินิจฉัยโรค (DDx)");
    }
    if (timeLeft === 0 && !showDDxGate) {
      setShowDDxGate(true);
    }
  }, [timeLeft, showDDxGate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVoiceInput = () => {
    // Unlock iOS Audio and SpeechSynthesis on first user interaction
    if (audioRef.current && !audioRef.current.src.startsWith('blob:')) {
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audioRef.current.play().catch(() => {});
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAlertMessage("เบราว์เซอร์ของคุณไม่รองรับการสั่งงานด้วยเสียง (แนะนำให้ใช้ Google Chrome หรือ Safari เวอร์ชันล่าสุด)");
      return;
    }
    
    // Resume shared audio context on user gesture to fix Safari/Mac audio dropouts
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    
    setIsMicStarting(true);
    
    const recognition = new SpeechRecognition();
    const isEnglishCase = patientCase?.patientName === 'Mrs. Sarah Connor';
    recognition.lang = isEnglishCase ? 'en-US' : 'th-TH'; 
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let accumulatedTranscript = '';

    recognition.onstart = () => {
      setIsMicStarting(false);
      setIsRecording(true);
      // Play a tiny beep so the user knows they can start speaking
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      } catch (e) {
        // ignore
      }
    };
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        accumulatedTranscript += event.results[i][0].transcript + ' ';
      }
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      setIsMicStarting(false);
      // Skip showing alert for 'no-speech' or 'aborted' as they are common and not fatal
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setAlertMessage("เกิดข้อผิดพลาดในการรับเสียง (" + event.error + ") กรุณาลองใหม่อีกครั้ง");
      }
    };
    recognition.onend = () => {
      setIsRecording(false);
      setIsMicStarting(false);
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

      const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      let response;
      if (openAIApiKey) {
        // Determine voice based on gender
        const isMale = patientCase?.gender === 'ชาย' || patientCase?.gender === 'Male' || patientCase?.gender === 'male';
        const voice = isMale ? 'onyx' : 'nova';
        
        response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: sanitizedText,
            voice: voice,
            speed: patientCase?.age >= 60 ? 0.9 : 1.0 // Slightly slower for elderly
          }),
        });
      } else {
        // Fallback to legacy cloud function if no OpenAI key
        const voiceProfile = patientCase?.voiceProfile || 'old_male';
        response = await fetch('https://us-central1-gen-lang-client-0374663187.cloudfunctions.net/synthesizeSpeech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sanitizedText, voiceProfile }),
        });
      }

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
          setCurrentAudio(audioRef.current);
          try {
            await audioRef.current.play();
            audioRef.current.onended = () => {
              setCurrentAudio(null);
              URL.revokeObjectURL(audioUrl);
            };
            audioRef.current.onerror = () => {
              setCurrentAudio(null);
              URL.revokeObjectURL(audioUrl);
            };
          } catch (playError) {
            console.warn("Auto-play blocked, falling back to browser TTS", playError);
            setCurrentAudio(null);
            speakTextFallback(text);
          }
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

      const isEnglishCase = patientCase?.patientName === 'Mrs. Sarah Connor';
      
      const utterance = new SpeechSynthesisUtterance(sanitizedText);
      utterance.lang = isEnglishCase ? 'en-US' : 'th-TH';
      utterance.rate = 1.0; 
      utterance.pitch = patientCase?.gender === 'ชาย' ? 0.6 : 1.2; 
      
      utterance.onstart = () => setIsSpeakingFallback(true);
      utterance.onend = () => setIsSpeakingFallback(false);
      utterance.onerror = () => setIsSpeakingFallback(false);
      
      let attempts = 0;
      
      const setVoiceAndSpeak = () => {
        let currentVoices = window.speechSynthesis.getVoices();
        
        if (currentVoices.length === 0 && attempts < 10) {
          attempts++;
          setTimeout(setVoiceAndSpeak, 200);
          return;
        }

        const isEnglishCase = patientCase?.diseaseName?.toLowerCase().includes('covid') || patientCase?.patientName?.includes('Sarah');
        utterance.lang = isEnglishCase ? 'en-US' : 'th-TH';

        if (currentVoices.length > 0) {
          let selectedVoice = null;
          
          if (isEnglishCase) {
            // Priority: Premium female voices
            selectedVoice = currentVoices.find(v => 
              (v.lang.includes('en') && (v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Tessa'))) ||
              v.name.includes('Google US English') ||
              v.name.includes('Google UK English Female')
            );
            
            // Fallback: Any female English voice
            if (!selectedVoice) {
              selectedVoice = currentVoices.find(v => v.lang.includes('en') && v.name.toLowerCase().includes('female'));
            }

            // Absolute Fallback: Any English voice (Safari often defaults to Thai if voice object is not explicitly set)
            if (!selectedVoice) {
              selectedVoice = currentVoices.find(v => v.lang.includes('en'));
            }
            
            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
          } else {
            // For Thai, we can try to find a Thai voice or just let the OS handle it
            selectedVoice = currentVoices.find(v => v.lang.includes('th') || v.name.includes('Kanya') || v.name.includes('Nattasha'));
            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
          }
        }

        window.speechSynthesis.speak(utterance);
      };

      setVoiceAndSpeak();
    }
  };

  const generateAIResponse = async (studentText: string, currentMessages: any[]) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        console.warn("VITE_GEMINI_API_KEY is missing");
        setAlertMessage("คำเตือน: ยังไม่ได้ตั้งค่า VITE_GEMINI_API_KEY ระบบจะใช้คำตอบแบบสุ่ม (Rule-based) แทน");
        fallbackRuleBasedResponse(studentText);
        return;
      }

    try {
      const isEnglishCase = patientCase?.patientName === 'Mrs. Sarah Connor';
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
        5. ตอบสั้นๆ กระชับ 1-3 ประโยค ${isEnglishCase ? 'เป็นภาษาอังกฤษเท่านั้น (English Only)' : 'เป็นภาษาไทยพูดธรรมชาติ'}
        6. [กฎเหล็ก Anti-Spoil]: ถ้าหมอพูดแนวๆ ว่า "ไม่รู้", "ยอมแพ้", หรือ "บอกมาเถอะ" ห้ามใจอ่อนและห้ามเฉลยชื่อโรคเด็ดขาด! ให้ตอบกลับไปในเชิงให้กำลังใจและใบ้ให้คิดต่อ
        7. "ห้ามใช้สัญลักษณ์ Markdown เด็ดขาด" (เช่น ** * # // \n) ให้ตอบเป็นข้อความธรรมดา (Plain text) เท่านั้น
        8. "ต้องพูดในมุมมองของตัวเองเท่านั้น" ${isEnglishCase ? '(Use "I", "me", "my")' : '(ใช้คำแทนตัวเองเช่น ผม, หนู, ฉัน, ดิฉัน)'} ห้ามใช้คำว่า "คนไข้บอกว่า..." เด็ดขาด
        9. เวลาจะเรียกนักศึกษาแพทย์ ${isEnglishCase ? 'ให้เรียก "Doctor"' : 'ให้พิมพ์คำว่า "คุณหมอ" แบบเต็มคำ ห้ามพิมพ์คำว่า "หมอ" เฉยๆ'}
        10. ห้ามใช้ตัวย่อเด็ดขาด ${isEnglishCase ? '' : '(เช่น พิมพ์ "โรงพยาบาล" แทน "รพ.", "เซนติเมตร" แทน "ซม.")'}
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
      setAlertMessage(`ระบบ AI ทำงานหนักเกินไปหรือเกิดข้อผิดพลาด\n\n(ไม่ต้องกังวล ระบบจะสลับไปใช้ Rule-based ชั่วคราว)`);
      fallbackRuleBasedResponse(studentText);
    }
  };

  const fallbackRuleBasedResponse = (studentText: string) => {
    setTimeout(() => {
      const isEnglishCase = patientCase?.patientName === 'Mrs. Sarah Connor';
      const reply = isEnglishCase ? "I'm sorry Doctor, I feel a bit dizzy and can't think straight right now. (Fallback Response)" : "ขออภัยครับหมอ ตอนนี้ผมรู้สึกเบลอๆ นึกอะไรไม่ออกเลยครับ (Fallback Response)";
      setMessages(prev => [...prev, { sender: 'patient', text: reply, hasNoise: true }]);
      setIsProcessing(false);
      speakTextFallback(reply);
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
          const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
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
          const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
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
          addLogAction('hint', 'request', 'N/A', 'yenjai_hint');
        } catch (e) {
          setDdxErrorHint("เกือบถูกแล้วค่ะคุณหมอ! ลองพิจารณาอาการหลักของคนไข้ประกอบอีกครั้งนะคะ");
          addLogAction('hint', 'request', 'N/A', 'yenjai_hint');
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
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
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
      addLogAction('History Taking', 'Omitted symptom onset time', 'Missed critical temporal profiling criteria', 'Review Slide Section: Timeline & Evolution of Symptoms');
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
    <div className="bg-background text-on-background h-screen h-[100dvh] overflow-hidden flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="bg-primary text-on-primary text-center h-9 px-4 font-label-sm tracking-wide flex items-center justify-center gap-2 relative z-20 shrink-0">
        <span className="material-symbols-rounded text-[16px] flex-shrink-0">shield</span>
        <span>Formative Sandbox: This activity is for diagnostic learning and skills development. Results are confidential.</span>
      </div>
      
      {/* TopAppBar */}
      <header className="bg-surface-container-lowest w-full top-0 border-b border-outline-variant flex justify-between items-center px-3 md:px-5 lg:px-6 py-2.5 lg:py-4 z-10 shadow-xs">
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={onBack} className="p-1.5 lg:p-2 hover:bg-surface-container-low rounded-full transition text-on-surface-variant hover:text-primary flex-shrink-0" title="Back">
            <span className="material-symbols-rounded text-[20px] lg:text-[24px]">arrow_back</span>
          </button>
          <div className="bg-secondary-container p-1.5 lg:p-2 rounded-full hidden sm:block">
            <span className="material-symbols-rounded text-secondary text-[18px] lg:text-[20px]">stethoscope</span>
          </div>
          <h1 className="text-base md:text-lg lg:text-2xl font-bold text-on-surface hidden sm:block">{t('scenes.history.title')}</h1>
          <h1 className="text-base font-bold text-on-surface sm:hidden">{t('scenes.history.title')}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {onToggleScratchpad && (
            <button 
              onClick={onToggleScratchpad}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold bg-surface-container-low hover:bg-surface-container text-on-surface-variant border border-outline-variant transition-colors shadow-2xs"
              title="ซ่อน/แสดงกระดาษทด"
            >
              <span className="material-symbols-rounded text-[18px]">edit_note</span>
              <span>{isScratchpadOpen ? 'ซ่อนกระดาษทด' : 'แสดงกระดาษทด'}</span>
            </button>
          )}
          <button 
            onClick={startTutorial}
            className="text-xs lg:text-sm font-semibold text-on-surface-variant hover:text-primary bg-surface-container-low hover:bg-surface-container px-3 py-1.5 lg:px-4 lg:py-2 rounded-full transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-rounded text-[16px] lg:text-[18px]">help</span> <span className="hidden sm:inline">Tutorial</span>
          </button>
          <div id="tour-timer" className={`flex items-center gap-1.5 px-3 py-1 lg:px-4 lg:py-2 rounded-full font-mono text-sm md:text-base lg:text-lg font-bold transition-colors border ${
            timeLeft < 120 
              ? 'bg-error-container text-on-error-container border-error animate-pulse' 
              : 'bg-surface-container-low text-on-surface border-outline-variant'
          }`}>
            <span className="material-symbols-rounded text-[18px] lg:text-[20px]">timer</span>
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Patient Profile Sidebar */}
        <aside className="w-full md:w-72 lg:w-80 bg-surface-container-lowest border-b md:border-b-0 md:border-r border-outline-variant flex flex-row md:flex-col shadow-xs z-0 shrink-0 overflow-y-auto">
          <div id="tour-avatar" className="w-24 md:w-36 lg:w-full h-24 md:h-36 lg:h-64 my-3 lg:my-0 mx-auto lg:mx-0 relative flex-shrink-0 rounded-full lg:rounded-none border-2 lg:border-0 lg:border-b border-outline-variant overflow-hidden bg-surface-container-low flex items-center justify-center shadow-sm">
            <PatientAvatar3D audioElement={currentAudio} isSpeakingFallback={isSpeakingFallback} patientCase={patientCase} />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 lg:bottom-4 lg:left-4 lg:translate-x-0 bg-surface-container-lowest/90 text-on-surface text-[10px] md:text-xs lg:text-sm font-semibold px-2.5 py-0.5 lg:px-3 lg:py-1.5 rounded-full shadow-xs border border-outline-variant hidden md:block whitespace-nowrap">
              AI Patient: {patientCase?.patientName}
            </div>
          </div>

          <div className="flex-1 flex flex-col p-3 md:p-4 lg:p-6 justify-start">
            <div id="tour-cc" className="bg-primary-container/30 border border-primary-container rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-6 relative overflow-hidden text-center mb-3 lg:mb-4 shadow-2xs">
              <h3 className="text-[10px] md:text-xs lg:text-sm font-bold text-primary uppercase tracking-wider mb-1 lg:mb-2">Chief Complaint</h3>
              <p className="font-semibold text-xs md:text-sm lg:text-base text-on-surface leading-snug">"{patientCase?.chiefComplaint}"</p>
            </div>

            {patientCase?.vitals && (
              <div id="tour-vitals" className="bg-surface-container-lowest border border-outline-variant rounded-xl lg:rounded-2xl p-3 md:p-4 lg:p-5 shadow-2xs relative overflow-hidden hidden md:block">
                <div className="flex items-center gap-2 mb-2 lg:mb-4">
                  <div className="w-2 h-2 rounded-full bg-error animate-pulse"></div>
                  <h3 className="text-xs lg:text-sm font-bold text-on-surface-variant uppercase tracking-wider">Vital Signs</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-2 lg:gap-y-3 gap-x-3 lg:gap-x-4 text-xs lg:text-sm font-body-md">
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-medium">BP</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.bp} <span className="text-[9px] lg:text-[10px] text-outline font-normal">mmHg</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-medium">HR</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.hr} <span className="text-[9px] lg:text-[10px] text-outline font-normal">bpm</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-medium">RR</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.rr} <span className="text-[9px] lg:text-[10px] text-outline font-normal">/min</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-medium">Temp</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.temp} <span className="text-[9px] lg:text-[10px] text-outline font-normal">°C</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-medium">SpO2</span>
                    <span className="font-bold text-on-surface">{patientCase.vitals.spo2} <span className="text-[9px] lg:text-[10px] text-outline font-normal">%</span></span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/50 pb-1">
                    <span className="text-on-surface-variant font-medium">Wt/Ht</span>
                    <span className="font-bold text-on-surface text-[10px] lg:text-xs whitespace-nowrap">{patientCase.vitals.weight}kg / {patientCase.vitals.height}cm</span>
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
                  disabled={isProcessing || isMicStarting}
                  className={`relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full transition-all duration-300 shadow-md ${
                    isMicStarting
                      ? 'bg-tertiary text-on-tertiary animate-pulse'
                      : isRecording 
                      ? 'bg-error text-on-error scale-110' 
                      : isProcessing
                      ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
                      : 'bg-primary text-on-primary hover:bg-primary-fixed-variant hover:-translate-y-1'
                  }`}
                >
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-error/50 animate-ping"></div>
                  )}
                  {isMicStarting && (
                    <div className="absolute inset-0 rounded-full border-4 border-tertiary-container/50 animate-spin border-t-tertiary"></div>
                  )}
                  <span key={isMicStarting ? 'start' : isRecording ? 'rec' : isProcessing ? 'proc' : 'idle'} className="material-symbols-rounded text-[32px]">{isMicStarting ? 'hourglass_empty' : isRecording ? 'mic' : isProcessing ? 'mic_off' : 'mic'}</span>
                </button>
              </div>

              <div id="tour-next" className="flex-1 flex justify-end md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
                <button 
                  onClick={() => setShowDDxGate(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-colors border border-secondary-fixed-dim rounded-full font-label-md shadow-sm text-[10px] md:text-sm"
                >
                  {t('scenes.history.end_consult')} <span className="material-symbols-rounded text-[18px] hidden sm:block">arrow_forward</span>
                </button>
              </div>

            </div>

            <p key={isMicStarting ? 'start' : isRecording ? 'rec' : 'idle'} className={`font-label-sm transition-colors text-center mt-2 ${isMicStarting ? 'text-tertiary' : isRecording ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
              {isMicStarting ? 'กำลังเตรียมไมโครโฟน... โปรดรอสัญญาณเสียง "ติ๊ด"' : isRecording ? 'กำลังฟัง... (พูดได้เลย)' : 'Tap the microphone icon to speak'}
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
          forceSubmit={timeLeft === 0}
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

      {alertMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-scrim/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <span className="material-symbols-rounded text-error text-[48px] mb-4 block mx-auto">error</span>
            <p className="font-body-md text-on-surface mb-6 whitespace-pre-line">{alertMessage}</p>
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full py-3 bg-surface-variant hover:bg-surface-container-highest text-on-surface-variant rounded-full font-label-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hidden audio element for unlocking iOS Web Audio API */}
      <audio ref={audioRef} playsInline className="hidden" />
    </div>
  );
};

export default HistoryTakingScene;
