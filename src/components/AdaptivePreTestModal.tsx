import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, BrainCircuit, Bot, ChevronRight, Loader2 } from 'lucide-react';
import type { ClinicalCase } from '../data/cases';

const AdaptivePreTestModal = ({ caseData, onClose, onCancel, addLogAction }: { caseData: ClinicalCase, onClose: (score: number, answers: number[]) => void, onCancel?: () => void, addLogAction: (dim: string, act: string, mis: string, tag: string) => void }) => {
  const [step, setStep] = useState(0); // 0 = Intro, 1-9 = Questions, 10 = Loading
  const [answers, setAnswers] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const PRE_TEST_QUESTIONS = caseData.preTestQuestions || [];

  const currentQuestion = step - 1;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (optionIndex !== PRE_TEST_QUESTIONS[currentQuestion].correctAnswerIndex) {
      addLogAction(
        `Pre-test Question ${currentQuestion + 1}`,
        'Incorrect Answer',
        `Missed concept: ${PRE_TEST_QUESTIONS[currentQuestion].question}`,
        `Review Slide Section: ${PRE_TEST_QUESTIONS[currentQuestion].category}`
      );
    }
    
    if (step < PRE_TEST_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      // Finished all 9 questions
      finishPreTest(newAnswers);
    }
  };

  const finishPreTest = (finalAnswers: number[]) => {
    setStep(PRE_TEST_QUESTIONS.length + 1); // Loading state
    setIsTransitioning(true);
    
    // Calculate score silently
    let score = 0;
    finalAnswers.forEach((ans, idx) => {
      if (ans === PRE_TEST_QUESTIONS[idx].correctAnswerIndex) {
        score += 1;
      }
    });

    // Simulate analysis delay
    setTimeout(() => {
      onClose(score, finalAnswers);
    }, 2500);
  };

  if (!PRE_TEST_QUESTIONS || PRE_TEST_QUESTIONS.length === 0) {
    return null; // Don't render if no questions
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-md transition-all duration-300 font-body-md">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-outline-variant">
        
        {/* Banner: Psychological Safety Rule (Silent Triage) */}
        <div className="bg-surface-container-low p-4 flex items-center justify-between gap-3 text-on-surface border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 flex-shrink-0 text-primary" />
            <p className="font-label-md text-sm md:text-base">
              <strong className="text-primary">Safe Sandbox Mode:</strong> พื้นที่ปลอดภัย ไม่มีการแสดงคะแนน ตอบเพื่อประเมินพื้นฐานเบื้องต้นเท่านั้น
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => finishPreTest(PRE_TEST_QUESTIONS.map(q => q.correctAnswerIndex))}
              className="px-3 py-1 bg-error-container text-on-error-container hover:bg-error hover:text-on-error rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
            >
              Skip (Dev)
            </button>
            {onCancel && (
              <button 
                onClick={onCancel}
                className="p-1 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface-variant hover:text-error"
                title="Cancel Pre-Test"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-8 min-h-[400px] flex flex-col">
          
          {step === 0 && (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-4 bg-primary-container text-on-primary-container rounded-2xl">
                  <Bot className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-headline-lg font-bold text-on-surface">Adaptive Pre-Test (Respiratory System)</h2>
                  <p className="text-on-surface-variant mt-2 text-lg">แบบทดสอบสั้น {PRE_TEST_QUESTIONS.length} ข้อ เพื่อให้ AI เตรียมเคสที่เหมาะสมกับคุณที่สุด</p>
                </div>
              </div>
              <div className="bg-secondary-container/20 border border-secondary-fixed-dim p-6 rounded-2xl">
                <p className="text-on-surface text-lg leading-relaxed font-medium">
                  "This 5-minute pre-test optimizes your cognitive load and pairs you with a personalized clinical case tailored to your baseline knowledge."
                </p>
                <p className="text-on-surface-variant mt-4 text-base">
                  ไม่ต้องกดดันนะครับ ระบบจะไม่โชว์ข้อถูก/ผิด หรือให้เกรดในตอนนี้ ทำใจให้สบาย แล้วตอบตามความเข้าใจปัจจุบันได้เลยครับ
                </p>
              </div>
              <button 
                onClick={() => setStep(1)} 
                className="mt-4 w-full py-5 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-2xl font-label-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xl"
              >
                เริ่มทำแบบทดสอบ <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {step > 0 && step <= PRE_TEST_QUESTIONS.length && (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-label-sm text-outline uppercase tracking-widest font-bold">
                  ข้อที่ {step} จาก {PRE_TEST_QUESTIONS.length}
                </h3>
                <div className="text-outline">
                  <BrainCircuit className="w-6 h-6 opacity-50" />
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-body-lg md:font-headline-sm font-bold text-on-surface leading-relaxed mb-10">
                {PRE_TEST_QUESTIONS[step - 1].question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                {PRE_TEST_QUESTIONS[step - 1].options.map((option, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleAnswer(idx)} 
                    className="py-5 px-6 bg-surface border-2 border-outline-variant hover:border-primary hover:bg-primary-container/20 text-on-surface rounded-2xl font-label-md transition-all text-left shadow-sm hover:shadow-md text-lg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTransitioning && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div>
                  <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Syncing with your personalized simulation...</h3>
                  <p className="font-body-md text-on-surface-variant">Preparing your clinical case safely in the background</p>
              </div>
            </div>
          )}
          
        </div>

        {/* Progress Bar (Only show during questions) */}
        {step > 0 && step <= PRE_TEST_QUESTIONS.length && (
          <div className="bg-surface-container-highest h-2 w-full">
            <div 
              className="bg-primary h-full transition-all duration-500 ease-out"
              style={{ width: `${(step / PRE_TEST_QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptivePreTestModal;
