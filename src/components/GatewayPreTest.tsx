import React, { useState } from 'react';
import { GATEWAY_QUESTIONS } from '../data/gatewayQuestions';
import { LogOut } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface GatewayPreTestProps {
  onPass: () => void;
  onLogout: () => void;
  answers: number[];
  setAnswers: (answers: number[]) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const GatewayPreTest = ({ onPass, onLogout, answers, setAnswers, currentIndex, setCurrentIndex }: GatewayPreTestProps) => {
  const [isFinished, setIsFinished] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  
  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < 19) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(20);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === GATEWAY_QUESTIONS[index].correctAnswerIndex ? 1 : 0);
    }, 0);
  };

  if (currentIndex >= 20 || isFinished) {
    const score = calculateScore();
    const passed = score >= 14;

    if (passed) {
      return (
        <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6 font-body-md">
          <div className="bg-surface-container-lowest border border-outline-variant max-w-lg w-full rounded-3xl shadow-lg p-10 text-center animate-in zoom-in-95 duration-500">
            <span className="material-symbols-rounded text-primary text-[80px] mb-6 block mx-auto">check_circle</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Access Granted!</h2>
            <p className="font-body-lg text-on-surface-variant mb-8">
              Congratulations. You scored {score}/20, demonstrating sufficient baseline knowledge to enter the simulation.
            </p>
            <button 
              onClick={onPass}
              className="w-full bg-primary text-on-primary font-label-md px-8 py-4 rounded-full shadow-md hover:bg-primary-fixed-variant transition-colors flex items-center justify-center gap-2"
            >
              Enter Main Dashboard <span className="material-symbols-rounded text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>
      );
    } else {
      // Failed - Show Remediation
      const mistakes = answers.map((ans, idx) => ({
        question: GATEWAY_QUESTIONS[idx],
        isWrong: ans !== GATEWAY_QUESTIONS[idx].correctAnswerIndex
      })).filter(m => m.isWrong);

      // Extract unique slides
      const slidesToReview = Array.from(new Set(mistakes.map(m => m.question.relatedSlide)));

      return (
        <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6 font-body-md">
          <div className="bg-surface-container-lowest border border-outline-variant max-w-2xl w-full rounded-3xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="bg-error-container p-8 border-b border-error-container/50 text-center">
              <span className="material-symbols-rounded text-error text-[80px] mb-4 block mx-auto">gpp_maybe</span>
              <h2 className="font-headline-lg text-headline-lg text-on-error-container mb-2">Access Denied</h2>
              <p className="font-body-lg text-on-error-container opacity-90">
                Score: {score}/20 (Required: 14)
              </p>
            </div>
            <div className="p-8">
              <p className="font-body-lg text-on-surface-variant mb-6">
                Your baseline knowledge is currently below the required threshold to benefit from the clinical simulations. Please review the following lecture slides before re-testing.
              </p>
              <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 mb-8">
                <h3 className="font-label-md text-on-surface mb-4 flex items-center gap-2 text-lg">
                  <span className="material-symbols-rounded text-primary text-[24px]">menu_book</span> Required Review Materials:
                </h3>
                <ul className="space-y-3">
                  {(showAllTopics ? slidesToReview : slidesToReview.slice(0, 5)).map((slide, idx) => (
                    <li key={idx} className="flex items-center gap-3 font-body-md text-on-surface-variant">
                      <span className="material-symbols-rounded text-error text-[20px]">cancel</span> {slide}
                    </li>
                  ))}
                  {slidesToReview.length > 5 && (
                    <li 
                      className="text-primary font-label-md pl-8 cursor-pointer hover:underline transition-all mt-2"
                      onClick={() => setShowAllTopics(!showAllTopics)}
                    >
                      {showAllTopics ? "Show less" : `...and ${slidesToReview.length - 5} more topics. Click to view.`}
                    </li>
                  )}
                </ul>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={onLogout}
                  className="flex-1 bg-surface-variant hover:bg-surface-container-highest text-on-surface-variant font-label-md py-4 rounded-full transition-colors flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-rounded text-[20px]">logout</span> Logout
                </button>
                <button 
                  onClick={() => {
                    setAnswers(new Array(20).fill(-1));
                    setCurrentIndex(0);
                    setIsFinished(false);
                    setShowAllTopics(false);
                  }}
                  className="flex-1 bg-primary text-on-primary font-label-md py-4 rounded-full shadow-md hover:bg-primary-fixed-variant transition-colors"
                >
                  Retake Test Now
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  const q = GATEWAY_QUESTIONS[currentIndex];
  const hasAnswered = answers[currentIndex] !== -1;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant w-full top-0 z-40 sticky">
        <div className="flex justify-between items-center px-4 md:px-6 py-4 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-14 md:h-20 overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="Bridge AI Logo" className="h-40 md:h-52 w-auto object-contain" />
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary hidden sm:inline ml-2">Gateway Pre-Test</span>
            <span className="font-headline-md text-xl font-bold text-primary sm:hidden">Pre-Test</span>
          </div>
          <div className="flex items-center gap-4">
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
        {/* Progress Indicator */}
        <div className="w-full mb-8 px-2">
          <div className="flex justify-between items-center mb-3">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest">Question Progress</span>
            <span className="font-label-md text-primary font-bold">{currentIndex + 1} / 20</span>
          </div>
          <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
            <div 
              className="h-full bg-secondary-container transition-all duration-500 ease-in-out rounded-full" 
              style={{ width: `${((currentIndex) / 20) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Container */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-10 w-full shadow-sm">
          <div className="mb-10">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-6 leading-tight">
              {q.question}
            </h1>
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
            {currentIndex === 19 ? 'Submit Test' : 'Continue'}
            {currentIndex !== 19 && <span className="material-symbols-rounded text-[24px]">arrow_forward</span>}
          </button>
        </div>
      </main>
    </div>
  );
};

export default GatewayPreTest;
