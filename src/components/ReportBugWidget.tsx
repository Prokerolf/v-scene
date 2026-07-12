import React, { useState } from 'react';
import { Bug, X, Send } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface ReportBugWidgetProps {
  stage?: string;
  caseName?: string;
}

const ReportBugWidget = ({ stage, caseName }: ReportBugWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reportText.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'bug_reports'), {
        text: reportText,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        stage: stage || 'unknown',
        caseName: caseName || 'unknown'
      });
      alert('ขอบคุณที่รายงานข้อผิดพลาดครับ ทีมงานจะรีบตรวจสอบและแก้ไขให้เร็วที่สุดครับ 🙏');
      setReportText('');
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start font-body-md">
      {isOpen && (
        <div className="bg-surface-container-lowest w-80 sm:w-96 rounded-3xl shadow-2xl border border-outline-variant flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5">
          <div className="bg-error-container border-b border-error/20 text-on-error-container p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-error" />
              <span className="font-bold font-headline-md text-base">รายงานปัญหา (Report Bug)</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-error-container hover:bg-error/10 p-1 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 bg-surface flex flex-col gap-3">
            <p className="text-sm text-on-surface-variant">พบข้อผิดพลาดของระบบ บั๊ก หรือ AI ตอบเนื้อหาผิดพลาด แจ้งให้ทีมงานทราบได้ที่นี่เลยครับ</p>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="อธิบายปัญหาที่พบ เช่น 'ด่านซักประวัติ AI ตอบแปลกๆ' หรือ 'ปุ่มกดไม่ไป'..."
              className="w-full bg-surface-container-highest border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:border-error focus:ring-2 focus:ring-error-container outline-none resize-none min-h-[100px]"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !reportText.trim()}
              className="w-full bg-error text-on-error py-3 rounded-full font-label-md font-bold hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? 'กำลังส่งข้อมูล...' : <><Send className="w-4 h-4" /> ส่งรายงาน</>}
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative flex items-center transition-all hover:scale-105 group"
        >
          <div className="bg-surface-container-lowest hover:bg-error-container text-on-surface-variant hover:text-on-error-container p-3 rounded-full shadow-lg border border-outline-variant transition-colors flex items-center gap-2">
            <Bug className="w-5 h-5" />
            <span className="font-label-sm font-bold hidden sm:block">Report Bug</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ReportBugWidget;
