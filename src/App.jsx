import * as THREE from 'three';
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

console.log("Three.js versão:", THREE.REVISION);

const App = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      {/* Luzes */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {/* Teste: Adicionar um cubo temporário */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Controles da câmera com eventos passivos */}
      <OrbitControls makeDefault />
    </Canvas>
  );
};

export default App;


