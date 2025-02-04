import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';


const Shapes = () => {
    const meshRef = useRef(); // Criando a referência corretamente
    const [shape, setShape] = useState('box');
  
    // Alternar entre formas ao clicar
    const toggleShape = () => {
      setShape(prev => (prev === 'box' ? 'pyramid' : prev === 'pyramid' ? 'sphere' : 'box'));
    };
  
    // Animação de leve rotação
    useFrame(({ clock }) => {
      if (meshRef.current) {
        meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      }
    });
  
    return (
      <mesh 
        ref={meshRef} // Aplicando a referência aqui
        onClick={toggleShape}
        position={[0, 0, 0]}
        castShadow
      >
        {/* Alternando a geometria */}
        {shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {shape === 'sphere' && <sphereGeometry args={[0.8, 32, 32]} />}
        {shape === 'pyramid' && <coneGeometry args={[1, 1.2, 4]} />}
        
        <meshStandardMaterial color="blue" roughness={0.3} metalness={0.5} />
      </mesh>
    );
  };
  
  export default Shapes;
  
