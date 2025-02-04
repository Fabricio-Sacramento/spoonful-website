import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const Glass = () => {
  const glassRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    if (glassRef.current) {
      glassRef.current.position.set(0, 0, 0); // 🔹 Mantém atrás dos objetos
      glassRef.current.rotation.set(0, 0, 0); // 🔹 Garante que não gire
    }
  }, [scene]);

  return (
    <mesh ref={glassRef} position={[0, 0, -2.5]} rotation={[0, 0, 0]}>
      <icosahedronGeometry args={[3, 1]} /> {/* 🔹 Cria um Icosaedro */}
      <meshPhysicalMaterial 
        color="white"
        transparent
        opacity={0.2}
        roughness={0.9}
        transmission={0.9} // 🔹 Mais transparência para refração realista
        clearcoat={1}
        side={THREE.DoubleSide} // 🔹 Mantém os efeitos visíveis dos dois lados
      />
    </mesh>
  );
};

export default Glass;
