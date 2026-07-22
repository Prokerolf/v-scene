import React, { useEffect, useRef, useState } from 'react';

interface PatientAvatarRealisticProps {
  audioElement: HTMLAudioElement | null;
  isSpeakingFallback: boolean;
  patientCase?: any | null;
}

const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
export const sharedAudioCtx = AudioContextClass ? new AudioContextClass() : null;

const PatientAvatarRealistic = ({ audioElement, isSpeakingFallback, patientCase }: PatientAvatarRealisticProps) => {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const requestRef = useRef<number>();
  
  const [volume, setVolume] = useState(0);

  // Setup Web Audio API
  useEffect(() => {
    if (!audioElement) {
      setVolume(0);
      return;
    }

    try {
      if (!sharedAudioCtx) return;
      if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
      }
      
      let source = (audioElement as any)._mediaElementSource;
      let analyser = (audioElement as any)._mediaElementAnalyser;

      if (!source || !analyser) {
         source = sharedAudioCtx.createMediaElementSource(audioElement);
         analyser = sharedAudioCtx.createAnalyser();
         analyser.fftSize = 256;
         
         source.connect(analyser);
         analyser.connect(sharedAudioCtx.destination);
         
         (audioElement as any)._mediaElementSource = source;
         (audioElement as any)._mediaElementAnalyser = analyser;
      }
      
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      return () => {
         // Do not disconnect the Web Audio graph to prevent Safari from muting the audio element forever
         analyserRef.current = null;
      };
    } catch (err) {
      console.warn("Could not setup Web Audio API for lip sync", err);
    }
  }, [audioElement]);

  // Animation Loop
  useEffect(() => {
    const updateVolume = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const avg = sum / dataArrayRef.current.length;
        setVolume(avg);
      }
      requestRef.current = requestAnimationFrame(updateVolume);
    };

    if (audioElement || isSpeakingFallback) {
      requestRef.current = requestAnimationFrame(updateVolume);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [audioElement, isSpeakingFallback]);

  // Determine which image to use
  let avatarUrl = '/avatars/adult_male.jpg'; // default
  
  if (patientCase) {
     const isFemale = patientCase.gender === 'หญิง' || patientCase.gender === 'Female' || patientCase.gender === 'female';
     const isElderly = patientCase.age >= 60;
     const isSarah = patientCase?.patientName?.includes('Sarah');
     
     if (isSarah) avatarUrl = '/avatars/sarah_connor.jpg';
     else if (isFemale && isElderly) avatarUrl = '/avatars/elderly_female.jpg';
     else if (!isFemale && isElderly) avatarUrl = '/avatars/elderly_male.jpg';
     else if (isFemale && !isElderly) avatarUrl = '/avatars/adult_female.jpg';
     else avatarUrl = '/avatars/adult_male.jpg';
  }

  // Calculate dynamic scale based on volume or fallback state
  let scale = 1.0;
  if (isSpeakingFallback) {
    // Artificial pulse if WebAudio isn't working
    scale = 1.02 + Math.sin(Date.now() / 100) * 0.04;
  } else if (volume > 5) {
    scale = 1.0 + (volume / 100) * 0.08; // max scale ~ 1.08, more bouncy
  }

  const isSpeaking = isSpeakingFallback || volume > 5;

  return (
    <div className="w-full h-full relative overflow-hidden bg-surface flex items-center justify-center">
       <img 
          src={avatarUrl} 
          alt="Patient Avatar"
          className={`w-full h-full object-cover transition-transform duration-75`}
          style={{
             transform: `scale(${scale})`,
             filter: isSpeaking ? 'brightness(1.05)' : 'brightness(1.0)',
          }}
       />
       {isSpeaking && (
          <div 
             className="absolute inset-0 border-[4px] border-transparent pointer-events-none opacity-60" 
             style={{ borderImage: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) 1' }}
          />
       )}
       {/* Subtle breathing animation overlay when idle */}
       {!isSpeaking && (
         <div className="absolute inset-0 bg-black/5 animate-[pulse_4s_ease-in-out_infinite] pointer-events-none" />
       )}
    </div>
  );
};

export default PatientAvatarRealistic;
