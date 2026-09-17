import React from 'react';

interface PatientAvatar3DProps {
  audioElement: HTMLAudioElement | null;
  isSpeakingFallback: boolean;
  patientCase?: any;
}

const PatientAvatar3D = ({ isSpeakingFallback, patientCase }: PatientAvatar3DProps) => {
  const profile = patientCase?.voiceProfile || 'adult_male';
  const imageUrl = `/assets/avatars/${profile}.jpg`;

  return (
    <div className="w-full h-full relative bg-surface-container-lowest flex items-center justify-center overflow-hidden">
      <div 
        className={`relative w-full max-w-[300px] aspect-square rounded-full overflow-hidden border-4 border-surface-container-high shadow-lg transition-transform duration-300 ${isSpeakingFallback ? 'scale-105 ring-4 ring-primary ring-opacity-50' : 'scale-100'}`}
      >
        <img 
          src={imageUrl} 
          alt="Patient Avatar" 
          className="w-full h-full object-cover"
        />
        {isSpeakingFallback && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAvatar3D;
