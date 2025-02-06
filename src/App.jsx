import * as THREE from 'three';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from "@react-three/drei";
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
      {/* 🔹 Luz ambiente mais forte para dar vida à cena */}
      <ambientLight intensity={1} />

      {/* 🔹 Luz direcional para gerar sombras e reflexos */}
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />

      {/* 🔹 Luz pontual para criar brilhos nas superfícies */}
      <pointLight position={[-5, 5, 5]} intensity={1} />

      <Glass />

      {/* 🔹 Reativa a rotação da cena */}
      <OrbitControls />

    </Canvas>

    </>
  );
};

export default App;
