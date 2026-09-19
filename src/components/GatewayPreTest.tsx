import React, { useState, useEffect } from 'react';
import { BATCH1_QUESTIONS, BATCH2_QUESTIONS } from '../data/exams';
import { fetchAndMergeExamsForCategory } from '../lib/examUtils';
import { LogOut } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, getDocs, collection, query, where, runTransaction } from 'firebase/firestore';
import { QuestionHighlighter } from './QuestionHighlighter';

interface GatewayPreTestProps {
  onPass: () => void;
  onLogout: () => void;
  answers: number[];
  setAnswers: (answers: number[]) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  onSwitchToTeacher?: () => void;
}

const GatewayPreTest = ({ onPass, onLogout, answers, setAnswers, currentIndex, setCurrentIndex, onSwitchToTeacher }: GatewayPreTestProps) => {
  const [questions, setQuestions] = useState<any[]>(BATCH1_QUESTIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [allocatedGroup, setAllocatedGroup] = useState<string | null>(null);

  const [activePeriod, setActivePeriod] = useState<number>(1);
  const [starredQuestions, setStarredQuestions] = useState<{ [qIndex: number]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('vscene_gateway_starred');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleStar = (qIdx: number) => {
    setStarredQuestions(prev => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'settings', 'system_config'));
        const period = (configDoc.exists() && configDoc.data().activePeriod) ? configDoc.data().activePeriod : 1;
        setActivePeriod(period);

        const targetCat = period === 2 ? 'pretest_batch2' : 'pretest_batch1';
        const mergedQuestions = await fetchAndMergeExamsForCategory(targetCat);
        setQuestions(mergedQuestions);

        // Restore currentIndex & answers scoped to period
        const savedIdx = localStorage.getItem(`vscene_gateway_p${period}_index`);
        if (savedIdx !== null && !isNaN(Number(savedIdx))) {
          const parsed = Number(savedIdx);
          if (parsed >= 0 && parsed < 30) {
            setCurrentIndex(parsed);
          }
        }

        const savedAns = localStorage.getItem(`vscene_gateway_p${period}_answers`);
        if (savedAns) {
          try {
            const parsedAns = JSON.parse(savedAns);
            if (Array.isArray(parsedAns) && parsedAns.length > 0) {
              setAnswers(parsedAns);
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(`vscene_gateway_p${activePeriod}_starred`, JSON.stringify(starredQuestions));
    } catch (e) {}
  }, [starredQuestions, activePeriod]);

  // Save currentIndex in real-time
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < 30) {
      localStorage.setItem(`vscene_gateway_p${activePeriod}_index`, currentIndex.toString());
    }
  }, [currentIndex, activePeriod]);

  // Save answers in real-time
  useEffect(() => {
    if (answers && answers.length > 0) {
      localStorage.setItem(`vscene_gateway_p${activePeriod}_answers`, JSON.stringify(answers));
    }
  }, [answers, activePeriod]);

  // Poll for allocation if waiting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaiting && auth.currentUser) {
      interval = setInterval(async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.allocatedGroup) {
              setAllocatedGroup(data.allocatedGroup);
              setIsWaiting(false);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaiting]);

  useEffect(() => {
    if (currentIndex >= 30) {
      submitAndWait();
    }
  }, [currentIndex]);

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < 29) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(30);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const calculateScores = () => {
    let totalScore = 0;
    
    answers.forEach((ans, index) => {
      if (index >= 30) return;
      const q = questions[index];
      if (ans === q.correctAnswerIndex) {
        totalScore++;
      }
    });

    return totalScore;
  };

  const getTier = (score: number) => {
    if (score <= 10) return 'Beginner';
    if (score <= 20) return 'Intermediate';
    return 'Advanced';
  };

  const submitAndWait = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    try {
      const totalScore = calculateScores();
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      if (activePeriod === 1) {
        const tier = getTier(totalScore);
        
        // Ensure they get allocated immediately
        let assignedGroup = userData.allocatedGroup;
        
        if (!assignedGroup) {
            // Stratified Randomization
            const usersSnap = await getDocs(query(collection(db, 'users'), where('triageTier', '==', tier)));
            let countA = 0;
            let countB = 0;
            usersSnap.forEach(u => {
              if (u.data().allocatedGroup === 'A') countA++;
              if (u.data().allocatedGroup === 'B') countB++;
            });
            
            if (countA < countB) {
              assignedGroup = 'A';
            } else if (countB < countA) {
              assignedGroup = 'B';
            } else {
              assignedGroup = Math.random() < 0.5 ? 'A' : 'B';
            }
        }

        const triageData = {
          hasCompletedPretest: true,
          pretestScore_batch1: totalScore,
          triageTier: tier,
          pretestAnswers_batch1: answers,
          allocatedGroup: assignedGroup
        };
        await updateDoc(userRef, triageData);
        setAllocatedGroup(assignedGroup);
      } else {
        // Period 2
        await updateDoc(userRef, {
          hasCompletedPretest_period2: true,
          pretestScore_batch2: totalScore,
          pretestAnswers_batch2: answers
        });
        onPass(); // Skip waiting screen and go to dashboard
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting pretest. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (allocatedGroup) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center p-6 antialiased relative">
        <button 
          onClick={onPass}
          className="absolute top-6 right-6 text-xs bg-error text-on-error hover:bg-error/90 px-4 py-2 rounded-full font-label-sm shadow-md transition-colors flex items-center gap-1 z-50 font-bold"
        >
          ⚡ Skip (Dev Pass to Dashboard)
        </button>
         <div className="text-center bg-surface-container-lowest p-10 md:p-14 rounded-[32px] shadow-lg border border-outline-variant max-w-xl w-full animate-in zoom-in-95 duration-500">
            <span className="material-symbols-rounded text-primary text-[80px] mb-6 block mx-auto">
              campaign
            </span>
            <h1 className="text-3xl md:text-5xl font-headline-lg text-on-surface mb-4">ประกาศผล</h1>
            <p className="text-2xl md:text-3xl font-bold text-primary mb-6">คุณได้อยู่กลุ่ม {allocatedGroup}</p>
            
            <div className="bg-surface-container-low p-6 rounded-2xl mb-10 border border-outline-variant/50">
              {allocatedGroup === 'A' ? (
                <p className="font-body-lg text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface block mb-2 text-lg">กลุ่มเรียนด้วย V-SCENE (AI Simulation)</strong>
                  กรุณากดปุ่มด้านล่างเพื่อเข้าสู่ระบบ V-SCENE และเริ่มฝึกซักประวัติผู้ป่วยจำลอง
                </p>
              ) : (
                <p className="font-body-lg text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface block mb-2 text-lg">กลุ่มเรียนด้วย Traditional CBL</strong>
                  กรุณารอเรียนกับอาจารย์ผู้สอนตามที่ได้นัดหมายไว้ (ไม่ต้องใช้ระบบ V-SCENE)
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={onPass}
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-label-lg shadow-md hover:bg-primary-fixed-variant transition-all flex items-center justify-center gap-3 w-full sm:w-auto font-bold"
              >
                เข้าสู่ระบบ V-SCENE <span className="material-symbols-rounded">arrow_forward</span>
              </button>
              {allocatedGroup === 'B' && (
                <button 
                  onClick={onLogout}
                  className="bg-surface-variant text-on-surface-variant px-8 py-4 rounded-full font-label-lg hover:bg-surface-container-highest transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
                >
                  ออกจากระบบ <span className="material-symbols-rounded">logout</span>
                </button>
              )}
            </div>
         </div>
      </div>
    );
  }

  if (currentIndex >= 30 || isWaiting) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center p-4 md:p-6 font-body-md relative">
        <button 
          onClick={onPass}
          className="absolute top-6 right-6 text-xs bg-error text-on-error hover:bg-error/90 px-4 py-2 rounded-full font-label-sm shadow-md transition-colors flex items-center gap-1 z-50 font-bold"
        >
          ⚡ Skip (Dev Pass to Dashboard)
        </button>
        <div className="bg-surface-container-lowest border border-outline-variant max-w-lg w-full rounded-3xl shadow-lg p-10 text-center animate-in zoom-in-95 duration-500">
          <span className="material-symbols-rounded text-primary text-[80px] mb-6 block mx-auto animate-pulse">
            hourglass_empty
          </span>
          <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface mb-4">
            ส่งคำตอบสำเร็จ
          </h2>
          <p className="font-body-lg text-on-surface-variant mb-8 leading-relaxed">
            กรุณารอสักครู่...<br/>
            ระบบกำลังประมวลผลและรออาจารย์ผู้สอนทำการจัดกลุ่มเพื่อมอบหมายเคสผู้ป่วยจำลอง
          </p>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onPass}
              className="bg-primary text-on-primary py-3 rounded-full font-bold shadow hover:bg-primary/90 transition"
            >
              เข้าสู่ระบบ V-SCENE (Dev Bypass)
            </button>
            <button 
              onClick={onLogout}
              className="text-on-surface-variant hover:text-error transition-colors text-sm underline"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;
  const hasAnswered = answers[currentIndex] !== -1;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant w-full top-0 z-40 sticky">
        <div className="flex justify-between items-center px-4 md:px-6 py-4 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-14 md:h-20 overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="V-SCENE Logo" className="h-40 md:h-52 w-auto object-contain" />
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary hidden sm:inline ml-2">Pre-Test (Period {activePeriod})</span>
            <span className="font-headline-md text-xl font-bold text-primary sm:hidden">Pre-Test (P{activePeriod})</span>
          </div>
          <div className="flex items-center gap-3">
            {onSwitchToTeacher && (
              <button 
                onClick={onSwitchToTeacher}
                className="text-xs bg-purple-700 hover:bg-purple-800 text-white px-3.5 py-1.5 rounded-full font-bold shadow-sm transition-all flex items-center gap-1.5"
                title="สลับไปยังมุมมองอาจารย์ผู้สอน (Switch to Teacher View)"
              >
                <span className="material-symbols-rounded text-base">school</span>
                <span className="hidden sm:inline">Teacher View</span>
              </button>
            )}
            <button 
              onClick={onPass}
              className="text-xs bg-error text-on-error hover:bg-error/90 px-3 py-1.5 rounded-full font-label-sm shadow-sm transition-colors"
              title="Developer bypass"
            >
              Skip (Dev)
            </button>
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

      {/* Main Content */}
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

        {/* Question Container */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-10 w-full shadow-sm">
          <div className="mb-6">
            <QuestionHighlighter
              questionId={`pretest_p${activePeriod}_q_${q.id || currentIndex}`}
              questionNumber={currentIndex + 1}
              questionText={q.question}
              imageUrl={q.imageUrl || q.image}
            />
          </div>

          {/* Options Form */}
          <div className="space-y-4" id="mcq-form">
            {q.options.map((opt, idx) => (
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
                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
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

        {/* Bottom Actions */}
        <div className="w-full mt-10 flex justify-center">
          <button 
            onClick={handleNext}
            disabled={!hasAnswered}
            className="bg-primary text-on-primary font-headline-md text-xl px-12 py-4 rounded-full shadow-lg hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {currentIndex === 29 ? 'Submit Test' : 'Continue'}
            {currentIndex !== 29 && <span className="material-symbols-rounded text-[24px]">arrow_forward</span>}
          </button>
        </div>
      </main>
    </div>
  );
};

export default GatewayPreTest;
