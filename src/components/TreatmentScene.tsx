import React, { useState } from 'react';
import { Pill, ActivitySquare, AlertOctagon, CheckSquare, ListPlus, ShieldCheck, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import YenjaiChatWidget from './YenjaiChatWidget';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface DrugOption {
  id: string;
  name: string;
  category: 'A' | 'B' | 'C';
  form: string;
}

export const drugOptions: DrugOption[] = [
  { id: '1', name: 'Aspirin (ASA)', category: 'ก', form: 'Oral (Tablet)' },
  { id: '2', name: 'Atorvastatin', category: 'ข', form: 'Oral (Tablet)' },
  { id: '3', name: 'Enalapril', category: 'ก', form: 'Oral (Tablet)' },
  { id: '4', name: 'Clopidogrel', category: 'ค', form: 'Oral (Tablet)' },
  { id: '5', name: 'rt-PA (Alteplase)', category: 'จ', form: 'IV Infusion' },
  { id: '6', name: 'Warfarin', category: 'ก', form: 'Oral (Tablet)' },
  { id: '7', name: 'Mannitol', category: 'ก', form: 'IV Infusion' },
  { id: '8', name: 'Amoxicillin/Clavulanate', category: 'ก', form: 'Oral (Tablet)' },
  { id: '9', name: 'Codeine', category: 'ค', form: 'Oral (Tablet)' },
  { id: '10', name: 'Salbutamol MDI', category: 'ก', form: 'Inhaler' },
  { id: '11', name: 'Praziquantel', category: 'ข', form: 'Oral (Tablet)' },
  { id: '12', name: 'Ivermectin', category: 'ข', form: 'Oral (Tablet)' },
  { id: '13', name: 'Albendazole', category: 'ก', form: 'Oral (Tablet)' },
  { id: '14', name: 'Oseltamivir', category: 'ก', form: 'Oral (Tablet)' },
  { id: '15', name: 'Remdesivir', category: 'จ', form: 'IV Infusion' },
  { id: '16', name: 'Dexamethasone', category: 'ก', form: 'IV/Oral' },
  { id: '17', name: 'Low-molecular-weight heparin (LMWH)', category: 'ค', form: 'Subcutaneous' },
  { id: '18', name: 'High-Flow Nasal Cannula (HFNC)', category: 'ข', form: 'Oxygen Therapy' },
  { id: '19', name: 'Non-invasive Positive Pressure Ventilation (BiPAP)', category: 'ค', form: 'Ventilation Support' },
  { id: '20', name: 'Weight loss program / Bariatric consult', category: 'ก', form: 'Lifestyle' },
  { id: '21', name: 'Oxygen Therapy (Nasal Cannula)', category: 'ก', form: 'Oxygen Therapy' },
];

const TreatmentScene = ({ activeCase, onFinish, addLogAction, selectedDrugs, setSelectedDrugs }: { activeCase: any, onFinish: (drugs: string[], reason: string) => void, addLogAction: (dim: string, act: string, mis: string, tag: string) => void, selectedDrugs: string[], setSelectedDrugs: (v: string[]) => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [treatmentAttempts, setTreatmentAttempts] = useState(0);
  const [yenjaiHint, setYenjaiHint] = useState<string | null>(null);
  const [treatmentFeedbackPopup, setTreatmentFeedbackPopup] = useState<{status: 'success' | 'fail', message: string} | null>(null);
  const [confirmedCorrectDrugs, setConfirmedCorrectDrugs] = useState<string[]>([]);
  const [reason, setReason] = useState('');

  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'ต่อไป ➔',
      prevBtnText: '⬅ ก่อนหน้า',
      doneBtnText: 'เข้าใจแล้ว!',
      steps: [
        { element: '#tour-tx-constraints', popover: { title: 'ข้อจำกัดผู้ป่วย', description: 'ก่อนจ่ายยา ต้องอ่านข้อจำกัดและข้อห้าม (Contraindications) ของคนไข้รายนี้ให้ดีนะครับ', side: "bottom", align: 'start' }},
        { element: '#tour-tx-cats', popover: { title: 'หมวดหมู่ยา (RDU)', description: 'ยาแบ่งตามบัญชียาหลัก (A, B, C) ให้พิจารณาเลือกใช้ยาจากหมวดที่ปลอดภัยและจำเป็นก่อน', side: "top", align: 'start' }},
        { element: '#tour-tx-confirm', popover: { title: 'ยืนยันและจบเคส', description: 'เมื่อจ่ายยาเสร็จเรียบร้อย กดปุ่มนี้เพื่อจบเคสและดูคะแนนสรุปผลได้เลยครับ', side: "top", align: 'end' }}
      ]
    });
    driverObj.drive();
  };

  const toggleDrug = (id: string) => {
    if (selectedDrugs.includes(id)) {
      setSelectedDrugs(selectedDrugs.filter(d => d !== id));
    } else {
      const maxAllowed = activeCase?.goldStandardDrugs?.length || 0;
      if (maxAllowed > 0 && selectedDrugs.length >= maxAllowed) {
        alert(`ข้อนี้สามารถเลือกจ่ายยาได้สูงสุด ${maxAllowed} อย่างครับ เพื่อป้องกันการเดาสุ่ม`);
        return;
      }
      setSelectedDrugs([...selectedDrugs, id]);
    }
  };

  const handleConfirmTreatment = async () => {
    setIsProcessing(true);
    setYenjaiHint(null);

    const requiredDrugs = activeCase?.goldStandardDrugs || [];
    const missingDrugs = requiredDrugs.filter((id: string) => !selectedDrugs.includes(id));
    const correctPicks = selectedDrugs.filter((id: string) => requiredDrugs.includes(id));
    setConfirmedCorrectDrugs(correctPicks);
    const isStrictFormative = activeCase?.isStrictFormative !== false;

    let finalStatus: 'success' | 'fail' = 'success';

    if (isStrictFormative && missingDrugs.length > 0) {
      const newAttempts = treatmentAttempts + 1;
      setTreatmentAttempts(newAttempts);

      if (newAttempts < 3) {
        if (newAttempts === 1) {
          setYenjaiHint(`คุณหมอสั่งยาถูกไปแล้ว ${correctPicks.length} รายการค่ะ แต่ยังขาดที่จำเป็นอีก ${missingDrugs.length} รายการ ลองพิจารณาดูอีกทีนะคะ ✌️`);
          setIsProcessing(false);
          return;
        }

        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
          
          const missingDrugNames = missingDrugs.map((id: string) => drugOptions.find(d => d.id === id)?.name).join(', ');
          
          const prompt = `
            คุณคือ "เย็นใจ" ผู้ช่วย AI สาวน้อยน่ารัก สุภาพ อ่อนโยน
            นักศึกษาสั่งยาขาดสิ่งสำคัญคือ: ${missingDrugNames}
            สำหรับคนไข้โรค: ${activeCase?.diseaseName}
            ข้อมูลปัจจุบัน: นักศึกษาเลือกถูกแล้ว ${correctPicks.length} รายการ และขาดอีก ${missingDrugs.length} รายการ
            
            กฎเหล็กการตอบ (Yenjai Strict Tone):
            - "ประโยคแรกต้องสรุปให้ชัดเจนว่าทำถูกกี่อัน ขาดกี่อัน" (เช่น "ตอนนี้คุณหมอสั่งยาถูกไปแล้ว ${correctPicks.length} รายการนะคะ แต่ยังขาดยาสำคัญอีก ${missingDrugs.length} ตัวค่ะ")
            - "เนื้อหาคำใบ้ต้องสั้น ตรงประเด็นสุดๆ ห้ามเกิน 4 บรรทัด" ตัดคำชมและน้ำทิ้งทั้งหมด
            - ห้ามเฉลยชื่อยาตรงๆ ให้ใบ้ถึงกลไกการออกฤทธิ์ หรือข้อบ่งชี้
            - "ห้ามใช้สัญลักษณ์ Markdown เด็ดขาด" (เช่น ** * # // \\n) ให้ตอบเป็นข้อความธรรมดาเท่านั้น
            - ตัวอย่าง: "คุณหมอสั่งยาถูกไปแล้ว ${correctPicks.length} รายการ แต่ยังขาดอีก ${missingDrugs.length} ตัวค่ะ สำหรับคนไข้ที่มีความเสี่ยงลิ่มเลือดอุดตัน ลองพิจารณายาต้านเกล็ดเลือดดูนะคะ"
          `;
          const result = await model.generateContent(prompt);
          setYenjaiHint(result.response.text().trim());
        } catch (e) {
          setYenjaiHint("พยายามได้ดีมากค่ะคุณหมอ! แต่ยังขาดยาสำคัญบางตัว ลองทบทวนดูอีกนิดนะคะ");
        }
        setIsProcessing(false);
        return; 
      } else {
        addLogAction('Treatment', 'Treatment Failed 3 Attempts', `Missing: ${missingDrugs.join(',')}`, 'Review Slide Section: Treatment Options');
        finalStatus = 'fail';
      }
    }

    setIsProcessing(false);
    
    setTreatmentFeedbackPopup({
      status: finalStatus,
      message: finalStatus === 'success'
        ? `🎉 เย่! ถูกต้องแล้วครับ\n\nยอดเยี่ยมมาก คุณเลือกสั่งยาได้อย่างปลอดภัยและเหมาะสม\n\n💡 การให้ยาที่ถูกต้องตามข้อบ่งชี้ช่วยลดความพิการและเพิ่มโอกาสฟื้นตัวของผู้ป่วยได้มากครับ`
        : `คุณตอบผิดครบ 3 ครั้ง ระบบขอเฉลยยาที่จำเป็นเพิ่มเติม\n\n🎯 ยาที่ควรสั่งคือ: ${missingDrugs.map((id: string) => drugOptions.find(d => d.id === id)?.name).join(', ')}`,
      reason: reason
    });
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'ก': return 'bg-primary-container text-on-primary-container border-primary-container';
      case 'ข': return 'bg-secondary-container text-on-secondary-container border-secondary-container';
      case 'ค': return 'bg-tertiary-container text-on-tertiary-container border-tertiary-container';
      case 'จ': return 'bg-error-container text-on-error-container border-error-container';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  const getCategoryDescription = (cat: string) => {
    switch(cat) {
      case 'ก': return 'ยามาตรฐานที่ต้องมีใช้ (บัญชี ก) มีความปลอดภัยและประสิทธิภาพสูง';
      case 'ข': return 'ยาทางเลือก (บัญชี ข) ใช้เมื่อยาหมวด ก ไม่ได้ผลหรือมีข้อห้ามใช้';
      case 'ค': return 'ยาสำหรับโรคเฉพาะทาง (บัญชี ค) ต้องสั่งโดยแพทย์ผู้เชี่ยวชาญเฉพาะด้าน';
      case 'จ': return 'ยาที่มีความจำเป็นพิเศษ/ราคาแพง (บัญชี จ) ต้องมีข้อบ่งชี้ชัดเจนตามอนุมัติ (เช่น rt-PA)';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <div className="bg-primary text-on-primary text-center py-2 px-4 font-label-sm tracking-wide flex items-center justify-center gap-2 shadow-sm relative z-20">
        <span className="material-symbols-rounded text-[16px] flex-shrink-0">shield</span>
        <span>Formative Sandbox: This activity is for diagnostic learning and skills development. Results are confidential.</span>
      </div>
      
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-secondary-container p-2 rounded-full hidden sm:block">
            <span className="material-symbols-rounded text-secondary text-[20px]">prescriptions</span>
          </div>
          <div>
            <h1 className="font-headline-md font-bold text-lg text-on-surface tracking-wide">Phase 4: Treatment</h1>
            <p className="font-label-sm text-secondary">Rational Drug Use (RDU) principles</p>
          </div>
        </div>
        <button 
          onClick={startTutorial}
          className="font-label-sm font-bold text-on-surface-variant bg-surface-container-low hover:bg-surface-container px-4 py-2 rounded-full transition-colors flex items-center gap-2 shadow-sm border border-outline-variant"
        >
          <span className="material-symbols-rounded text-[16px]">help</span> <span className="hidden sm:inline">Tutorial</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col gap-6">
        
        {/* Patient Constraints Banner */}
        <div id="tour-tx-constraints" className="bg-error-container/20 rounded-2xl shadow-sm border border-error/30 p-6">
          <h2 className="font-label-md font-bold text-error uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-[20px]">warning</span> Patient Constraints & Contraindications
          </h2>
          <div className="flex flex-wrap gap-3">
            {activeCase?.caseConstraints?.map((constraint: string, idx: number) => (
              <span key={idx} className="px-4 py-2 bg-error-container text-on-error-container rounded-full font-label-sm font-semibold border border-error/20">
                {constraint}
              </span>
            ))}
            {(!activeCase?.caseConstraints || activeCase.caseConstraints.length === 0) && (
              <span className="px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full font-label-sm font-semibold border border-outline-variant">
                No special constraints identified.
              </span>
            )}
          </div>
        </div>

        {/* Drug Categories */}
        <div id="tour-tx-cats" className="flex flex-col gap-8 mt-4">
          {['ก', 'ข', 'ค', 'จ'].map(category => (
            <div key={category} className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant overflow-hidden">
              <div className={`px-6 py-5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between ${
                category === 'ก' ? 'bg-primary-container/10' :
                category === 'ข' ? 'bg-secondary-container/10' :
                category === 'ค' ? 'bg-tertiary-container/10' :
                'bg-error-container/10'
              }`}>
                <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                    category === 'ก' ? 'bg-primary text-on-primary' :
                    category === 'ข' ? 'bg-secondary text-on-secondary' :
                    category === 'ค' ? 'bg-tertiary text-on-tertiary' :
                    'bg-error text-on-error'
                  }`}>
                    {category}
                  </span>
                  บัญชียาหลักแห่งชาติ หมวด {category}
                </h3>
                <p className="font-label-sm font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg mt-2 sm:mt-0 leading-tight border border-outline-variant">
                  {getCategoryDescription(category)}
                </p>
              </div>

              <div className="divide-y divide-outline-variant/30">
                {drugOptions.filter(d => d.category === category).map(drug => (
                  <label key={drug.id} className={`flex items-center p-5 cursor-pointer transition-colors hover:bg-surface-container-low ${confirmedCorrectDrugs.includes(drug.id) ? 'bg-primary/10 border-2 border-primary shadow-sm' : selectedDrugs.includes(drug.id) ? 'bg-primary-container/5' : ''}`}>
                    <div className="flex items-center gap-4 w-full">
                      <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                        <input 
                          type="checkbox" 
                          checked={selectedDrugs.includes(drug.id)}
                          onChange={() => toggleDrug(drug.id)}
                          disabled={confirmedCorrectDrugs.includes(drug.id)}
                          className={`peer appearance-none w-6 h-6 border-2 rounded-md transition-all ${confirmedCorrectDrugs.includes(drug.id) ? 'bg-primary border-primary cursor-not-allowed opacity-80' : 'border-outline checked:bg-primary checked:border-primary cursor-pointer'}`}
                        />
                        <span className="material-symbols-rounded absolute text-[20px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">check</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-label-md text-base truncate transition-colors ${confirmedCorrectDrugs.includes(drug.id) ? 'text-primary font-bold' : selectedDrugs.includes(drug.id) ? 'text-primary font-bold' : 'text-on-surface font-semibold'}`}>
                          {drug.name} {confirmedCorrectDrugs.includes(drug.id) && <span className="text-primary text-sm ml-2 bg-primary/20 px-2 py-0.5 rounded-full">✅ ถูกต้องแล้ว</span>}
                        </h4>
                        <p className="font-label-sm text-on-surface-variant mt-0.5">{drug.form}</p>
                      </div>
                    </div>
                  </label>
                ))}
                {drugOptions.filter(d => d.category === category).length === 0 && (
                  <div className="p-6 font-body-md text-sm text-on-surface-variant italic text-center">No medications in this category.</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {yenjaiHint && (
          <div className="sticky bottom-4 animate-in slide-in-from-bottom-4 fade-in duration-300 z-20 mt-6">
            <div className="bg-secondary-container/30 border border-secondary border-dashed rounded-3xl p-5 shadow-lg flex gap-4 backdrop-blur-md">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                 <img src="/yenjai2.png" alt="Coach Yenjai" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <h4 className="font-label-md font-bold text-secondary text-sm flex items-center gap-2">
                  Coach Yenjai 
                  <span className="bg-secondary text-on-secondary text-[10px] px-2 py-0.5 rounded-full">AI Tutor</span>
                </h4>
                <p className="font-body-md text-on-surface text-sm mt-1 leading-relaxed">{yenjaiHint}</p>
                <p className="font-label-sm text-secondary/70 text-xs mt-2">Attempts: {treatmentAttempts}/3</p>
              </div>
            </div>
          </div>
        )}

      </main>

      <YenjaiChatWidget patientCase={activeCase} />

      {treatmentFeedbackPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-scrim/80 backdrop-blur-md">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300 border border-outline-variant">
            {treatmentFeedbackPopup.status === 'success' ? (
              <span className="material-symbols-rounded text-[80px] text-primary mx-auto mb-6 block">check_circle</span>
            ) : (
              <img src="/yenjai2.png?v=2" alt="Yenjai Chicken" className="w-24 h-24 mx-auto mb-6 object-contain rounded-full border-4 border-error bg-surface-container-highest" />
            )}
            <h2 className={`font-headline-md text-2xl md:text-3xl font-bold mb-4 ${treatmentFeedbackPopup.status === 'success' ? 'text-primary' : 'text-error'}`}>
              {treatmentFeedbackPopup.status === 'success' ? 'Correct Treatment!' : 'System Feedback'}
            </h2>
            <p className="font-body-md text-on-surface-variant mb-8 whitespace-pre-line text-lg">
              {treatmentFeedbackPopup.message}
            </p>
            <button
              onClick={() => {
                onFinish(selectedDrugs, reason);
                setTreatmentFeedbackPopup(null);
              }}
              className="w-full py-4 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-full font-label-md text-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              Continue <span className="material-symbols-rounded text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest border-t border-outline-variant p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-between items-end z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="w-full md:w-2/3">
          <label className="font-label-md font-bold text-on-surface flex items-center gap-2 mb-2">
            เหตุผลที่เลือกสั่งยาเหล่านี้ (Clinical Reasoning) <span className="text-error">*</span>
          </label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="คุณหมอจ่ายยานี้เพื่อบรรเทาอาการ หรือรักษาสาเหตุหลักอะไรครับ?"
            className="w-full h-20 p-3 bg-surface border-2 border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-xl outline-none transition-all font-body-md text-on-surface resize-none"
          />
        </div>
        <div className="w-full md:w-auto flex flex-col items-end gap-3">
          <div className="font-label-md font-bold text-on-surface-variant flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant self-end sm:self-auto">
            <span className="material-symbols-rounded text-[20px] hidden sm:block">list_alt</span>
            Selected {selectedDrugs.length} items
          </div>
          <button 
            id="tour-tx-confirm"
            onClick={handleConfirmTreatment}
            disabled={isProcessing || !reason.trim() || selectedDrugs.length === 0}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 md:px-8 rounded-full font-label-md transition-all shadow-md ${isProcessing || !reason.trim() || selectedDrugs.length === 0 ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-50' : 'bg-primary text-on-primary hover:bg-primary-fixed-variant hover:shadow-lg hover:-translate-y-0.5'}`}
          >
            {isProcessing ? (
              <><span className="material-symbols-rounded animate-spin">sync</span> Verifying...</>
            ) : (
              <><span className="material-symbols-rounded text-[20px]">check_circle</span> Confirm Treatment & Finish Case</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentScene;
