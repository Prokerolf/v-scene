import React, { useState } from 'react';
import { Search, FlaskConical, AlertTriangle, CheckCircle, ChevronRight, TestTube, Microscope, Activity, ShieldCheck, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import YenjaiChatWidget from './YenjaiChatWidget';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface LabOption {
  id: string;
  name: string;
  isGoldStandardFor?: string;
  category: string;
}

export const labOptions: LabOption[] = [
  { id: '1', name: 'CT Brain non-contrast', category: 'Imaging' },
  { id: '2', name: 'MRI Brain', category: 'Imaging' },
  { id: '3', name: 'Complete Blood Count (CBC)', category: 'Hematology', isGoldStandardFor: 'Basic infection screening' },
  { id: '4', name: 'Pulmonary Function Test (PFT) & Spirometry', category: 'Pulmonology', isGoldStandardFor: 'Restrictive/Obstructive lung defects' },
  { id: '5', name: 'BUN, Creatinine', category: 'Chemistry' },
  { id: '6', name: 'Electrolytes (Na, K, Cl, CO2)', category: 'Chemistry' },
  { id: '7', name: 'Chest X-ray (PA upright)', category: 'Imaging', isGoldStandardFor: 'Pulmonary infiltrates/effusion' },
  { id: '8', name: 'Lipid Profile', category: 'Chemistry' },
  { id: '9', name: 'Electrocardiogram (EKG 12 leads)', category: 'Cardiology' },
  { id: '10', name: 'Sputum Examination (AFB, Smear, Parasite)', category: 'Microbiology', isGoldStandardFor: 'Pulmonary TB and Parasites' },
  { id: '11', name: 'CT Chest with Contrast', category: 'Imaging' },
  { id: '12', name: 'SARS-CoV-2 RT-PCR', category: 'Microbiology', isGoldStandardFor: 'COVID-19 diagnosis' },
  { id: '13', name: 'Arterial Blood Gas (ABG)', category: 'Chemistry', isGoldStandardFor: 'Respiratory Failure Assessment' },
  { id: '14', name: 'C-reactive protein (CRP)', category: 'Chemistry' },
];

const LabOrderScene = ({ activeCase, addLogAction, onFinish, selectedLabs, setSelectedLabs }: { activeCase: any, addLogAction: (dim: string, act: string, mis: string, tag: string) => void, onFinish: (labs: string[], reason: string) => void, selectedLabs: string[], setSelectedLabs: (labs: string[]) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showIpeAlert, setShowIpeAlert] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [labAttempts, setLabAttempts] = useState(0);
  const [yenjaiHint, setYenjaiHint] = useState<string | null>(null);
  const [labFeedbackPopup, setLabFeedbackPopup] = useState<{status: 'success' | 'fail', message: string} | null>(null);
  const [confirmedCorrectLabs, setConfirmedCorrectLabs] = useState<string[]>([]);
  const [customLabInput, setCustomLabInput] = useState('');
  const [reason, setReason] = useState('');

  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'ต่อไป ➔',
      prevBtnText: '⬅ ก่อนหน้า',
      doneBtnText: 'เข้าใจแล้ว!',
      steps: [
        { element: '#tour-lab-rlu', popover: { title: 'กฎ Rational Lab Use (RLU)', description: 'ระบบจะให้คุณฝึกการเลือก Lab อย่างมีเหตุผล ไม่เลือกแบบหว่านแห (Shotgun) โดยให้เลือกเฉพาะ Gold Standard ที่ตรงกับโรคมากที่สุดครับ', side: "bottom", align: 'start' }},
        { element: '#tour-lab-search', popover: { title: 'ค้นหา Lab', description: 'พิมพ์ชื่อ Lab ที่ต้องการค้นหาได้ที่นี่เลยครับ', side: "bottom", align: 'start' }},
        { element: '#tour-lab-list', popover: { title: 'รายการ Lab', description: 'คลิกเพื่อเลือก Lab ที่ต้องการส่งตรวจ และสังเกตตัวที่อาจเป็น Gold Standard นะครับ', side: "top", align: 'start' }},
        { element: '#tour-lab-stats', popover: { title: 'จำนวนที่เลือก', description: 'คุณสามารถดูจำนวน Lab ที่เลือกไว้ตรงนี้ ถ้ายิ่งเลือกเยอะโดยไม่มีเหตุผลระวังจะโดนนักเทคนิคการแพทย์เตือนเอานะครับ!', side: "bottom", align: 'end' }},
        { element: '#tour-lab-confirm', popover: { title: 'ยืนยันการส่ง', description: 'เมื่อเลือกเสร็จแล้ว กดปุ่มนี้เพื่อส่ง Lab แล้วไปด่านต่อไปครับ', side: "top", align: 'end' }}
      ]
    });
    driverObj.drive();
  };

  const handleToggleLab = (id: string) => {
    let newSelected;
    if (selectedLabs.includes(id)) {
      newSelected = selectedLabs.filter(labId => labId !== id);
    } else {
      const maxAllowed = activeCase?.goldStandardLabs?.length || 0;
      if (maxAllowed > 0 && selectedLabs.length >= maxAllowed) {
        alert(`ข้อนี้สามารถเลือกส่ง Lab ได้สูงสุด ${maxAllowed} อย่างครับ เพื่อป้องกันการเดาสุ่ม`);
        return;
      }
      newSelected = [...selectedLabs, id];
    }
    
    setSelectedLabs(newSelected);

    // IPE Trigger Logic: If they select > 3 non-gold-standard (shotgun approach)
    const nonSpecificCount = newSelected.filter(lId => !labOptions.find(o => o.id === lId)?.isGoldStandardFor).length;
    if (nonSpecificCount >= 3 && !showIpeAlert) {
      setShowIpeAlert(true);
    } else if (nonSpecificCount < 3) {
      setShowIpeAlert(false);
    }
  };

  const handleConfirmLabs = async () => {
    setIsProcessing(true);
    setYenjaiHint(null);

    const requiredLabs = activeCase?.goldStandardLabs || [];
    const missingLabs = requiredLabs.filter((id: string) => !selectedLabs.includes(id));
    const correctPicks = selectedLabs.filter((id: string) => requiredLabs.includes(id));
    setConfirmedCorrectLabs(correctPicks);
    
    let finalStatus: 'success' | 'fail' = 'success';

    // Strict Check: Must have all gold standard labs
    if (missingLabs.length > 0) {
      const newAttempts = labAttempts + 1;
      setLabAttempts(newAttempts);

      if (newAttempts < 3) {
        if (newAttempts === 1) {
          setYenjaiHint(`คุณหมอเลือก Lab ถูกไปแล้ว ${correctPicks.length} รายการค่ะ แต่ยังขาดที่จำเป็นอีก ${missingLabs.length} รายการ ลองพิจารณาดูอีกทีนะคะ ✌️`);
          setIsProcessing(false);
          return;
        }

        // Call Yenjai AI
        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
          
          const missingLabNames = missingLabs.map((id: string) => labOptions.find(l => l.id === id)?.name).join(', ');
          
          const prompt = `
            คุณคือ "เย็นใจ" ผู้ช่วย AI สาวน้อยน่ารัก สุภาพ อ่อนโยน
            นักศึกษาส่ง Lab ขาดสิ่งสำคัญคือ: ${missingLabNames}
            สำหรับคนไข้โรค: ${activeCase?.diseaseName}
            ข้อมูลปัจจุบัน: นักศึกษาเลือกถูกแล้ว ${correctPicks.length} รายการ และขาดอีก ${missingLabs.length} รายการ
            
            กฎเหล็กการตอบ (Yenjai Strict Tone):
            - "ประโยคแรกต้องสรุปให้ชัดเจนว่าทำถูกกี่อัน ขาดกี่อัน" (เช่น "ตอนนี้คุณหมอเลือกถูกไปแล้ว ${correctPicks.length} รายการนะคะ แต่ยังขาด Lab สำคัญอีก ${missingLabs.length} ตัวค่ะ")
            - "เนื้อหาคำใบ้ต้องสั้น ตรงประเด็นสุดๆ ห้ามเกิน 4 บรรทัด" ตัดคำชมและน้ำทิ้งทั้งหมด
            - ห้ามเฉลยชื่อ Lab ตรงๆ ให้ใบ้ถึงระบบหรืออวัยวะที่ต้องตรวจเพิ่ม
            - "ห้ามใช้สัญลักษณ์ Markdown เด็ดขาด" (เช่น ** * # // \\n) ให้ตอบเป็นข้อความธรรมดาเท่านั้น
            - ตัวอย่าง: "คุณหมอเลือกถูกไปแล้ว ${correctPicks.length} รายการ แต่ยังขาดอีก ${missingLabs.length} ตัวค่ะ อย่าลืมส่งตรวจภาพถ่ายสมองเพื่อแยกภาวะเลือดออกด้วยนะคะ"
          `;
          const result = await model.generateContent(prompt);
          setYenjaiHint(result.response.text().trim());
          addLogAction('hint', 'request', 'N/A', 'yenjai_hint');
        } catch (e) {
          setYenjaiHint("พยายามได้ดีมากค่ะคุณหมอ! แต่ยังขาด Lab สำคัญบางตัว ลองทบทวนดูอีกนิดนะคะ");
          addLogAction('hint', 'request', 'N/A', 'yenjai_hint');
        }
        setIsProcessing(false);
        return; // Block Progression
      } else {
        // Allow progression after 3 failed attempts
        finalStatus = 'fail';
      }
    }

    if (activeCase?.tier === 'Low' && selectedLabs.includes('2') && !selectedLabs.includes('1')) {
      addLogAction('Lab Ordering', 'Ordered Immediate MRI', 'Premature imaging protocol for acute stroke', 'Review Slide Section: Acute Stroke Imaging Protocols (CT vs MRI)');
    }
    setIsProcessing(false);
    
    setLabFeedbackPopup({
      status: finalStatus,
      message: finalStatus === 'success'
        ? `🎉 เย่! ถูกต้องแล้วครับ\n\nยอดเยี่ยมมาก คุณสั่ง Lab ได้อย่างเหมาะสม\n\n💡 การส่งตรวจนี้ช่วยให้เราวินิจฉัยและรักษาได้แม่นยำยิ่งขึ้น`
        : `คุณตอบผิดครบ 3 ครั้ง ระบบขอเฉลย Lab ที่จำเป็นเพิ่มเติม\n\n🎯 Lab ที่ควรสั่ง: ${missingLabs.map((id: string) => labOptions.find(l => l.id === id)?.name).join(', ')}`
    });
  };

  const filteredLabs = labOptions.filter(lab => lab.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getIcon = (category: string) => {
    if (category === 'Imaging') return <span className="material-symbols-rounded text-[14px]">medical_services</span>;
    if (category === 'Cardiology') return <span className="material-symbols-rounded text-[14px]">monitor_heart</span>;
    return <span className="material-symbols-rounded text-[14px]">science</span>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="bg-primary text-on-primary text-center py-2 px-4 font-label-sm tracking-wide flex items-center justify-center gap-2 shadow-sm relative z-20">
        <span className="material-symbols-rounded text-[16px] flex-shrink-0">shield</span>
        <span>Formative Sandbox: This activity is for diagnostic learning and skills development.</span>
      </div>
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-tertiary-container p-2 rounded-full hidden sm:block">
            <span className="material-symbols-rounded text-[20px] text-tertiary">biotech</span>
          </div>
          <div>
            <h1 className="font-headline-md font-bold text-lg text-on-surface tracking-wide">Phase 2: Lab Investigations</h1>
            <p className="font-label-sm text-tertiary">Rational Lab Use (RLU) principles</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={startTutorial}
            className="font-label-sm font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container px-4 py-2 rounded-full transition-colors flex items-center gap-2 shadow-sm border border-outline-variant"
          >
            <span className="material-symbols-rounded text-[16px]">help</span> <span className="hidden sm:inline">Tutorial</span>
          </button>
          <div id="tour-lab-stats" className="bg-surface-container-high px-4 py-2 rounded-full font-label-sm font-bold text-on-surface border border-outline-variant">
            Selected: {selectedLabs.length}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6 relative">
        
        {/* RLU Philosophy Banner */}
        <div id="tour-lab-rlu" className="bg-tertiary-container/30 border border-tertiary-container rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <span className="material-symbols-rounded text-[28px] text-tertiary flex-shrink-0 mt-0.5">check_circle</span>
          <div>
            <h2 className="font-headline-md text-tertiary font-bold mb-2">Rational Lab Use (RLU) is Active</h2>
            <p className="font-body-md text-on-surface-variant">
              Focus on selecting <strong>Gold Standard</strong> investigations that align with your DDx. Avoid the "shotgun approach" of ordering unnecessary tests. (Prices are hidden to reduce cognitive load).
            </p>
          </div>
        </div>

        {/* Search */}
        <div id="tour-lab-search" className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-rounded text-outline">search</span>
          </div>
          <input 
            type="text" 
            placeholder="Search for lab investigations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-2 border-outline-variant focus:border-tertiary focus:ring-4 focus:ring-tertiary-container rounded-2xl outline-none transition-all font-body-md font-medium text-on-surface shadow-sm"
          />
        </div>

        {/* Lab Checklist */}
        <div id="tour-lab-list" className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="divide-y divide-outline-variant/50">
            {filteredLabs.map(lab => (
              <label 
                key={lab.id} 
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-3 sm:gap-0 cursor-pointer transition-colors hover:bg-surface-container-low ${confirmedCorrectLabs.includes(lab.id) ? 'bg-primary/10 border-2 border-primary shadow-sm' : selectedLabs.includes(lab.id) ? 'bg-tertiary-container/10' : ''}`}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={selectedLabs.includes(lab.id)}
                      onChange={() => handleToggleLab(lab.id)}
                      disabled={confirmedCorrectLabs.includes(lab.id)}
                      className={`peer appearance-none w-6 h-6 border-2 rounded-md transition-all ${confirmedCorrectLabs.includes(lab.id) ? 'bg-primary border-primary cursor-not-allowed opacity-80' : 'border-outline checked:bg-tertiary checked:border-tertiary cursor-pointer'}`}
                    />
                    <span className="material-symbols-rounded absolute text-[20px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-label-md text-base truncate transition-colors ${confirmedCorrectLabs.includes(lab.id) ? 'text-primary font-bold' : selectedLabs.includes(lab.id) ? 'text-tertiary font-bold' : 'text-on-surface font-semibold'}`}>
                      {lab.name} {confirmedCorrectLabs.includes(lab.id) && <span className="text-primary text-sm ml-2 bg-primary/20 px-2 py-0.5 rounded-full">✅ ถูกต้องแล้ว</span>}
                    </h3>
                    <p className="font-label-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
                      {getIcon(lab.category)}
                      {lab.category}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Custom Lab Input */}
          <div className="mt-8 bg-surface-container-low rounded-3xl p-6 border border-outline-variant shadow-sm">
            <h3 className="font-headline-md font-bold text-lg text-on-surface mb-2 flex items-center gap-2">
              <span className="material-symbols-rounded text-tertiary">add_circle</span>
              Other Labs (เพิ่มการส่งตรวจอื่นๆ)
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-4">หากการส่งตรวจที่คุณหมอต้องการไม่มีในรายการด้านบน สามารถพิมพ์เพิ่มได้ที่นี่ครับ</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={customLabInput}
                onChange={(e) => setCustomLabInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customLabInput.trim()) {
                    const newLab = `OTHER: ${customLabInput.trim()}`;
                    if (!selectedLabs.includes(newLab)) {
                      setSelectedLabs([...selectedLabs, newLab]);
                    }
                    setCustomLabInput('');
                  }
                }}
                placeholder="ระบุชื่อ Lab ที่ต้องการส่งตรวจ..."
                className="flex-1 bg-surface border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:border-tertiary focus:ring-2 focus:ring-tertiary-container outline-none transition-all"
              />
              <button 
                onClick={() => {
                  if (customLabInput.trim()) {
                    const newLab = `OTHER: ${customLabInput.trim()}`;
                    if (!selectedLabs.includes(newLab)) {
                      setSelectedLabs([...selectedLabs, newLab]);
                    }
                    setCustomLabInput('');
                  }
                }}
                disabled={!customLabInput.trim()}
                className="bg-tertiary text-on-tertiary px-6 py-3 rounded-xl font-label-md font-bold hover:bg-tertiary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                เพิ่ม Lab
              </button>
            </div>
            
            {/* List Custom Labs */}
            {selectedLabs.filter(id => id.startsWith('OTHER:')).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedLabs.filter(id => id.startsWith('OTHER:')).map((labId) => (
                  <div key={labId} className="bg-tertiary-container text-on-tertiary-container pl-4 pr-2 py-1.5 rounded-full font-label-sm flex items-center gap-2 shadow-sm border border-tertiary/20">
                    {labId.replace('OTHER: ', '')}
                    <button 
                      onClick={() => setSelectedLabs(selectedLabs.filter(id => id !== labId))}
                      className="hover:bg-tertiary/20 p-1 rounded-full transition-colors"
                    >
                      <span className="material-symbols-rounded text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* IPE Alert Popup (Simulated Lab Tech) */}
        {showIpeAlert && (
          <div className="sticky bottom-24 animate-in slide-in-from-bottom-4 fade-in duration-300 z-20">
            <div className="bg-surface-container-lowest text-on-surface rounded-3xl p-6 shadow-2xl border-l-8 border-error flex gap-5 items-start">
              <div className="bg-error-container text-on-error-container p-3 rounded-full flex-shrink-0">
                <span className="material-symbols-rounded text-[24px]">warning</span>
              </div>
              <div>
                <h4 className="font-headline-md text-lg text-error font-bold mb-2 flex items-center gap-2">
                  <span className="bg-error text-on-error px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">Interprofessional Alert</span>
                  Lab Technician
                </h4>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  "Warning: You are ordering a shotgun panel of labs. This increases laboratory workload and may not yield targeted results. Please review your DDx and order only indicated investigations."
                </p>
              </div>
            </div>
          </div>
        )}

        {yenjaiHint && (
          <div className="sticky bottom-4 animate-in slide-in-from-bottom-4 fade-in duration-300 z-20 mt-6">
            <div className="bg-tertiary-container/30 border border-tertiary border-dashed rounded-3xl p-5 shadow-lg flex gap-4 backdrop-blur-md">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                 <img src="/yenjai2.png" alt="Coach Yenjai" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <h4 className="font-label-md font-bold text-tertiary text-sm flex items-center gap-2">
                  Coach Yenjai 
                  <span className="bg-tertiary text-on-tertiary text-[10px] px-2 py-0.5 rounded-full">AI Tutor</span>
                </h4>
                <p className="font-body-md text-on-surface text-sm mt-1 leading-relaxed">{yenjaiHint}</p>
                <p className="font-label-sm text-tertiary/70 text-xs mt-2">Attempts: {labAttempts}/3</p>
              </div>
            </div>
          </div>
        )}

      </main>

      <YenjaiChatWidget patientCase={activeCase} />

      {labFeedbackPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-scrim/80 backdrop-blur-md">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300 border border-outline-variant">
            {labFeedbackPopup.status === 'success' ? (
              <span className="material-symbols-rounded text-[80px] text-primary mx-auto mb-6 block">check_circle</span>
            ) : (
              <img src="/yenjai2.png?v=2" alt="Yenjai Chicken" className="w-24 h-24 mx-auto mb-6 object-contain rounded-full border-4 border-error bg-surface-container-highest" />
            )}
            <h2 className={`font-headline-md text-2xl md:text-3xl font-bold mb-4 ${labFeedbackPopup.status === 'success' ? 'text-primary' : 'text-error'}`}>
              {labFeedbackPopup.status === 'success' ? 'Correct Labs!' : 'System Feedback'}
            </h2>
            <p className="font-body-md text-on-surface-variant mb-8 whitespace-pre-line text-lg">
              {labFeedbackPopup.message}
            </p>
            <button
              onClick={() => {
                onFinish(selectedLabs, reason);
                setLabFeedbackPopup(null);
              }}
              className="w-full py-4 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-full font-label-md text-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              Continue <span className="material-symbols-rounded text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest border-t border-outline-variant p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-between mt-auto z-10 shadow-lg relative items-end">
        <div className="w-full md:w-2/3">
          <label className="font-label-md font-bold text-on-surface flex items-center gap-2 mb-2">
            เหตุผลที่สั่ง Lab เหล่านี้ (Clinical Reasoning) <span className="text-error">*</span>
          </label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="ทำไมคุณถึงต้องการผล Lab เหล่านี้? จะนำไปแยกโรคอะไร?"
            className="w-full h-20 p-3 bg-surface border-2 border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-xl outline-none transition-all font-body-md text-on-surface resize-none"
          />
        </div>
        <button 
          id="tour-lab-confirm"
          onClick={handleConfirmLabs}
          disabled={isProcessing || !reason.trim() || selectedLabs.length === 0}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 w-full md:w-auto rounded-full font-label-md transition-all shadow-md ${isProcessing || !reason.trim() || selectedLabs.length === 0 ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-50' : 'bg-primary text-on-primary hover:bg-primary-fixed-variant hover:shadow-lg hover:-translate-y-0.5'}`}
        >
          {isProcessing ? (
            <><span className="material-symbols-rounded animate-spin">sync</span> Verifying...</>
          ) : (
            <>Confirm Lab Orders <span className="material-symbols-rounded text-[20px]">arrow_forward</span></>
          )}
        </button>
      </div>
    </div>
  );
};

export default LabOrderScene;
