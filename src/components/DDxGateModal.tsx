import React, { useState, useRef, useEffect } from 'react';
import { Lock, FileSignature, AlertCircle, Search, X, Plus, FastForward, CheckCircle2 } from 'lucide-react';
import { searchDiseases, type DiseaseItem } from '../data/diseases';

interface DDxGateModalProps {
  onSubmit: (ddx: string[], confidence: number, reason: string) => void;
  onCancel: () => void;
  errorHint: string | null;
  attempts: number;
  isProcessing: boolean;
  forceSubmit?: boolean;
}

const DDxGateModal = ({ onSubmit, onCancel, errorHint, attempts, isProcessing, forceSubmit }: DDxGateModalProps) => {
  const [inputValue, setInputValue] = useState('');
  const [ddxList, setDdxList] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState(50);
  const [localError, setLocalError] = useState(false);

  // Auto-complete state
  const [suggestions, setSuggestions] = useState<DiseaseItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update suggestions whenever input changes
  useEffect(() => {
    if (inputValue.trim().length >= 1) {
      const results = searchDiseases(inputValue);
      setSuggestions(results);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [inputValue]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddDisease = (diseaseText: string) => {
    const cleaned = diseaseText.trim();
    if (!cleaned) return;
    if (!ddxList.includes(cleaned)) {
      setDdxList([...ddxList, cleaned]);
    }
    setInputValue('');
    setShowDropdown(false);
    setLocalError(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        handleAddDisease(`${selected.nameEn} (${selected.nameTh})`);
        return;
      }
      if (e.key === 'Escape') {
        setShowDropdown(false);
        return;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddDisease(inputValue);
      }
    }
  };

  const handleRemoveDdx = (index: number) => {
    setDdxList(ddxList.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const currentList = [...ddxList];
    if (inputValue.trim() && !currentList.includes(inputValue.trim())) {
      currentList.push(inputValue.trim());
    }

    if (currentList.length === 0 || !reason.trim()) {
      setLocalError(true);
      return;
    }
    onSubmit(currentList, confidence, reason.trim());
  };

  const handleSkipDev = () => {
    const defaultDdx = ddxList.length > 0 ? ddxList : ['Asthma (โรคหอบหืด)', 'COPD (โรคปอดอุดกั้นเรื้อรัง)'];
    const defaultReason = reason.trim() || 'Dev bypass reasoning for testing';
    onSubmit(defaultDdx, confidence, defaultReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-scrim/40 backdrop-blur-md transition-all duration-300 font-body-md">
      <div className="bg-surface-container-lowest rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-outline-variant relative">
        
        {/* Banner Header */}
        <div className="bg-surface-container-low px-4 py-3.5 flex flex-col items-center justify-center text-on-surface relative shrink-0 border-b border-outline-variant">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary"></div>
          
          <div className="w-full flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-primary">
              <Lock className="w-5 h-5" />
              <span className="font-bold text-xs uppercase tracking-wider">Clinical Reasoning Gate</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSkipDev}
                className="px-2.5 py-1 bg-amber-400 text-amber-950 hover:bg-amber-300 text-[11px] font-bold rounded-full shadow-sm transition flex items-center gap-1 cursor-pointer"
                title="Dev Bypass DDx Gate"
              >
                <FastForward className="w-3 h-3" /> Skip (Dev)
              </button>
              {!forceSubmit && (
                <button 
                  type="button"
                  onClick={onCancel}
                  className="text-on-surface-variant hover:text-on-error hover:bg-error p-1.5 rounded-full transition-all bg-surface-container"
                  title="กลับไปซักประวัติต่อ"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <h2 className="font-headline-md text-lg md:text-xl font-bold text-center">ด่านคัดกรองโรค (The DDx Gate)</h2>
          <p className="font-label-sm text-on-surface-variant text-xs text-center font-medium mt-0.5">ระบุ Differential Diagnosis (DDx) ก่อนส่งตรวจ Lab</p>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Instructions banner */}
          <div className="flex items-start gap-3 p-3.5 bg-primary-container/80 rounded-xl border border-primary-fixed-dim/60">
            <FileSignature className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs md:text-sm font-bold text-on-primary-container leading-snug">
                จากประวัติผู้ป่วย คุณคิดว่าผู้ป่วยเป็นโรคอะไร (Differential Diagnosis - DDx)?
              </h3>
              <p className="text-[11px] md:text-xs text-on-primary-container opacity-85 mt-0.5 leading-relaxed">
                กรุณาระบุหรือเลือกชื่อโรคอย่างน้อย 1 โรค (พิมพ์ค้นหาหรือเลือกจากรายการอัตโนมัติ)
              </p>
            </div>
          </div>

          {/* Separate Flex Input & Button layout to avoid overlap */}
          <div className="relative">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-outline" />
                </div>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (inputValue.trim().length >= 1) setShowDropdown(true);
                  }}
                  placeholder="พิมพ์ค้นหาโรค (เช่น Asthma, COPD)..." 
                  className={`w-full pl-9 pr-3 py-2.5 bg-surface border-2 ${
                    localError && ddxList.length === 0 ? 'border-error bg-error-container text-on-error-container' : 'border-outline-variant'
                  } focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-xs md:text-sm font-medium text-on-surface placeholder:text-outline/70`}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (inputValue.trim()) {
                    handleAddDisease(inputValue);
                  }
                }}
                disabled={!inputValue.trim()}
                className="shrink-0 px-3.5 py-2.5 bg-primary text-on-primary text-xs md:text-sm font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> เพิ่มโรค
              </button>
            </div>

            {/* Auto-complete Dropdown Menu */}
            {showDropdown && suggestions.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-1"
              >
                <div className="px-3 py-1.5 bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant flex justify-between items-center">
                  <span>เลือกชื่อโรคจากรายการ</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{suggestions.length} รายการ</span>
                </div>

                <div className="divide-y divide-outline-variant/30">
                  {suggestions.map((item, index) => {
                    const isSelected = selectedIndex === index;
                    const fullText = `${item.nameEn} (${item.nameTh})`;
                    const isAlreadyAdded = ddxList.includes(fullText);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAddDisease(fullText)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-primary-container/60 text-on-primary-container font-semibold' : 'hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs md:text-sm text-primary">{item.nameEn}</span>
                            {item.abbreviation && (
                              <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-mono rounded font-bold">
                                {item.abbreviation}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-on-surface-variant">{item.nameTh}</span>
                        </div>

                        {isAlreadyAdded ? (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> เลือกแล้ว
                          </span>
                        ) : (
                          <span className="text-[11px] text-outline group-hover:text-primary">
                            + เลือกโรคนี้
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tagged Diseases List */}
          <div>
            <div className="text-[11px] md:text-xs font-bold text-on-surface-variant mb-1 flex justify-between">
              <span>โรคที่ระบุแล้ว (DDx Tags):</span>
              <span className="text-primary font-bold">{ddxList.length} โรค</span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[50px] p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-inner">
              {ddxList.length === 0 ? (
                <span className="text-xs text-outline italic flex items-center justify-center w-full h-full text-center py-2">
                  ยังไม่ได้เพิ่มชื่อโรค... (พิมพ์ค้นหาด้านบนหรือเลือกจากรายการ)
                </span>
              ) : (
                ddxList.map((ddx, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-container text-on-primary-container border border-primary-fixed-dim/80 shadow-xs rounded-lg text-xs animate-in fade-in zoom-in-95">
                    <span className="font-semibold">{ddx}</span>
                    <button type="button" onClick={() => handleRemoveDdx(i)} className="text-on-primary-container/70 hover:text-error transition p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {localError && ddxList.length === 0 && (
            <p className="text-xs text-error flex items-center gap-1 font-medium animate-bounce">
              <AlertCircle className="w-3.5 h-3.5" /> กรุณาระบุชื่อโรคอย่างน้อย 1 โรค
            </p>
          )}

          {/* Reasoning Input */}
          <div>
            <label className="text-xs md:text-sm font-bold text-on-surface flex items-center gap-1 mb-1">
              เหตุผลประกอบการตัดสินใจ (Clinical Reasoning) <span className="text-error">*</span>
            </label>
            <textarea 
              value={reason}
              onChange={(e) => { setReason(e.target.value); setLocalError(false); }}
              placeholder="ทำไมคุณถึงคิดถึงโรคเหล่านี้? (เช่น ผู้ป่วยมีอาการไข้สูง ร่วมกับไอเรื้อรัง...)"
              className={`w-full h-20 p-3 bg-surface border-2 ${localError && !reason.trim() ? 'border-error bg-error-container text-on-error-container' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-xs md:text-sm text-on-surface resize-none`}
            />
            {localError && !reason.trim() && (
              <p className="text-xs text-error flex items-center gap-1 mt-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> กรุณาระบุเหตุผลประกอบ
              </p>
            )}
          </div>

          {errorHint && (
            <div className="bg-tertiary-container border border-tertiary-fixed-dim rounded-xl p-3 flex gap-2.5 animate-in fade-in">
              <div className="w-8 h-8 bg-tertiary rounded-full flex items-center justify-center flex-shrink-0 text-on-tertiary text-sm">👩‍⚕️</div>
              <div>
                <h4 className="text-xs font-bold text-on-tertiary-container">โค้ช เย็นใจ (Coach Yenjai)</h4>
                <p className="text-xs text-on-tertiary-container mt-0.5 leading-relaxed">{errorHint}</p>
                <p className="text-[10px] text-on-tertiary-container opacity-70 mt-1 font-semibold">Attempts: {attempts}/3</p>
              </div>
            </div>
          )}

          {/* Confidence Slider */}
          <div className="bg-secondary-container border border-secondary-fixed-dim p-3.5 rounded-xl shadow-xs">
            <div className="flex justify-between items-end mb-1">
              <label className="text-xs md:text-sm font-bold text-on-secondary-container">
                คุณมั่นใจในคำตอบนี้แค่ไหน? (Calibrated Confidence)
              </label>
              <span className="text-lg font-bold text-secondary">{confidence}%</span>
            </div>
            <p className="text-[11px] text-on-secondary-container opacity-80 mb-2">เพื่อวัดระดับความมั่นใจของคุณหมอ</p>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={confidence} 
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-secondary"
            />
            <div className="flex justify-between text-[10px] text-secondary mt-1 font-bold uppercase tracking-wider">
              <span>เดา (Guess)</span>
              <span>มั่นใจมาก (Certain)</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className={`w-full py-3 rounded-full text-xs md:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
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
