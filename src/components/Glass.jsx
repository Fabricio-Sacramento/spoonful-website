import { useRef, useState } from "react";
import * as THREE from "three";
//import { useThree } from "@react-three/fiber";
import DynamicEnvMap from "./DynamicEnvMap";

const Glass = () => {
  const glassRef = useRef();
  const [envMap, setEnvMap] = useState(null); // 🔹 Guardamos o Environment Map aqui

  return (
    <>
      {/* 🔹 Captura o Environment Map Dinâmico */}
      <DynamicEnvMap setEnvMap={setEnvMap} />

      {/* 🔹 Icosaedro de vidro com reflexos */}
      <mesh ref={glassRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.3}
          roughness={0.05}      // superfícies mais lisas para melhor reflexão
          metalness={0}         // vidro não é metálico
          transmission={1}
          thickness={0.3}
          ior={1.5}
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
        <icosahedronGeometry args={[1.52, 2]} />
        <meshBasicMaterial color="white" wireframe transparent opacity={0.1} />
      </mesh>
    </>
  );
};

export default Glass;
