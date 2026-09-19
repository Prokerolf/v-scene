import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Eye, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { QuestionHighlighter } from './QuestionHighlighter';
import { ExamIntegrityWidget } from './ExamIntegrityWidget';
import type { GatewayQuestion } from '../data/gatewayQuestions';
import type { ExamCategory } from './ExamEditorModal';

interface ExamSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ExamCategory;
  questions: GatewayQuestion[];
  initialIndex?: number;
}

export const ExamSimulationModal: React.FC<ExamSimulationModalProps> = ({
  isOpen,
  onClose,
  category,
  questions,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [starredQuestions, setStarredQuestions] = useState<{ [qIndex: number]: boolean }>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const toggleStar = (qIdx: number) => {
    setStarredQuestions(prev => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setSelectedAnswers({});
      setShowExplanation(false);
    }
  }, [isOpen, initialIndex]);

  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const selectedAnswerIndex = selectedAnswers[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optIdx
    }));
  };

  const getCategoryTitle = (cat: ExamCategory) => {
    switch (cat) {
      case 'pretest_batch1': return 'Pre-test (Batch 1)';
      case 'pretest_batch2': return 'Pre-test (Batch 2)';
      case 'posttest': return 'Post-test (Final)';
      case 'kfp': return 'KFP (Key Feature Problem)';
      case 'kfq': return 'KFQ (Key Feature Question)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto">
      {/* System 3: Anti-Cheating & Integrity Widget */}
      <ExamIntegrityWidget isExamActive={isOpen} />

      {/* Simulation Header Banner */}
      <div className="w-full bg-slate-900 border-b border-slate-800 text-white px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <Eye className="w-3.5 h-3.5" />
            Student Exam Simulation Mode (มุมมองจำลองของนักเรียน)
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">
            | หมวด: <strong className="text-slate-200">{getCategoryTitle(category)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              showExplanation
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showExplanation ? 'ซ่อนเฉลยอาจารย์' : 'แสดงเฉลยอาจารย์'}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Student Exam Simulation Layout */}
      <div className="w-full max-w-3xl py-8 px-4 md:px-6 flex flex-col items-center">
        {/* University / App Logo */}
        <div className="mb-6 text-center">
          <img src={logoImg} alt="V-SCENE Logo" className="h-16 md:h-20 w-auto mx-auto object-contain drop-shadow-sm mb-2" />
          <h2 className="text-lg font-bold text-slate-800">{getCategoryTitle(category)}</h2>
        </div>

        {/* Interactive Question Navigation Grid & Star Bar */}
        <div className="w-full mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              QUESTION PROGRESS ({answers.filter(a => a !== -1 && a !== undefined && a !== null).length} / {questions.length})
            </span>

            {/* Icon-Only Star / Bookmark Toggle Button */}
            <button
              onClick={() => toggleStar(currentIndex)}
              className={`p-2 rounded-full transition flex items-center justify-center ${
                starredQuestions[currentIndex]
                  ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
              }`}
              title={starredQuestions[currentIndex] ? 'ติดดาวแล้ว' : 'ติดดาวข้อนี้'}
            >
              <span className="material-symbols-rounded text-lg">
                {starredQuestions[currentIndex] ? 'star' : 'star_outline'}
              </span>
            </button>
          </div>

          {/* Interactive Question Grid 1..30 */}
          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 pt-1">
            {questions.map((_, qIdx) => {
              const isCurrent = currentIndex === qIdx;
              const isAnswered = selectedAnswers[qIdx] !== undefined;
              const isStarred = starredQuestions[qIdx];

              let btnStyle = "bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400";
              if (isCurrent) {
                btnStyle = "bg-blue-600 text-white font-bold ring-2 ring-blue-400/40 shadow-sm scale-105";
              } else if (isAnswered) {
                btnStyle = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
              }

              return (
                <button
                  key={qIdx}
                  onClick={() => setCurrentIndex(qIdx)}
                  className={`relative h-9 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center ${btnStyle}`}
                  title={`ข้อที่ ${qIdx + 1}${isAnswered ? ' (ทำแล้ว)' : ''}${isStarred ? ' ⭐ (ติดดาว)' : ''}`}
                >
                  <span>{qIdx + 1}</span>
                  {isStarred && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs">
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Text & GoodNotes Pen/Highlighter Canvas Component */}
        <QuestionHighlighter
          questionId={currentQ.id || `sim_${currentIndex}`}
          questionNumber={currentIndex + 1}
          questionText={currentQ.question || (currentQ as any).questionPrompt || (currentQ as any).vignette || ''}
          imageUrl={currentQ.imageUrl || (currentQ as any).image}
        />

        {/* Options List */}
        <div className="w-full mt-6 space-y-3">
          {currentQ.options && currentQ.options.map((option, optIdx) => {
            const isSelected = selectedAnswerIndex === optIdx;
            const isCorrect = currentQ.correctAnswerIndex === optIdx;

            let btnStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50";
            if (showExplanation) {
              if (isCorrect) {
                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-2 ring-emerald-400/50";
              } else if (isSelected && !isCorrect) {
                btnStyle = "bg-rose-50 border-rose-400 text-rose-900 font-semibold";
              }
            } else if (isSelected) {
              btnStyle = "bg-blue-50 border-blue-500 text-blue-900 font-semibold ring-2 ring-blue-400/50";
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full p-4 md:p-5 text-left border rounded-2xl transition flex items-center gap-3.5 shadow-xs ${btnStyle}`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm md:text-base flex-1">{option}</span>

                {showExplanation && isCorrect && (
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> เฉลยถูก
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {showExplanation && currentQ.explanation && (
          <div className="w-full mt-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-emerald-950 space-y-2 animate-fade-in shadow-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              คำอธิบายเฉลยทางคลินิก (Clinical Rationale):
            </h4>
            <p className="text-sm leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Bottom Pagination Controls */}
        <div className="w-full mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            disabled={currentIndex === 0}
            onClick={() => {
              setCurrentIndex(prev => prev - 1);
              setShowExplanation(false);
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> ข้อก่อนหน้า
          </button>

          <span className="text-xs font-bold text-slate-500">
            ข้อ {currentIndex + 1} / {questions.length}
          </span>

          <button
            disabled={currentIndex === questions.length - 1}
            onClick={() => {
              setCurrentIndex(prev => prev + 1);
              setShowExplanation(false);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition disabled:opacity-40 shadow-sm flex items-center gap-1.5"
          >
            ข้อถัดไป <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
