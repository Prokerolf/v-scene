import React, { useEffect, useRef, useState } from 'react';

interface PatientCase {
  id?: string;
  diseaseName?: string;
  patientName?: string;
  age?: number;
  gender?: string;
  chiefComplaint?: string;
}

interface PatientAvatarSVGProps {
  audioElement: HTMLAudioElement | null;
  isSpeakingFallback: boolean;
  patientCase?: PatientCase | null;
}

const PatientAvatarSVG = ({ audioElement, isSpeakingFallback, patientCase }: PatientAvatarSVGProps) => {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const requestRef = useRef<number>();
  
  const [mouthOpenness, setMouthOpenness] = useState(0.2); // 0.2 is closed, up to ~4.0 for fully open

  // Setup Web Audio API
  useEffect(() => {
    if (!audioElement) {
      analyserRef.current = null;
      setMouthOpenness(0.2);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioCtx.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      return () => {
        source.disconnect();
        analyser.disconnect();
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      };
    } catch (err) {
      console.warn("Could not setup Web Audio API for SVG lip sync", err);
    }
  }, [audioElement]);

  // Animation Loop for Lip Sync
  useEffect(() => {
    const updateMouth = () => {
      let volume = 0;

      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        volume = sum / dataArrayRef.current.length;
      } else if (isSpeakingFallback) {
        // Fake volume for fallback TTS
        volume = Math.random() > 0.5 ? Math.random() * 100 + 50 : 0;
      }

      // Smooth easing for mouth
      setMouthOpenness(prev => {
        // Map volume (0-255) to mouth drop (0 to ~25)
        let target = (volume / 100) * 20;
        if (target > 25) target = 25; 
        if (target < 0) target = 0;
        
        // Lerp factor
        return prev + (target - prev) * 0.4;
      });

      requestRef.current = requestAnimationFrame(updateMouth);
    };

    requestRef.current = requestAnimationFrame(updateMouth);
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isSpeakingFallback]);

  // Procedural Traits based on patient case
  const isMale = patientCase?.gender !== 'หญิง';
  const age = patientCase?.age || 30;
  const isOld = age >= 50;
  
  const hairColor = isOld ? "#94a3b8" : "#451a03";
  const skinColor = "#fcdbb3";

  return (
    <div className="w-full h-full flex items-center justify-center bg-sky-100 overflow-hidden relative">
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full drop-shadow-xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(0, 20)">
          
          {/* Hair Back (For Female) */}
          {!isMale && (
            <path d="M 40 100 Q 30 180 50 180 Q 70 180 60 100 Z" fill={hairColor} />
          )}
          {!isMale && (
            <path d="M 160 100 Q 170 180 150 180 Q 130 180 140 100 Z" fill={hairColor} />
          )}

          {/* Ears */}
          <circle cx="35" cy="100" r="15" fill="#f0c08b" />
          <circle cx="165" cy="100" r="15" fill="#f0c08b" />

          {/* Base Face (Cute Round) */}
          <ellipse cx="100" cy="105" rx="70" ry="60" fill={skinColor} />
          
          {/* Hair Front */}
          {isMale ? (
            // Spiky/Messy Boy Hair
            <path 
              d="M 30 80 Q 30 30 100 25 Q 170 30 170 80 Q 140 40 100 45 Q 60 40 30 80" 
              fill={hairColor} 
            />
          ) : (
            // Bangs for Girl
            <path 
              d="M 30 80 Q 30 25 100 25 Q 170 25 170 80 Q 150 50 100 50 Q 50 50 30 80" 
              fill={hairColor} 
            />
          )}

          {/* Wrinkles for older patients */}
          {isOld && (
            <g stroke="#d4a373" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6">
              <path d="M 80 55 Q 100 60 120 55" />
              <path d="M 75 65 Q 100 70 125 65" />
              <path d="M 45 100 Q 50 110 55 120" />
              <path d="M 155 100 Q 150 110 145 120" />
            </g>
          )}

          {/* Blush */}
          <ellipse cx="55" cy="115" rx="14" ry="9" fill="#fca5a5" opacity="0.6" />
          <ellipse cx="145" cy="115" rx="14" ry="9" fill="#fca5a5" opacity="0.6" />

          {/* Eyes (Cute big dots) */}
          <circle cx="65" cy="95" r="7" fill="#1e293b" />
          <circle cx="135" cy="95" r="7" fill="#1e293b" />
          
          {/* Eyelashes for female */}
          {!isMale && (
            <g stroke="#1e293b" strokeWidth="2" strokeLinecap="round">
              <path d="M 55 88 L 50 82" />
              <path d="M 145 88 L 150 82" />
            </g>
          )}

          {/* Nose */}
          <path d="M 95 110 Q 100 115 105 110" fill="none" stroke="#d4a373" strokeWidth="3" strokeLinecap="round" />

          {/* Mustache for old male */}
          {isMale && isOld && (
            <path d="M 85 122 Q 100 115 115 122 Q 100 128 85 122" fill={hairColor} opacity="0.8" />
          )}

          {/* Animated Mouth (Smile that opens) */}
          <path 
            d={`M 85 130 Q 100 135 115 130 Q 100 ${135 + mouthOpenness} 85 130`} 
            fill="#be123c" 
            stroke="#be123c"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Cute Outfit Base */}
          <path d="M 45 160 Q 100 140 155 160 L 170 200 L 30 200 Z" fill={isMale ? "#38bdf8" : "#fb7185"} />
          <path d="M 80 160 Q 100 175 120 160 L 100 180 Z" fill={isMale ? "#0284c7" : "#e11d48"} />
        </g>
      </svg>
    </div>
  );
};

export default PatientAvatarSVG;
