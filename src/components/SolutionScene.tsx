import React from 'react';
import { AlertCircle, ArrowRight, Activity, BookOpen, Bot, Brain, BrainCircuit, CheckCircle2, ChevronRight, Lightbulb, Pill, ShieldCheck, TestTube, XCircle } from 'lucide-react';
import { labOptions } from './LabOrderScene';
import { drugOptions } from './TreatmentScene';

interface SolutionSceneProps {
  patientCase: any;
  preTestScore: number;
  preTestAnswers: number[];
  submittedDDx: string;
  selectedLabs: string[];
  selectedDrugs: string[];
  studentActionsLog: {dimension: string, action: string, mistake: string, tag: string}[];
  onFinish: () => void;
}

const SolutionScene = ({ 
  patientCase, 
  preTestScore, 
  preTestAnswers, 
  submittedDDx, 
  selectedLabs, 
  selectedDrugs, 
  studentActionsLog,
  onFinish 
}: SolutionSceneProps) => {

  const PRE_TEST_QUESTIONS = patientCase?.preTestQuestions || [];
  const gaveContraindicated = patientCase?.contraindicatedDrugs?.some((d: string) => selectedDrugs.includes(d));
  const missedGoldStandardDrug = patientCase?.goldStandardDrugs?.some((d: string) => !selectedDrugs.includes(d));
  
  const labOveruse = selectedLabs.length > 5;
  const missedLabs = patientCase?.goldStandardLabs?.filter((l: string) => !selectedLabs.includes(l));

  // --- Holistic Recommendation Logic ---
  const getPreTestRec = () => {
    if (preTestScore <= 3) return "It looks like you might need to review basic anatomy and physiology related to this system.";
    if (preTestScore <= 6) return "Good foundational knowledge, but you might want to brush up on specific pathologies and treatments.";
    return "Excellent foundational knowledge! You are well-prepared for complex clinical concepts.";
  };

  const getHistoryRec = () => {
    const isClose = submittedDDx.toLowerCase().includes(patientCase?.diseaseName?.toLowerCase().split(' ')[0] || '');
    if (isClose) return "Great history taking and localization! You identified the likely disease effectively.";
    return "You may have missed some key temporal aspects of the symptoms. Try to focus on the onset and progression to better differentiate conditions.";
  };

  const getLabRec = () => {
    if (labOveruse) return "You ordered a 'shotgun' panel. Review Rational Lab Use (RLU) principles and try to order only tests necessary to confirm or rule out your specific DDx.";
    if (missedLabs && missedLabs.length > 2) return "You missed some critical investigations. Make sure to review Clinical Practice Guidelines (CPG) for this presentation.";
    return "Lab ordering was precise and cost-effective. Excellent use of RLU!";
  };

  const getDrugRec = () => {
    if (gaveContraindicated) return "CRITICAL WARNING: You prescribed a contraindicated medication. Always review patient constraints carefully (RDU).";
    if (missedGoldStandardDrug) return "You missed the gold standard treatment, which could delay optimal care. Review the treatment guidelines.";
    return "Safe and effective treatment plan. Great adherence to Rational Drug Use (RDU)!";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container pb-32">
      {/* Banner */}
      <div className="bg-surface-container-highest border-b border-outline-variant text-on-surface-variant text-center py-2 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm z-20 relative">
        <span className="material-symbols-rounded text-primary text-[20px]">shield</span>
        Safe Sandbox Mode: End of Case Debriefing (No Grading)
      </div>

      <header className="bg-primary-container text-on-primary-container px-6 py-12 text-center shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 0%, transparent 60%)' }}></div>
        <h1 className="font-headline-lg font-bold text-3xl md:text-5xl tracking-wide flex items-center justify-center gap-4 relative z-10">
          <span className="material-symbols-rounded text-[48px] text-primary">lightbulb</span>
          Debriefing & Feedback 
        </h1>
        <p className="mt-4 font-body-lg text-lg max-w-2xl mx-auto relative z-10 opacity-90">
          Thank you for completing this case! Review the clinical breakdown and AI feedback below to understand the Gold Standard approach and identify areas for growth.
        </p>
      </header>

      <main className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-12 mt-4 relative z-10">
        
        {/* ================= PART A: PRE-TEST REVIEW ================= */}
        <section className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="bg-surface-container px-6 py-5 border-b border-outline-variant flex items-center gap-3">
            <div className="bg-surface-container-high p-2.5 rounded-xl"><span className="material-symbols-rounded text-[24px] text-primary">psychology</span></div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface">Part A: Pre-test Review</h2>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-black text-3xl shrink-0">
                {preTestScore}/{PRE_TEST_QUESTIONS.length}
              </div>
              <div className="text-center md:text-left">
                <p className="font-headline-md text-lg text-on-surface mb-2">Your pre-test score unlocked the <strong>"{patientCase?.tier}"</strong> difficulty tier for this case.</p>
                <p className="font-body-md text-on-surface-variant">Reviewing foundational concepts directly improves clinical localization accuracy.</p>
              </div>
            </div>

            <div className="space-y-6">
              {PRE_TEST_QUESTIONS.map((q: any, idx: number) => {
                const isCorrect = preTestAnswers[idx] === q.correctAnswerIndex;
                const studentAns = q.options[preTestAnswers[idx]];
                const correctAns = q.options[q.correctAnswerIndex];

                return (
                  <div key={q.id} className={`p-5 md:p-6 rounded-2xl border ${isCorrect ? 'bg-primary-container/10 border-primary/20' : 'bg-error-container/10 border-error/20'}`}>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {isCorrect ? (
                        <span className="material-symbols-rounded text-[28px] text-primary shrink-0 sm:mt-0.5 hidden sm:block">check_circle</span>
                      ) : (
                        <span className="material-symbols-rounded text-[28px] text-error shrink-0 sm:mt-0.5 hidden sm:block">cancel</span>
                      )}
                      <div className="w-full">
                        <p className="font-label-md text-base text-on-surface mb-3 flex items-start gap-2 leading-relaxed">
                           {isCorrect ? (
                            <span className="material-symbols-rounded text-[24px] text-primary shrink-0 mt-0.5 sm:hidden">check_circle</span>
                          ) : (
                            <span className="material-symbols-rounded text-[24px] text-error shrink-0 mt-0.5 sm:hidden">cancel</span>
                          )}
                          <span>{idx + 1}. {q.question}</span>
                        </p>
                        <div className="font-body-md text-sm md:text-base space-y-1.5 mb-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50">
                          {!isCorrect && <p className="text-error line-through">Your Answer: {studentAns || 'Skipped'}</p>}
                          <p className="text-primary font-bold">Correct Answer: {correctAns}</p>
                        </div>
                        <p className="font-body-md text-sm md:text-base text-on-surface-variant bg-surface-container-low p-4 rounded-xl border border-outline-variant/50 leading-relaxed shadow-sm">
                          <span className="font-label-md text-primary mr-2 block sm:inline">Explanation:</span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= PART B: CASE SOLUTION ================= */}
        <section className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="bg-secondary-container/30 px-6 py-5 border-b border-outline-variant flex items-center gap-3">
            <div className="bg-secondary-container p-2.5 rounded-xl"><span className="material-symbols-rounded text-[24px] text-secondary">neurology</span></div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface">Part B: Case Solution ({patientCase?.diseaseName})</h2>
          </div>
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Diagnosis */}
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-[24px] text-secondary">hub</span> Diagnosis & Localization
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant">
                  <p className="font-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Your Final DDx</p>
                  <p className="font-headline-md text-on-surface font-medium text-lg">{submittedDDx || "Not provided"}</p>
                </div>
                <div className="bg-secondary-container/20 rounded-2xl p-5 border border-secondary shadow-sm">
                  <p className="font-label-sm font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-rounded text-[16px]">verified</span> Gold Standard
                  </p>
                  <p className="font-headline-md text-secondary font-bold text-lg">{patientCase?.diseaseName}</p>
                  <div className="mt-4 font-body-md text-sm text-on-surface-variant space-y-2 bg-surface-container-lowest p-3 rounded-xl">
                    <p><strong className="text-on-surface">Localization:</strong> {patientCase?.localization}</p>
                    <p><strong className="text-on-surface">Etiology:</strong> {patientCase?.etiology}</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant" />

            {/* Labs */}
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-[24px] text-tertiary">biotech</span> Rational Lab Use
              </h3>
              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant">
                <p className="font-label-md font-bold text-on-surface mb-3">Gold Standard Investigations for this case:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {patientCase?.goldStandardLabs?.map((labId: string) => (
                    <span key={labId} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm text-on-surface font-medium shadow-sm flex items-center gap-2">
                      <span className="material-symbols-rounded text-[16px] text-tertiary">science</span>
                      {labOptions.find(l => l.id === labId)?.name || `Lab ID: ${labId}`}
                    </span>
                  ))}
                </div>
                {labOveruse && <p className="font-label-sm text-error font-medium mt-3 flex items-center gap-2 bg-error-container/30 p-3 rounded-xl border border-error/20"><span className="material-symbols-rounded text-[18px]">warning</span> You ordered unnecessary labs (Shotgun approach).</p>}
              </div>
            </div>

            {/* Part C: AI Personalized Remediation Matrix */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant p-6 md:p-8 mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/20 rounded-bl-full -z-10 blur-xl"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-primary-container p-3 rounded-xl">
              <span className="material-symbols-rounded text-[32px] text-primary">smart_toy</span>
            </div>
            <div>
              <h2 className="font-headline-md text-2xl font-bold text-on-surface">AI Personalized Remediation Matrix</h2>
              <p className="font-body-md text-on-surface-variant mt-1">Cross-analyzed from your Formative Telemetry Log</p>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-2xl border border-outline-variant overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-highest text-on-surface-variant font-label-md text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold border-b border-outline-variant w-1/4">Dimension</th>
                  <th className="px-6 py-4 font-semibold border-b border-outline-variant w-1/4">Your Action</th>
                  <th className="px-6 py-4 font-semibold border-b border-outline-variant w-1/4">The Mistake / Gap</th>
                  <th className="px-6 py-4 font-semibold border-b border-outline-variant w-1/4">Actionable Remediation Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-body-md">
                {studentActionsLog.map((log, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-5 font-bold text-on-surface bg-surface-bright/50">{log.dimension}</td>
                    <td className="px-6 py-5 text-on-surface-variant font-medium">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-error-container text-on-error-container rounded-lg border border-error/20 text-sm">
                        <span className="material-symbols-rounded text-[16px]">cancel</span>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-sm leading-relaxed">{log.mistake}</td>
                    <td className="px-6 py-5">
                      <a href="#" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-fixed-variant hover:underline font-semibold text-sm transition-colors group">
                        {log.tag}
                        <span className="material-symbols-rounded text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </a>
                    </td>
                  </tr>
                ))}
                {studentActionsLog.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant bg-surface-container-lowest">
                      <span className="material-symbols-rounded text-[48px] text-primary/50 mx-auto mb-3 block">verified</span>
                      <p className="font-label-md text-lg text-on-surface mb-1">Great job! No major gaps detected.</p>
                      <p className="text-sm">Your telemetry looks clean.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

            <hr className="border-outline-variant" />

            {/* Drugs */}
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-[24px] text-primary">prescriptions</span> Rational Drug Use
              </h3>
              
              {gaveContraindicated && (
                <div className="bg-error-container/20 border border-error/30 rounded-2xl p-6 mb-5 flex gap-4 shadow-sm">
                  <span className="material-symbols-rounded text-[32px] text-error flex-shrink-0 mt-1">warning</span>
                  <div>
                    <h4 className="font-label-md font-bold text-error text-lg mb-1">Critical Error: Contraindicated Medication Prescribed!</h4>
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                      You prescribed a medication that is strictly contraindicated for this patient based on their profile. Always review patient constraints carefully before prescribing (e.g., giving rt-PA outside the 4.5h window or with active bleeding risks).
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant shadow-sm">
                <p className="font-label-md font-bold text-on-surface mb-3">Gold Standard Treatment for this case:</p>
                <div className="flex flex-wrap gap-2">
                  {patientCase?.goldStandardDrugs?.map((drugId: string) => (
                    <span key={drugId} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl text-sm shadow-sm font-bold flex items-center gap-2">
                      <span className="material-symbols-rounded text-[16px] text-primary">medication</span>
                      {drugOptions.find(d => d.id === drugId)?.name || `Drug ID: ${drugId}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= PART C: AI PERSONALIZED STUDY PLAN ================= */}
        <section className="bg-primary text-on-primary rounded-3xl shadow-xl overflow-hidden relative border border-outline-variant/30">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <span className="material-symbols-rounded text-[150px]">auto_awesome</span>
          </div>
          <div className="px-6 py-6 border-b border-on-primary/10 flex items-center gap-3 relative z-10 bg-on-primary/5">
            <div className="bg-on-primary/20 p-2.5 rounded-xl backdrop-blur-sm"><span className="material-symbols-rounded text-[24px]">menu_book</span></div>
            <h2 className="font-headline-md text-xl font-bold">Part C: AI Personalized Study Plan</h2>
          </div>
          
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 relative z-10">
            
            {/* Dimension 1: Pre-test */}
            <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-6 border border-on-primary/10 hover:bg-surface-container-lowest/20 transition-colors shadow-sm">
              <h3 className="text-on-primary/70 font-label-md text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><span className="material-symbols-rounded text-[18px]">neurology</span> 1. Foundational Knowledge</h3>
              <p className="font-body-md text-base leading-relaxed">{getPreTestRec()}</p>
            </div>

            {/* Dimension 2: History Taking */}
            <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-6 border border-on-primary/10 hover:bg-surface-container-lowest/20 transition-colors shadow-sm">
              <h3 className="text-on-primary/70 font-label-md text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><span className="material-symbols-rounded text-[18px]">forum</span> 2. Clinical Reasoning & Logic</h3>
              <p className="font-body-md text-base leading-relaxed">{getHistoryRec()}</p>
            </div>

            {/* Dimension 3: Lab Ordering */}
            <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-6 border border-on-primary/10 hover:bg-surface-container-lowest/20 transition-colors shadow-sm">
              <h3 className="text-on-primary/70 font-label-md text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><span className="material-symbols-rounded text-[18px]">biotech</span> 3. Rational Lab Use (RLU)</h3>
              <p className="font-body-md text-base leading-relaxed">{getLabRec()}</p>
            </div>

            {/* Dimension 4: Prescription */}
            <div className="bg-surface-container-lowest/10 backdrop-blur-md rounded-2xl p-6 border border-on-primary/10 hover:bg-surface-container-lowest/20 transition-colors shadow-sm">
              <h3 className="text-on-primary/70 font-label-md text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><span className="material-symbols-rounded text-[18px]">prescriptions</span> 4. Rational Drug Use (RDU)</h3>
              <p className="font-body-md text-base leading-relaxed">{getDrugRec()}</p>
            </div>

          </div>
        </section>

      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant p-4 md:p-6 flex justify-center z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <button 
          onClick={onFinish}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-full font-label-md transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-base md:text-lg"
        >
          Return to Dashboard <span className="material-symbols-rounded text-[24px]">home</span>
        </button>
      </div>
    </div>
  );
};

export default SolutionScene;
