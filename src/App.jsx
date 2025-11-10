// src/App.jsx
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import Glass from './components/Glass';
import DynamicBackground from './components/DynamicBackground';
import GlassCube from './components/GlassCube';
import AppCanvasCleanupRegistrar from './components/AppCanvasCleanupRegistrar';
import { OrbitControls } from '@react-three/drei';

// ===================================================
// CanvasReadySignal → Emite evento "canvas:ready"
// Simplificado - apenas notifica que renderizou 1 frame
// ===================================================
function CanvasReadySignal() {
  const { gl } = useThree();

  useEffect(() => {
    // Garante que o frame inicial foi renderizado
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('canvas:ready'));
      console.log('📡 Canvas ready event emitted');
    });
  }, [gl]);

  return null;
}

const App = () => {
  return (
    <Canvas 
      frameloop="demand" 
      camera={{ position: [0, 0, 5], fov: 50 }} 
      shadows
    >
      <AppCanvasCleanupRegistrar />

      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />

      <DynamicBackground />
      <Glass />
      <GlassCube />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
      />

      <CanvasReadySignal />
    </Canvas>
  );
};

export default App;