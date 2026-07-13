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
}

export const ClassAnalyticsModal: React.FC<ClassAnalyticsModalProps> = ({ isOpen, onClose, logs }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Calculate Distributions
  const totalLogs = logs.length || 1; // Prevent division by zero
  const highTier = logs.filter(l => (l.preTestScore || 0) >= 7).length;
  const midTier = logs.filter(l => (l.preTestScore || 0) >= 4 && (l.preTestScore || 0) < 7).length;
  const lowTier = logs.filter(l => (l.preTestScore || 0) < 4).length;

  const highPct = Math.round((highTier / totalLogs) * 100);
  const midPct = Math.round((midTier / totalLogs) * 100);
  const lowPct = Math.round((lowTier / totalLogs) * 100);

  // Simulated Skills Data
  const skills = [
    { name: t('teacher.history_skill'), score: 85, color: 'bg-primary' },
    { name: t('teacher.ddx_skill'), score: 72, color: 'bg-secondary' },
    { name: t('teacher.lab_skill'), score: 65, color: 'bg-tertiary' },
    { name: t('teacher.treatment_skill'), score: 45, color: 'bg-error' }
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
            <p className="font-body-sm text-on-surface-variant mt-1">{t('teacher.analytics_subtitle')}</p>
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
              <span className="bg-surface-variant text-on-surface-variant text-xs px-2 py-0.5 rounded-full">Coming Soon</span>
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
