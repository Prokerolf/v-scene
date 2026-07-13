import React from 'react';
import { X, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CaseLog {
  preTestScore?: number;
  assignedTier?: string;
  [key: string]: any;
}

interface ClassAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: CaseLog[];
  cases: any[];
}

const calculateStudentScores = (log: CaseLog, caseData: any) => {
  if (!caseData) return { historyScore: 0, labScore: 0, ddxScore: 0, treatmentScore: 0 };

  // 1. Lab Score
  const goldLabs = caseData.goldStandardLabs || [];
  const selectedLabs = log.selectedLabs || [];
  const correctLabs = selectedLabs.filter((l: string) => goldLabs.includes(l));
  const labScore = goldLabs.length > 0 ? (correctLabs.length / goldLabs.length) * 100 : 100;

  // 2. Treatment Score
  const goldDrugs = caseData.goldStandardDrugs || [];
  const contraDrugs = caseData.contraindicatedDrugs || [];
  const selectedDrugs = log.selectedDrugs || [];
  const correctDrugs = selectedDrugs.filter((d: string) => goldDrugs.includes(d));
  const badDrugsCount = selectedDrugs.filter((d: string) => contraDrugs.includes(d)).length;
  
  let treatmentScore = goldDrugs.length > 0 ? (correctDrugs.length / goldDrugs.length) * 100 : 100;
  treatmentScore -= (badDrugsCount * 20); // Penalty
  treatmentScore = Math.max(0, Math.min(100, treatmentScore));

  // 3. DDx Score
  let ddxScore = 0;
  const finalDiag = (log.finalDiagnosis || '').toLowerCase();
  const ddxKeywords = caseData.ddxKeywords || [];
  const finalKeywords = caseData.finalDiagnosisKeywords || [];
  
  if (finalKeywords.some((k: string) => finalDiag.includes(k.toLowerCase()))) {
    ddxScore = 100;
  } else {
    const submittedDDx = log.submittedDDx || [];
    const hasPartial = submittedDDx.some((dx: string) => 
      ddxKeywords.some((k: string) => dx.toLowerCase().includes(k.toLowerCase()))
    );
    if (hasPartial) ddxScore = 50;
  }

  // 4. History Score (Proxy based on chat depth)
  const chatHistory = log.chatHistory || [];
  // Assuming a thorough history needs about 12 messages total (6 Q&A pairs)
  const historyScore = Math.min((chatHistory.length / 12) * 100, 100);

  return {
    historyScore,
    labScore,
    ddxScore,
    treatmentScore
  };
};

export const ClassAnalyticsModal: React.FC<ClassAnalyticsModalProps> = ({ isOpen, onClose, logs, cases }) => {
  const { t } = useTranslation();
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = selectedCaseId === 'all' 
    ? logs 
    : logs.filter(l => l.activeCaseId === selectedCaseId);

  // Calculate Distributions
  const totalLogs = filteredLogs.length || 1; // Prevent division by zero
  const highTier = filteredLogs.filter(l => (l.preTestScore || 0) >= 7).length;
  const midTier = filteredLogs.filter(l => (l.preTestScore || 0) >= 4 && (l.preTestScore || 0) < 7).length;
  const lowTier = filteredLogs.filter(l => (l.preTestScore || 0) < 4).length;

  const highPct = Math.round((highTier / totalLogs) * 100);
  const midPct = Math.round((midTier / totalLogs) * 100);
  const lowPct = Math.round((lowTier / totalLogs) * 100);

  // Calculate Average Real Skills Data
  let sumHistory = 0;
  let sumLab = 0;
  let sumDdx = 0;
  let sumTreatment = 0;
  let validLogsCount = 0;

  filteredLogs.forEach(log => {
    const caseData = cases.find(c => c.id === log.activeCaseId);
    if (caseData) {
      const scores = calculateStudentScores(log, caseData);
      sumHistory += scores.historyScore;
      sumLab += scores.labScore;
      sumDdx += scores.ddxScore;
      sumTreatment += scores.treatmentScore;
      validLogsCount++;
    }
  });

  const avgHistory = validLogsCount > 0 ? Math.round(sumHistory / validLogsCount) : 0;
  const avgLab = validLogsCount > 0 ? Math.round(sumLab / validLogsCount) : 0;
  const avgDdx = validLogsCount > 0 ? Math.round(sumDdx / validLogsCount) : 0;
  const avgTreatment = validLogsCount > 0 ? Math.round(sumTreatment / validLogsCount) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-primary';
    if (score >= 60) return 'bg-secondary';
    return 'bg-error';
  };

  const skills = [
    { name: t('teacher.history_skill'), score: avgHistory, color: getScoreColor(avgHistory) },
    { name: t('teacher.ddx_skill'), score: avgDdx, color: getScoreColor(avgDdx) },
    { name: t('teacher.lab_skill'), score: avgLab, color: getScoreColor(avgLab) },
    { name: t('teacher.treatment_skill'), score: avgTreatment, color: getScoreColor(avgTreatment) }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <div>
            <h2 className="font-headline-md text-2xl text-on-surface flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              {t('teacher.analytics_title')}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="font-body-sm text-on-surface-variant">{t('teacher.analytics_subtitle')}</p>
              <select 
                value={selectedCaseId} 
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="bg-surface border border-outline-variant rounded-md px-2 py-1 text-sm text-on-surface outline-none focus:border-primary"
              >
                <option value="all">All Cases</option>
                {cases?.map(c => (
                  <option key={c.id} value={c.id}>{c.diseaseName}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Top Row: Distribution & AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Performance Distribution */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 shadow-sm">
              <h3 className="font-headline-sm text-lg text-on-surface mb-4">{t('teacher.performance_dist')}</h3>
              
              <div className="space-y-4">
                {/* High Tier */}
                <div>
                  <div className="flex justify-between font-label-sm mb-1">
                    <span className="text-on-surface">{t('teacher.high_tier')}</span>
                    <span className="text-primary font-bold">{highPct}% ({highTier})</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${highPct}%` }}></div>
                  </div>
                </div>

                {/* Mid Tier */}
                <div>
                  <div className="flex justify-between font-label-sm mb-1">
                    <span className="text-on-surface">{t('teacher.mid_tier')}</span>
                    <span className="text-secondary font-bold">{midPct}% ({midTier})</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: `${midPct}%` }}></div>
                  </div>
                </div>

                {/* Low Tier */}
                <div>
                  <div className="flex justify-between font-label-sm mb-1">
                    <span className="text-on-surface">{t('teacher.low_tier')}</span>
                    <span className="text-error font-bold">{lowPct}% ({lowTier})</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-error rounded-full transition-all duration-1000" style={{ width: `${lowPct}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-primary-container/30 border border-primary/20 rounded-2xl p-5 shadow-sm flex flex-col">
              <h3 className="font-headline-sm text-lg text-on-primary-container mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                {t('teacher.ai_insights')}
              </h3>
              <p className="font-body-md text-on-surface-variant leading-relaxed bg-surface-container-lowest/50 p-4 rounded-xl border border-primary/10 flex-1">
                {t('teacher.ai_insights_desc')}
              </p>
            </div>

          </div>

          {/* Bottom Row: Skills Breakdown */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-headline-sm text-lg text-on-surface">{t('teacher.skills_breakdown')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm">
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    {/* Simple CSS Circle Progress */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-surface-container-highest" />
                      <circle 
                        cx="28" cy="28" r="24" 
                        stroke="currentColor" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={`${2 * Math.PI * 24}`} 
                        strokeDashoffset={`${2 * Math.PI * 24 * (1 - skill.score / 100)}`} 
                        className={skill.color.replace('bg-', 'text-')}
                        strokeLinecap="round" 
                      />
                    </svg>
                    <span className="absolute font-label-md font-bold text-on-surface text-sm">{skill.score}%</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-label-md text-on-surface">{skill.name}</h4>
                    <p className="font-body-sm text-on-surface-variant mt-0.5">
                      {skill.score >= 80 ? 'Excellent' : skill.score >= 60 ? 'Average' : 'Needs Improvement'}
                    </p>
                  </div>
                  {skill.score < 60 && (
                    <AlertTriangle className="w-5 h-5 text-error shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex justify-end">
          <button onClick={onClose} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md hover:bg-primary-fixed-variant transition-colors shadow-sm">
            {t('common.close')}
          </button>
        </div>

      </div>
    </div>
  );
};
