import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, EyeOff, Clock, ShieldCheck, Lock, AlertOctagon } from 'lucide-react';

interface ExamIntegrityWidgetProps {
  studentName?: string;
  studentId?: string;
  isExamActive: boolean;
  onViolationLogged?: (violationCount: number, history: any[]) => void;
}

export const ExamIntegrityWidget: React.FC<ExamIntegrityWidgetProps> = ({
  studentName = 'Student',
  studentId = 'MED-001',
  isExamActive,
  onViolationLogged
}) => {
  const [violationCount, setViolationCount] = useState(0);
  const [violationHistory, setViolationHistory] = useState<{ timestamp: string; type: string }[]>([]);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    if (!isExamActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const timeStr = new Date().toLocaleTimeString('th-TH');
        setViolationCount((prev) => {
          const next = prev + 1;
          const newHistory = [...violationHistory, { timestamp: timeStr, type: 'สลับแท็บ / ออกจากหน้าจอสอบ (Tab Switch)' }];
          setViolationHistory(newHistory);
          if (onViolationLogged) onViolationLogged(next, newHistory);
          return next;
        });
        setShowWarningModal(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isExamActive, violationHistory, onViolationLogged]);

  if (!isExamActive) return null;

  return (
    <>
      {/* Prominent High-Visibility Security Deterrent HUD Bar (Top Right) */}
      <div className="fixed top-16 right-4 z-40 max-w-sm bg-slate-900/95 text-white backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border-2 border-slate-700 space-y-2 animate-fade-in">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${violationCount > 0 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>ANTI-CHEATING SECURITY</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-[10px] text-slate-400 font-medium">ระบบตรวจจับการทุจริตแบบ Real-time</div>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-xs font-black border ${
            violationCount > 0
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-bounce'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            สลับหน้าจอ: {violationCount} ครั้ง
          </div>
        </div>

        <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800 leading-snug flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>คำเตือน:</strong> หากสลับไปแท็บอื่น พับหน้าจอ หรือเปิดแอปอื่น ระบบจะประทับเวลาและส่งรายงานให้อาจารย์แพทย์ทันที!
          </span>
        </div>
      </div>

      {/* Full-Screen High-Impact Violation Alert Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-rose-600 text-center space-y-5 relative overflow-hidden">
            
            {/* Top Red Header Strip */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-rose-600" />

            {/* Giant Alarm Icon */}
            <div className="w-16 h-16 bg-rose-100 border-2 border-rose-400 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <AlertOctagon className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-black uppercase tracking-wider inline-block">
                🚨 VIOLATION DETECTED!
              </span>
              <h3 className="text-xl font-black text-rose-950">
                เตือนรุนแรง: ตรวจพบการออกนอกหน้าจอสอบ!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                ท่านได้สลับไปหน้าต่างอื่น หรือพับเบราว์เซอร์ออกจากการทำข้อสอบ ระบบได้ทำการบันทึกประวัติการทุจริตเรียบร้อยแล้ว
              </p>
            </div>

            {/* Violation Details Box */}
            <div className="bg-rose-50/90 border border-rose-200 p-4 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-900 border-b border-rose-200 pb-2">
                <span>สรุปประวัติการทำผิดกฎการสอบ</span>
                <span className="text-sm font-black text-rose-600">รวม {violationCount} ครั้ง</span>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {violationHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-rose-100 text-rose-950 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-500" />
                      ครั้งที่ {idx + 1}: {item.type}
                    </span>
                    <span className="text-slate-500 font-bold">{item.timestamp}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-rose-700 font-bold pt-1">
                ⚠️ หากสลับหน้าจอซ้ำอีก อาจถูกปรับตกหรือยกเลิกผลการสอบในรายวิชานี้โดยอัตโนมัติ
              </p>
            </div>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>รับทราบข้อตกลง และกลับเข้าสู่หน้าทำข้อสอบ</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Exam Shuffling Utility (Question & Choice Randomization)
export const shuffleExamQuestions = (questions: any[]) => {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.map((q) => {
    if (!q.options || !Array.isArray(q.options)) return q;
    // Keep track of original correct option
    const originalCorrect = q.options[q.correctAnswerIndex ?? 0];
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrect);
    return {
      ...q,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex >= 0 ? newCorrectIndex : (q.correctAnswerIndex ?? 0)
    };
  });
};
