// src/App.jsx
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import Glass from './components/Glass';
import DynamicBackground from './components/DynamicBackground';
import GlassCube from './components/GlassCube';
import AppCanvasCleanupRegistrar from './components/AppCanvasCleanupRegistrar';
import { OrbitControls } from '@react-three/drei';

// ===================================================
// CanvasReadySignal → Emite evento "canvas:ready"
// ===================================================
function CanvasReadySignal() {
  const { gl } = useThree();
  useEffect(() => {
    // garante que o frame inicial foi renderizado
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('canvas:ready'));
    });
  }, [gl]);
  return null;
}

const App = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1023);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Canvas frameloop="demand" camera={{ position: [0, 0, 5], fov: 50 }} shadows gl={{ outputColorSpace: THREE.SRGBColorSpace }}>
      <AppCanvasCleanupRegistrar />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      <DynamicBackground />
      <Glass />
      <GlassCube />
      
      {/* Renderiza OrbitControls APENAS no desktop */}
      {!isMobile && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
        />
      )}
      
      <CanvasReadySignal />
    </Canvas>
  );
};

export default App;