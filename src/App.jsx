// src/App.jsx
import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';

import GlobalRotationController from './components/GlobalRotationController';
import CubeController from './components/CubeController';
import GlassCubePhysics from './components/GlassCubePhysics';
import Glass from './components/Glass';
import DynamicBackground from './components/DynamicBackground';
import FluidParticles from './components/FluidParticles';

const App = () => {
  // Cria um único ref que será compartilhado entre GlobalRotationController, CubeController e GlassCubePhysics
  const globalTransformRef = useRef();

  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 50 }} shadows>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />

      <Physics gravity={[0, 0, 0]} subSteps={4} iterations={50} debug={false}>
        <GlobalRotationController
          transformRef={globalTransformRef}
          
        >
          <DynamicBackground />
          <Glass />
          <CubeController transformRef={globalTransformRef} />
          <GlassCubePhysics transformRef={globalTransformRef} />
          <FluidParticles
            numParticles={50}
            globalTransformRef={globalTransformRef}
          />
        </GlobalRotationController>
      </Physics>
    </Canvas>
  );
};

export default App;
