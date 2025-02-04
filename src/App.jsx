import * as THREE from 'three';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import Shapes from './components/Shapes';
import Background from './components/Background';
import Glass from './components/Glass';
import './styles/Background.css'; // ✅ Garante que o CSS do background está carregado

const App = () => {
  return (
    <>
      <Background /> {/* ✅ Agora está fora do Canvas */}

      <Canvas 
        camera={{ position: [0, 1, 5], fov: 50 }}
        shadows
        frameloop="demand"
        style={{ width: "100vw", height: "100vh" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />

        <Glass />
        <Shapes />

      </Canvas>
    </>
  );
};

export default App;
