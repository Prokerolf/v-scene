import React from 'react';
import { PenTool, CheckCircle, Search, FileText } from 'lucide-react';
import { CLINICAL_CASES } from '../data/cases';
import { labOptions } from './LabOrderScene';

interface ScratchpadWidgetProps {
  notes: string;
  setNotes: (text: string) => void;
  submittedDDx: string;
  finalDiagnosis: string;
  selectedLabs: string[];
}

const ScratchpadWidget: React.FC<ScratchpadWidgetProps> = ({
  notes,
  setNotes,
  submittedDDx,
  finalDiagnosis,
  selectedLabs
}) => {
  return (
    <div className="h-screen bg-surface-container-lowest border-l border-outline-variant flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden shrink-0 w-full font-body-md">
      <div className="bg-primary text-on-primary px-4 h-9 flex items-center gap-2 shadow-sm shrink-0 border-b border-primary-fixed-dim">
        <PenTool className="w-4 h-4 flex-shrink-0" />
        <h2 className="font-headline-md font-bold text-sm truncate">กระดาษทด (Scratchpad)</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Free Text Notes */}
        <div className="flex flex-col flex-1 min-h-[200px]">
          <label className="text-sm font-label-md font-bold text-on-surface-variant mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-outline" /> Personal Notes
          </label>
          <textarea
            className="flex-1 w-full border border-outline-variant rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none shadow-inner bg-tertiary-container/30 text-on-surface placeholder:text-outline"
            placeholder="พิมพ์โน้ตส่วนตัว ทดความคิด หรือเรียบเรียงอาการคนไข้ได้ที่นี่..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Submitted DDx */}
        {submittedDDx && (
          <div className="bg-surface-container border border-outline-variant rounded-xl p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-[10px] md:text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-primary" /> Submitted DDx
            </h3>
            <p className="text-on-surface font-semibold text-sm">{submittedDDx}</p>
          </div>
        )}

        {/* Selected Labs */}
        {selectedLabs.length > 0 && (
          <div className="bg-surface-container border border-outline-variant rounded-xl p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-[10px] md:text-xs font-label-sm font-bold text-on-surface-variant uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-secondary" /> Labs Ordered
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedLabs.map((labId, idx) => {
                const labDetails = labOptions.find(l => l.id === labId);
                const labName = labDetails ? labDetails.name : `Test #${labId}`;
                return (
                  <span key={idx} className="bg-secondary-container/50 text-on-secondary-container border border-secondary-fixed-dim px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium">
                    {labName}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Final Diagnosis */}
        {finalDiagnosis && (
          <div className="bg-primary-container border border-primary-fixed-dim rounded-xl p-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-[10px] md:text-xs font-label-sm font-bold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Final Diagnosis
            </h3>
            <p className="text-on-primary-container font-bold text-sm">{finalDiagnosis}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScratchpadWidget;
