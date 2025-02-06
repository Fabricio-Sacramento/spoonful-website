//import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const EnvBackground = () => {
  // Carregue uma textura que represente o seu background desejado
  const texture = useLoader(THREE.TextureLoader, '/path/to/your/background.jpg');
  
  // Crie um mesh de esfera com a textura aplicada no lado interno (BackSide)
  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
};

export default EnvBackground;
