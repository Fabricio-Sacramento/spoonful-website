import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import DynamicEnvMap from "./DynamicEnvMap";

const Glass = () => {
  const glassRef = useRef();
  const [envMap, setEnvMap] = useState(null); // 🔹 Estado para armazenar o environment map dinâmico

  useFrame(() => {
    if (glassRef.current) {
      glassRef.current.material.envMap = envMap; // 🔹 Atualiza o envMap do vidro em tempo real
      glassRef.current.material.needsUpdate = true; // 🔹 Garante que a atualização seja aplicada
    }
  });

  return (
    <>
      {/* 🔹 Componente que gera o envMap dinâmico */}
      <DynamicEnvMap setEnvMap={setEnvMap} />

      {/* 🔹 Icosaedro de vidro */}
      <mesh ref={glassRef}>
        <icosahedronGeometry args={[3.5, 2]} />
        <meshPhysicalMaterial 
          color="white"
          transparent
          opacity={0.3}
          roughness={0.05}      // superfícies mais lisas para melhor reflexão
          metalness={0}         // vidro não é metálico
          transmission={1.3}
          thickness={0.3}
          ior={1}
          reflectivity={1}
          envMap={envMap}
          envMapIntensity={3}   // aumente para ver reflexos mais intensos
          clearcoat={1}
          clearcoatRoughness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 🔹 Wireframe para dar destaque ao vidro */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="white" wireframe transparent opacity={0.1} />
      </mesh>
    </>
  );
};

export default Glass;
