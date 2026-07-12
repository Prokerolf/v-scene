import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, Mic, MicOff } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface YenjaiChatWidgetProps {
  patientCase?: any;
  contextMessages?: any[];
}

const YenjaiChatWidget: React.FC<YenjaiChatWidgetProps> = ({ patientCase, contextMessages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'yenjai' | 'student', text: string}[]>(() => {
    const saved = sessionStorage.getItem(`yenjai_chat_${patientCase?.id || 'default'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { sender: 'yenjai', text: 'สวัสดีค่ะคุณหมอ! น้องเย็นใจพร้อมเป็นผู้ช่วยให้คำปรึกษาแล้วค่ะ มีอะไรให้ช่วยบอกได้เลยนะคะ 💖' }
    ];
  });

  useEffect(() => {
    sessionStorage.setItem(`yenjai_chat_${patientCase?.id || 'default'}`, JSON.stringify(messages));
  }, [messages, patientCase?.id]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'th-TH';

      recognitionRef.current.onresult = (event: any) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newTranscript += event.results[i][0].transcript + ' ';
        }
        setInputValue(prev => (prev ? prev + ' ' : '') + newTranscript.trim());
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการพิมพ์ด้วยเสียงค่ะ (แนะนำให้ใช้ Chrome)');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { sender: 'student', text: userText }]);
    setIsProcessing(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'yenjai', text: 'ขออภัยค่ะ ระบบยังไม่ได้ตั้งค่า VITE_GEMINI_API_KEY ค่ะ 😅' }]);
        setIsProcessing(false);
      }, 1000);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const contextChat = contextMessages 
        ? contextMessages.filter(m => m.sender !== 'system').map(m => `${m.sender === 'student' ? 'หมอ' : 'คนไข้'}: ${m.text}`).join('\n')
        : 'ยังไม่มีข้อมูลการซักประวัติ';

      const yenjaiHistory = messages
        .filter(m => m.text.trim())
        .slice(-6) // Keep last 6 messages to avoid token bloat
        .map(m => `${m.sender === 'student' ? 'หมอ' : 'น้องเย็นใจ'}: ${m.text}`)
        .join('\n');

      const prompt = `
        คุณคือ "น้องเย็นใจ" ผู้ช่วย AI สาวน้อยน่ารัก สดใส สุภาพ อ่อนโยน และคอยให้กำลังใจนักศึกษาแพทย์เสมอ
        ตอนนี้นักศึกษาแพทย์กำลังดูแลคนไข้ชื่อ: ${patientCase?.patientName || 'ไม่ระบุ'}
        โรคเป้าหมายที่ต้องวินิจฉัยคือ: ${patientCase?.diseaseName || 'ไม่ระบุ'}
        อาการสำคัญ: ${patientCase?.chiefComplaint || 'ไม่ระบุ'}
        
        ประวัติการซักประวัติกับคนไข้ที่ผ่านมา:
        ${contextChat}

        ประวัติการคุยระหว่างหมอกับน้องเย็นใจก่อนหน้านี้:
        ${yenjaiHistory || 'เพิ่งเริ่มคุยกัน'}

        คำถามล่าสุดจากนักศึกษาแพทย์: "${userText}"

        กฎเหล็กการตอบ (Yenjai Strict Tone):
        1. แทนตัวเองว่า "น้องเย็นใจ" และลงท้ายด้วย "ค่ะ/นะคะ" เสมอ
        2. "ตอบฟันธงทันทีในประโยคแรกว่าถูกหรือผิด" (เช่น "ใช่เลยค่ะ", "ยังไม่ใช่นะคะ")
        3. "ให้เนื้อหาเน้นๆ สั้น กระชับสุดๆ" ความยาวรวมทั้งหมดห้ามเกิน 4 บรรทัด
        4. ไม่ต้องเกริ่นนำหรือให้กำลังใจเยิ่นเย้อ เข้าประเด็นทันที
        5. อย่าเฉลยคำตอบตรงๆ ให้ใช้วิธีไกด์เนื้อหาทางคลินิกให้คิดต่อ
        6. ห้ามด่า ห้ามใช้คำหยาบ
        7. "ห้ามใช้สัญลักษณ์ Markdown เด็ดขาด" (เช่น ** * # // \\n) ให้ตอบเป็นข้อความธรรมดาเท่านั้น
        8. "ห้ามพูดว่า 'คนไข้บอกว่า...'" ให้ถือว่าคุณคือผู้ช่วยที่กำลังแนะนำคุณหมอโดยตรง
      `;

      const result = await model.generateContent(prompt);
      const reply = result.response.text().trim();
      
      setMessages(prev => [...prev, { sender: 'yenjai', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'yenjai', text: 'ขออภัยค่ะ สมองกลน้องเย็นใจขัดข้องชั่วคราว ลองถามใหม่อีกครั้งนะคะ 🥺' }]);
    }
    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div id="tour-yenjai" className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-body-md">
      {isOpen && (
        <div className="bg-surface-container-lowest w-80 sm:w-96 max-h-[80vh] sm:max-h-[600px] h-[500px] rounded-3xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary-container border-b border-primary-fixed-dim text-on-primary-container p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center -ml-2 drop-shadow-sm">
                <img src="/yenjai2.png" alt="Yenjai" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold font-headline-md text-base">น้องเย็นใจ (ผู้ช่วย AI)</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-primary-container hover:bg-primary/10 p-1 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 bg-surface overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'student' 
                    ? 'bg-secondary text-on-secondary rounded-tr-sm' 
                    : 'bg-surface-container-lowest border border-outline-variant text-on-surface rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-surface-container-lowest border border-outline-variant p-3 rounded-2xl rounded-tl-sm text-sm text-on-surface-variant shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> น้องเย็นใจกำลังคิด...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-surface-container border-t border-outline-variant flex items-center gap-2 relative">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                isListening 
                  ? 'bg-error text-on-error animate-pulse' 
                  : 'bg-surface-container-highest text-on-surface hover:bg-surface-variant'
              }`}
              title={isListening ? 'กำลังฟัง...' : 'พูดเพื่อพิมพ์'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'กำลังฟังคุณหมอพูด...' : 'ปรึกษาน้องเย็นใจ...'}
              className="flex-1 bg-surface-container-highest border-none rounded-full px-4 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none placeholder:text-outline"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isProcessing || (!inputValue.trim() && !isListening)}
              className="bg-primary text-on-primary p-2 rounded-full hover:bg-primary-fixed-variant transition disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center transition-all hover:scale-105 animate-bounce-slow"
        >
          <div className="bg-primary text-on-primary pl-6 py-3 rounded-l-full rounded-r-3xl shadow-lg pr-24 flex flex-col items-start border border-primary-fixed-dim">
            <span className="font-black italic text-base leading-none tracking-wider text-on-primary drop-shadow-sm">LIVE CHAT</span>
            <span className="text-[10px] font-medium mt-0.5 text-on-primary opacity-90">คุยกับน้องเย็นใจ</span>
          </div>
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2">
            <div className="w-24 h-24 flex items-center justify-center group-hover:-rotate-6 transition-transform drop-shadow-lg">
              <img 
                src="/yenjai2.png" 
                alt="Yenjai Avatar" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default YenjaiChatWidget;
