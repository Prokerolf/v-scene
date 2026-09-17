import React, { useState, useEffect } from 'react';
import { BATCH1_QUESTIONS, BATCH2_QUESTIONS } from '../data/exams';
import logoImg from '../assets/logo.png';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface FinalPostTestProps {
  onComplete: () => void;
  onLogout: () => void;
}

const FinalPostTest = ({ onComplete, onLogout }: FinalPostTestProps) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePeriod, setActivePeriod] = useState<number>(1);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'settings', 'system_config'));
        let period = 1;
        if (configDoc.exists() && configDoc.data().activePeriod) {
          period = configDoc.data().activePeriod;
        }
        setActivePeriod(period);
        
        let sourceQuestions = period === 1 ? BATCH1_QUESTIONS : BATCH2_QUESTIONS;
        
        // Shuffle questions
        const shuffledQuestions = sourceQuestions.map(q => ({ ...q })).sort(() => Math.random() - 0.5);
        
        // Shuffle options and update correctAnswerIndex
        shuffledQuestions.forEach(q => {
           const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctAnswerIndex }));
           optionsWithIndex.sort(() => Math.random() - 0.5);
           q.options = optionsWithIndex.map(o => o.text);
           q.correctAnswerIndex = optionsWithIndex.findIndex(o => o.isCorrect);
        });
        
        setQuestions(shuffledQuestions);
        setAnswers(new Array(shuffledQuestions.length).fill(-1));
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const submitTest = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    try {
      let finalScore = 0;
      answers.forEach((ans, index) => {
        if (ans === questions[index].correctAnswerIndex) {
          finalScore++;
        }
      });
      setScore(finalScore);

      const updateData: any = {};
      if (activePeriod === 1) {
        updateData.hasCompletedPosttest_batch1 = true;
        updateData.posttestScore_batch1 = finalScore;
        updateData.posttestAnswers_batch1 = answers;
      } else {
        updateData.hasCompletedPosttest_batch2 = true;
        updateData.posttestScore_batch2 = finalScore;
        updateData.posttestAnswers_batch2 = answers;
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updateData);
      setIsFinished(true);
    } catch (e) {
      console.error(e);
      alert('Error submitting post-test. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (isFinished) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6 antialiased">
         <div className="text-center bg-surface-container-lowest p-10 rounded-[32px] shadow-lg border border-outline-variant max-w-xl w-full animate-in zoom-in-95 duration-500">
            <span className="material-symbols-rounded text-primary text-[80px] mb-6 block mx-auto">
              task_alt
            </span>
            <h1 className="text-3xl font-headline-lg text-on-surface mb-4">ทำแบบทดสอบเสร็จสมบูรณ์</h1>
            <p className="text-xl font-bold text-primary mb-6">คุณทำข้อสอบ Period {activePeriod} เรียบร้อยแล้ว</p>
            <p className="font-body-lg text-on-surface-variant leading-relaxed mb-10">
              ขอบคุณที่ให้ความร่วมมือในการทดสอบระบบและทำวิจัยครับ
            </p>
            <div className="flex justify-center gap-4">
               <button 
                  onClick={onComplete}
                  className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-lg shadow-md hover:bg-primary-fixed-variant transition-all flex items-center gap-2"
                >
                  กลับสู่หน้าหลัก
                </button>
                <button 
                  onClick={onLogout}
                  className="bg-surface-variant text-on-surface-variant px-8 py-3 rounded-full font-label-lg hover:bg-surface-container-highest transition-all flex items-center gap-2"
                >
                  ออกจากระบบ
                </button>
            </div>
         </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const hasAnswered = answers[currentIndex] !== -1;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <header className="bg-surface-container-lowest border-b border-outline-variant w-full top-0 z-40 sticky">
        <div className="flex justify-between items-center px-4 md:px-6 py-4 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-14 md:h-20 overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="Bridge AI Logo" className="h-40 md:h-52 w-auto object-contain" />
            </div>
            <span className="font-headline-md font-bold text-primary ml-2">Final Post-Test (Period {activePeriod})</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-md bg-surface-container-low px-4 py-2 rounded-full"
          >
            <span className="material-symbols-rounded text-[18px]">logout</span>
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-16 px-4 md:px-6 w-full max-w-3xl mx-auto">
        <div className="w-full mb-8 px-2">
          <div className="flex justify-between items-center mb-3">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest">Question Progress</span>
            <span className="font-label-md text-primary font-bold">{currentIndex + 1} / {questions.length}</span>
          </div>
          <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary-container transition-all duration-500 ease-in-out rounded-full" 
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-10 w-full shadow-sm">
          <div className="mb-8">
            <h1 className="font-body-lg md:font-headline-sm text-xl md:text-2xl text-on-surface mb-6 leading-relaxed">
              <span className="font-bold text-primary mr-2">{currentIndex + 1}.</span> {q.question}
            </h1>
          </div>

          <div className="space-y-4">
            {q.options.map((opt: string, idx: number) => (
              <label key={idx} className="block relative cursor-pointer group">
                <input 
                  className="option-radio absolute opacity-0 w-0 h-0" 
                  name={`question${currentIndex}`} 
                  type="radio" 
                  value={idx}
                  checked={answers[currentIndex] === idx}
                  onChange={() => handleSelectOption(idx)}
                />
                <div className={`border rounded-2xl px-6 py-5 transition-all duration-300 flex items-center gap-4 ${
                  answers[currentIndex] === idx 
                    ? 'border-primary bg-primary-container' 
                    : 'border-outline-variant group-hover:bg-surface-container group-hover:border-primary/50'
                }`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    answers[currentIndex] === idx ? 'border-primary' : 'border-outline-variant group-hover:border-primary/50'
                  }`}>
                    <div className={`radio-inner w-3 h-3 rounded-full transition-colors ${
                      answers[currentIndex] === idx ? 'bg-primary' : 'bg-transparent'
                    }`}></div>
                  </div>
                  <div className={`font-body-md text-body-md ${
                    answers[currentIndex] === idx ? 'text-on-primary-container font-semibold' : 'text-on-surface'
                  }`}>
                    {opt}
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          <div className="mt-8 pt-6 flex justify-between border-t border-outline-variant">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="text-on-surface-variant font-label-md px-6 py-3 rounded-full hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex-grow"></div>
          </div>
        </div>

        <div className="w-full mt-10 flex justify-center">
          <button 
            onClick={handleNext}
            disabled={!hasAnswered || isSubmitting}
            className="bg-primary text-on-primary font-headline-md text-xl px-12 py-4 rounded-full shadow-lg hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isSubmitting ? 'Submitting...' : currentIndex === questions.length - 1 ? 'Submit Test' : 'Continue'}
            {currentIndex !== questions.length - 1 && <span className="material-symbols-rounded text-[24px]">arrow_forward</span>}
          </button>
        </div>
      </main>
    </div>
  );
};

export default FinalPostTest;
