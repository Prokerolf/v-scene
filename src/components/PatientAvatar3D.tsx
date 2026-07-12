import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

interface PatientAvatar3DProps {
  audioElement: HTMLAudioElement | null;
  isSpeakingFallback: boolean;
}

const AvatarHead = ({ audioElement, isSpeakingFallback }: PatientAvatar3DProps) => {
  const mouthRef = useRef<THREE.Mesh>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Fallback random movement
  const [fakeVolume, setFakeVolume] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isSpeakingFallback) {
      interval = setInterval(() => {
        setFakeVolume(Math.random() * 150);
      }, 100);
    } else {
      setFakeVolume(0);
    }
    return () => clearInterval(interval);
  }, [isSpeakingFallback]);

  useEffect(() => {
    if (!audioElement) {
      analyserRef.current = null;
      return;
    }

    try {
      // Create audio context only when we have an audio element to avoid autoplay blocks
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      
      // Need to handle cross-origin if playing from external URL, but here it's blob URL
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
      console.warn("Could not setup Web Audio API for lip sync", err);
    }
  }, [audioElement]);

  useFrame(() => {
    if (!mouthRef.current) return;

    let volume = 0;

    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      volume = sum / dataArrayRef.current.length;
    } else if (isSpeakingFallback) {
      volume = fakeVolume;
    }

    // Map volume (0-255) to scale (1 to 4)
    const targetScale = 1 + (volume / 255) * 3;
    
    // Smooth lerp
    mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, targetScale, 0.3);
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Head Base */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[1, 0.5, 4, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* Visor / Eyes Area */}
        <mesh position={[0, 0.3, 0.8]} castShadow>
          <boxGeometry args={[1.5, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Eye Left */}
        <mesh position={[-0.4, 0.3, 0.96]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>

        {/* Eye Right */}
        <mesh position={[0.4, 0.3, 0.96]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>

        {/* Mouth (Scales with audio) */}
        <mesh ref={mouthRef} position={[0, -0.4, 0.9]} castShadow>
          <boxGeometry args={[0.6, 0.05, 0.1]} />
          <meshBasicMaterial color="#0ea5e9" toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
};

const PatientAvatar3D = ({ audioElement, isSpeakingFallback }: PatientAvatar3DProps) => {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <AvatarHead audioElement={audioElement} isSpeakingFallback={isSpeakingFallback} />
        
        <Environment preset="city" />
        <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2.5} />
      </Canvas>
    </div>
  );
};

export default PatientAvatar3D;
