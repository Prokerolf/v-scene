import React, { useState, useEffect } from 'react';
import { BATCH1_QUESTIONS, BATCH2_QUESTIONS } from '../data/exams';
import logoImg from '../assets/logo.png';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { QuestionHighlighter } from './QuestionHighlighter';
import { sanitizeQuestionsForStudent } from '../lib/examUtils';

interface FinalPostTestProps {
  onComplete: () => void;
  onLogout: () => void;
  onSwitchToTeacher?: () => void;
}

const FinalPostTest = ({ onComplete, onLogout, onSwitchToTeacher }: FinalPostTestProps) => {
  const [masterQuestions, setMasterQuestions] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePeriod, setActivePeriod] = useState<number>(1);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [starredQuestions, setStarredQuestions] = useState<{ [qIndex: number]: boolean }>({});

  const toggleStar = (qIdx: number) => {
    setStarredQuestions(prev => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  useEffect(() => {
    const blockInspect = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'U'))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', blockInspect);
    window.addEventListener('contextmenu', blockContextMenu);
    return () => {
      window.removeEventListener('keydown', blockInspect);
      window.removeEventListener('contextmenu', blockContextMenu);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`vscene_finalposttest_p${activePeriod}_index`, currentIndex.toString());
    } catch (e) {}
  }, [currentIndex, activePeriod]);

  useEffect(() => {
    if (answers && answers.length > 0) {
      try {
        localStorage.setItem(`vscene_finalposttest_p${activePeriod}_answers`, JSON.stringify(answers));
      } catch (e) {}
    }
  }, [answers, activePeriod]);

  useEffect(() => {
    try {
      localStorage.setItem(`vscene_finalposttest_p${activePeriod}_starred`, JSON.stringify(starredQuestions));
    } catch (e) {}
  }, [starredQuestions, activePeriod]);

  useEffect(() => {
    const init = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'settings', 'system_config'));
        let period = 1;
        if (configDoc.exists() && configDoc.data().activePeriod) {
          period = configDoc.data().activePeriod;
        }
        setActivePeriod(period);

        const savedIdx = localStorage.getItem(`vscene_finalposttest_p${period}_index`);
        if (savedIdx !== null && !isNaN(Number(savedIdx))) {
          setCurrentIndex(Number(savedIdx));
        }

        const savedStarred = localStorage.getItem(`vscene_finalposttest_p${period}_starred`);
        if (savedStarred) {
          try { setStarredQuestions(JSON.parse(savedStarred)); } catch (e) {}
        }

        const savedQuestionsKey = `vscene_finalposttest_p${period}_questions`;
        const savedQuestionsStr = localStorage.getItem(savedQuestionsKey);

        let finalQuestions: any[] = [];
        if (savedQuestionsStr) {
          try {
            finalQuestions = JSON.parse(savedQuestionsStr);
          } catch (e) {}
        }

        if (!finalQuestions || finalQuestions.length === 0) {
          let sourceQuestions = period === 1 ? BATCH1_QUESTIONS : BATCH2_QUESTIONS;
          finalQuestions = sourceQuestions.map(q => ({ ...q })).sort(() => Math.random() - 0.5);
          finalQuestions.forEach(q => {
             const optionsWithIndex = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctAnswerIndex }));
             optionsWithIndex.sort(() => Math.random() - 0.5);
             q.options = optionsWithIndex.map(o => o.text);
             q.correctAnswerIndex = optionsWithIndex.findIndex(o => o.isCorrect);
          });
          localStorage.setItem(savedQuestionsKey, JSON.stringify(finalQuestions));
        }

        setMasterQuestions(finalQuestions);
        setQuestions(sanitizeQuestionsForStudent(finalQuestions));

        const savedAnsStr = localStorage.getItem(`vscene_finalposttest_p${period}_answers`);
        if (savedAnsStr) {
          try {
            const parsed = JSON.parse(savedAnsStr);
            if (Array.isArray(parsed) && parsed.length === finalQuestions.length) {
              setAnswers(parsed);
            } else {
              setAnswers(new Array(finalQuestions.length).fill(-1));
            }
          } catch (e) {
            setAnswers(new Array(finalQuestions.length).fill(-1));
          }
        } else {
          setAnswers(new Array(finalQuestions.length).fill(-1));
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  const handleSelectOption = (optIdx: number) => {
    const updated = [...answers];
    updated[currentIndex] = optIdx;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(questions.length);
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
        const q = masterQuestions[index] || questions[index];
        if (q && q.correctAnswerIndex !== undefined && ans === q.correctAnswerIndex) {
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
      localStorage.removeItem(`vscene_finalposttest_p${activePeriod}_index`);
      localStorage.removeItem(`vscene_finalposttest_p${activePeriod}_answers`);
      localStorage.removeItem(`vscene_finalposttest_p${activePeriod}_starred`);
      localStorage.removeItem(`vscene_finalposttest_p${activePeriod}_questions`);
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
            <div className="h-10 md:h-12 flex items-center justify-center">
              <img src={logoImg} alt="V-SCENE Logo" className="h-9 md:h-11 w-auto object-contain" />
            </div>
            <span className="text-base md:text-lg font-bold text-primary ml-2">Final Post-Test (Period {activePeriod})</span>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchToTeacher && (
              <button 
                onClick={onSwitchToTeacher}
                className="text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors flex items-center gap-1 font-label-md px-3 py-1.5 rounded-full font-bold text-xs"
                title="Switch back to Teacher View"
              >
                <span className="material-symbols-rounded text-[18px]">admin_panel_settings</span>
                <span>Teacher View</span>
              </button>
            )}
            <button 
              onClick={onLogout}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-label-md bg-surface-container-low px-4 py-2 rounded-full"
            >
              <span className="material-symbols-rounded text-[18px]">logout</span>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-16 px-4 md:px-6 w-full max-w-3xl mx-auto">
        {/* Interactive Question Navigation Grid & Star Bar */}
        <div className="w-full mb-6 bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest text-xs font-bold">
              QUESTION PROGRESS ({answers.filter(a => a !== -1 && a !== undefined && a !== null).length} / {questions.length})
            </span>

            {/* Icon-Only Star / Bookmark Toggle Button */}
            <button
              onClick={() => toggleStar(currentIndex)}
              className={`p-2 rounded-full transition flex items-center justify-center ${
                starredQuestions[currentIndex]
                  ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-300'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-amber-100 hover:text-amber-800'
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
              const isAnswered = answers[qIdx] !== -1 && answers[qIdx] !== undefined;
              const isStarred = starredQuestions[qIdx];

              let btnStyle = "bg-surface-container-low text-on-surface-variant border border-outline-variant hover:border-primary/50";
              if (isCurrent) {
                btnStyle = "bg-primary text-on-primary font-bold ring-2 ring-primary/40 shadow-sm scale-105";
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

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-10 w-full shadow-sm">
          <div className="mb-6">
            <QuestionHighlighter
              questionId={`posttest_p${activePeriod}_q_${q.id || currentIndex}`}
              questionNumber={currentIndex + 1}
              questionText={q.question}
              imageUrl={q.imageUrl || q.image}
            />
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
