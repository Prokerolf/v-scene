import React, { useState } from 'react';
import { Lock, FileSignature, AlertCircle, Search, X } from 'lucide-react';

const DDxGateModal = ({ onSubmit, onCancel, errorHint, attempts, isProcessing }: { onSubmit: (ddx: string[], confidence: number, reason: string) => void, onCancel: () => void, errorHint: string | null, attempts: number, isProcessing: boolean }) => {
  const [inputValue, setInputValue] = useState('');
  const [ddxList, setDdxList] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState(50);
  const [localError, setLocalError] = useState(false);

  const handleAddDdx = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setDdxList([...ddxList, inputValue.trim()]);
      setInputValue('');
      setLocalError(false);
    }
  };

  const handleRemoveDdx = (index: number) => {
    setDdxList(ddxList.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const currentList = [...ddxList];
    if (inputValue.trim()) {
      currentList.push(inputValue.trim());
    }

    if (currentList.length === 0 || !reason.trim()) {
      setLocalError(true);
      return;
    }
    onSubmit(currentList, confidence, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-md transition-all duration-300 font-body-md">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-outline-variant">
        
        {/* Banner */}
        <div className="bg-surface-container-low p-5 flex flex-col items-center justify-center gap-2 text-on-surface relative shrink-0 border-b border-outline-variant">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary"></div>
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-error hover:bg-error p-2 rounded-full transition-all bg-surface-container"
            title="กลับไปซักประวัติต่อ"
          >
            <X className="w-5 h-5" />
          </button>
          <Lock className="w-8 h-8 text-primary mb-1" />
          <h2 className="font-headline-md text-xl md:text-2xl font-bold text-center">ด่านคัดกรองโรค (The DDx Gate)</h2>
          <p className="font-label-md text-on-surface-variant text-sm font-medium">คุณต้องระบุ Differential Diagnosis (DDx) ก่อนที่จะไปสั่งตรวจ Lab ได้</p>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <div className="flex items-start gap-4 mb-6 p-4 bg-primary-container rounded-2xl border border-primary-fixed-dim">
            <FileSignature className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-label-md font-bold text-on-primary-container">จากประวัติผู้ป่วย คุณคิดว่าผู้ป่วยเป็นโรคอะไร (Differential Diagnosis - DDx)?</h3>
              <p className="font-label-sm text-on-primary-container opacity-80 mt-1">
                กรุณาระบุชื่อโรคอย่างน้อย 1 โรค (บังคับ) เพื่อฝึกกระบวนการคิดวิเคราะห์ และป้องกันการเดาโรคจากบล็อกที่เรียนอยู่
              </p>
            </div>
          </div>

          <form onSubmit={handleAddDdx} className="mb-4 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-outline" />
            </div>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="พิมพ์ชื่อโรค (เช่น Asthma, COPD) แล้วกด Enter..." 
              className={`w-full pl-12 pr-4 py-3 bg-surface border-2 ${localError && ddxList.length === 0 ? 'border-error bg-error-container text-on-error-container' : 'border-outline-variant'} focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-xl outline-none transition-all font-body-md text-on-surface placeholder:text-outline`}
            />
          </form>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 min-h-[60px] mb-8 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-inner">
            {ddxList.length === 0 ? (
              <span className="font-label-sm text-outline italic flex items-center justify-center w-full h-full">ยังไม่ได้เพิ่มชื่อโรค (DDx)...</span>
            ) : (
              ddxList.map((ddx, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-outline-variant shadow-sm rounded-lg text-on-surface font-label-md animate-in fade-in slide-in-from-bottom-2">
                  <span>{ddx}</span>
                  <button onClick={() => handleRemoveDdx(i)} className="text-on-surface-variant hover:text-error transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {localError && ddxList.length === 0 && (
            <p className="font-label-sm text-error flex items-center gap-1 mb-4 animate-bounce">
              <AlertCircle className="w-4 h-4" /> กรุณาระบุชื่อโรคอย่างน้อย 1 โรค (คุณไม่สามารถข้ามขั้นตอนนี้ได้)
            </p>
          )}

          {/* Reasoning Input */}
          <div className="mb-8">
            <label className="font-label-md font-bold text-on-surface flex items-center gap-2 mb-2">
              เหตุผลประกอบการตัดสินใจ (Clinical Reasoning) <span className="text-error">*</span>
            </label>
            <textarea 
              value={reason}
              onChange={(e) => { setReason(e.target.value); setLocalError(false); }}
              placeholder="ทำไมคุณถึงคิดถึงโรคเหล่านี้? (เช่น ผู้ป่วยมีอาการชาครึ่งซีก...)"
              className={`w-full h-24 p-4 bg-surface border-2 ${localError && !reason.trim() ? 'border-error bg-error-container text-on-error-container' : 'border-outline-variant'} focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-xl outline-none transition-all font-body-md text-on-surface resize-none`}
            />
            {localError && !reason.trim() && (
              <p className="font-label-sm text-error flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" /> กรุณาระบุเหตุผลประกอบ
              </p>
            )}
          </div>

          {errorHint && (
            <div className="bg-tertiary-container border border-tertiary-fixed-dim rounded-xl p-4 mb-6 flex gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-10 h-10 bg-tertiary rounded-full flex items-center justify-center flex-shrink-0 text-on-tertiary">👩‍⚕️</div>
              <div>
                <h4 className="font-label-md font-bold text-on-tertiary-container">โค้ช เย็นใจ (Coach Yenjai)</h4>
                <p className="font-body-sm text-on-tertiary-container mt-1">{errorHint}</p>
                <p className="font-label-sm text-on-tertiary-container opacity-70 mt-2 font-semibold">Attempts: {attempts}/3</p>
              </div>
            </div>
          )}

          {/* Calibrated Answer (Confidence Slider) */}
          <div className="mb-8 bg-secondary-container border border-secondary-fixed-dim p-5 rounded-2xl shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <label className="font-label-md font-bold text-on-secondary-container">
                คุณมั่นใจในคำตอบนี้แค่ไหน? (Calibrated Confidence)
              </label>
              <span className="text-2xl font-headline-lg text-secondary">{confidence}%</span>
            </div>
            <p className="font-label-sm text-on-secondary-container opacity-80 mb-4">เพื่อวัดว่าคุณชัวร์หรือเดา (ข้อมูลนี้จะส่งให้อาจารย์ดูเท่านั้น)</p>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={confidence} 
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-secondary"
            />
            <div className="flex justify-between font-label-sm text-secondary mt-2 font-bold uppercase tracking-wider">
              <span>เดา (Guess)</span>
              <span>มั่นใจมาก (Certain)</span>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isProcessing}
            className={`w-full py-4 rounded-full font-label-lg transition-all shadow-md flex items-center justify-center gap-2 ${
              (ddxList.length > 0 || inputValue.trim()) && reason.trim()
                ? 'bg-primary hover:bg-primary-fixed-variant text-on-primary hover:shadow-lg hover:-translate-y-0.5' 
                : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
            } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isProcessing ? 'กำลังตรวจสอบ...' : 'ยืนยัน DDx & ไปยังหน้าสั่ง Lab'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DDxGateModal;
