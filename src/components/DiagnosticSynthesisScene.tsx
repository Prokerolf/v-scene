import React, { useState } from 'react';
import { Search, BrainCircuit, ChevronRight, ShieldCheck, AlertCircle, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import YenjaiChatWidget from './YenjaiChatWidget';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { searchDiseases, COMPREHENSIVE_DISEASES } from '../data/diseases';

interface DiagnosticSynthesisSceneProps {
  activeCase: any;
  onFinish: (finalDx: string, reason: string) => void;
  addLogAction: (dim: string, act: string, mis: string, tag: string) => void;
  diagnosticInput: string;
  setDiagnosticInput: (v: string) => void;
  submittedDDx?: string | string[];
}

const DiagnosticSynthesisScene = ({ 
  activeCase, 
  onFinish, 
  addLogAction, 
  diagnosticInput, 
  setDiagnosticInput,
  submittedDDx 
}: DiagnosticSynthesisSceneProps) => {
  const inputValue = diagnosticInput;
  const setInputValue = setDiagnosticInput;
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [yenjaiHint, setYenjaiHint] = useState<string | null>(null);
  const [localError, setLocalError] = useState(false);
  const [dxFeedbackPopup, setDxFeedbackPopup] = useState<{status: 'success' | 'fail', message: string, dx: string, reason: string} | null>(null);
  const [reason, setReason] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Parse user's submitted DDx list from earlier stage
  const userDdxList: string[] = (() => {
    if (!submittedDDx) return [];
    if (Array.isArray(submittedDDx)) return submittedDDx.filter(Boolean);
    if (typeof submittedDDx === 'string') {
      return submittedDDx.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  })();

  // Keywords to validate correctness of user's submitted DDx
  const caseKeywords: string[] = [
    ...(activeCase?.finalDiagnosisKeywords || []),
    activeCase?.diseaseName,
    ...(activeCase?.ddxKeywords || [])
  ].filter(Boolean);

  // Check if participant gave at least ONE valid/correct DDx in their early submission
  const hasValidUserDDx = userDdxList.some(userDx => {
    const lower = userDx.toLowerCase();
    return caseKeywords.some(kw => lower.includes(kw.toLowerCase()) || kw.toLowerCase().includes(lower));
  });

  // System fallback DDx options (used when user DDx was incorrect or empty)
  const systemDdxOptions: string[] = (() => {
    const base = [
      activeCase?.diseaseName,
      ...(activeCase?.ddxKeywords || []),
    ].filter(Boolean);
    
    const defaultList = [
      'Pulmonary Tuberculosis (วัณโรคปอด)',
      'Community-Acquired Pneumonia (ปอดอักเสบชุมชน)',
      'COPD (โรคปอดอุดกั้นเรื้อรัง)',
      'Lung Cancer (มะเร็งปอด)',
      'Asthma (โรคหอบหืด)'
    ];
    const merged = Array.from(new Set([...base, ...defaultList]));
    return merged.slice(0, 5);
  })();

  // Final options selection: User's submitted DDx if valid, otherwise System default DDx options
  const displayOptions = (hasValidUserDDx && userDdxList.length > 0)
    ? userDdxList
    : systemDdxOptions;

  const filteredSuggestions = inputValue.trim().length >= 1
    ? searchDiseases(inputValue)
    : [];

  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'ต่อไป ➔',
      prevBtnText: '⬅ ก่อนหน้า',
      doneBtnText: 'เข้าใจแล้ว!',
      steps: [
        { element: '#tour-dx-options', popover: { title: 'ตัวเลือกการวินิจฉัย', description: 'เลือกจากรายการ DDx ที่ผ่านการคัดกรอง หรือกดเลือกโดยตรงได้เลยครับ', side: "bottom", align: 'start' }},
        { element: '#tour-dx-input', popover: { title: 'กรอกผลการวินิจฉัย', description: 'หรือพิมพ์ระบุชื่อโรคลงในช่องนี้ได้ครับ', side: "bottom", align: 'start' }},
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
          const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
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
          const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
          
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
          addLogAction('hint', 'request', 'N/A', 'yenjai_hint');
        } catch (e) {
          setYenjaiHint("เข้าใกล้ความจริงแล้วค่ะคุณหมอ! ลองพิจารณาผลการตรวจร่างกายและแล็บประกอบกันดูนะคะ");
          addLogAction('hint', 'request', 'N/A', 'yenjai_hint');
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
        ? `🎉 ยอดเยี่ยมมากครับคุณหมอ! \n\n🎯 การวินิจฉัยโรค: ${activeCase?.diseaseName} นั้นถูกต้องแม่นยำ\n\n💡 สาเหตุและกลไก: ${activeCase?.diagnosisExplanation || 'พยาธิสภาพสอดคล้องกับอาการแสดงของผู้ป่วยรายนี้'}${correctSpellingFeedback}`
        : `คุณตอบผิดครบ 3 ครั้ง ระบบขอเฉลยเพื่อให้คุณไปต่อ\n\n🎯 การวินิจฉัยที่ถูกต้องคือ: ${activeCase?.diseaseName}\n\n💡 สาเหตุและกลไก: ${activeCase?.diagnosisExplanation || 'พยาธิสภาพสอดคล้องกับอาการแสดงของผู้ป่วยรายนี้'}`,
      dx: inputValue,
      reason: reason
    });
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] overflow-hidden bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="bg-primary text-on-primary text-center h-9 px-4 font-label-sm tracking-wide flex items-center justify-center gap-2 shadow-sm relative z-20 shrink-0">
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
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant p-6 md:p-8">
          <h2 className="font-headline-md text-2xl font-bold text-on-surface mb-2">Final Diagnosis</h2>
          <p className="font-body-md text-on-surface-variant mb-6">Based on the history, physical exam, and lab findings, select or enter your final diagnosis for this patient.</p>

          {/* Quick Diagnosis Options Section */}
          <div id="tour-dx-options" className="mb-6 p-5 rounded-2xl bg-surface-container-low border border-outline-variant shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-rounded text-primary text-[20px]">recommend</span>
                <h3 className="font-bold text-sm">
                  {hasValidUserDDx 
                    ? 'ตัวเลือกโรคจากการวินิจฉัยของคุณ (Your Submitted DDx):' 
                    : 'ตัวเลือกโรคจากระบบ (System Recommended DDx):'}
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                hasValidUserDDx 
                  ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
              }`}>
                {hasValidUserDDx ? '✓ อาสาสมัครระบุ DDx ถูกต้อง' : '⚠️ ตัวเลือกจากระบบ'}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant mb-3">
              {hasValidUserDDx 
                ? 'คุณระบุ DDx ที่ถูกต้องในขั้นตอนแรก ระบบนำรายการ DDx ของคุณมาให้เลือกเป็น Final Diagnosis:' 
                : 'เนื่องจาก DDx ในขั้นตอนแรกยังไม่ครอบคลุม ระบบจึงนำรายการ DDx ที่เกี่ยวข้องมาให้คุณเลือก:'}
            </p>

            <div className="flex flex-wrap gap-2">
              {displayOptions.map((opt, idx) => {
                const isSelected = inputValue.trim().toLowerCase() === opt.trim().toLowerCase();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputValue(opt);
                      setLocalError(false);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border shadow-xs flex items-center gap-2 cursor-pointer ${
                      isSelected 
                        ? 'bg-primary text-on-primary border-primary ring-2 ring-primary/30 shadow-md scale-[1.02]' 
                        : 'bg-surface hover:bg-primary-container/40 text-on-surface border-outline-variant hover:border-primary/40'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <span className="material-symbols-rounded text-[16px]">check_circle</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div id="tour-dx-input" className="relative mb-6">
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
              หรือพิมพ์ระบุ/ค้นหาชื่อโรคเพิ่มเติม:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                <span className="material-symbols-rounded text-outline">search</span>
              </div>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="พิมพ์ชื่อโรค เช่น Malaria, Strongyloidiasis..." 
                className={`w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-2 ${localError ? 'border-error bg-error-container/20 text-on-error-container' : 'border-outline-variant text-on-surface'} focus:border-primary focus:ring-4 focus:ring-primary-container rounded-xl outline-none transition-all font-body-md font-medium text-sm`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { setShowSuggestions(false); handleSubmit(); }
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                autoComplete="off"
              />

              {/* Autocomplete dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-outline-variant/30">
                  {filteredSuggestions.map((item) => {
                    const fullText = `${item.nameEn} (${item.nameTh})`;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-primary-container/40 transition-colors flex items-center justify-between cursor-pointer"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setInputValue(fullText);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-primary">{item.nameEn}</span>
                            {item.abbreviation && (
                              <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-mono rounded font-bold">
                                {item.abbreviation}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-on-surface-variant">{item.nameTh}</span>
                        </div>
                        <span className="text-xs text-outline hover:text-primary">+ เลือก</span>
                      </button>
                    );
                  })}
                  {/* Free text option */}
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 cursor-pointer bg-slate-50"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="material-symbols-rounded text-blue-400 text-[18px]">edit</span>
                    <span className="text-sm text-slate-500">ใช้ "<strong className="text-slate-700">{inputValue}</strong>" ที่พิมพ์เอง</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {localError && (!inputValue.trim() || !reason.trim()) && (
            <p className="text-error text-sm font-label-md flex items-center gap-1 mb-4 animate-bounce">
              <span className="material-symbols-rounded text-[16px]">error</span> กรุณาเลือกหรือระบุการวินิจฉัย และใส่เหตุผลประกอบ
            </p>
          )}

          <div className="mb-6">
            <label className="font-label-md font-bold text-on-surface flex items-center gap-2 mb-2 text-sm">
              เหตุผลประกอบการวินิจฉัย (Clinical Reasoning) <span className="text-error">*</span>
            </label>
            <textarea 
              value={reason}
              onChange={(e) => { setReason(e.target.value); setLocalError(false); }}
              placeholder="รวบรวมประวัติ อาการแสดง และผล Lab เพื่อยืนยันการวินิจฉัยนี้..."
              className={`w-full h-24 p-4 bg-surface-container-low border-2 ${localError && !reason.trim() ? 'border-error bg-error-container/20 text-on-error-container' : 'border-outline-variant text-on-surface'} focus:border-primary focus:ring-4 focus:ring-primary-container rounded-xl outline-none transition-all font-body-md text-sm resize-none`}
            />
          </div>

          {yenjaiHint && (
            <div className="bg-secondary-container/30 border border-secondary border-dashed rounded-2xl p-5 mb-6 flex gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img src="/yenjai2.png" alt="Coach Yenjai" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <h4 className="font-headline-md font-bold text-on-secondary-container flex items-center gap-2">
                  โค้ช เย็นใจ (Coach Yenjai)
                  <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                    Attempts: {attempts}/3
                  </span>
                </h4>
                <p className="font-body-md text-on-surface mt-1 leading-relaxed whitespace-pre-wrap">{yenjaiHint}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-outline-variant">
            <button 
              id="tour-dx-confirm"
              onClick={handleSubmit}
              disabled={isProcessing}
              className={`bg-primary text-on-primary font-bold px-8 py-3.5 rounded-full shadow-md hover:bg-primary-fixed-variant transition-all flex items-center gap-2 text-sm cursor-pointer ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  ยืนยัน Final Diagnosis <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Feedback Popup Modal */}
      {dxFeedbackPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-outline-variant p-6 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              dxFeedbackPopup.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {dxFeedbackPopup.status === 'success' ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>
            
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              {dxFeedbackPopup.status === 'success' ? 'การวินิจฉัยถูกต้อง!' : 'สรุปผลการวินิจฉัย'}
            </h3>
            
            <div className="text-left bg-surface-container-low p-4 rounded-2xl mb-6 border border-outline-variant text-sm space-y-3">
              <p className="whitespace-pre-wrap font-body-md text-on-surface">{dxFeedbackPopup.message}</p>
            </div>

            <button
              onClick={() => {
                const dx = dxFeedbackPopup.dx;
                const rsn = dxFeedbackPopup.reason;
                setDxFeedbackPopup(null);
                onFinish(dx, rsn);
              }}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-full shadow-md hover:bg-primary-fixed-variant transition-all cursor-pointer"
            >
              ไปยังขั้นตอนถัดไป (Treatment Phase) ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticSynthesisScene;
