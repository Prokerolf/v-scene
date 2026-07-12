import React, { useState } from 'react';
import { Search, BrainCircuit, ChevronRight, ShieldCheck, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import YenjaiChatWidget from './YenjaiChatWidget';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const DiagnosticSynthesisScene = ({ activeCase, onFinish, addLogAction, diagnosticInput, setDiagnosticInput }: { activeCase: any, onFinish: (finalDx: string, reason: string) => void, addLogAction: (dim: string, act: string, mis: string, tag: string) => void, diagnosticInput: string, setDiagnosticInput: (v: string) => void }) => {
  const inputValue = diagnosticInput;
  const setInputValue = setDiagnosticInput;
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [yenjaiHint, setYenjaiHint] = useState<string | null>(null);
  const [localError, setLocalError] = useState(false);
  const [dxFeedbackPopup, setDxFeedbackPopup] = useState<{status: 'success' | 'fail', message: string, dx: string, reason: string} | null>(null);
  const [reason, setReason] = useState('');

  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'ต่อไป ➔',
      prevBtnText: '⬅ ก่อนหน้า',
      doneBtnText: 'เข้าใจแล้ว!',
      steps: [
        { element: '#tour-dx-input', popover: { title: 'กรอกผลการวินิจฉัย', description: 'พิมพ์ชื่อโรคที่คุณคิดว่าเป็น Final Diagnosis ลงในช่องนี้ได้เลยครับ', side: "bottom", align: 'start' }},
        { element: '#tour-dx-confirm', popover: { title: 'ยืนยันและไปต่อ', description: 'ถ้ามั่นใจแล้ว กดปุ่มนี้เพื่อส่งคำตอบ ถ้าระบุผิด น้องเย็นใจจะคอยให้คำใบ้ช่วยเหลือครับ', side: "top", align: 'end' }}
      ]
    });
    driverObj.drive();
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || !reason.trim()) {
      setLocalError(true);
      return;
    }
    setLocalError(false);
    setIsProcessing(true);
    setYenjaiHint(null);

    const submittedText = inputValue.toLowerCase();
    const keywords = activeCase?.finalDiagnosisKeywords || [];
    
    // Check if any keyword matches
    let isCorrect = keywords.some((kw: string) => submittedText.includes(kw.toLowerCase()));
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
            นักศึกษาส่งคำตอบ Final Diagnosis มาว่า: "${submittedText}"
            คำตอบที่ถูกต้องคือ: ${activeCase?.diseaseName}
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
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts < 3) {
        if (newAttempts === 1) {
          setYenjaiHint("ยังไม่ถูกต้องนะคะคุณหมอ ลองพิจารณาทบทวนข้อมูลและผลตรวจทั้งหมดดูอีกครั้งค่ะ ✌️");
          setIsProcessing(false);
          return;
        }

        // Call Yenjai AI
        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          
          const prompt = `
            คุณคือ "เย็นใจ" ผู้ช่วย AI สาวน้อยน่ารัก สุภาพ อ่อนโยน
            นักศึกษาส่ง Final Diagnosis มาว่า: "${inputValue}"
            แต่คำตอบที่ถูกคือ: ${activeCase?.diseaseName} (Etiology: ${activeCase?.etiology}, Localization: ${activeCase?.localization})
            
            กฎเหล็กการตอบ (Yenjai Strict Tone):
            - "บอกตรงๆ ทันทีในประโยคแรกว่าคำตอบยังไม่ถูกต้อง"
            - "เนื้อหาคำใบ้ต้องสั้น ตรงประเด็นสุดๆ ห้ามเกิน 4 บรรทัด" ตัดคำชมและน้ำทิ้งทั้งหมด
            - ห้ามเฉลยชื่อโรคตรงๆ ให้ไกด์พยาธิสภาพ (Etiology) หรือตำแหน่งรอยโรค (Localization)
            - "ห้ามใช้สัญลักษณ์ Markdown เด็ดขาด" (เช่น ** * # // \\n) ให้ตอบเป็นข้อความธรรมดาเท่านั้น
            - ตัวอย่าง: "ยังไม่ถูกต้องนะคะ! จากผลแล็บ ลองทบทวนดูอีกนิดว่าน่าจะเป็นโรคหลอดเลือดสมองตีบหรือแตกคะ?"
          `;
          const result = await model.generateContent(prompt);
          setYenjaiHint(result.response.text().trim());
        } catch (e) {
          setYenjaiHint("เข้าใกล้ความจริงแล้วค่ะคุณหมอ! ลองพิจารณาผลการตรวจร่างกายและแล็บประกอบกันดูนะคะ");
        }
        setIsProcessing(false);
        return; // Block Progression
      } else {
        // Allow progression after 3 failed attempts
        addLogAction('Diagnosis', 'Final Dx Failed 3 Attempts', `Submitted: ${inputValue}`, 'Review Slide Section: Final Diagnosis & Localization');
        finalStatus = 'fail';
      }
    }

    setIsProcessing(false);
        setDxFeedbackPopup({
          status: finalStatus,
          message: finalStatus === 'success'
            ? `🎉 ยอดเยี่ยมมากครับคุณหมอ! \n\n🎯 การวินิจฉัยโรค: ${activeCase?.diseaseName} นั้นถูกต้องแม่นยำ\n\n💡 สาเหตุและกลไก: ${activeCase?.pathophysiology || 'พยาธิสภาพสอดคล้องกับอาการแสดงของผู้ป่วยรายนี้'}${correctSpellingFeedback}`
            : `คุณตอบผิดครบ 3 ครั้ง ระบบขอเฉลยเพื่อให้คุณไปต่อ\n\n🎯 การวินิจฉัยที่ถูกต้องคือ: ${activeCase?.diseaseName}\n\n💡 สาเหตุและกลไก: ${activeCase?.pathophysiology || 'พยาธิสภาพสอดคล้องกับอาการแสดงของผู้ป่วยรายนี้'}`,
          dx: inputValue,
          reason: reason
        });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="bg-primary text-on-primary text-center py-2 px-4 font-label-sm tracking-wide flex items-center justify-center gap-2 shadow-sm relative z-20">
        <span className="material-symbols-rounded text-[16px] flex-shrink-0">shield</span>
        <span>Formative Sandbox: This activity is for diagnostic learning and skills development.</span>
      </div>
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-secondary-container p-2 rounded-full hidden sm:block">
            <span className="material-symbols-rounded text-[20px] text-secondary">psychology</span>
          </div>
          <div>
            <h1 className="font-headline-md font-bold text-lg text-on-surface tracking-wide">Phase 3: Diagnostic Synthesis</h1>
            <p className="font-label-sm text-secondary">Synthesize clinical findings into a Final Diagnosis</p>
          </div>
        </div>
        <button 
          onClick={startTutorial}
          className="font-label-sm font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container px-4 py-2 rounded-full transition-colors flex items-center gap-2 shadow-sm border border-outline-variant"
        >
          <span className="material-symbols-rounded text-[16px]">help</span> <span className="hidden sm:inline">Tutorial</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col gap-6 relative">
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant p-8">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-2">Final Diagnosis</h2>
          <p className="font-body-md text-on-surface-variant mb-8">Based on the history and physical exam, what is your final diagnosis for this patient?</p>

          <div id="tour-dx-input" className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-rounded text-outline">search</span>
            </div>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your final diagnosis here..." 
              className={`w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 ${localError ? 'border-error bg-error-container/20 text-on-error-container' : 'border-outline-variant text-on-surface'} focus:border-primary focus:ring-4 focus:ring-primary-container rounded-xl outline-none transition-all font-body-md font-medium`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          {localError && (!inputValue.trim() || !reason.trim()) && (
            <p className="text-error text-sm font-label-md flex items-center gap-1 mb-4 animate-bounce">
              <span className="material-symbols-rounded text-[16px]">error</span> Please enter a diagnosis and clinical reasoning.
            </p>
          )}

          <div className="mb-6">
            <label className="font-label-md font-bold text-on-surface flex items-center gap-2 mb-2">
              เหตุผลประกอบการวินิจฉัย (Clinical Reasoning) <span className="text-error">*</span>
            </label>
            <textarea 
              value={reason}
              onChange={(e) => { setReason(e.target.value); setLocalError(false); }}
              placeholder="รวบรวมประวัติ อาการแสดง และผล Lab เพื่อยืนยันการวินิจฉัยนี้..."
              className={`w-full h-24 p-4 bg-surface-container-low border-2 ${localError && !reason.trim() ? 'border-error bg-error-container/20 text-on-error-container' : 'border-outline-variant text-on-surface'} focus:border-primary focus:ring-4 focus:ring-primary-container rounded-xl outline-none transition-all font-body-md resize-none`}
            />
          </div>

          {yenjaiHint && (
            <div className="bg-secondary-container/30 border border-secondary border-dashed rounded-2xl p-5 mb-6 flex gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img src="/yenjai2.png" alt="Coach Yenjai" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <h4 className="font-label-md font-bold text-secondary flex items-center gap-2">
                  Coach Yenjai <span className="bg-secondary text-on-secondary text-[10px] px-2 py-0.5 rounded-full">AI Tutor</span>
                </h4>
                <p className="font-body-md text-on-surface mt-1 leading-relaxed">{yenjaiHint}</p>
                <p className="font-label-sm text-secondary/70 text-xs mt-2">Attempts: {attempts}/3</p>
              </div>
            </div>
          )}

          <button 
            id="tour-dx-confirm"
            onClick={handleSubmit}
            disabled={isProcessing || !inputValue.trim() || !reason.trim()}
            className={`w-full py-4 rounded-full font-label-md text-lg transition-all shadow-md flex items-center justify-center gap-2 ${
              inputValue.trim() && reason.trim()
                ? 'bg-primary hover:bg-primary-fixed-variant text-on-primary hover:shadow-lg hover:-translate-y-0.5' 
                : 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-50'
            } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isProcessing ? (
              <><span className="material-symbols-rounded animate-spin text-[20px]">sync</span> Verifying...</>
            ) : (
              <>Confirm Diagnosis & Proceed <span className="material-symbols-rounded text-[20px]">arrow_forward</span></>
            )}
          </button>
        </div>
      </main>
      <YenjaiChatWidget patientCase={activeCase} />

      {dxFeedbackPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-scrim/80 backdrop-blur-md">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300 border border-outline-variant">
            {dxFeedbackPopup.status === 'success' ? (
              <span className="material-symbols-rounded text-[80px] text-primary mx-auto mb-6 block">check_circle</span>
            ) : (
              <img src="/yenjai2.png?v=2" alt="Yenjai Chicken" className="w-24 h-24 mx-auto mb-6 object-contain rounded-full border-4 border-error bg-surface-container-highest" />
            )}
            <h2 className={`font-headline-md text-2xl md:text-3xl font-bold mb-4 ${dxFeedbackPopup.status === 'success' ? 'text-primary' : 'text-error'}`}>
              {dxFeedbackPopup.status === 'success' ? 'Correct Diagnosis!' : 'System Feedback'}
            </h2>
            <div className="font-body-md text-on-surface-variant mb-8 text-left whitespace-pre-line text-[15px] bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              {dxFeedbackPopup.message}
            </div>
            <button
              onClick={() => {
                onFinish(dxFeedbackPopup.dx, dxFeedbackPopup.reason);
                setDxFeedbackPopup(null);
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

export default DiagnosticSynthesisScene;
