import React, { useState } from 'react';
import { BrainCircuit, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import type { ClinicalCase } from '../data/cases';

const PostTest = ({ caseData, onComplete }: { caseData: ClinicalCase, onComplete: (score: number, answers: number[]) => void }) => {
  const [step, setStep] = useState(0); // 0 = Intro, 1-N = Questions, N+1 = Loading
  const [answers, setAnswers] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const POST_TEST_QUESTIONS = caseData.preTestQuestions || []; // Reusing pre-test questions for direct comparison
  const currentQuestion = step - 1;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (step < POST_TEST_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      finishPostTest(newAnswers);
    }
  };

  const finishPostTest = (finalAnswers: number[]) => {
    setStep(POST_TEST_QUESTIONS.length + 1);
    setIsTransitioning(true);
    
    let score = 0;
    finalAnswers.forEach((ans, idx) => {
      if (ans === POST_TEST_QUESTIONS[idx].correctAnswerIndex) {
        score += 1;
      }
    });

    setTimeout(() => {
      onComplete(score, finalAnswers);
    }, 2000);
  };

  if (!POST_TEST_QUESTIONS || POST_TEST_QUESTIONS.length === 0) {
    onComplete(0, []);
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-md font-sans">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-outline-variant">
        
        <div className="bg-surface-container-low p-4 flex items-center justify-between text-on-surface border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-headline-md font-bold tracking-wide">การประเมินผลหลังเรียน (Post-Test)</h2>
          </div>
          {step > 0 && step <= POST_TEST_QUESTIONS.length && (
            <div className="text-sm font-label-md font-bold bg-primary-container text-on-primary-container px-3 py-1 rounded-full">
              ข้อ {step} / {POST_TEST_QUESTIONS.length}
            </div>
          )}
        </div>

        <div className="p-8 min-h-[400px] flex flex-col">
          {step === 0 && (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
              <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container mb-2 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-headline-lg font-bold text-on-surface mb-3">ถึงเวลาตรวจสอบความเข้าใจ</h3>
                <p className="text-on-surface-variant max-w-md mx-auto text-lg leading-relaxed font-body-md">
                  กรุณาทำแบบทดสอบจำนวน {POST_TEST_QUESTIONS.length} ข้ออีกครั้ง เพื่อวัดระดับความเข้าใจและผลสัมฤทธิ์ทางการเรียนรู้หลังจากทำเคสผู้ป่วยเสร็จสิ้น
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-8 px-8 py-4 bg-primary hover:bg-primary-fixed-variant text-on-primary font-label-lg font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-lg"
              >
                เริ่มทำแบบทดสอบ <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step > 0 && step <= POST_TEST_QUESTIONS.length && (
            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl md:text-2xl font-body-lg md:font-headline-sm font-bold text-on-surface leading-relaxed mb-10">
                {POST_TEST_QUESTIONS[step - 1].question}
              </h2>
              
              <div className="space-y-4 font-body-md">
                {POST_TEST_QUESTIONS[currentQuestion].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full text-left p-5 rounded-2xl border-2 border-outline-variant bg-surface hover:border-primary hover:bg-primary-container/20 transition-all group flex items-center gap-4 shadow-sm hover:shadow-md"
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-outline-variant group-hover:border-primary flex items-center justify-center font-bold text-on-surface-variant group-hover:text-primary transition-colors bg-surface-container-lowest">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium text-on-surface transition-colors">
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTransitioning && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-xl font-headline-md font-bold text-on-surface mt-4">กำลังประมวลผลคะแนนและเตรียม AI Coaching Report...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PostTest;
